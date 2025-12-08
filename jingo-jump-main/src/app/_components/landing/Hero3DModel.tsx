"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

interface ModelProps {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

function Model({ scale, position, rotation }: ModelProps) {
  const { scene } = useGLTF("/Rainbow_Bounce_House_1120203742_texture.glb");

  return (
    <primitive
      object={scene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

interface Hero3DModelProps {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export function Hero3DModel({ scale, position, rotation }: Hero3DModelProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} />
          <Model scale={scale} position={position} rotation={rotation} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
