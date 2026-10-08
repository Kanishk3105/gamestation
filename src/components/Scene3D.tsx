import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion, useIsMobile } from '../hooks/useMediaQuery';
const sceneContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
};

interface FloatingShapeProps {
  position: [number, number, number];
  geometry: React.ReactNode;
  color: string;
  speed: number;
  reduceMotion: boolean;
  material?: React.ReactNode;
}

function FloatingShape({ position, geometry, color, speed, reduceMotion, material }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!reduceMotion && meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  const meshContent = (
    <mesh ref={meshRef} position={position}>
      {geometry}
      {material || (
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.8}
        />
      )}
    </mesh>
  );

  if (reduceMotion) {
    return meshContent;
  }

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      {meshContent}
    </Float>
  );
}

function AmbientParticles({ count, reduceMotion }: { count: number; reduceMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const speed = Math.random() * 0.5 + 0.1;
      temp.push({ x, y, z, speed, initialY: y });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (reduceMotion || !meshRef.current) return;
    
    particles.forEach((particle, i) => {
      // Subtle floating effect
      particle.y = particle.initialY + Math.sin(state.clock.elapsedTime * particle.speed + i) * 0.5;
      
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Initialize once for reduceMotion case
  useMemo(() => {
    if (reduceMotion && meshRef.current) {
      particles.forEach((particle, i) => {
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [reduceMotion, particles, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export default function Scene3D() {
  const isMobile = useIsMobile();
  const reduceMotion = usePrefersReducedMotion();

  if (isMobile) {
    return null;
  }

  return (
    <div style={sceneContainerStyle}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} color="#4c1d95" />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#6d28d9" />
          
          {/* Large translucent torus */}
          <FloatingShape
            position={[0, 0, -2]}
            geometry={<torusGeometry args={[1.5, 0.4, 16, 32]} />}
            color="#8b5cf6"
            speed={1}
            reduceMotion={reduceMotion}
            material={
              <meshPhysicalMaterial 
                color="#8b5cf6"
                transmission={0.9}
                opacity={1}
                metalness={0.2}
                roughness={0.1}
                ior={1.5}
                thickness={0.5}
                transparent
              />
            }
          />
          
          {/* Small floating spheres with distort material */}
          <FloatingShape
            position={[-2, 1, -1]}
            geometry={<sphereGeometry args={[0.4, 32, 32]} />}
            color="#6d28d9"
            speed={1.5}
            reduceMotion={reduceMotion}
            material={
              <MeshDistortMaterial
                color="#6d28d9"
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                metalness={0.8}
                roughness={0.2}
                distort={reduceMotion ? 0 : 0.4}
                speed={reduceMotion ? 0 : 3}
              />
            }
          />
          
          <FloatingShape
            position={[2, -1.5, -3]}
            geometry={<sphereGeometry args={[0.5, 32, 32]} />}
            color="#4c1d95"
            speed={2}
            reduceMotion={reduceMotion}
            material={
              <MeshDistortMaterial
                color="#4c1d95"
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0.2}
                metalness={0.6}
                roughness={0.2}
                distort={reduceMotion ? 0 : 0.3}
                speed={reduceMotion ? 0 : 2}
              />
            }
          />
          
          {/* Subtle icosahedron wireframe */}
          <FloatingShape
            position={[1.5, 1.5, -2]}
            geometry={<icosahedronGeometry args={[1, 0]} />}
            color="#c4b5fd"
            speed={1.2}
            reduceMotion={reduceMotion}
            material={
              <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.3} />
            }
          />

          <AmbientParticles count={40} reduceMotion={reduceMotion} />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
