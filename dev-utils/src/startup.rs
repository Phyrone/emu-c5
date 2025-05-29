use clap::Parser;
use clap_verbosity_flag::{InfoLevel, Verbosity};

#[derive(Debug, Clone, Parser)]
pub struct StartupParams {
    
    #[clap(flatten)]
    pub verbosity: Verbosity<InfoLevel>
}
