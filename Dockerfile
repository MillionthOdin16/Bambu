# Use Node.js as the base image
FROM node:20-slim

# Install PrusaSlicer and dependencies
# We need to add the universe repository for some dependencies if they aren't in main
RUN apt-get update && apt-get install -y \
    prusa-slicer \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy app source
COPY . .

# Create uploads directory and ensure it's writable
RUN mkdir -p uploads && chmod 777 uploads

# Expose port
EXPOSE 3000

# Start the application
CMD [ "node", "server.js" ]
