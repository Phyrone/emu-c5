use std::ops::Deref;
use futures_lite::future::block_on;
use postgresql_embedded::{PostgreSQL, Settings};
use sqlx::pool::PoolOptions;
use sqlx::{ConnectOptions, Postgres};
use std::path::Path;
use std::time::Instant;

pub struct TempPostgres {
    database: PostgreSQL,
    temp_dir: tempfile::TempDir,
    superuser_pool: sqlx::Pool<sqlx::Postgres>,
}
impl TempPostgres {
    fn pool_options() -> PoolOptions<Postgres> {
        sqlx::postgres::PgPoolOptions::new()
            .max_connections(1)
            .min_connections(1)
            .idle_timeout(Some(std::time::Duration::from_secs(5)))
            .max_lifetime(Some(std::time::Duration::from_secs(5)))
    }

    pub async fn new() -> Self {

        let temp_dir = tempfile::tempdir().unwrap();

        println!("Temp dir: {:?}", temp_dir.path());

        println!("Postgres VERSION: {}", postgresql_embedded::V17.clone());
        let mut database = PostgreSQL::new(Settings {
            version: postgresql_embedded::V17.clone(),
            data_dir: temp_dir.path().to_path_buf(),
            temporary: true,
            port: 0,
            //host: "127.0.0.1".to_string(),
            ..Default::default()
        });
        println!("Prepare PostgreSQL");
        let time = Instant::now();
        database.setup().await.unwrap();
        let time = time.elapsed();
        println!("PostgreSQL prepared ({:?})", time);

        println!("Starting PostgreSQL");
        let time = Instant::now();
        database.start().await.unwrap();
        let time = time.elapsed();
        println!("PostgreSQL started ({:?})", time);

        let options = sqlx::postgres::PgConnectOptions::new()
            .host(&database.settings().host)
            .port(database.settings().port)
            .username(&database.settings().username)
            .password(&database.settings().password);
        let pool_options = Self::pool_options();
        let superuser_pool = pool_options.connect_with(options).await.unwrap();

        Self {
            database,
            temp_dir,
            superuser_pool,
        }
    }

    pub async fn database(&self, name: impl AsRef<str>) -> TempPostgresDatabase {
        let name = name.as_ref();
        println!("Creating database {}", name);
        let time = Instant::now();
        self.database.create_database(name).await.unwrap();
        println!("Database {} created ({:?})", name, time.elapsed());

        println!("Connecting to database {}", name);
        let time = Instant::now();
        let options = sqlx::postgres::PgConnectOptions::new()
            .host(&self.database.settings().host)
            .port(self.database.settings().port)
            .username(&self.database.settings().username)
            .password(&self.database.settings().password)
            .database(name);
        let pool_options = Self::pool_options();
        let pool = pool_options.connect_with(options).await.unwrap();
        println!("Connected to database {} ({:?})", name, time.elapsed());
        let database = sea_orm::DatabaseConnection::from(pool.clone());

        TempPostgresDatabase {
            postgres: self,
            name: name.to_string(),
            pool,
            database,
        }
    }
}
pub struct TempPostgresDatabase<'a> {
    postgres: &'a TempPostgres,
    name: String,
    pool: sqlx::Pool<Postgres>,
    database: sea_orm::DatabaseConnection,
}
impl Deref for TempPostgresDatabase<'_> {
    type Target = sea_orm::DatabaseConnection;
    fn deref(&self) -> &Self::Target {
        &self.database
    }
}
impl TempPostgresDatabase<'_> {
    pub fn pool(&self) -> &sqlx::Pool<Postgres> {
        &self.pool
    }
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn postgres(&self) -> &TempPostgres {
        self.postgres
    }
    pub fn database(&self) -> &sea_orm::DatabaseConnection {
        &self.database
    }
}
impl Drop for TempPostgresDatabase<'_> {
    fn drop(&mut self) {
        let _ = block_on(self.postgres.database.drop_database(&self.name));
    }
}
