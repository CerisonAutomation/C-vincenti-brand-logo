import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut, Home, Maximize2 } from 'lucide-react';

interface Property3DViewerProps {
  propertyId: string;
  images: string[];
  className?: string;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex items-center gap-2 text-white">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  );
}

function PropertyScene({ images }: { images: string[] }) {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  // Create a simple 3D scene with images as textures
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const materials = images.slice(0, 6).map((imageUrl) => {
    const texture = new THREE.TextureLoader().load(imageUrl);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  });

  // Fill remaining faces with default material
  while (materials.length < 6) {
    materials.push(new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide }));
  }

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={materials} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.8}
        rotateSpeed={0.4}
      />
    </group>
  );
}

function Controls({ onReset, onZoomIn, onZoomOut, onFullscreen }: {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
}) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
      >
        <Home className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onZoomIn}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onZoomOut}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onFullscreen}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

export const Property3DViewer: React.FC<Property3DViewerProps> = ({
  propertyId,
  images,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleReset = () => {
    // Reset camera position
  };

  const handleZoomIn = () => {
    // Zoom in
  };

  const handleZoomOut = () => {
    // Zoom out
  };

  const handleFullscreen = () => {
    if (canvasRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden ${className}`}
    >
      <Suspense fallback={<Loader />}>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <PropertyScene images={images} />
        </Canvas>
      </Suspense>

      <Controls
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
      />

      {/* VR Mode Toggle */}
      <div className="absolute bottom-4 right-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Enter VR Mode
        </motion.button>
      </div>

      {/* Loading Overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading 3D Experience...</p>
          </div>
        </div>
      }>
      </Suspense>
    </motion.div>
  );
};
