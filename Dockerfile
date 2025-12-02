# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy bambu-web-app package files
COPY bambu-web-app/package*.json ./bambu-web-app/

# Install all dependencies (root + bambu-web-app via postinstall)
RUN npm ci --include=dev

# Copy source files
COPY bambu-web-app/ ./bambu-web-app/

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14

# Copy built assets from builder
COPY --from=builder /app/bambu-web-app/dist ./dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
