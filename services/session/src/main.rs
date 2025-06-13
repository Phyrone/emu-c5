use clap::Parser;
use emu_shared_grpc::auth::session::session_service_server::SessionService;
use emu_shared_grpc::auth::session::{CheckSessionRequest, CheckSessionResponse, SessionToken};
use error_stack::ResultExt;
use sentry::{ClientOptions, release_name};
use std::sync::Arc;
use thiserror::Error;
use tonic::{Request, Response, Status, async_trait};

mod startup;

#[derive(Debug, Error)]
#[error("session service error")]
pub struct SessionServiceError;

#[tokio::main]
async fn main() -> error_stack::Result<(), SessionServiceError> {
    dotenvy::dotenv().ok();
    let params = startup::StartupParams::parse();
    pretty_env_logger::formatted_timed_builder()
        .filter_level(params.verbosity.log_level_filter())
        .init();

    let sentry_guard = sentry::init((
        "https://5c0e1fea2c4647c58fad7fc23dfa6b31@bug.phyrone.de/3",
        ClientOptions {
            release: release_name!(),
            send_default_pii: true,
            ..Default::default()
        },
    ));

    let database = emu_shared_database::DB::new(&params.database)
        .await
        .change_context(SessionServiceError)?;
    
    SessionToken::default();

    drop(sentry_guard);
    Ok(())
}

pub struct SessionServiceImpl {
    
}

#[async_trait]
impl SessionService for SessionServiceImpl {
    async fn check_session(
        &self,
        request: Request<CheckSessionRequest>,
    ) -> Result<Response<CheckSessionResponse>, Status> {
       
        let request = request.into_inner();

        
        todo!()
    }
}
