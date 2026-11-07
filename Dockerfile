# Bookworm-slim used instead of Alpine because of the inclusion of packages
# such as bcrypt in the project
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production


LABEL org.opencontainers.image.source="https://github.com/lorenaborges256/DEV1003_A2_BackEnd_GAMS"

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER node

EXPOSE 5000

CMD ["node", "src/index.js"]