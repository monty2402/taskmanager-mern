# =========================
# 🟢 STAGE 1: Build React App
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build production React app
RUN npm run build


# =========================
# 🔵 STAGE 2: Production (Node runtime)
# =========================
FROM node:20-alpine

WORKDIR /app

# Install lightweight static server
RUN npm install -g serve

# Copy only build output from stage 1
COPY --from=build /app/build ./build

# Expose app port
EXPOSE 3000

# Run React app
CMD ["serve", "-s", "build", "-l", "3000"]