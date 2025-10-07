FROM node:20-slim
WORKDIR /app

# Install system deps and Node dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate && npm run build

# Expose backend port
EXPOSE 8000

# Start server (dist build)
CMD ["npm","run","start"]