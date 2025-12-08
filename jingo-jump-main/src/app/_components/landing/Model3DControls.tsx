"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

interface Model3DControlsProps {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: [number, number, number]) => void;
  onRotationChange: (rotation: [number, number, number]) => void;
}

export function Model3DControls({
  scale,
  position,
  rotation,
  onScaleChange,
  onPositionChange,
  onRotationChange,
}: Model3DControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = () => {
    const config = {
      scale,
      position,
      rotation,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    alert("Configuration copied to clipboard!");
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="3D Model Controls"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96 max-h-[70vh] overflow-y-auto border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900">3D Model Controls</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-100 rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Scale */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Scale: {scale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Position X */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position X: {position[0].toFixed(2)}
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={position[0]}
                onChange={(e) =>
                  onPositionChange([parseFloat(e.target.value), position[1], position[2]])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Position Y */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position Y: {position[1].toFixed(2)}
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={position[1]}
                onChange={(e) =>
                  onPositionChange([position[0], parseFloat(e.target.value), position[2]])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Position Z */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position Z: {position[2].toFixed(2)}
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={position[2]}
                onChange={(e) =>
                  onPositionChange([position[0], position[1], parseFloat(e.target.value)])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Rotation X */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rotation X: {((rotation[0] * 180) / Math.PI).toFixed(0)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.1"
                value={rotation[0]}
                onChange={(e) =>
                  onRotationChange([parseFloat(e.target.value), rotation[1], rotation[2]])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Rotation Y */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rotation Y: {((rotation[1] * 180) / Math.PI).toFixed(0)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.1"
                value={rotation[1]}
                onChange={(e) =>
                  onRotationChange([rotation[0], parseFloat(e.target.value), rotation[2]])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Rotation Z */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rotation Z: {((rotation[2] * 180) / Math.PI).toFixed(0)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.1"
                value={rotation[2]}
                onChange={(e) =>
                  onRotationChange([rotation[0], rotation[1], parseFloat(e.target.value)])
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Copy Configuration Button */}
            <button
              onClick={copyToClipboard}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Copy Configuration
            </button>
          </div>
        </div>
      )}
    </>
  );
}
