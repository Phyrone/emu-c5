use clap::Parser;
use clap_verbosity_flag::{InfoLevel, Verbosity};
use emu_shared_database::DatabaseConfig;

#[derive(Debug, Clone, Parser)]
#[clap(version, about, long_about = None)]
pub struct StartupParams {
    #[clap(flatten)]
    pub database: DatabaseConfig,

    #[clap(flatten)]
    pub verbosity: Verbosity<InfoLevel>,
}
