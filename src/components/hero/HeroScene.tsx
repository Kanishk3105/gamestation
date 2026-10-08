import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { interpolateFrames } from './keyframes';
import type { MutableRefObject } from 'react';

const ASSETS = {
  shell: 'https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-100-games-with-1-controller/ps5-with-100-games-with-1-controller-on-rent-sharepal-1.webp',
  controller: 'https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-2%20controllers/ps5-console-with-2-controllers-on-rent-sharepal-1.webp',
  artwork: 'https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-god-of-war-ragnarok/ps5-with-god-of-war-ragnarok-with-100-games-with-1-controller-on-rent-sharepal-1.webp',
  accessory: 'https://images.sharepal.in/categories/gaming-consoles/ps5/ps-portal-remote-player/ps-portal-on-rent-1.webp',
};

function useTextureSafe(url: string) {
  return useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [url]);
}

function ProductPlane({
  url,
  poseRef,
  layer,
  width = 1.6,
  height = 1.15,
}: {
  url: string;
  poseRef: MutableRefObject<number>;
  layer: 'shell' | 'inner' | 'controller' | 'artwork' | 'accessory';
  width?: number;
  height?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useTextureSafe(url);
  useFrame(() => {
    if (!mesh.current) return;
    const pose = interpolateFrames(poseRef.current).layers[layer];
    mesh.current.position.set(pose.x, pose.y, pose.z);
    mesh.current.rotation.set(pose.rx, pose.ry, pose.rz);
    mesh.current.scale.setScalar(pose.scale);
    const material = mesh.current.material as THREE.MeshPhysicalMaterial;
    material.opacity = pose.opacity;
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        roughness={0.22}
        metalness={0.15}
        clearcoat={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlassCore({ poseRef }: { poseRef: MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const pose = interpolateFrames(poseRef.current).layers.inner;
    mesh.current.position.set(pose.x, pose.y, pose.z - 0.08);
    mesh.current.rotation.set(pose.rx, pose.ry + 0.4, pose.rz);
    mesh.current.scale.setScalar(pose.scale * 0.72);
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.55, 1.15, 0.18]} />
      <meshPhysicalMaterial
        color="#c4c9d4"
        transmission={0.78}
        roughness={0.05}
        thickness={0.4}
        metalness={0.12}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

const camTarget = new THREE.Vector3();

function CameraRig({ poseRef }: { poseRef: MutableRefObject<number> }) {
  useFrame(({ camera }) => {
    const frame = interpolateFrames(poseRef.current);
    camTarget.set(frame.camera.x, frame.camera.y, frame.camera.z);
    camera.position.lerp(camTarget, 0.12);
    camera.lookAt(0, 0, 0);
    if ('fov' in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov += (frame.camera.fov - persp.fov) * 0.08;
      persp.updateProjectionMatrix();
    }
  });
  return null;
}

export function HeroScene({
  progressRef,
  reduced,
  active,
}: {
  progressRef: MutableRefObject<number>;
  reduced: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.05, 4.2], fov: 38 }}
      dpr={[1, reduced ? 1 : 1.4]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      frameloop={!active || reduced ? 'demand' : 'always'}
    >
      <color attach="background" args={['#00000000']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#f2f4ff" />
      <pointLight position={[-3, 2, 2]} intensity={0.6} color="#8b9cff" />
      <CameraRig poseRef={progressRef} />
      <Float speed={reduced ? 0 : 0.6} floatIntensity={reduced ? 0 : 0.15} rotationIntensity={0}>
        <GlassCore poseRef={progressRef} />
        <ProductPlane url={ASSETS.shell} poseRef={progressRef} layer="shell" width={2.1} height={1.5} />
        <ProductPlane url={ASSETS.controller} poseRef={progressRef} layer="controller" width={1.1} height={0.8} />
        <ProductPlane url={ASSETS.artwork} poseRef={progressRef} layer="artwork" width={1.05} height={0.75} />
        <ProductPlane url={ASSETS.accessory} poseRef={progressRef} layer="accessory" width={0.9} height={0.65} />
      </Float>
      <Environment preset="warehouse" />
    </Canvas>
  );
}
