mod orm;

use clap::Args;
use emu_shared_database_migration::{Migrator, MigratorTrait};
use error_stack::{FutureExt, Report, ResultExt};
pub use orm::*;
use sea_orm::{Database, DatabaseConnection};
use thiserror::Error;
use tokio::try_join;

#[derive(Debug, Clone, Args)]
pub struct DatabaseConfig {
    #[clap(long, env = "DATABASE_URL")]
    pub database_url: String,

    #[clap(long, env = "DATABASE_URL_RO")]
    pub database_url_ro: Option<String>,
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
    #[error("failed running database migrations")]
    MigrationError,
    #[error("failed connecting to read-only database")]
    OpenDatabaseRo,
}

impl DB {
    pub async fn new(config: &DatabaseConfig) -> error_stack::Result<Self, DatabaseConnectError> {
        let (database, database_ro) = try_join!(
            async {
                let database = Database::connect(&config.database_url)
                    .await
                    .change_context(DatabaseConnectError::OpenDatabase)?;
                Migrator::up(&database, None)
                    .await
                    .change_context(DatabaseConnectError::MigrationError)?;

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

    pub fn db(&self) -> &DatabaseConnection {
        &self.database
    }
    pub fn db_ro(&self) -> &DatabaseConnection {
        self.database_ro.as_ref().unwrap_or(&self.database)
    }
}
