mod startup;

use clap::Parser;
use url::Url;
use webauthn_rs::prelude::PublicKeyCredential;
use webauthn_rs::WebauthnBuilder;

#[tokio::main]
async fn main() {

    let params = startup::StartupParams::parse();
    pretty_env_logger::formatted_timed_builder()
        .filter_level(params.verbosity.log_level_filter())
        .init();
    
    




    println!("Hello, world!");
}
