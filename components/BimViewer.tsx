import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, Center, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
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
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { camera, controls, scene } = useThree() as any;

    useEffect(() => {
        const loadIfc = async () => {
            // Reset state
            setError(null);
            setIsLoading(true);
            setModel(null);

            try {
                const ifcLoader = new IFCLoader();
                // Explicitly set WASM path. Assuming files are in public root.
                // If this fails, we will try to copy them or alert user.
                ifcLoader.ifcManager.setWasmPath('/');

                // Use Web Workers to prevent UI freeze
                await ifcLoader.ifcManager.useWebWorkers(true, '/IFCWorker.js');

                // IMPORTANT: Fix for large coordinates in BIM models
                await ifcLoader.ifcManager.applyWebIfcConfig({
                    COORDINATE_TO_ORIGIN: true,
                    USE_FAST_BOOLS: true
                });

                const onLoad = (ifcModel: THREE.Object3D) => {
                    console.log('IFC Model Loaded:', ifcModel);
                    // Ensure matrix is updated and material is double-sided
                    // Force update world matrix
                    ifcModel.updateMatrixWorld(true);

                    // Check bounds
                    const box = new THREE.Box3().setFromObject(ifcModel);
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    const center = new THREE.Vector3();
                    box.getCenter(center);
                    console.log('Model Size:', size);
                    console.log('Model Center:', center);

                    // Ensure materials are visible and meshes are not hidden
                    ifcModel.traverse((child) => {
                        child.visible = true;
                        if ((child as THREE.Mesh).isMesh) {
                            const mesh = child as THREE.Mesh;
                            if (mesh.material) {
                                (mesh.material as THREE.Material).side = THREE.DoubleSide;
                                // If material is too dark or transparent, make it visible for debugging
                                if (mesh.material instanceof THREE.MeshStandardMaterial) {
                                    (mesh.material as THREE.Material).transparent = false;
                                    (mesh.material as THREE.Material).opacity = 1;
                                    (mesh.material as THREE.Material).depthWrite = true;
                                    (mesh.material as THREE.Material).depthTest = true;
                                }
                            }
                        }
                    });

                    // Zoom camera to fit
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = camera.fov * (Math.PI / 180);
                    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                    cameraZ *= 2.0; // Zoom out enough

                    // Adjust near/far planes if model is huge
                    camera.near = Math.min(0.1, maxDim / 1000);
                    camera.far = Math.max(20000, maxDim * 10);
                    camera.updateProjectionMatrix();

                    camera.position.set(cameraZ, cameraZ, cameraZ);
                    camera.lookAt(center);

                    if (controls) {
                        controls.target.copy(center);
                        controls.maxDistance = camera.far * 0.8;
                        controls.minDistance = camera.near * 2;
                        controls.update();
                    }

                    setModel(ifcModel);
                    setIsLoading(false);
                };

                const onError = (err: any) => {
                    console.error('Error loading IFC:', err);
                    setError(`Lỗi tải mô hình: ${err.message || 'Unknown error'}`);
                    setIsLoading(false);
                };

                // const onProgress = (event: ProgressEvent) => {
                //     // console.log(`Loading: ${event.loaded} / ${event.total}`);
                // };

                if (file) {
                    const ifcURL = URL.createObjectURL(file);
                    // Use a slightly different approach for file object to ensure array buffer is read correctly if needed,
                    // but cleaner is just passing the URL.
                    ifcLoader.load(ifcURL, onLoad, undefined, onError);

                    // Cleanup
                    return () => {
                        URL.revokeObjectURL(ifcURL);
                    };
                } else if (url) {
                    ifcLoader.load(url, onLoad, undefined, onError);
                } else {
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error("Setup error:", err);
                setError(`Lỗi khởi tạo: ${err.message}`);
                setIsLoading(false);
            }
        };

        if (url || file) {
            loadIfc();
        }
    }, [url, file, camera, controls]);

    // BoxHelper for debugging visibility
    useEffect(() => {
        if (!model) return;
        const helper = new THREE.BoxHelper(model, 0xffff00);
        scene.add(helper);
        return () => {
            scene.remove(helper);
        };
    }, [model, scene]);

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

    if (error) {
        return <Html center><div className="bg-red-500 text-white p-4 rounded shadow-lg whitespace-pre-wrap max-w-md">{error}</div></Html>;
    }

    if (isLoading) {
        return <Html center><div className="text-white bg-slate-800 p-2 rounded">Đang xử lý BIM...</div></Html>;
    }

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

            <Canvas shadows dpr={[1, 2]} camera={{ position: [50, 50, 50], fov: 50, near: 0.1, far: 20000 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Environment preset="city" />

                <group position={[0, -0.1, 0]}>
                    <gridHelper args={[200, 200, 0x444444, 0x222222]} />
                    <axesHelper args={[10]} />
                </group>

                <Model url={localFile ? undefined : modelUrl} file={localFile || undefined} progressUpdate={progressUpdate} />

                <OrbitControls makeDefault autoRotate={autoRotate && !localFile} minDistance={1} maxDistance={5000} />

                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
                </GizmoHelper>
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
