use clap::Parser;
use clap_verbosity_flag::{InfoLevel, Verbosity};

#[derive(Debug, Clone, Parser)]
#[clap(version, about, long_about = None)]
pub struct StartupParams {
    #[clap(flatten)]
    pub verbosity: Verbosity<InfoLevel>,
}
