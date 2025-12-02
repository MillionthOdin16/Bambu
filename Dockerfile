# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY bambu-web-app/package*.json ./bambu-web-app/

# Install dependencies
WORKDIR /app/bambu-web-app
RUN npm ci

# Copy source files
COPY bambu-web-app/ ./

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/bambu-web-app/dist ./dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
