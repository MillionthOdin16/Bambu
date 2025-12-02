// Printer configurations with detailed specifications
export const printerConfigs = {
  bambu_a1_mini: {
    id: 'bambu_a1_mini',
    name: 'Bambu Lab A1 Mini',
    displayName: 'A1 Mini',
    buildVolume: { x: 180, y: 180, z: 180 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 250,
    features: {
      multiColor: false,
      enclosure: false,
      camera: true,
      autoLeveling: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 2,
      topLayers: 4,
      bottomLayers: 3,
      outerWallSpeed: 100,
      innerWallSpeed: 250,
      infillSpeed: 250,
      topSpeed: 150,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      'PLA Matte': { nozzle: 220, bed: 65, maxSpeed: 500 },
      'PLA Silk': { nozzle: 230, bed: 65, maxSpeed: 400 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 200, requiresEnclosure: true }
    },
    tips: [
      'A1 Mini works best with PLA and PETG filaments',
      'For ABS printing, consider adding an enclosure due to lack of built-in one',
      'Smaller build volume means you may need to scale or split larger models',
      'Auto-leveling ensures consistent first layers - no manual adjustment needed'
    ]
  },
  bambu_a1: {
    id: 'bambu_a1',
    name: 'Bambu Lab A1',
    displayName: 'A1',
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 250,
    features: {
      multiColor: true,
      enclosure: false,
      camera: true,
      autoLeveling: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 2,
      topLayers: 4,
      bottomLayers: 3,
      outerWallSpeed: 100,
      innerWallSpeed: 250,
      infillSpeed: 250,
      topSpeed: 150,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 200, requiresEnclosure: true }
    }
  },
  bambu_p1p: {
    id: 'bambu_p1p',
    name: 'Bambu Lab P1P',
    displayName: 'P1P',
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 300,
    features: {
      multiColor: false,
      enclosure: false,
      camera: false,
      autoLeveling: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 3,
      topLayers: 5,
      bottomLayers: 4,
      outerWallSpeed: 150,
      innerWallSpeed: 300,
      infillSpeed: 300,
      topSpeed: 200,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 300, requiresEnclosure: true }
    }
  },
  bambu_p1s: {
    id: 'bambu_p1s',
    name: 'Bambu Lab P1S',
    displayName: 'P1S',
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 300,
    features: {
      multiColor: false,
      enclosure: true,
      camera: true,
      autoLeveling: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 3,
      topLayers: 5,
      bottomLayers: 4,
      outerWallSpeed: 150,
      innerWallSpeed: 300,
      infillSpeed: 300,
      topSpeed: 200,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 300 },
      ASA: { nozzle: 270, bed: 90, maxSpeed: 300 },
      PA: { nozzle: 280, bed: 90, maxSpeed: 200 },
      PC: { nozzle: 280, bed: 90, maxSpeed: 200 }
    }
  },
  bambu_x1: {
    id: 'bambu_x1',
    name: 'Bambu Lab X1',
    displayName: 'X1',
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 330,
    features: {
      multiColor: false,
      enclosure: false,
      camera: true,
      autoLeveling: true,
      lidar: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 3,
      topLayers: 5,
      bottomLayers: 4,
      outerWallSpeed: 170,
      innerWallSpeed: 300,
      infillSpeed: 300,
      topSpeed: 200,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 330 },
      ASA: { nozzle: 270, bed: 90, maxSpeed: 330 },
      PA: { nozzle: 280, bed: 90, maxSpeed: 200 },
      PC: { nozzle: 280, bed: 90, maxSpeed: 200 }
    }
  },
  bambu_x1c: {
    id: 'bambu_x1c',
    name: 'Bambu Lab X1 Carbon',
    displayName: 'X1 Carbon',
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleDiameters: [0.2, 0.4, 0.6, 0.8],
    defaultNozzle: 0.4,
    maxSpeed: 500,
    recommendedSpeed: 330,
    features: {
      multiColor: true,
      enclosure: true,
      camera: true,
      autoLeveling: true,
      lidar: true,
      ams: true
    },
    defaultSettings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 3,
      topLayers: 5,
      bottomLayers: 4,
      outerWallSpeed: 170,
      innerWallSpeed: 300,
      infillSpeed: 300,
      topSpeed: 200,
      firstLayerSpeed: 50,
      nozzleTemp: 220,
      bedTemp: 65,
      firstLayerBedTemp: 65
    },
    filamentProfiles: {
      PLA: { nozzle: 220, bed: 65, maxSpeed: 500 },
      PETG: { nozzle: 250, bed: 80, maxSpeed: 300 },
      TPU: { nozzle: 230, bed: 45, maxSpeed: 30 },
      ABS: { nozzle: 270, bed: 90, maxSpeed: 330 },
      ASA: { nozzle: 270, bed: 90, maxSpeed: 330 },
      PA: { nozzle: 280, bed: 90, maxSpeed: 200 },
      PC: { nozzle: 280, bed: 90, maxSpeed: 200 },
      PVA: { nozzle: 200, bed: 55, maxSpeed: 200 }
    }
  }
};

