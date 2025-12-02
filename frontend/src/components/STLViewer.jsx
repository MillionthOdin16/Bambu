import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function STLViewer({ fileBlob, fileName, onModelLoad }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    if (!fileBlob || !mountRef.current) return;

    setLoading(true);
    setError(null);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 200);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Load STL
    const loader = new STLLoader();
    loader.load(
      fileBlob,
      (geometry) => {
        // Center geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Calculate model dimensions
        geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);

        const modelData = {
          x: size.x,
          y: size.y,
          z: size.z,
          volume: (size.x * size.y * size.z) / 1000 // Convert to cm³
        };

        setModelInfo(modelData);

        // Call parent callback with model dimensions
        if (onModelLoad) {
          onModelLoad(modelData);
        }

        // Create material and mesh
        const material = new THREE.MeshPhongMaterial({
          color: 0x00ae42,
          specular: 0x111111,
          shininess: 200,
          flatShading: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        meshRef.current = mesh;

        // Auto-fit camera
        const boundingBox = geometry.boundingBox;
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        camera.position.z = cameraZ;
        camera.updateProjectionMatrix();

        controls.update();
        setLoading(false);
      },
      (progress) => {
        // Progress callback
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`Loading: ${percentComplete.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading STL:', error);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    );

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [fileBlob]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
        <span className="font-medium">{fileName}</span>
        {modelInfo && (
          <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            📏 {modelInfo.x.toFixed(1)} × {modelInfo.y.toFixed(1)} × {modelInfo.z.toFixed(1)} mm
          </div>
        )}
      </div>

      <div className="viewer-container relative" ref={mountRef}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 mx-auto text-bambu-primary mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-white">Loading 3D model...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-red-400">
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>🖱️</span>
          <span>Left click: Rotate</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🖱️</span>
          <span>Right click: Pan</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔍</span>
          <span>Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
}

export default STLViewer;
