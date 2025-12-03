const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a safe random filename, preserving extension
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        // Allow only .stl extension for safety
        const safeExt = ext === '.stl' ? '.stl' : '.stl.unsafe'; 
        cb(null, randomName + safeExt);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ filepath: req.file.path, filename: req.file.filename });
});

app.post('/slice', (req, res) => {
    const { filepath, layer_height, infill_density, support_enable, filament_type, printer_model } = req.body;

    // Validate filepath is within uploads directory and exists (basic traversal check)
    if (!filepath || !fs.existsSync(filepath) || path.dirname(path.resolve(filepath)) !== path.resolve(uploadDir)) {
        return res.status(400).json({ error: 'Invalid file' });
    }

    const outputFilename = path.basename(filepath, path.extname(filepath)) + '.gcode';
    const outputPath = path.join(uploadDir, outputFilename);
    
    // Use a random config name to avoid conflicts
    const tempConfigPath = path.join(uploadDir, `temp_config_${crypto.randomBytes(8).toString('hex')}.ini`);

    // Determine profile
    let profilePath = 'profiles/bambu_x1c.ini'; // Default
    if (printer_model === 'a1_mini') {
        profilePath = 'profiles/bambu_a1_mini.ini';
    }

    if (!fs.existsSync(profilePath)) {
        return res.status(500).json({ error: `Profile not found: ${profilePath}` });
    }

    // Read base config
    const baseConfig = fs.readFileSync(profilePath, 'utf8');
    let newConfig = baseConfig;

    // Apply overrides
    // Sanitize numeric inputs
    const safeLayerHeight = parseFloat(layer_height);
    const safeInfill = parseInt(infill_density);
    
    if (!isNaN(safeLayerHeight)) {
        newConfig = newConfig.replace(/^layer_height = .*/m, `layer_height = ${safeLayerHeight}`);
    }
    if (!isNaN(safeInfill)) {
        newConfig = newConfig.replace(/^fill_density = .*/m, `fill_density = ${safeInfill}%`);
    }
    if (support_enable !== undefined) {
        const supportVal = support_enable ? '1' : '0';
        newConfig = newConfig.replace(/^support_material = .*/m, `support_material = ${supportVal}`);
    }
    if (filament_type) {
        // Filament type is string, but we only accept specific values in logic
        if (filament_type === 'PETG') {
             newConfig = newConfig.replace(/^first_layer_temperature = .*/m, `first_layer_temperature = 255`);
             newConfig = newConfig.replace(/^temperature = .*/m, `temperature = 255`);
             newConfig = newConfig.replace(/^first_layer_bed_temperature = .*/m, `first_layer_bed_temperature = 70`);
        } else if (filament_type === 'ABS') {
             newConfig = newConfig.replace(/^first_layer_temperature = .*/m, `first_layer_temperature = 260`);
             newConfig = newConfig.replace(/^temperature = .*/m, `temperature = 260`);
             newConfig = newConfig.replace(/^first_layer_bed_temperature = .*/m, `first_layer_bed_temperature = 90`);
        }
    }

    fs.writeFileSync(tempConfigPath, newConfig);

    // Run PrusaSlicer using execFile (avoids shell interpolation)
    const args = [
        '-g', filepath,
        '--load', tempConfigPath,
        '--output', outputPath
    ];

    console.log(`Executing prusa-slicer with args:`, args);

    execFile('prusa-slicer', args, (error, stdout, stderr) => {
        // Clean up temp config
        try {
            fs.unlinkSync(tempConfigPath);
        } catch (e) {
            console.error('Error deleting temp config', e);
        }

        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Slicing failed', details: stderr });
        }

        res.json({ 
            success: true, 
            gcode_path: outputPath, 
            download_url: `/uploads/${outputFilename}` 
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
