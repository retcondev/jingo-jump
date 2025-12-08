"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { Box, RotateCcw } from "lucide-react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} />;
}

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block animate-spin">
          <Box className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Loading 3D Model...</p>
      </div>
    </div>
  );
}

interface ModelViewerProps {
  modelUrl: string;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      {/* 3D View Label */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm">
        <Box className="h-4 w-4 text-primary-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">3D View</span>
      </div>

      {/* Reset View Button */}
      <button
        onClick={() => window.location.reload()}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
        title="Reset Camera"
      >
        <RotateCcw className="h-4 w-4 text-slate-600" />
        <span className="text-xs font-semibold text-slate-700">Reset</span>
      </button>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/75 px-5 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-medium text-white">
          <span className="opacity-75">Drag to rotate • Scroll to zoom • Right-click to pan</span>
        </p>
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Model */}
          <Model url={modelUrl} />
          
          {/* Ground Shadow */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Loading Fallback */}
      <Suspense fallback={<Loader />}>
        <div className="hidden" />
      </Suspense>
    </div>
  );
}