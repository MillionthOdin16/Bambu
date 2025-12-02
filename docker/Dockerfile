# Dockerfile for backend with Bambu Studio CLI
FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    build-essential \
    git \
    libgtk-3-0 \
    libglu1-mesa \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Download and install Bambu Studio
# Note: This downloads the AppImage. In production, you might want to pin a specific version
RUN mkdir -p /opt/bambu-studio && \
    cd /opt/bambu-studio && \
    wget -O bambu-studio.AppImage "https://github.com/bambulab/BambuStudio/releases/latest/download/BambuStudio-linux-ubuntu-22.04.AppImage" && \
    chmod +x bambu-studio.AppImage && \
    ./bambu-studio.AppImage --appimage-extract && \
    ln -s /opt/bambu-studio/squashfs-root/usr/bin/bambu-studio /usr/local/bin/bambu-studio

# Alternative: OrcaSlicer (often has better CLI support)
# RUN cd /opt && \
#     wget -O orca-slicer.AppImage "https://github.com/SoftFever/OrcaSlicer/releases/latest/download/OrcaSlicer_Linux_V2.0.0.AppImage" && \
#     chmod +x orca-slicer.AppImage && \
#     ./orca-slicer.AppImage --appimage-extract && \
#     ln -s /opt/squashfs-root/usr/bin/orca-slicer /usr/local/bin/orca-slicer

# Create app directory
WORKDIR /app

# Copy package files
COPY ../backend/package*.json /app/backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Create necessary directories
RUN mkdir -p /app/uploads /app/output

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]
