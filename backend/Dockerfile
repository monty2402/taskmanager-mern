# ---------- STAGE 1: base ----------
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

# ---------- STAGE 2: dependencies ----------
FROM base AS deps

RUN npm install

# ---------- STAGE 3: development ----------
FROM base AS dev

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# install nodemon globally for dev
RUN npm install -g nodemon

EXPOSE 5000

CMD ["nodemon", "server.js"]

# ---------- STAGE 4: production ----------
FROM base AS prod

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
