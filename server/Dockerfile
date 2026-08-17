FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
