# Image de production pour l'auto-hébergement (VPS Propulseo via Coolify).
# Base Debian slim plutôt qu'Alpine : sharp et @react-pdf s'appuient sur des
# binaires natifs qui posent régulièrement problème avec la musl d'Alpine.

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# --- Dépendances -------------------------------------------------------------
FROM base AS deps
WORKDIR /app
# pnpm-workspace.yaml porte la liste des scripts d'installation autorisés :
# sans lui, pnpm 11 s'arrête sur ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Construction ------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Les variables NEXT_PUBLIC_* sont figées dans le bundle au moment du build :
# elles doivent être fournies ici, pas seulement à l'exécution. Dans Coolify,
# cocher « Build Variable » sur chacune d'elles.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID=${NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

# Les pages boutique sont pré-générées : la construction interroge réellement
# Supabase. Sans les deux variables ci-dessus, le build échoue.
RUN pnpm build

# --- Exécution ---------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Destination des sauvegardes, montée sur un volume persistant par Coolify.
ENV BACKUP_DIR=/data/backups

# curl sert aux tâches planifiées Coolify, qui appellent les routes /api/cron
# depuis l'intérieur du conteneur. Debian slim ne l'embarque pas.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --create-home nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /data/backups && chown -R nextjs:nodejs /data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
