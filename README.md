# Bambu Web Slicer 🚀

A lightweight, mobile-friendly web application for 3D slicing with Bambu Lab printers. Upload STL files, configure slicer settings, preview your model, and generate G-code - all from your browser!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Features

- **📱 Mobile-First Design**: Optimized responsive UI that works seamlessly on phones, tablets, and desktop
- **📁 Easy File Upload**: Drag-and-drop or click to upload STL, OBJ, and 3MF files (up to 100MB)
- **👁️ 3D Preview**: Interactive Three.js viewer with rotate, zoom, and pan controls
- **⚙️ Comprehensive Settings**: Configure all major slicer parameters:
  - Quality (layer height)
  - Strength (infill, walls, top/bottom layers)
  - Speed (wall speeds, infill speed)
  - Temperature (nozzle, bed)
  - Support structures
  - Advanced options (flow rate, skirt, brim)
- **🖨️ Multi-Printer Support**: Profiles for X1 Carbon, X1, P1P, P1S, A1, and A1 Mini
- **⚡ Fast Processing**: Backend powered by official Bambu Studio CLI
- **🐳 Docker Ready**: Complete Docker setup for easy deployment

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Research & References](#research--references)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with Vite (fast development and optimized builds)
- Three.js + STLLoader for 3D model visualization
- Tailwind CSS for responsive, mobile-first UI
- Axios for API communication

**Backend:**
- Node.js + Express API server
- Multer for file upload handling
- Bambu Studio CLI for slicing operations
- Settings management via JSON configuration files

**Infrastructure:**
- Docker & Docker Compose for containerization
- Ubuntu 22.04 base image with Bambu Studio AppImage

### Workflow

```
1. User uploads STL file → 2. Preview renders in browser → 3. User adjusts settings
   ↓                              ↓                              ↓
4. Settings + file sent to backend → 5. Bambu Studio CLI slices → 6. G-code returned
```

## 📦 Prerequisites

### Option 1: Docker (Recommended)
- Docker Engine 20.10+
- Docker Compose 2.0+

### Option 2: Local Development
- Node.js 20.x or higher
- npm or yarn
- Bambu Studio installed and accessible via CLI

## 🚀 Installation

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/bambu-web-slicer.git
   cd bambu-web-slicer
   ```

2. **Build and start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Local Development Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Install Bambu Studio:**

   **Linux (Ubuntu/Debian):**
   ```bash
   cd /opt
   wget https://github.com/bambulab/BambuStudio/releases/latest/download/BambuStudio-linux-ubuntu-22.04.AppImage
   chmod +x BambuStudio-*.AppImage
   ./BambuStudio-*.AppImage --appimage-extract
   sudo ln -s /opt/squashfs-root/usr/bin/bambu-studio /usr/local/bin/bambu-studio
   ```

   **macOS:**
   ```bash
   brew install --cask bambu-studio
   # or download from https://bambulab.com/en/download/studio
   ```

   **Windows:**
   Download and install from https://bambulab.com/en/download/studio

3. **Configure environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env to set BAMBU_STUDIO_PATH if needed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts both frontend (port 5173) and backend (port 3000) concurrently.

## 📖 Usage

### Basic Workflow

1. **Upload a 3D Model**
   - Drag and drop an STL, OBJ, or 3MF file (max 100MB)
   - Or click to browse and select a file

2. **Preview Your Model**
   - Interact with the 3D viewer using mouse or touch:
     - Left click + drag: Rotate
     - Right click + drag: Pan
     - Scroll: Zoom

3. **Configure Settings**
   - Select your printer model
   - Adjust quality (layer height)
   - Configure strength (infill, walls)
   - Set speeds and temperatures
   - Enable support if needed

4. **Generate G-code**
   - Click "Generate G-code"
   - Wait for slicing to complete
   - Download the output file

5. **Print**
   - Transfer the G-code to your printer
   - Start printing!

### Recommended Settings by Use Case

**Quick Draft (Fast):**
- Layer Height: 0.28mm
- Infill: 10%
- Wall Count: 2

**Standard Quality (Balanced):**
- Layer Height: 0.2mm
- Infill: 15%
- Wall Count: 2-3

**High Quality (Slow):**
- Layer Height: 0.12mm
- Infill: 20%
- Wall Count: 3-4

**Functional Parts (Strong):**
- Layer Height: 0.2mm
- Infill: 30-50%
- Wall Count: 4+

## 🛠️ Development

### Project Structure

```
bambu-web-slicer/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── STLViewer.jsx
│   │   │   └── SlicerSettings.jsx
│   │   ├── api/          # API utilities
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/              # Express backend API
│   ├── src/
│   │   └── server.js     # Main server file
│   ├── uploads/          # Uploaded files storage
│   ├── output/           # Generated G-code output
│   ├── settings/         # Generated settings JSON files
│   └── package.json
├── docker/               # Docker configuration
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Available Scripts

**Root:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers

**Frontend:**
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start backend with nodemon (port 3000)
- `npm start` - Start backend in production mode

### Environment Variables

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
BAMBU_STUDIO_PATH=/usr/local/bin/bambu-studio
MAX_FILE_SIZE=104857600
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

## 🌐 Deployment

### Docker Deployment

1. **Build the images:**
   ```bash
   docker-compose build
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Configure reverse proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           client_max_body_size 100M;
       }
   }
   ```

### Production Considerations

- Use a process manager like PM2 for Node.js
- Set up SSL/TLS certificates (Let's Encrypt)
- Configure firewall rules
- Set up backup for uploaded files
- Monitor disk usage for uploads/outputs
- Implement rate limiting
- Add authentication if needed

## 📡 API Documentation

### Endpoints

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Bambu Web Slicer API is running"
}
```

#### `POST /api/upload`
Upload a 3D model file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (STL/OBJ/3MF, max 100MB)

**Response:**
```json
{
  "success": true,
  "fileId": "file-1234567890.stl",
  "originalName": "model.stl",
  "size": 1234567,
  "path": "/app/uploads/file-1234567890.stl"
}
```

#### `POST /api/slice`
Slice a 3D model with specified settings.

**Request:**
```json
{
  "fileId": "file-1234567890.stl",
  "settings": {
    "printer": "bambu_x1c",
    "layerHeight": 0.2,
    "infillDensity": 15,
    "wallCount": 2,
    "nozzleTemp": 210,
    "bedTemp": 60
  }
}
```

**Response:**
```json
{
  "success": true,
  "outputFile": "file-1234567890-output.3mf",
  "downloadUrl": "/api/download/file-1234567890-output.3mf"
}
```

#### `GET /api/download/:filename`
Download generated G-code file.

**Response:** File download

#### `GET /api/printers`
Get list of available printer profiles.

**Response:**
```json
{
  "printers": [
    {
      "id": "bambu_x1c",
      "name": "Bambu Lab X1 Carbon",
      "buildVolume": "256x256x256"
    }
  ]
}
```

## 🔧 Troubleshooting

### Common Issues

**1. "Failed to slice file" error:**
- Verify Bambu Studio CLI is installed correctly
- Check the path in `.env` file
- Ensure the uploaded file is valid
- Check backend logs: `docker-compose logs backend`

**2. 3D preview not loading:**
- Verify the file format is supported (STL, OBJ, 3MF)
- Check browser console for errors
- Ensure WebGL is enabled in your browser

**3. Upload fails:**
- Check file size (max 100MB)
- Verify file format
- Check backend storage permissions

**4. Docker container won't start:**
- Ensure ports 3000 and 5173 are available
- Check Docker logs: `docker-compose logs`
- Verify Docker has enough resources allocated

### Logs

**View backend logs:**
```bash
docker-compose logs -f backend
```

**View all logs:**
```bash
docker-compose logs -f
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Research & References

This project was built after extensive research into 3D slicing tools and web-based solutions:

### Official Documentation
- [Bambu Studio CLI Documentation](https://github.com/bambulab/BambuStudio/wiki/Command-Line-Usage)
- [Bambu Studio GitHub Repository](https://github.com/bambulab/BambuStudio)
- [Bambu Lab Wiki - Slicing Parameters](https://wiki.bambulab.com/en/software/bambu-studio/how-to-set-slicing-parameters)

### Alternative Slicers
- [OrcaSlicer](https://github.com/OrcaSlicer/OrcaSlicer) - Popular fork with excellent Bambu Lab support
- [PrusaSlicer CLI](https://github.com/prusa3d/PrusaSlicer/wiki/Command-Line-Interface)
- [SimplyPrint OrcaSlicer Online](https://simplyprint.io/features/slicer/orcaslicer)

### Docker Solutions
- [LinuxServer.io Bambu Studio Docker](https://github.com/linuxserver/docker-bambustudio)
- [LinuxServer.io OrcaSlicer Docker](https://docs.linuxserver.io/images/docker-orcaslicer/)

### Web-Based Slicers (Inspiration)
- [Kiri:Moto](https://grid.space/) - Browser-based slicer with offline capability
- [REALvision Online](https://realvisiononline.com/) - Mobile-first online slicer
- [AstroPrint](https://www.astroprint.com/online-stl-slicer-and-gcode-x3g-generator)

### 3D Visualization
- [Three.js](https://threejs.org/)
- [React STL Viewer](https://github.com/gabotechs/react-stl-viewer)
- [ViewSTL Plugin](https://www.viewstl.com/plugin/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Bambu Lab for their excellent open-source Bambu Studio
- The Three.js team for amazing 3D visualization tools
- LinuxServer.io for Docker container inspiration
- The 3D printing community for feedback and testing

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [Troubleshooting](#troubleshooting) section
- Review the [Bambu Lab Community Forum](https://forum.bambulab.com/)

---

**Made with ❤️ for the 3D printing community**