//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.12

pub mod prelude;

pub mod channel;
pub mod comment;
pub mod guild;
pub mod guild_member;
pub mod guild_role;
pub mod message;
pub mod post;
pub mod profile;
pub mod sea_orm_active_enums;
pub mod user;

seaography::register_entity_modules!([
    channel,
    comment,
    guild,
    guild_member,
    guild_role,
    message,
    post,
    profile,
    user,
]);
seaography::register_active_enums!([sea_orm_active_enums::ChannelType,]);
