use std::path::PathBuf;

fn main() {
    let prot_dir = PathBuf::from("../../proto/");
    //list all proto files in the directory
    let proto_files: Vec<PathBuf> = std::fs::read_dir(&prot_dir)
        .unwrap()
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.extension()? == "proto" {
                Some(path)
            } else {
                None
            }
        })
        .collect();

    tonic_build::configure()
        .build_client(true)
        .build_server(true)
        .build_transport(true)
        .bytes(&["."])
        .generate_default_stubs(true)
        .include_file("_proto.rs")
        .compile_well_known_types(true)
        .use_arc_self(true)
        .emit_rerun_if_changed(true)
        .compile_protos(&proto_files, &[&prot_dir])
        .unwrap();
}
