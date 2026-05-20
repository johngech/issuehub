# ──────────────────────────────────────────────
# Stage 1: Build the client with Vite
# ──────────────────────────────────────────────
FROM oven/bun:1.2.15 AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json ./

# Create workspace directories and copy package.json files
RUN mkdir -p core client server
COPY core/package.json core/package.json
COPY client/package.json client/package.json
COPY server/package.json server/package.json

# Install all workspace dependencies (skip scripts — client doesn't need Prisma)
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source code
COPY core/ core/
COPY client/ client/

# Build argument for API URL (defaults to localhost for dev)
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

# Build the client
RUN cd client && bunx vite build

# ──────────────────────────────────────────────
# Stage 2: Serve static files with nginx
# ──────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY --from=builder /app/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
