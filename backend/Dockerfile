FROM denoland/deno:2.6.6

WORKDIR /app

# Copy only what we need
COPY deno.json deno.lock ./
COPY main.ts server.ts types.ts ./
COPY utils ./utils

# Cache deps
RUN --mount=type=cache,target=/deno-dir \
    deno cache server.ts

EXPOSE 3000

CMD ["deno", "task", "start"]
