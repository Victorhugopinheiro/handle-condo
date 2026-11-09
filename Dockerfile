# syntax=docker/dockerfile:1

# Node 24 LTS (Krypton). Pin the patch so Coolify builds stay reproducible.
# https://hub.docker.com/_/node
ARG NODE_VERSION=24.22.2-alpine

FROM node:${NODE_VERSION} AS base
# libc6-compat: native addons (for example sharp) expect glibc symbols on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- dependencies ---
FROM base AS dependencies
COPY package.json package-lock.json ./
# Husky's prepare script looks for .git, which is not part of the image.
ENV HUSKY=0
RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --no-fund

# --- build ---
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Coolify injects build-time env as --build-arg. Only public values belong here:
# they are inlined into the browser bundle. Server secrets stay runtime-only.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  NODE_ENV=production \
  HUSKY=0

RUN --mount=type=cache,target=/app/.next/cache \
  npm run build

# --- test ---
# Not a parent of the runtime stage, so Coolify's default build skips it.
# Run on demand: docker build --target test .
FROM dependencies AS test
COPY . .
ENV HUSKY=0 \
  CI=true
RUN npm test

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0

# curl: Coolify's health check uses curl, then busybox wget. Alpine wget
# resolves localhost to IPv6 and reports the container down.
RUN apk add --no-cache curl \
  && addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD sh -c 'curl -fsS "http://127.0.0.1:${PORT:-3000}/" || exit 1'

# Docker sets HOSTNAME to the container id and overrides ENV HOSTNAME.
# Next standalone binds to HOSTNAME, so force 0.0.0.0 for the Node process.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
