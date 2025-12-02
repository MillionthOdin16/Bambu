import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Configure file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.stl');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.stl', '.obj', '.3mf'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only STL, OBJ, and 3MF files are allowed.'));
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bambu Web Slicer API is running' });
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      fileId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Slice endpoint
app.post('/api/slice', async (req, res) => {
  try {
    const { fileId, settings } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    const inputPath = join(__dirname, '../uploads', fileId);
    const outputDir = join(__dirname, '../output');
    await fs.mkdir(outputDir, { recursive: true });

    const outputFileName = `${fileId.replace('.stl', '')}-output.3mf`;
    const outputPath = join(outputDir, outputFileName);

    // Generate settings files
    const settingsResult = await generateSettingsFiles(settings);

    // Execute Bambu Studio CLI
    const result = await sliceWithBambuStudio(
      inputPath,
      outputPath,
      settingsResult.machine,
      settingsResult.process,
      settingsResult.filament
    );

    if (result.success) {
      res.json({
        success: true,
        outputFile: outputFileName,
        downloadUrl: `/api/download/${outputFileName}`
      });
    } else {
      res.status(500).json({
        error: 'Slicing failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Slice error:', error);
    res.status(500).json({ error: 'Failed to slice file', details: error.message });
  }
});

// Download endpoint
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = join(__dirname, '../output', filename);

    // Check if file exists
    await fs.access(filepath);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get available printer profiles
app.get('/api/printers', (req, res) => {
  res.json({
    printers: [
      { id: 'bambu_x1c', name: 'Bambu Lab X1 Carbon', buildVolume: '256x256x256' },
      { id: 'bambu_x1', name: 'Bambu Lab X1', buildVolume: '256x256x256' },
      { id: 'bambu_p1p', name: 'Bambu Lab P1P', buildVolume: '256x256x256' },
      { id: 'bambu_p1s', name: 'Bambu Lab P1S', buildVolume: '256x256x256' },
      { id: 'bambu_a1', name: 'Bambu Lab A1', buildVolume: '256x256x256' },
      { id: 'bambu_a1_mini', name: 'Bambu Lab A1 Mini', buildVolume: '180x180x180' }
    ]
  });
});

// Generate settings JSON files
async function generateSettingsFiles(settings) {
  const settingsDir = join(__dirname, '../settings');
  await fs.mkdir(settingsDir, { recursive: true });

  const machineSettings = {
    printer_model: settings.printer || 'Bambu Lab X1 Carbon',
    nozzle_diameter: [settings.nozzleDiameter || 0.4],
    printer_variant: 'default',
    bed_temperature: settings.bedTemp || 60,
    max_print_height: 256
  };

  const processSettings = {
    layer_height: settings.layerHeight || 0.2,
    initial_layer_height: settings.firstLayerHeight || 0.2,
    wall_loops: settings.wallCount || 2,
    top_shell_layers: settings.topLayers || 4,
    bottom_shell_layers: settings.bottomLayers || 4,
    sparse_infill_density: `${settings.infillDensity || 15}%`,
    sparse_infill_pattern: settings.infillPattern || 'grid',
    outer_wall_speed: settings.outerWallSpeed || 60,
    inner_wall_speed: settings.innerWallSpeed || 150,
    sparse_infill_speed: settings.infillSpeed || 150,
    top_surface_speed: settings.topSpeed || 100,
    enable_support: settings.enableSupport || false,
    support_type: settings.supportType || 'normal',
    support_interface_spacing: settings.supportDensity || 0.5,
    skirts: settings.skirt || 1,
    skirt_distance: 2,
    brim_width: settings.brimWidth || 0,
    enable_prime_tower: false
  };

  const filamentSettings = {
    filament_type: [settings.filamentType || 'PLA'],
    nozzle_temperature: [settings.nozzleTemp || 210],
    filament_flow_ratio: [settings.flowRate || 1.0],
    filament_density: [1.24],
    filament_cost: [20]
  };

  const machineFile = join(settingsDir, 'machine.json');
  const processFile = join(settingsDir, 'process.json');
  const filamentFile = join(settingsDir, 'filament.json');

  await fs.writeFile(machineFile, JSON.stringify(machineSettings, null, 2));
  await fs.writeFile(processFile, JSON.stringify(processSettings, null, 2));
  await fs.writeFile(filamentFile, JSON.stringify(filamentSettings, null, 2));

  return { machine: machineFile, process: processFile, filament: filamentFile };
}

// Execute Bambu Studio CLI slicing
function sliceWithBambuStudio(inputPath, outputPath, machineFile, processFile, filamentFile) {
  return new Promise((resolve, reject) => {
    const bambuStudioPath = process.env.BAMBU_STUDIO_PATH || 'bambu-studio';

    const args = [
      '--orient',
      '--arrange', '1',
      '--load-settings', `${machineFile};${processFile}`,
      '--load-filaments', filamentFile,
      '--slice', '2',
      '--export-3mf', outputPath,
      inputPath
    ];

    console.log('Executing:', bambuStudioPath, args.join(' '));

    const process = spawn(bambuStudioPath, args);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('stdout:', data.toString());
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('stderr:', data.toString());
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        resolve({
          success: false,
          error: `Process exited with code ${code}`,
          stdout,
          stderr
        });
      }
    });

    process.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bambu Web Slicer API running on port ${PORT}`);
  console.log(`📁 Upload directory: ${join(__dirname, '../uploads')}`);
  console.log(`📦 Output directory: ${join(__dirname, '../output')}`);
});
