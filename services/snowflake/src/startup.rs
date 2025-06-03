use chrono::{DateTime, Utc};
use clap::Parser;
use clap_num::number_range;
use clap_verbosity_flag::{InfoLevel, Verbosity};
use hexafreeze::DEFAULT_EPOCH;
use std::net::SocketAddr;

#[derive(Debug, Clone, Parser)]
pub struct StartupParams {
    #[clap(short, long,value_parser=node_id_parser, default_value_t = 0,env)]
    pub node_id: u16,

    #[clap(long, default_value_t = DEFAULT_EPOCH.clone(),env)]
    pub epoch_start: DateTime<Utc>,

    #[clap(default_value = "0.0.0.0:50051")]
    pub listen: SocketAddr,

    #[clap(flatten)]
    pub verbosity: Verbosity<InfoLevel>,
}
fn node_id_parser(s: &str) -> Result<u16, String> {
    number_range(s, 0, 1023)
}
