use crate::startup::StartupParams;
use clap::Parser;
use emu_shared_grpc::snowflake::snowflake_service_server::{SnowflakeService, SnowflakeServiceServer};
use emu_shared_grpc::snowflake::{SnowflakeIdRequest, SnowflakeIdResponse};
use hexafreeze::HexaFreezeError;
use sentry::{ClientOptions, release_name};
use tonic::{Request, Response, Status, async_trait};
use tonic::codegen::CompressionEncoding;
use tracing::{info, instrument};

mod startup;

#[instrument]
#[tokio::main]
async fn main() {
    let params = StartupParams::parse();
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
    let generator = hexafreeze::Generator::new(params.node_id as i64, params.epoch_start).unwrap();

    let service = SnowflakeServiceImpl::new(generator);
    let service = SnowflakeServiceServer::new(service)
        .send_compressed(CompressionEncoding::Zstd)
        .accept_compressed(CompressionEncoding::Zstd);

    info!("Listening on {}...", params.listen);
    tonic::transport::Server::builder()
        .accept_http1(true)
        .tcp_nodelay(true)
        .add_service(service)
        .serve(params.listen)
        .await
        .unwrap();

    drop(sentry_guard);
}
#[derive(Clone)]
pub struct SnowflakeServiceImpl {
    generator: hexafreeze::Generator,
}
impl SnowflakeServiceImpl {
    pub fn new(generator: hexafreeze::Generator) -> Self {
        Self { generator }
    }
}

#[async_trait]
impl SnowflakeService for SnowflakeServiceImpl {
    async fn snowflake_id(
        self: std::sync::Arc<Self>,
        request: Request<SnowflakeIdRequest>,
    ) -> Result<Response<SnowflakeIdResponse>, Status> {
        let count = request.get_ref().count.unwrap_or(1).max(1);
        let mut ids = Vec::with_capacity(count as usize);
        for _ in 0..count {
            let id = self.generator.generate().await.map_err(|e| match e {
                HexaFreezeError::EpochInTheFuture => Status::internal("Epoch is in the future"),
                HexaFreezeError::EpochTooFarInThePast => {
                    Status::internal("Epoch is too far in the past")
                }
                HexaFreezeError::NodeIdTooLarge => Status::internal("Node ID is too large"),
                HexaFreezeError::ClockWentBackInTime => Status::internal("Clock went back in time"),
                HexaFreezeError::Surpassed64BitLimit => {
                    Status::resource_exhausted("Surpassed 64-bit limit")
                }
            })?;
            ids.push(id as u64);
        }

        let response = SnowflakeIdResponse { ids };
        Ok(Response::new(response))
    }
}

pub struct SnowflakeGenerator {
    epoch: chrono::DateTime<chrono::offset::Utc>,
}
impl SnowflakeGenerator {}
