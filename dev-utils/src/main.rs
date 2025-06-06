use crate::database::TempPostgres;
use crate::startup::{StartupParams, StartupSubcommand};
use clap::Parser;
use emu_shared_database_migration::{MIGRATIONS_TABLE_NAME, Migrator};
use error_stack::ResultExt;
use sea_orm_codegen::{
    DateTimeCrate, EntityTransformer, EntityWriterContext, WithPrelude, WithSerde,
};
use sea_orm_migration::MigratorTrait;
use sqlx::{Pool, Postgres};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use sea_orm::DbErr;
use thiserror::Error;
use tokio::process::Command;
use tracing::debug;

mod database;
mod startup;
//const DATA_DIR: &str = ".data";

const WORKDIR: &str = env!("CARGO_MANIFEST_DIR");

#[derive(Debug, Error)]
pub enum DevUtilsError {
    #[error("an io error occurred")]
    Io,

    #[error("task failed: {0}")]
    TaskFailed(String),

    #[error("error: {0}")]
    Custom(String),
}
impl DevUtilsError {
    pub fn custom<S: Into<String>>(msg: S) -> Self {
        DevUtilsError::Custom(msg.into())
    }
    pub fn task_failed<S: Into<String>>(msg: S) -> Self {
        DevUtilsError::TaskFailed(msg.into())
    }
}

#[tokio::main]
async fn main() {
    let params = StartupParams::parse();

    pretty_env_logger::formatted_timed_builder()
        .filter_level(params.verbosity.log_level_filter())
        .init();
    debug!("params: {:?}", &params);

    let try_catch = async || -> error_stack::Result<(), DevUtilsError> {
        match &params.command {
            StartupSubcommand::GenerateEntities => {
                let postgres = TempPostgres::new().await;
                let test_db = postgres.database("test").await;
                let project_dir = PathBuf::from_str(WORKDIR)
                    .change_context(DevUtilsError::Io)?
                    .parent()
                    .ok_or(DevUtilsError::Io)?
                    .to_path_buf();
                let db_orm_dir = project_dir
                    .join("shared")
                    .join("database")
                    .join("src")
                    .join("orm");
                pg_generate_entities::<Migrator>(db_orm_dir, test_db.pool())
                    .await
                    .change_context(DevUtilsError::task_failed("generate entities"))?;
            }
        };
        Ok(())
    };
    if let Err(report) = try_catch().await {
        tracing::error!("{:#?}", report);
        std::process::exit(1);
    }
}

#[derive(Debug, Error)]
pub enum SchemaGenerationError {
    #[error("an io error occurred")]
    IoError,

    #[error("an error occurred during database migration")]
    ErrorDuringDatabaseMigration,
    #[error("an error occurred during schema discovery")]
    ErrorDuringSchemaDiscovery,
    #[error("an error occurred during code generation")]
    ErrorDuringCodeGeneration,
    #[error("an error occurred during formatting")]
    ErrorDuringFormatting,
}

async fn pg_generate_entities<M: MigratorTrait>(
    target: impl AsRef<Path>,
    connection: &Pool<Postgres>,
) -> error_stack::Result<(), SchemaGenerationError> {
    let db = sea_orm::DatabaseConnection::from(connection.clone());
    tracing::info!("Apply schema to database");
    M::fresh(&db)
        .await
        .change_context(SchemaGenerationError::ErrorDuringDatabaseMigration)?;

    tracing::info!("Discovering schema from database");
    let discovery =
        sea_schema::postgres::discovery::SchemaDiscovery::new(connection.clone(), "public");
    let schema = discovery
        .discover()
        .await
        .change_context(SchemaGenerationError::ErrorDuringSchemaDiscovery)?;
    //let indexes = discovery.discover_indexes().await.unwrap();

    tracing::info!("Generating entities");
    let context = EntityWriterContext::new(
        true,
        WithPrelude::All,
        WithSerde::Both,
        true,
        DateTimeCrate::Chrono,
        None,
        false,
        false,
        false,
        vec![],
        vec![],
        vec![],
        vec![],
        true,
        true,
    );
    let table_stmts = schema
        .tables
        .into_iter()
        .filter(|table| table.info.name != MIGRATIONS_TABLE_NAME)
        .map(|schema| schema.write())
        .collect::<Vec<_>>();
    let output = EntityTransformer::transform(table_stmts)
        .change_context(SchemaGenerationError::ErrorDuringCodeGeneration)?
        .generate(&context);

    tokio::fs::create_dir_all(target.as_ref())
        .await
        .change_context(SchemaGenerationError::IoError)?;
    let mut paths = Vec::new();
    for file in output.files.into_iter() {
        let path = target.as_ref().join(&file.name);
        tracing::info!("Writing file: {}", path.display());
        tokio::fs::write(&path, &file.content)
            .await
            .change_context(SchemaGenerationError::IoError)?;
        paths.push(path);
    }

    tracing::info!("Formatting files");
    for path in paths.into_iter() {
        let path = tokio::fs::canonicalize(path)
            .await
            .change_context(SchemaGenerationError::IoError)?;
        let command = Command::new("rustfmt")
            .arg(&path)
            .status()
            .await
            .change_context(SchemaGenerationError::ErrorDuringFormatting)?;
        if !command.success() {
            tracing::error!("Failed to format file: {}", path.display());
        } else {
            tracing::info!("Formatted file: {}", path.display());
        }
    }

    tracing::info!("Codegeneration complete");

    Ok(())
}
