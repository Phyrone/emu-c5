use clap::{Parser, Subcommand};
use clap_verbosity_flag::{InfoLevel, Verbosity};

#[derive(Debug, Clone, Parser)]
pub struct StartupParams {
    #[clap(flatten)]
    pub verbosity: Verbosity<InfoLevel>,

    #[clap(subcommand)]
    pub command: StartupSubcommand,
}

#[derive(Debug, Clone, Subcommand)]
pub enum StartupSubcommand {
    #[clap(alias = "generate", alias = "gen")]
    GenerateEntities,
}
