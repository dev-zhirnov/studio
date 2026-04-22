FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy and build
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl for health checks
# RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy workers directory
COPY --from=builder --chown=nextjs:nodejs /app/workers ./workers

# Pre-create /tmp/uploads with the correct owner so that when Docker mounts
# a fresh named volume here, the volume inherits these perms (Docker copies
# ownership from the image's mount point into empty volumes on first mount).
# Without this, the volume comes up root-owned and the nextjs user can't
# write to it — contact-form uploads and the wp-media cache both need this.
RUN mkdir -p /tmp/uploads && chown -R nextjs:nodejs /tmp/uploads

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s \
#   CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "server.js"]
