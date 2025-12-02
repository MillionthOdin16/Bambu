import { useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './GcodePreview.css';

/**
 * Parse G-code and extract path data
 */
function parseGcode(gcode, maxLayer = Infinity) {
  const paths = [];
  const lines = gcode.split('\n');
  
  let currentPos = { x: 0, y: 0, z: 0, e: 0 };
  let currentLayer = 0;
  let currentPath = [];
  let isExtruding = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Track layer changes
    if (trimmed.includes('; Layer at Z=')) {
      currentLayer++;
      if (currentLayer > maxLayer) break;
    }
    
    // Parse G0/G1 commands
    if (trimmed.startsWith('G0') || trimmed.startsWith('G1')) {
      const newPos = { ...currentPos };
      let hasMove = false;
      let hasExtrusion = false;
      
      // Parse coordinates
      const xMatch = trimmed.match(/X([-\d.]+)/);
      const yMatch = trimmed.match(/Y([-\d.]+)/);
      const zMatch = trimmed.match(/Z([-\d.]+)/);
      const eMatch = trimmed.match(/E([-\d.]+)/);
      
      if (xMatch) { newPos.x = parseFloat(xMatch[1]); hasMove = true; }
      if (yMatch) { newPos.y = parseFloat(yMatch[1]); hasMove = true; }
      if (zMatch) { newPos.z = parseFloat(zMatch[1]); hasMove = true; }
      if (eMatch) { 
        const newE = parseFloat(eMatch[1]);
        hasExtrusion = newE > currentPos.e;
        newPos.e = newE;
      }
      
      if (hasMove) {
        const isNowExtruding = hasExtrusion && (xMatch || yMatch);
        
        if (isNowExtruding !== isExtruding) {
          // State change - save current path and start new
          if (currentPath.length > 1 && isExtruding) {
            paths.push({
              points: [...currentPath],
              layer: currentLayer,
              type: 'extrusion'
            });
          }
          currentPath = [{ ...currentPos }, { ...newPos }];
          isExtruding = isNowExtruding;
        } else if (isExtruding) {
          currentPath.push({ ...newPos });
        }
        
        currentPos = newPos;
      }
    }
  }
  
  // Add final path
  if (currentPath.length > 1 && isExtruding) {
    paths.push({
      points: currentPath,
      layer: currentLayer,
      type: 'extrusion'
    });
  }
  
  return { paths, totalLayers: currentLayer };
}

/**
 * Component to render G-code paths
 */
function GcodePaths({ gcode, currentLayer, colorMode = 'layer' }) {
  const { paths, totalLayers } = useMemo(() => parseGcode(gcode, currentLayer), [gcode, currentLayer]);
  
  const geometry = useMemo(() => {
    const positions = [];
    const colors = [];
    
    for (const path of paths) {
      const layerProgress = path.layer / Math.max(totalLayers, 1);
      
      // Color based on layer or type
      let color;
      if (colorMode === 'layer') {
        // Rainbow gradient based on layer height
        const hue = layerProgress * 0.7; // Go from red to blue
        color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      } else {
        color = new THREE.Color('#00a862');
      }
      
      for (let i = 0; i < path.points.length - 1; i++) {
        const p1 = path.points[i];
        const p2 = path.points[i + 1];
        
        positions.push(p1.x, p1.y, p1.z);
        positions.push(p2.x, p2.y, p2.z);
        
        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);
      }
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geo;
  }, [paths, totalLayers, colorMode]);
  
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors />
    </lineSegments>
  );
}

/**
 * Build plate for preview
 */
function BuildPlate({ size = [256, 256] }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Grid */}
      <gridHelper 
        args={[Math.max(size[0], size[1]), 20, '#3a3a50', '#2a2a40']} 
        position={[size[0] / 2, size[1] / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Plate border */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              0, 0, 0,
              size[0], 0, 0,
              size[0], size[1], 0,
              0, size[1], 0
            ])}
            count={4}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00a862" linewidth={2} />
      </lineLoop>
    </group>
  );
}

/**
 * Main G-code preview component
 */
export default function GcodePreview({ 
  gcode, 
  stats,
  bedSize = [256, 256],
  onClose,
  onDownload,
  onDownload3MF
}) {
  const [currentLayer, setCurrentLayer] = useState(Infinity);
  const [colorMode, setColorMode] = useState('layer');
  
  const totalLayers = useMemo(() => {
    if (!gcode) return 0;
    const matches = gcode.match(/; Layer at Z=/g);
    return matches ? matches.length : 0;
  }, [gcode]);
  
  useEffect(() => {
    setCurrentLayer(totalLayers);
  }, [totalLayers]);
  
  if (!gcode) return null;
  
  return (
    <div className="gcode-preview">
      <div className="preview-header">
        <button className="back-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h2>G-code Preview</h2>
      </div>
      
      <div className="preview-viewport">
        <Canvas
          gl={{ antialias: true }}
          dpr={[1, 2]}
          style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)' }}
        >
          <PerspectiveCamera 
            makeDefault 
            position={[bedSize[0] * 1.5, -bedSize[1] * 0.5, bedSize[0] * 0.8]} 
            fov={45}
          />
          
          <ambientLight intensity={0.6} />
          
          <BuildPlate size={bedSize} />
          <GcodePaths gcode={gcode} currentLayer={currentLayer} colorMode={colorMode} />
          
          <OrbitControls 
            target={[bedSize[0] / 2, bedSize[1] / 2, 50]}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
      </div>
      
      <div className="preview-controls">
        <div className="layer-slider">
          <label>Layer: {currentLayer === Infinity ? totalLayers : currentLayer} / {totalLayers}</label>
          <input
            type="range"
            min={1}
            max={totalLayers || 1}
            value={currentLayer === Infinity ? totalLayers : currentLayer}
            onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
          />
        </div>
        
        <div className="color-mode">
          <button 
            className={colorMode === 'layer' ? 'active' : ''}
            onClick={() => setColorMode('layer')}
          >
            Layer Colors
          </button>
          <button 
            className={colorMode === 'solid' ? 'active' : ''}
            onClick={() => setColorMode('solid')}
          >
            Solid Color
          </button>
        </div>
      </div>
      
      {stats && (
        <div className="print-stats">
          <div className="stat">
            <span className="stat-label">Layers</span>
            <span className="stat-value">{stats.layerCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Height</span>
            <span className="stat-value">{stats.printHeight}mm</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{stats.estimatedTime}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Filament</span>
            <span className="stat-value">{stats.filamentWeight}g</span>
          </div>
        </div>
      )}
      
      <div className="preview-actions">
        <button className="download-button secondary" onClick={onDownload}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download G-code
        </button>
        <button className="download-button primary" onClick={onDownload3MF}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download 3MF (Bambu)
        </button>
      </div>
    </div>
  );
}
