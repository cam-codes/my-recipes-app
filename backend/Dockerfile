FROM denoland/deno:2.6.6

WORKDIR /app

# Copy only what we need
COPY deno.json deno.lock ./
COPY main.ts server.ts types.ts ./
COPY utils ./utils

# Cache deps -- Cant cache mount here because we want to write the cache into the image
RUN deno cache server.ts

EXPOSE 3000

CMD ["deno", "task", "start"]
