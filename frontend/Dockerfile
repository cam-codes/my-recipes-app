# Stage 1: Build frontend safely
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy only the files needed to install deps
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN corepack enable && yarn install --frozen-lockfile

# Copy only source and public files needed for build
COPY src ./src
COPY public ./public
COPY index.html tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./

# Build production assets
RUN yarn build

# Stage 2: Serve built frontend
FROM nginx:alpine
# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built dist from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
