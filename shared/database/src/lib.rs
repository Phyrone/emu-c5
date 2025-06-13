mod orm;

use clap::{Args, ValueEnum};
use emu_shared_database_migration::{Migrator, MigratorTrait};
use error_stack::{FutureExt, Report, ResultExt};
pub use orm::*;
use sea_orm::{Database, DatabaseConnection};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::try_join;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, ValueEnum)]
pub enum DatabaseMigrationStrategy {
    /// Upsert the database schema, creating tables and columns as needed.
    /// The database will be modified to match the current schema at the start of the application.
    ///
    /// This is recommended for small-scale and private setups to lift workload from administrators.
    /// This is the default behavior.
    Forward,
    /// Validate the database schema matches the expected schema.
    Check,
    /// Do not modify or check the database schema. Use this for custom setups.
    /// Its the administrator's responsibility to ensure database operations work as expected including schema migrations.
    Ignore,
}
impl std::fmt::Display for DatabaseMigrationStrategy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DatabaseMigrationStrategy::Forward => write!(f, "forward"),
            DatabaseMigrationStrategy::Check => write!(f, "check"),
            DatabaseMigrationStrategy::Ignore => write!(f, "ignore"),
        }
    }
}

#[derive(Debug, Clone, Args, Serialize, Deserialize)]
pub struct DatabaseConfig {
    #[clap(long, env = "DATABASE_URL")]
    pub database_url: String,

    #[clap(long, env = "DATABASE_URL_RO")]
    pub database_url_ro: Option<String>,

    #[clap(long, env = "DATABASE_MIGRATION_STRATEGY", default_value_t = DatabaseMigrationStrategy::Forward)]
    pub database_migration_strategy: DatabaseMigrationStrategy,
}

#[derive(Debug, Clone)]
pub struct DB {
    database: DatabaseConnection,
    database_ro: Option<DatabaseConnection>,
}

#[derive(Debug, Error)]
pub enum DatabaseConnectError {
    #[error("failed connecting to database")]
    OpenDatabase,
    #[error("error during database migration")]
    MigrationError,
    #[error("failed connecting to read-only database")]
    OpenDatabaseRo,

    #[error("unable to perform database operation")]
    DatabaseOperation,
    #[error("database migration check failed")]
    MigrationCheckError,
    #[error("database is not fully migrated missing {0} migrations")]
    MigrationPending(usize),
}

impl DB {
    pub async fn new(config: &DatabaseConfig) -> error_stack::Result<Self, DatabaseConnectError> {
        let (database, database_ro) = try_join!(
            async {
                let database = Database::connect(&config.database_url)
                    .await
                    .change_context(DatabaseConnectError::OpenDatabase)?;
                match config.database_migration_strategy {
                    DatabaseMigrationStrategy::Forward => {
                        Migrator::up(&database, None)
                            .await
                            .change_context(DatabaseConnectError::DatabaseOperation)
                            .change_context(DatabaseConnectError::MigrationError)?;
                    }
                    DatabaseMigrationStrategy::Check => {
                        Self::check_migrations(&database)
                            .await
                            .change_context(DatabaseConnectError::MigrationCheckError)?;

                        // Trigger the read check barrier to ensure the read-only connection is checked after migrations.
                    }
                    DatabaseMigrationStrategy::Ignore => {}
                }

                Result::<_, Report<DatabaseConnectError>>::Ok(database)
            },
            async {
                if let Some(ro_url) = &config.database_url_ro {
                    let connection_ro = Database::connect(ro_url)
                        .await
                        .change_context(DatabaseConnectError::OpenDatabaseRo)?;
                    Ok(Some(connection_ro))
                } else {
                    Ok(None)
                }
            }
        )?;

        Ok(Self {
            database,
            database_ro,
        })
    }

    async fn check_migrations(
        database: &DatabaseConnection,
    ) -> error_stack::Result<(), DatabaseConnectError> {
        let pending = Migrator::get_pending_migrations(database)
            .await
            .change_context(DatabaseConnectError::DatabaseOperation)?;
        if !pending.is_empty() {
            Err(Report::new(DatabaseConnectError::MigrationPending(
                pending.len(),
            )))
        } else {
            Ok(())
        }
    }

    pub fn db(&self) -> &DatabaseConnection {
        &self.database
    }
    pub fn db_ro(&self) -> &DatabaseConnection {
        self.database_ro.as_ref().unwrap_or(&self.database)
    }
}
