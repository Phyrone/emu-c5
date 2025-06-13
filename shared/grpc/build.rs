use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
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
    let attributes_file = prot_dir.join("attributes.json");
    println!("cargo:rerun-if-changed={}", attributes_file.display());
    println!("cargo:rerun-if-changed={}", prot_dir.display());
    let attributes: AttributesFile = if attributes_file.exists() {
        let content = std::fs::read_to_string(&attributes_file).unwrap();

        serde_json::from_str(&content).unwrap()
    } else {
        panic!("Attributes file not found: {}", attributes_file.display())
    };

    let mut builder =  tonic_build::configure()
        .build_client(true)
        .build_server(true)
        .build_transport(true)
        .bytes(["."])
        .generate_default_stubs(true)
        .include_file("_proto.rs")
        .type_attribute(".","#[derive(serde::Serialize, serde::Deserialize,borsh::BorshSerialize, borsh::BorshDeserialize,schemars::JsonSchema)]")
        .enum_attribute(".","#[borsh(use_discriminant=false)]");

    for (types, attributes) in attributes.types {
        for (attribute) in attributes {
            builder = builder.type_attribute(types.as_str(), attribute.as_str());
        }
    }
    for (fields, attributes) in attributes.fields {
        for (attribute) in attributes {
            builder = builder.field_attribute(fields.as_str(), attribute.as_str());
        }
    }
    for (enums, attributes) in attributes.enums {
        for (attribute) in attributes {
            builder = builder.enum_attribute(enums.as_str(), attribute.as_str());
        }
    }
    for (messages, attributes) in attributes.messages {
        for (attribute) in attributes {
            builder = builder.message_attribute(messages.as_str(), attribute.as_str());
        }
    }

    builder
        .compile_well_known_types(true)
        .use_arc_self(false)
        .emit_rerun_if_changed(true)
        .compile_protos(&proto_files, &[&prot_dir])
        .unwrap();
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct AttributesFile {
    #[serde(default)]
    fields: IndexMap<String, Vec<String>>,
    #[serde(default)]
    enums: IndexMap<String, Vec<String>>,
    #[serde(default)]
    messages: IndexMap<String, Vec<String>>,
    #[serde(default)]
    types: IndexMap<String, Vec<String>>,
}
