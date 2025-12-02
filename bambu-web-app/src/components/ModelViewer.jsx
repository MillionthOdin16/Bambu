import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Component to display the 3D model
 */
function Model({ geometry, showWireframe = false }) {
  const meshRef = useRef();
  
  const bufferGeometry = useMemo(() => {
    if (!geometry || !geometry.vertices) return null;
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(geometry.vertices, 3));
    
    if (geometry.normals && geometry.normals.length > 0) {
      geo.setAttribute('normal', new THREE.BufferAttribute(geometry.normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    
    return geo;
  }, [geometry]);
  
  if (!bufferGeometry) return null;
  
  return (
    <group>
      <mesh ref={meshRef} geometry={bufferGeometry}>
        <meshStandardMaterial 
          color="#00a862" 
          metalness={0.1} 
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {showWireframe && (
        <lineSegments geometry={bufferGeometry}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </lineSegments>
      )}
    </group>
  );
}

/**
 * Build plate representation
 */
function BuildPlate({ size = [256, 256] }) {
  return (
    <group position={[0, 0, 0]}>
      <Grid
        position={[size[0] / 2, size[1] / 2, 0]}
        args={[size[0], size[1]]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#3a3a50"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#5a5a70"
        fadeDistance={300}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      {/* Build plate outline */}
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
 * Camera controller to handle auto-fit
 */
function CameraController({ geometry }) {
  const { camera } = useThree();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!geometry || !geometry.vertices || initialized.current) return;
    
    const vertices = geometry.vertices;
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < vertices.length; i += 3) {
      minX = Math.min(minX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      minZ = Math.min(minZ, vertices[i + 2]);
      maxX = Math.max(maxX, vertices[i]);
      maxY = Math.max(maxY, vertices[i + 1]);
      maxZ = Math.max(maxZ, vertices[i + 2]);
    }
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    
    const maxSize = Math.max(sizeX, sizeY, sizeZ);
    const distance = maxSize * 2;
    
    camera.position.set(
      centerX + distance * 0.7,
      centerY - distance * 0.7,
      centerZ + distance * 0.5
    );
    camera.lookAt(centerX, centerY, centerZ);
    camera.updateProjectionMatrix();
    
    initialized.current = true;
  }, [geometry, camera]);
  
  return null;
}

/**
 * Main ModelViewer component
 */
export default function ModelViewer({ 
  geometry, 
  bedSize = [256, 256],
  showWireframe = false,
  showBuildPlate = true,
  className = ''
}) {
  return (
    <div className={`model-viewer ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)' }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[200, -200, 200]} 
          fov={45}
          near={0.1}
          far={10000}
        />
        
        <CameraController geometry={geometry} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 100]} intensity={1} />
        <directionalLight position={[-100, -100, 50]} intensity={0.5} />
        
        <group position={[0, 0, 0]}>
          {showBuildPlate && <BuildPlate size={bedSize} />}
          
          {geometry && <Model geometry={geometry} showWireframe={showWireframe} />}
        </group>
        
        <OrbitControls 
          makeDefault
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          panSpeed={0.5}
          zoomSpeed={0.5}
          target={[bedSize[0] / 2, bedSize[1] / 2, 0]}
          maxPolarAngle={Math.PI}
          minDistance={10}
          maxDistance={1000}
        />
      </Canvas>
    </div>
  );
}
