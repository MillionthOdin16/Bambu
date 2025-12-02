/**
 * Simplified slicer for generating G-code from 3D geometry
 * This is a basic implementation for demonstration - production use would
 * integrate with CuraEngine WASM or a server-side slicer
 */

// Default slicer settings
export const defaultSettings = {
  // Print quality
  layerHeight: 0.2,
  initialLayerHeight: 0.28,
  lineWidth: 0.4,
  
  // Infill
  infillDensity: 15,
  infillPattern: 'grid',
  
  // Shell
  wallCount: 2,
  topLayers: 4,
  bottomLayers: 4,
  
  // Speed (mm/s)
  printSpeed: 50,
  infillSpeed: 80,
  wallSpeed: 30,
  travelSpeed: 150,
  initialLayerSpeed: 20,
  
  // Temperature
  nozzleTemp: 220,
  bedTemp: 60,
  
  // Support
  supportEnabled: false,
  supportDensity: 15,
  supportAngle: 45,
  
  // Adhesion
  adhesionType: 'skirt', // skirt, brim, raft, none
  skirtLineCount: 3,
  brimWidth: 8,
  
  // Retraction
  retractionEnabled: true,
  retractionDistance: 0.8,
  retractionSpeed: 35,
  
  // Bed size (Bambu Lab X1/P1 series)
  bedSizeX: 256,
  bedSizeY: 256,
  bedSizeZ: 256,
  
  // Filament
  filamentDiameter: 1.75,
  flowRate: 100,
  
  // Printer type
  printerProfile: 'bambu_x1c'
};

/**
 * Generate G-code header
 */
function generateHeader(settings) {
  return `; Bambu Web Slicer G-code
; Generated: ${new Date().toISOString()}
; 
; Printer: ${settings.printerProfile}
; Layer height: ${settings.layerHeight}mm
; Infill: ${settings.infillDensity}%
; Support: ${settings.supportEnabled ? 'Yes' : 'No'}
;

; Printer initialization
M82 ; Set extruder to absolute mode
G28 ; Home all axes
M140 S${settings.bedTemp} ; Set bed temperature
M104 S${settings.nozzleTemp} ; Set nozzle temperature
M190 S${settings.bedTemp} ; Wait for bed temperature
M109 S${settings.nozzleTemp} ; Wait for nozzle temperature

; Prime nozzle
G92 E0 ; Reset extruder position
G1 Z5 F3000 ; Move up
G1 X10 Y10 F${settings.travelSpeed * 60} ; Move to corner
G1 Z0.3 F3000 ; Lower nozzle
G1 X100 E20 F1000 ; Prime line
G1 X110 F${settings.travelSpeed * 60} ; Wipe
G92 E0 ; Reset extruder

`;
}

/**
 * Generate G-code footer
 */
function generateFooter(settings) {
  return `
; End G-code
M104 S0 ; Turn off nozzle heater
M140 S0 ; Turn off bed heater
G91 ; Relative positioning
G1 Z10 F3000 ; Raise Z
G90 ; Absolute positioning
G1 X0 Y${settings.bedSizeY} F${settings.travelSpeed * 60} ; Present print
M84 ; Disable steppers
; Print complete
`;
}

/**
 * Slice model geometry into layers
 */
function sliceGeometry(vertices, bounds, settings) {
  const layers = [];
  const startZ = bounds.min.z + settings.initialLayerHeight / 2;
  const endZ = bounds.max.z;
  
  let currentZ = startZ;
  let isFirstLayer = true;
  
  while (currentZ < endZ) {
    const height = isFirstLayer ? settings.initialLayerHeight : settings.layerHeight;
    const layer = {
      z: currentZ,
      height: height,
      isFirst: isFirstLayer,
      perimeters: [],
      infill: [],
      paths: []
    };
    
    // Find triangles that intersect this layer
    const intersections = findLayerIntersections(vertices, currentZ);
    
    if (intersections.length > 0) {
      // Generate perimeter paths
      const perimeter = generatePerimeter(intersections, bounds, settings);
      layer.perimeters = perimeter;
      
      // Generate infill
      if (settings.infillDensity > 0) {
        layer.infill = generateInfill(perimeter, bounds, settings, layers.length);
      }
    }
    
    layers.push(layer);
    currentZ += isFirstLayer ? settings.initialLayerHeight : settings.layerHeight;
    isFirstLayer = false;
  }
  
  return layers;
}

