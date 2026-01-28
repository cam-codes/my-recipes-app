# Use official Deno image
FROM denoland/deno:2.6.6

# Set working directory inside container
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Copy recipes folder
COPY recipes/ ./recipes/

# Cache dependencies
RUN deno cache --lock=backend/deno.lock backend/server.ts

# Expose backend port
EXPOSE 3000

# Set environment variable so backend knows port and recipes folder
ENV BACKEND_PORT=3000
ENV RECIPES_DIR=/app/recipes

# Run server with network + read permissions
CMD ["sh", "-c", \
  "deno run --allow-read=/app/recipes --allow-net --allow-env --lock=backend/deno.lock \
  backend/server.ts \
  --port=$BACKEND_PORT" \
]
