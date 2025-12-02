import JSZip from 'jszip';

// Coordinate precision for 3MF export (decimal places)
const COORDINATE_PRECISION = 6;

/**
 * Generate a 3MF file for Bambu Lab printers
 * Bambu printers use an extended 3MF format with additional metadata
 */
export async function generate3MF(geometry, gcode, settings) {
  const zip = new JSZip();
  
  // Content Types
  zip.file('[Content_Types].xml', generateContentTypes());
  
  // Relationships
  zip.file('_rels/.rels', generateRelationships());
  
  // 3D model
  const folder3D = zip.folder('3D');
  folder3D.file('3dmodel.model', generateModelXML(geometry));
  folder3D.file('_rels/3dmodel.model.rels', generate3DRelationships());
  
  // Metadata
  zip.folder('Metadata');
  zip.file('Metadata/plate_1.json', generatePlateMetadata(settings));
  zip.file('Metadata/model_settings.config', generateModelSettings());
  zip.file('Metadata/project_settings.config', generateProjectSettings(settings));
  zip.file('Metadata/slice_info.config', generateSliceInfo(gcode));
  
  // Thumbnail (placeholder - in production would generate actual preview)
  // zip.file('Metadata/plate_1.png', generateThumbnail());
  
  // G-code
  zip.file('Metadata/plate_1.gcode', gcode);
  
  // Generate the ZIP file
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  return blob;
}

function generateContentTypes() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="gcode" ContentType="text/x.gcode" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="config" ContentType="text/xml" />
</Types>`;
}

function generateRelationships() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;
}

function generate3DRelationships() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
}

function generateModelXML(geometry) {
  const { vertices } = geometry;
  
  // Build vertex list
  let vertexList = '';
  const vertexMap = new Map();
  
  for (let i = 0; i < vertices.length; i += 3) {
    const key = `${vertices[i].toFixed(COORDINATE_PRECISION)},${vertices[i + 1].toFixed(COORDINATE_PRECISION)},${vertices[i + 2].toFixed(COORDINATE_PRECISION)}`;
    
    if (!vertexMap.has(key)) {
      vertexMap.set(key, vertexMap.size);
      vertexList += `        <vertex x="${vertices[i].toFixed(COORDINATE_PRECISION)}" y="${vertices[i + 1].toFixed(COORDINATE_PRECISION)}" z="${vertices[i + 2].toFixed(COORDINATE_PRECISION)}" />\n`;
    }
  }
  
  // Build triangle list
  let triangleList = '';
  for (let i = 0; i < vertices.length; i += 9) {
    const key1 = `${vertices[i].toFixed(COORDINATE_PRECISION)},${vertices[i + 1].toFixed(COORDINATE_PRECISION)},${vertices[i + 2].toFixed(COORDINATE_PRECISION)}`;
    const key2 = `${vertices[i + 3].toFixed(COORDINATE_PRECISION)},${vertices[i + 4].toFixed(COORDINATE_PRECISION)},${vertices[i + 5].toFixed(COORDINATE_PRECISION)}`;
    const key3 = `${vertices[i + 6].toFixed(COORDINATE_PRECISION)},${vertices[i + 7].toFixed(COORDINATE_PRECISION)},${vertices[i + 8].toFixed(COORDINATE_PRECISION)}`;
    
    const v1 = vertexMap.get(key1);
    const v2 = vertexMap.get(key2);
    const v3 = vertexMap.get(key3);
    
    triangleList += `        <triangle v1="${v1}" v2="${v2}" v3="${v3}" />\n`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06">
  <metadata name="Application">Bambu Web Slicer</metadata>
  <metadata name="CreationDate">${new Date().toISOString()}</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexList}        </vertices>
        <triangles>
${triangleList}        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" transform="1 0 0 0 1 0 0 0 1 0 0 0" />
  </build>
</model>`;
}