/**
 * Find intersections of triangles with a horizontal plane
 */
function findLayerIntersections(vertices, z) {
  const intersections = [];
  
  for (let i = 0; i < vertices.length; i += 9) {
    const v1 = { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
    const v2 = { x: vertices[i + 3], y: vertices[i + 4], z: vertices[i + 5] };
    const v3 = { x: vertices[i + 6], y: vertices[i + 7], z: vertices[i + 8] };
    
    // Check if triangle intersects plane at z
    const above = [v1.z >= z, v2.z >= z, v3.z >= z];
    const below = [v1.z < z, v2.z < z, v3.z < z];
    
    // Triangle intersects if some vertices are above and some below
    const hasAbove = above.some(a => a);
    const hasBelow = below.some(b => b);
    
    if (hasAbove && hasBelow) {
      // Find intersection points
      const points = [];
      
      const edges = [[v1, v2], [v2, v3], [v3, v1]];
      for (const [a, b] of edges) {
        if ((a.z >= z && b.z < z) || (a.z < z && b.z >= z)) {
          const t = (z - a.z) / (b.z - a.z);
          points.push({
            x: a.x + t * (b.x - a.x),
            y: a.y + t * (b.y - a.y)
          });
        }
      }
      
      if (points.length === 2) {
        intersections.push([points[0], points[1]]);
      }
    }
  }
  
  return intersections;
}

/**
 * Generate perimeter from layer intersections
 */
function generatePerimeter(intersections, bounds, settings) {
  if (intersections.length === 0) return [];
  
  // Simple approach: create bounding contour
  // In production, this would use proper polygon construction
  const paths = [];
  
  // Sort and connect line segments into paths
  const segments = [...intersections];
  
  while (segments.length > 0) {
    const path = [segments[0][0], segments[0][1]];
    segments.splice(0, 1);
    
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const lastPoint = path[path.length - 1];
        const firstPoint = path[0];
        
        const d1 = distance(lastPoint, seg[0]);
        const d2 = distance(lastPoint, seg[1]);
        const d3 = distance(firstPoint, seg[0]);
        const d4 = distance(firstPoint, seg[1]);
        
        const threshold = settings.lineWidth * 2;
        
        if (d1 < threshold) {
          path.push(seg[1]);
          segments.splice(i, 1);
          changed = true;
          break;
        } else if (d2 < threshold) {
          path.push(seg[0]);
          segments.splice(i, 1);
          changed = true;
          break;
        } else if (d3 < threshold) {
          path.unshift(seg[1]);
          segments.splice(i, 1);
          changed = true;
          break;
        } else if (d4 < threshold) {
          path.unshift(seg[0]);
          segments.splice(i, 1);
          changed = true;
          break;
        }
      }
    }
    
    if (path.length > 2) {
      paths.push(path);
    }
  }
  
  return paths;
}

function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate infill pattern
 */
function generateInfill(perimeter, bounds, settings, layerIndex) {
  if (perimeter.length === 0) return [];
  
  const spacing = settings.lineWidth * (100 / settings.infillDensity);
  const infillPaths = [];
  
  // Generate grid infill
  // Alternate direction each layer for better strength
  const angle = layerIndex % 2 === 0 ? 45 : -45;
  const radians = angle * Math.PI / 180;
  
  const minX = bounds.min.x;
  const maxX = bounds.max.x;
  const minY = bounds.min.y;
  const maxY = bounds.max.y;
  
  // Generate parallel lines
  const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));
  const numLines = Math.ceil(diagonal / spacing);
  
  for (let i = -numLines; i <= numLines; i++) {
    const offset = i * spacing;
    
    // Line in rotated coordinates
    const path = [];
    
    // Sample points along the line
    for (let t = 0; t <= 1; t += 0.02) {
      const x = minX + t * (maxX - minX);
      const y = minY + offset + (x - minX) * Math.tan(radians);
      
      if (y >= minY && y <= maxY && isInsidePerimeter({ x, y }, perimeter)) {
        if (path.length === 0 || distance(path[path.length - 1], { x, y }) < spacing * 2) {
          path.push({ x, y });
        } else {
          if (path.length > 1) {
            infillPaths.push([...path]);
          }
          path.length = 0;
          path.push({ x, y });
        }
      }
    }
    
    if (path.length > 1) {
      infillPaths.push(path);
    }
  }
  
  return infillPaths;
}

