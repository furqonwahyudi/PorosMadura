FROM node:20-alpine

WORKDIR /app

# Salin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin schema prisma terlebih dahulu untuk generating client
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Salin seluruh source code backend
COPY . .

# Build TypeScript ke JavaScript
RUN npm run build

# Port default backend
EXPOSE 3001

# Command untuk menjalankan backend
CMD ["node", "dist/server.js"]