function generatePlateMetadata(settings) {
  return JSON.stringify({
    "plate_index": 1,
    "print_sequence": "by_layer",
    "printer": {
      "name": settings.printerProfile || "Bambu Lab X1 Carbon",
      "id": settings.printerProfile || "bambu_x1c"
    },
    "nozzle_diameter": 0.4,
    "objects": [
      {
        "id": 1,
        "name": "Model",
        "instances": [
          {
            "offset": [0, 0, 0],
            "rotation": [0, 0, 0],
            "scale": [1, 1, 1]
          }
        ]
      }
    ],
    "filament_settings": [
      {
        "id": 0,
        "type": "PLA",
        "color": "#00A862"
      }
    ]
  }, null, 2);
}

function generateModelSettings() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="1">
    <metadata type="object" key="name" value="Model"/>
    <metadata type="object" key="extruder" value="0"/>
  </object>
</config>`;
}

function generateProjectSettings(settings) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <header>
    <version>1.0.0</version>
    <application>Bambu Web Slicer</application>
    <creation_date>${new Date().toISOString()}</creation_date>
  </header>
  <print_settings>
    <layer_height>${settings.layerHeight || 0.2}</layer_height>
    <initial_layer_height>${settings.initialLayerHeight || 0.28}</initial_layer_height>
    <line_width>${settings.lineWidth || 0.4}</line_width>
    <wall_count>${settings.wallCount || 2}</wall_count>
    <top_layers>${settings.topLayers || 4}</top_layers>
    <bottom_layers>${settings.bottomLayers || 4}</bottom_layers>
    <infill_density>${settings.infillDensity || 15}</infill_density>
    <infill_pattern>${settings.infillPattern || 'grid'}</infill_pattern>
    <support_enabled>${settings.supportEnabled || false}</support_enabled>
  </print_settings>
  <filament_settings>
    <nozzle_temperature>${settings.nozzleTemp || 220}</nozzle_temperature>
    <bed_temperature>${settings.bedTemp || 60}</bed_temperature>
    <filament_diameter>${settings.filamentDiameter || 1.75}</filament_diameter>
  </filament_settings>
  <speed_settings>
    <print_speed>${settings.printSpeed || 50}</print_speed>
    <travel_speed>${settings.travelSpeed || 150}</travel_speed>
    <infill_speed>${settings.infillSpeed || 80}</infill_speed>
    <wall_speed>${settings.wallSpeed || 30}</wall_speed>
    <initial_layer_speed>${settings.initialLayerSpeed || 20}</initial_layer_speed>
  </speed_settings>
</config>`;
}

function generateSliceInfo(gcode) {
  // Parse G-code to extract statistics
  const lines = gcode.split('\n').length;
  const filamentMatch = gcode.match(/E([\d.]+)/g);
  let maxE = 0;
  if (filamentMatch) {
    for (const match of filamentMatch) {
      const e = parseFloat(match.substring(1));
      if (e > maxE) maxE = e;
    }
  }
  
  // Count layers
  const layerMatches = gcode.match(/; Layer at Z=/g);
  const layerCount = layerMatches ? layerMatches.length : 0;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <slice_info>
    <sliced_at>${new Date().toISOString()}</sliced_at>
    <slicer>Bambu Web Slicer</slicer>
    <slicer_version>1.0.0</slicer_version>
    <total_layers>${layerCount}</total_layers>
    <estimated_filament_mm>${maxE.toFixed(2)}</estimated_filament_mm>
    <gcode_lines>${lines}</gcode_lines>
  </slice_info>
</config>`;
}

/**
 * Download a file to the user's device
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate just G-code file for download
 */
export function downloadGcode(gcode, filename = 'print.gcode') {
  const blob = new Blob([gcode], { type: 'text/plain' });
  downloadFile(blob, filename);
}

/**
 * Generate and download 3MF file
 */
export async function download3MF(geometry, gcode, settings, filename = 'print.3mf') {
  const blob = await generate3MF(geometry, gcode, settings);
  downloadFile(blob, filename);
}
