# build stage
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Copy package.json etc
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Pass VITE_API_BASE as a build arg to Vite
#ARG VITE_API_BASE
#ENV VITE_API_BASE=$VITE_API_BASE

# Build frontend with correct API base
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# copy custom nginx config (this replaces the default nginx config that only serves static files)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
