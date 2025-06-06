mod startup;

use clap::Parser;
use emu_shared_database::DatabaseConfig;
use error_stack::ResultExt;
use thiserror::Error;
use url::Url;
use webauthn_rs::WebauthnBuilder;
use webauthn_rs::prelude::PublicKeyCredential;

#[derive(Debug, Error)]
#[error("authentication service error")]
pub struct AuthServiceError;

#[tokio::main]
async fn main() -> error_stack::Result<(), AuthServiceError> {
    dotenvy::dotenv().ok();

    let params = startup::StartupParams::parse();
    pretty_env_logger::formatted_timed_builder()
        .filter_level(params.verbosity.log_level_filter())
        .init();

    let database = emu_shared_database::DB::new(&params.database)
        .await
        .change_context(AuthServiceError)?;

    Ok(())
}
