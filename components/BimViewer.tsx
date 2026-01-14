import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

interface BimViewerProps {
    modelUrl: string; // Default can be empty loop
    progressUpdate?: Record<string, string>;
    autoRotate?: boolean;
}

const statusColors = {
    completed: new THREE.Color('#22c55e'),
    in_progress: new THREE.Color('#3b82f6'),
    not_started: new THREE.Color('#94a3b8'),
    default: new THREE.Color('#cbd5e1')
};

const GLTFModel = ({ url, progressUpdate }: { url: string; progressUpdate?: Record<string, string> }) => {
    const { scene } = useGLTF(url, true);
    const [clonedScene, setClonedScene] = useState<THREE.Object3D | null>(null);

    useEffect(() => {
        if (scene) {
            setClonedScene(scene.clone());
        }
    }, [scene]);

    // Apply colors
    useMemo(() => {
        if (!clonedScene || !progressUpdate) return;

        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const status = progressUpdate[mesh.name] ||
                    progressUpdate[mesh.userData.name] ||
                    progressUpdate[mesh.uuid];

                if (status) {
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

    if (!clonedScene) return null;
    return <primitive object={clonedScene} />;
};

const IFCModel = ({ url, file, progressUpdate }: { url?: string; file?: File; progressUpdate?: Record<string, string> }) => {
    const [model, setModel] = useState<THREE.Object3D | null>(null);

    useEffect(() => {
        const loadIfc = async () => {
            const ifcLoader = new IFCLoader();
            ifcLoader.ifcManager.setWasmPath('/');

            const onLoad = (ifcModel: THREE.Object3D) => {
                setModel(ifcModel);
            };

            const onError = (error: any) => {
                console.error('Error loading IFC:', error);
            };

            if (file) {
                const ifcURL = URL.createObjectURL(file);
                ifcLoader.load(ifcURL, onLoad, undefined, onError);
                return () => URL.revokeObjectURL(ifcURL);
            } else if (url) {
                ifcLoader.load(url, onLoad, undefined, onError);
            }
        };

        loadIfc();
    }, [url, file]);

    // Apply colors
    useMemo(() => {
        if (!model || !progressUpdate) return;

        model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const status = progressUpdate[mesh.name] ||
                    progressUpdate[mesh.userData.name] ||
                    progressUpdate[mesh.uuid];

                if (status) {
                    const material = new THREE.MeshStandardMaterial({
                        color: statusColors[status as keyof typeof statusColors] || statusColors.default,
                        metalness: 0.5,
                        roughness: 0.5
                    });
                    mesh.material = material;
                }
            }
        });
    }, [model, progressUpdate]);

    if (!model) return null;
    return <primitive object={model} />;
};

function Model({ url, progressUpdate, file }: { url?: string; file?: File; progressUpdate?: Record<string, string> }) {
    // Determine type
    const isGlb = url && (url.endsWith('.glb') || url.endsWith('.gltf'));

    if (file || (url && !isGlb)) {
        return <IFCModel url={url} file={file} progressUpdate={progressUpdate} />;
    }

    if (isGlb && url) {
        return <GLTFModel url={url} progressUpdate={progressUpdate} />;
    }

    return null;
}

const BimViewer: React.FC<BimViewerProps> = ({ modelUrl, progressUpdate, autoRotate = false }) => {
    const [localFile, setLocalFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLocalFile(file);
        }
    };

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden relative group">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 backdrop-blur hover:bg-white text-slate-700 font-semibold py-1.5 px-3 rounded shadow text-xs flex items-center gap-2 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Mở file IFC/GLB
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".ifc,.glb,.gltf"
                    className="hidden"
                />
            </div>

            <Canvas shadows dpr={[1, 2]} camera={{ position: [50, 50, 50], fov: 50 }}>
                <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.4, blur: 2 }}>
                    <Model url={localFile ? undefined : modelUrl} file={localFile || undefined} progressUpdate={progressUpdate} />
                </Stage>
                <OrbitControls makeDefault autoRotate={autoRotate && !localFile} />
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
                {localFile ? localFile.name : (modelUrl ? modelUrl.split('/').pop() : 'No Model')}
            </div>
        </div>
    );
};

export default BimViewer;
