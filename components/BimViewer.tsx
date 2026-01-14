import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stage } from '@react-three/drei';
import * as THREE from 'three';

interface BimViewerProps {
    modelUrl: string;
    progressUpdate?: Record<string, string>; // { "nodeName": "completed" | "in_progress" }
    autoRotate?: boolean;
}

const statusColors = {
    completed: new THREE.Color('#22c55e'), // Green-500
    in_progress: new THREE.Color('#3b82f6'), // Blue-500
    not_started: new THREE.Color('#94a3b8'), // Slate-400
    default: new THREE.Color('#cbd5e1')      // Slate-300
};

function Model({ url, progressUpdate }: { url: string; progressUpdate?: Record<string, string> }) {
    const { scene } = useGLTF(url);

    // Clone scene to avoid mutating cached model if reused
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Apply colors based on progress
    useMemo(() => {
        if (!progressUpdate) return;

        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const status = progressUpdate[mesh.name] || progressUpdate[mesh.userData.name];

                if (status) {
                    // Create a new material to avoid affecting other instances
                    const material = new THREE.MeshStandardMaterial({
                        color: statusColors[status as keyof typeof statusColors] || statusColors.default,
                        metalness: 0.5,
                        roughness: 0.5
                    });
                    mesh.material = material;
                }
            }
        });
    }, [clonedScene, progressUpdate]);

    return <primitive object={clonedScene} />;
}

const BimViewer: React.FC<BimViewerProps> = ({ modelUrl, progressUpdate, autoRotate = false }) => {
    return (
        <div className="w-full h-full min-h-[500px] bg-slate-100 rounded-xl overflow-hidden relative group">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [50, 50, 50], fov: 50 }}>
                <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.4, blur: 2 }}>
                    <Model url={modelUrl} progressUpdate={progressUpdate} />
                </Stage>
                <OrbitControls makeDefault autoRotate={autoRotate} />
            </Canvas>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs space-y-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="font-bold text-slate-700 mb-1">Trạng thái thi công</div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Đang thực hiện</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span>Chưa bắt đầu</span>
                </div>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow text-xs font-mono text-slate-600">
                WebGL Powered
            </div>
        </div>
    );
};

export default BimViewer;
