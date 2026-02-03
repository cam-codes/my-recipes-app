# Stage 1: Build frontend safely
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy only the files needed to install deps
# First, copy file(s) at content root
COPY .yarnrc.yml yarn.lock package.json ./

# Copy workspace manifest
COPY frontend/package.json frontend/

# Install dependencies
RUN corepack enable && yarn install --immutable

# Copy frontend source
COPY ./frontend frontend/

# Build production assets
WORKDIR /app/frontend
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache/yarn \
    yarn build

# Stage 2: Serve built frontend
FROM nginx:alpine

# Install curl (no cache to keep image small)
RUN apk add --no-cache curl

# Replace default nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built dist from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
