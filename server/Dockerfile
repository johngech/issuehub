# ──────────────────────────────────────────────
# Stage 1: Install dependencies & generate Prisma
# ──────────────────────────────────────────────
FROM oven/bun:1.2.15 AS deps

WORKDIR /app

# Copy workspace root files
COPY package.json ./

# Create workspace directories and copy package.json files
RUN mkdir -p core client server
COPY core/package.json core/package.json
COPY client/package.json client/package.json
COPY server/package.json server/package.json

# Install all workspace production dependencies
RUN bun install --production --frozen-lockfile

# Install Prisma separately (devDependency needed for generate)
RUN cd server && bun add prisma --ignore-scripts

# Copy Prisma schema and generate client
COPY server/prisma/ server/prisma/
RUN cd server && bunx prisma generate

# ──────────────────────────────────────────────
# Stage 2: Production runtime
# ──────────────────────────────────────────────
FROM oven/bun:1.2.15-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/core/node_modules ./core/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy application source
COPY core/ core/
COPY server/ server/

# Copy generated Prisma client (must be after server/ copy to avoid overwrite)
COPY --from=deps /app/server/prisma/client ./server/prisma/client

# Set ownership for non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the server port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun fetch --no-warn http://localhost:4000/api/health || exit 1

# Start the server
CMD ["bun", "run", "server/index.ts"]