/**
 * Simple point-in-polygon test
 */
function isInsidePerimeter(point, paths) {
  for (const path of paths) {
    if (isPointInPolygon(point, path)) {
      return true;
    }
  }
  return false;
}

function isPointInPolygon(point, polygon) {
  if (polygon.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Convert layer data to G-code moves
 */
function layerToGcode(layer, settings, extrusionState) {
  let gcode = '';
  const wallSpeed = layer.isFirst ? settings.initialLayerSpeed : settings.wallSpeed;
  
  // Layer change
  gcode += `; Layer at Z=${layer.z.toFixed(3)}mm\n`;
  gcode += `G1 Z${layer.z.toFixed(3)} F3000\n`;
  
  // Print perimeters
  for (const path of layer.perimeters) {
    if (path.length < 2) continue;
    
    // Move to start
    const start = path[0];
    
    // Retract before travel
    if (settings.retractionEnabled) {
      extrusionState.e -= settings.retractionDistance;
      gcode += `G1 E${extrusionState.e.toFixed(5)} F${settings.retractionSpeed * 60}\n`;
    }
    
    gcode += `G0 X${start.x.toFixed(3)} Y${start.y.toFixed(3)} F${settings.travelSpeed * 60}\n`;
    
    // Unretract
    if (settings.retractionEnabled) {
      extrusionState.e += settings.retractionDistance;
      gcode += `G1 E${extrusionState.e.toFixed(5)} F${settings.retractionSpeed * 60}\n`;
    }
    
    // Print path
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const dist = distance(prev, curr);
      
      // Calculate extrusion
      const extrusion = calculateExtrusion(dist, layer.height, settings);
      extrusionState.e += extrusion;
      
      gcode += `G1 X${curr.x.toFixed(3)} Y${curr.y.toFixed(3)} E${extrusionState.e.toFixed(5)} F${wallSpeed * 60}\n`;
    }
    
    // Close the loop if it's a closed path
    if (path.length > 2 && distance(path[0], path[path.length - 1]) < settings.lineWidth * 2) {
      const dist = distance(path[path.length - 1], path[0]);
      const extrusion = calculateExtrusion(dist, layer.height, settings);
      extrusionState.e += extrusion;
      gcode += `G1 X${path[0].x.toFixed(3)} Y${path[0].y.toFixed(3)} E${extrusionState.e.toFixed(5)} F${wallSpeed * 60}\n`;
    }
  }
  
  // Print infill
  const infillSpeed = layer.isFirst ? settings.initialLayerSpeed : settings.infillSpeed;
  
  for (const path of layer.infill) {
    if (path.length < 2) continue;
    
    const start = path[0];
    
    // Retract before travel
    if (settings.retractionEnabled) {
      extrusionState.e -= settings.retractionDistance;
      gcode += `G1 E${extrusionState.e.toFixed(5)} F${settings.retractionSpeed * 60}\n`;
    }
    
    gcode += `G0 X${start.x.toFixed(3)} Y${start.y.toFixed(3)} F${settings.travelSpeed * 60}\n`;
    
    // Unretract
    if (settings.retractionEnabled) {
      extrusionState.e += settings.retractionDistance;
      gcode += `G1 E${extrusionState.e.toFixed(5)} F${settings.retractionSpeed * 60}\n`;
    }
    
    // Print infill line
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const dist = distance(prev, curr);
      
      const extrusion = calculateExtrusion(dist, layer.height, settings);
      extrusionState.e += extrusion;
      
      gcode += `G1 X${curr.x.toFixed(3)} Y${curr.y.toFixed(3)} E${extrusionState.e.toFixed(5)} F${infillSpeed * 60}\n`;
    }
  }
  
  return gcode;
}

