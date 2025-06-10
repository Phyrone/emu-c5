FROM node:lts-slim AS node-build-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM node-build-base AS node-build
COPY . /build
WORKDIR /build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=emu-app --prod /out/app
# Since dist directory is in the gitignore, we need to copy it manually
RUN cp -r /build/app/dist /out/app/dist

FROM node-build-base AS app
COPY --from=node-build /out/app /app
WORKDIR /app
EXPOSE 3000
CMD ["node", "dist/index.js"]



FROM rust as emu-service-auth-builder

RUN apt update && apt install -y \
    libssl-dev \
    pkg-config \
    build-essential \
    protobuf-compiler
RUN mkdir -p /output
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo build --release --package emu-service-auth --bin emu-service-auth \
    && cp target/release/emu-service-auth /output/

FROM debian:bookworm-slim AS emu-service-auth
COPY --from=emu-service-auth-builder /output/emu-service-auth /usr/local/bin/emu-service-auth

CMD ["/usr/local/bin/emu-service-auth"]