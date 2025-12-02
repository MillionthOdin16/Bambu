# Bambu

## Bambu Web Slicer

A lightweight mobile-friendly web application replacement for Bambu Studio. This app allows users to upload 3D model files, configure slicer settings, preview the model and G-code, and generate output files for Bambu Lab 3D printers.

### Features

- **File Upload**: Support for STL, OBJ, and 3MF file formats
- **3D Model Viewer**: Interactive Three.js-based viewer with orbit controls
- **Slicer Settings**: Comprehensive settings including:
  - Quality settings (layer height, line width, wall count)
  - Infill settings (density, pattern)
  - Support settings
  - Speed settings (print, travel, infill speeds)
  - Temperature settings (nozzle, bed)
  - Retraction settings
- **Printer Profiles**: Pre-configured profiles for Bambu Lab printers (X1C, X1, P1P, P1S, A1, A1 mini)
- **G-code Preview**: Layer-by-layer preview with color coding
- **Export Options**: Download G-code or 3MF files ready for Bambu printers

### Getting Started

#### Prerequisites

- Node.js 18+ 
- npm or yarn

#### Installation

```bash
cd bambu-web-app
npm install
```

#### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Production Build

```bash
npm run build
npm run preview
```

### Usage

1. **Upload a Model**: Click or drag-and-drop an STL, OBJ, or 3MF file
2. **Configure Settings**: Adjust print settings using the settings panel
3. **Slice**: Click the "Slice Model" button to generate G-code
4. **Preview**: Review the G-code layer by layer
5. **Download**: Export as G-code or 3MF file for your Bambu printer

### Supported Printers

- Bambu Lab X1 Carbon
- Bambu Lab X1
- Bambu Lab P1P
- Bambu Lab P1S
- Bambu Lab A1
- Bambu Lab A1 mini

### Technical Notes

#### Slicing Engine

This app includes a simplified JavaScript-based slicer for demonstration purposes. For production use, consider integrating:
- **CuraEngine WASM**: For full-featured browser-based slicing
- **Server-side slicing**: Using PrusaSlicer, OrcaSlicer, or CuraEngine CLI

#### File Formats

- **Input**: STL (binary and ASCII), OBJ, 3MF
- **Output**: G-code, 3MF (Bambu Lab extended format)

#### Mobile Optimization

The app is designed mobile-first with:
- Touch-friendly controls
- Responsive layout
- PWA-ready structure

### Research Notes

#### Bambu Lab Ecosystem

Bambu Lab printers use an extended 3MF format that includes:
- Standard 3MF model data
- G-code in a dedicated metadata folder
- Plate configuration and filament settings
- Thumbnail images for printer display

#### CLI Tools Available

- **BambuStudio CLI**: The desktop app includes command-line slicing capabilities
- **OrcaSlicer**: Popular open-source alternative with CLI support
- **PrusaSlicer**: Foundation for BambuStudio, full CLI support

### License

MIT