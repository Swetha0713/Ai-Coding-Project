# ============================================================
# AlertCart – Dockerfile
# ============================================================

# Stage 1: Base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only (leverage Docker cache)
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Final image
FROM node:20-alpine

WORKDIR /app

# Copy node_modules from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S alertcart -u 1001 && \
    chown -R alertcart:nodejs /app

USER alertcart

# Expose app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]
