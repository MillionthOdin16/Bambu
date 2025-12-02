/**
 * Parse STL file (binary or ASCII) and return geometry data
 */
export async function parseSTL(file) {
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  
  // Check if it's binary or ASCII STL
  const isBinary = checkIfBinarySTL(arrayBuffer);
  
  if (isBinary) {
    return parseBinarySTL(dataView);
  } else {
    const text = new TextDecoder().decode(arrayBuffer);
    return parseAsciiSTL(text);
  }
}

function checkIfBinarySTL(arrayBuffer) {
  // ASCII STL files start with "solid"
  const header = new Uint8Array(arrayBuffer, 0, 5);
  const headerStr = String.fromCharCode(...header);
  
  if (headerStr.toLowerCase() !== 'solid') {
    return true;
  }
  
  // Additional check: binary STL has triangle count at byte 80
  if (arrayBuffer.byteLength > 84) {
    const dataView = new DataView(arrayBuffer);
    const triangleCount = dataView.getUint32(80, true);
    const expectedSize = 84 + triangleCount * 50;
    
    // If size matches binary format, it's binary
    if (Math.abs(arrayBuffer.byteLength - expectedSize) <= 1) {
      return true;
    }
  }
  
  return false;
}

function parseBinarySTL(dataView) {
  const triangleCount = dataView.getUint32(80, true);
  const vertices = [];
  const normals = [];
  
  let offset = 84;
  
  for (let i = 0; i < triangleCount; i++) {
    // Normal vector
    const nx = dataView.getFloat32(offset, true);
    const ny = dataView.getFloat32(offset + 4, true);
    const nz = dataView.getFloat32(offset + 8, true);
    offset += 12;
    
    // Three vertices
    for (let j = 0; j < 3; j++) {
      const x = dataView.getFloat32(offset, true);
      const y = dataView.getFloat32(offset + 4, true);
      const z = dataView.getFloat32(offset + 8, true);
      offset += 12;
      
      vertices.push(x, y, z);
      normals.push(nx, ny, nz);
    }
    
    // Skip attribute byte count
    offset += 2;
  }
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    triangleCount
  };
}

function parseAsciiSTL(text) {
  const vertices = [];
  const normals = [];
  let triangleCount = 0;
  
  const lines = text.split('\n');
  let currentNormal = [0, 0, 1];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('facet normal')) {
      const parts = trimmed.split(/\s+/);
      currentNormal = [
        parseFloat(parts[2]),
        parseFloat(parts[3]),
        parseFloat(parts[4])
      ];
    } else if (trimmed.startsWith('vertex')) {
      const parts = trimmed.split(/\s+/);
      vertices.push(
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      );
      normals.push(...currentNormal);
    } else if (trimmed.startsWith('endfacet')) {
      triangleCount++;
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    triangleCount
  };
}

/**
 * Parse OBJ file
 */
export async function parseOBJ(file) {
  const text = await file.text();
  const lines = text.split('\n');
  
  const tempVertices = [];
  const tempNormals = [];
  const vertices = [];
  const normals = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    const parts = trimmed.split(/\s+/);
    
    if (parts[0] === 'v') {
      tempVertices.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      ]);
    } else if (parts[0] === 'vn') {
      tempNormals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      ]);
    } else if (parts[0] === 'f') {
      // Parse face - can be "v", "v/vt", "v/vt/vn", or "v//vn"
      const faceVertices = [];
      const faceNormals = [];
      
      for (let i = 1; i < parts.length; i++) {
        const indices = parts[i].split('/');
        const vIdx = parseInt(indices[0]) - 1;
        faceVertices.push(tempVertices[vIdx]);
        
        if (indices[2]) {
          const nIdx = parseInt(indices[2]) - 1;
          faceNormals.push(tempNormals[nIdx]);
        }
      }
      
      // Triangulate face (fan triangulation)
      for (let i = 1; i < faceVertices.length - 1; i++) {
        vertices.push(...faceVertices[0], ...faceVertices[i], ...faceVertices[i + 1]);
        
        if (faceNormals.length > 0) {
          normals.push(...faceNormals[0], ...faceNormals[i], ...faceNormals[i + 1]);
        } else {
          // Calculate face normal
          const v0 = faceVertices[0];
          const v1 = faceVertices[i];
          const v2 = faceVertices[i + 1];
          
          const u = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
          const v = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
          
          const n = [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0]
          ];
          
          const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
          if (len > 0) {
            n[0] /= len;
            n[1] /= len;
            n[2] /= len;
          }
          
          normals.push(...n, ...n, ...n);
        }
      }
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    triangleCount: vertices.length / 9
  };
}

/**
 * Calculate bounding box of geometry
 */
export function calculateBoundingBox(vertices) {
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
  
  return {
    min,
    max,
    center: {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2
    },
    size: {
      x: max.x - min.x,
      y: max.y - min.y,
      z: max.z - min.z
    }
  };
}

/**
 * Parse a 3MF file and extract model data
 */
export async function parse3MF(file) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  
  // Look for the model file (usually 3D/3dmodel.model)
  let modelContent = null;
  for (const filename of Object.keys(zip.files)) {
    if (filename.endsWith('.model')) {
      modelContent = await zip.files[filename].async('text');
      break;
    }
  }
  
  if (!modelContent) {
    throw new Error('No model file found in 3MF archive');
  }
  
  // Parse XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(modelContent, 'text/xml');
  
  const vertices = [];
  const normals = [];
  
  // Find mesh elements
  const meshes = xmlDoc.getElementsByTagName('mesh');
  
  for (const mesh of meshes) {
    const vertexElements = mesh.getElementsByTagName('vertex');
    const triangleElements = mesh.getElementsByTagName('triangle');
    
    const meshVertices = [];
    for (const vertex of vertexElements) {
      meshVertices.push([
        parseFloat(vertex.getAttribute('x')),
        parseFloat(vertex.getAttribute('y')),
        parseFloat(vertex.getAttribute('z'))
      ]);
    }
    
    for (const triangle of triangleElements) {
      const v1 = parseInt(triangle.getAttribute('v1'));
      const v2 = parseInt(triangle.getAttribute('v2'));
      const v3 = parseInt(triangle.getAttribute('v3'));
      
      const p1 = meshVertices[v1];
      const p2 = meshVertices[v2];
      const p3 = meshVertices[v3];
      
      vertices.push(...p1, ...p2, ...p3);
      
      // Calculate normal
      const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
      const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
      
      const n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ];
      
      const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
      if (len > 0) {
        n[0] /= len;
        n[1] /= len;
        n[2] /= len;
      }
      
      normals.push(...n, ...n, ...n);
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    triangleCount: vertices.length / 9
  };
}

/**
 * Detect file type and parse accordingly
 */
export async function parseModelFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'stl':
      return await parseSTL(file);
    case 'obj':
      return await parseOBJ(file);
    case '3mf':
      return await parse3MF(file);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}
