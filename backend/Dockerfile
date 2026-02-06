FROM denoland/deno:2.6.6

WORKDIR /app

# Copy only what we need
COPY backend/deno.json backend/deno.lock ./
COPY backend/main.ts backend/server.ts backend/types.ts ./
COPY backend/utils ./utils

# Cache deps -- Cant cache mount here because we want to write the cache into the image
RUN deno cache server.ts

# Inject build info into the site
ARG GIT_COMMIT=unknown

# empty git tag by default, only set on tagged releases
ARG GIT_TAG=""

ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_TAG=$GIT_TAG
EXPOSE 3000

CMD ["deno", "task", "start"]
