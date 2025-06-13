use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use emu_shared_grpc::auth::session::SessionToken;
use error_stack::ResultExt;
use hmac::digest::Digest;
use hmac::{Hmac, Mac};
use sha3::Sha3_512;
use thiserror::Error;

#[derive(Debug, Error)]
#[error("cannot decode session token")]
pub struct DecodeSessionError;

pub trait SessionTokenExt {
    fn sign(&mut self, session_key: &[u8]);
    fn validate(&self, session_key: &[u8]) -> bool;

    /// Checks if the session token contains a signature. DOES NOT check if the signature is valid.
    /// Use [validate](Self::validate) to check if the token contains a valid signature.
    fn is_signed(&self) -> bool;

    fn encode(&self) -> String;
    fn decode(encoded: &str) -> error_stack::Result<Self, DecodeSessionError>
    where
        Self: Sized;
}
impl SessionTokenExt for SessionToken {
    fn sign(&mut self, session_key: &[u8]) {
        let hash_input = borsh::to_vec(self).unwrap();
        let mut session_hasher = Hmac::<Sha3_512>::new_from_slice(session_key).unwrap();

        session_hasher.update(&hash_input);
        self.signature = Some(session_hasher.finalize().into_bytes().to_vec().into());
    }

    fn validate(&self, session_key: &[u8]) -> bool {
        let Some(signature) = &self.signature else {
            return false;
        };
        let hash_input = borsh::to_vec(self).unwrap();
        let mut session_hasher = Hmac::<Sha3_512>::new_from_slice(session_key).unwrap();

        session_hasher.update(&hash_input);
        let expected_signature = session_hasher.finalize().into_bytes().to_vec();
        if expected_signature.len() != signature.len() {
            return false;
        }
        expected_signature == signature.as_ref()
    }
    fn is_signed(&self) -> bool {
        self.signature.is_some()
    }

    fn encode(&self) -> String {
        let encoded = <SessionToken as prost::Message>::encode_to_vec(self);
        URL_SAFE_NO_PAD.encode(encoded)
    }

    fn decode(encoded: &str) -> error_stack::Result<Self, DecodeSessionError>
    where
        Self: Sized,
    {
        let encoded = URL_SAFE_NO_PAD
            .decode(encoded)
            .change_context(DecodeSessionError)?;
        let token = <SessionToken as prost::Message>::decode(encoded.as_slice())
            .change_context(DecodeSessionError)?;

        Ok(token)
    }
}