// Print presets for quick selection
export const printPresets = {
  draft: {
    name: 'Draft (Fast)',
    icon: '⚡',
    description: 'Quick prints with lower quality',
    settings: {
      layerHeight: 0.28,
      infillDensity: 10,
      wallCount: 2,
      topLayers: 3,
      bottomLayers: 3,
      infillPattern: 'lines'
    }
  },
  standard: {
    name: 'Standard (Balanced)',
    icon: '⚖️',
    description: 'Good balance of speed and quality',
    settings: {
      layerHeight: 0.2,
      infillDensity: 15,
      wallCount: 2,
      topLayers: 4,
      bottomLayers: 3,
      infillPattern: 'grid'
    }
  },
  quality: {
    name: 'Quality (Detailed)',
    icon: '✨',
    description: 'High quality prints, slower speed',
    settings: {
      layerHeight: 0.12,
      infillDensity: 20,
      wallCount: 3,
      topLayers: 5,
      bottomLayers: 4,
      infillPattern: 'gyroid'
    }
  },
  strong: {
    name: 'Strong (Functional)',
    icon: '💪',
    description: 'Maximum strength for functional parts',
    settings: {
      layerHeight: 0.2,
      infillDensity: 40,
      wallCount: 4,
      topLayers: 6,
      bottomLayers: 5,
      infillPattern: 'gyroid'
    }
  },
  miniature: {
    name: 'Miniature (Ultra Detail)',
    icon: '🎭',
    description: 'Perfect for detailed miniatures',
    settings: {
      layerHeight: 0.08,
      infillDensity: 10,
      wallCount: 2,
      topLayers: 6,
      bottomLayers: 4,
      infillPattern: 'grid',
      enableSupport: true
    }
  },
  vase: {
    name: 'Vase Mode',
    icon: '🏺',
    description: 'Single-wall spiralized prints',
    settings: {
      layerHeight: 0.2,
      infillDensity: 0,
      wallCount: 1,
      topLayers: 0,
      bottomLayers: 3,
      infillPattern: 'lines'
    }
  }
};

export const getPrinterConfig = (printerId) => {
  return printerConfigs[printerId] || printerConfigs.bambu_x1c;
};

export const getAllPrinters = () => {
  return Object.values(printerConfigs).map(printer => ({
    id: printer.id,
    name: printer.name,
    displayName: printer.displayName,
    buildVolume: `${printer.buildVolume.x}×${printer.buildVolume.y}×${printer.buildVolume.z}mm`,
    features: printer.features
  }));
};

export const getFilamentProfile = (printerId, filamentType) => {
  const printer = printerConfigs[printerId];
  return printer?.filamentProfiles[filamentType] || null;
};

export const estimatePrintTime = (settings, modelSize) => {
  // Rough estimation based on layer height and speeds
  const { layerHeight, outerWallSpeed, infillSpeed } = settings;
  const layers = Math.ceil(modelSize.z / layerHeight);

  // Very rough approximation
  const avgSpeed = (outerWallSpeed + infillSpeed) / 2;
  const minutesPerLayer = 60 / avgSpeed;
  const totalMinutes = layers * minutesPerLayer;

  return Math.round(totalMinutes);
};

export const estimateMaterial = (settings, modelVolume) => {
  // Estimate filament usage in grams
  const { infillDensity } = settings;
  const density = 1.24; // PLA density g/cm³

  // Rough approximation
  const solidVolume = modelVolume * (infillDensity / 100);
  const grams = solidVolume * density;

  return Math.round(grams);
};

export const validateModelSize = (modelSize, printerId) => {
  const printer = printerConfigs[printerId];
  if (!printer) return { valid: true };

  const { buildVolume } = printer;
  const oversized = {
    x: modelSize.x > buildVolume.x,
    y: modelSize.y > buildVolume.y,
    z: modelSize.z > buildVolume.z
  };

  const isOversized = oversized.x || oversized.y || oversized.z;

  if (isOversized) {
    const scale = Math.min(
      buildVolume.x / modelSize.x,
      buildVolume.y / modelSize.y,
      buildVolume.z / modelSize.z
    );

    return {
      valid: false,
      oversized,
      recommendedScale: Math.floor(scale * 100),
      message: `Model exceeds build volume. Consider scaling to ${Math.floor(scale * 100)}%`
    };
  }

  return { valid: true };
};