/**
 * Calculate extrusion amount for a move
 */
function calculateExtrusion(distance, layerHeight, settings) {
  const crossSection = layerHeight * settings.lineWidth;
  const volume = distance * crossSection;
  const filamentArea = Math.PI * Math.pow(settings.filamentDiameter / 2, 2);
  return (volume / filamentArea) * (settings.flowRate / 100);
}

/**
 * Main slicing function
 */
export async function sliceModel(geometry, settings) {
  const mergedSettings = { ...defaultSettings, ...settings };
  const { vertices } = geometry;
  
  // Calculate bounds
  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };
  
  for (let i = 0; i < vertices.length; i += 3) {
    min.x = Math.min(min.x, vertices[i]);
    min.y = Math.min(min.y, vertices[i + 1]);
    min.z = Math.min(min.z, vertices[i + 2]);
    max.x = Math.max(max.x, vertices[i]);
    max.y = Math.max(max.y, vertices[i + 1]);
    max.z = Math.max(max.z, vertices[i + 2]);
  }
  
  // Center model on bed
  const centerX = mergedSettings.bedSizeX / 2;
  const centerY = mergedSettings.bedSizeY / 2;
  const modelCenterX = (min.x + max.x) / 2;
  const modelCenterY = (min.y + max.y) / 2;
  const offsetX = centerX - modelCenterX;
  const offsetY = centerY - modelCenterY;
  const offsetZ = -min.z; // Place on bed
  
  // Create offset vertices
  const offsetVertices = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i += 3) {
    offsetVertices[i] = vertices[i] + offsetX;
    offsetVertices[i + 1] = vertices[i + 1] + offsetY;
    offsetVertices[i + 2] = vertices[i + 2] + offsetZ;
  }
  
  // Update bounds for centered model
  const centeredBounds = {
    min: { x: min.x + offsetX, y: min.y + offsetY, z: 0 },
    max: { x: max.x + offsetX, y: max.y + offsetY, z: max.z - min.z }
  };
  
  // Slice into layers
  const layers = sliceGeometry(offsetVertices, centeredBounds, mergedSettings);
  
  // Generate G-code
  let gcode = generateHeader(mergedSettings);
  const extrusionState = { e: 0 };
  
  // Process layers
  for (const layer of layers) {
    gcode += layerToGcode(layer, mergedSettings, extrusionState);
  }
  
  gcode += generateFooter(mergedSettings);
  
  // Calculate print statistics
  const printHeight = centeredBounds.max.z;
  const estimatedTime = estimatePrintTime(layers, mergedSettings);
  const filamentUsed = extrusionState.e;
  
  return {
    gcode,
    layers,
    stats: {
      layerCount: layers.length,
      printHeight: printHeight.toFixed(2),
      estimatedTime: formatTime(estimatedTime),
      estimatedTimeSeconds: estimatedTime,
      filamentUsed: (filamentUsed / 1000).toFixed(2), // in meters
      filamentWeight: (filamentUsed * Math.PI * Math.pow(mergedSettings.filamentDiameter / 2, 2) * 1.24 / 1000).toFixed(1) // in grams, assuming PLA density
    }
  };
}

/**
 * Estimate print time
 */
function estimatePrintTime(layers, settings) {
  let totalTime = 0;
  
  // Add heating time
  totalTime += 60; // Approximate heating time
  
  for (const layer of layers) {
    const speed = layer.isFirst ? settings.initialLayerSpeed : settings.printSpeed;
    
    // Calculate perimeter time
    for (const path of layer.perimeters) {
      let pathLength = 0;
      for (let i = 1; i < path.length; i++) {
        pathLength += distance(path[i - 1], path[i]);
      }
      totalTime += pathLength / speed;
    }
    
    // Calculate infill time
    for (const path of layer.infill) {
      let pathLength = 0;
      for (let i = 1; i < path.length; i++) {
        pathLength += distance(path[i - 1], path[i]);
      }
      totalTime += pathLength / settings.infillSpeed;
    }
    
    // Add layer change time
    totalTime += 1;
  }
  
  return totalTime;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
