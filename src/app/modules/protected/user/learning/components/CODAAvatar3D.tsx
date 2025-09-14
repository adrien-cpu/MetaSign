'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarSigningService, type SignKeyframe, type SignDatabase } from '../services/AvatarSigningService';

interface CODAAvatar3DProps {
  isActive?: boolean;
  currentSign?: string;
  onSignCompleted?: (signName: string) => void;
  onAvatarReady?: () => void;
  className?: string;
  showDebugInfo?: boolean;
  emotional?: 'neutral' | 'happy' | 'confused' | 'excited' | 'focused';
}

interface HandMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  fingerConfig: any;
  color: string;
}

const HandMesh: React.FC<HandMeshProps> = ({ position, rotation, fingerConfig, color }) => {
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (meshRef.current && fingerConfig) {
      // Animation fluide des doigts basée sur fingerConfig
      meshRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  }, [rotation, fingerConfig]);

  return (
    <group ref={meshRef} position={position}>
      {/* Paume */}
      <mesh>
        <boxGeometry args={[0.8, 0.3, 1.2]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Doigts (simulés) */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0.3 - i * 0.15, 0.2, 0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6]} />
          <meshLambertMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

interface BodyMeshProps {
  headTilt: number;
  shoulderTilt: number;
  eyeDirection: { x: number; y: number };
  emotional: string;
}

const BodyMesh: React.FC<BodyMeshProps> = ({ headTilt, shoulderTilt, eyeDirection, emotional }) => {
  const headRef = useRef<THREE.Group>(null);
  const shouldersRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (headRef.current) {
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, headTilt, 0.1);
    }
    if (shouldersRef.current) {
      shouldersRef.current.rotation.z = THREE.MathUtils.lerp(shouldersRef.current.rotation.z, shoulderTilt, 0.1);
    }
  });

  const getEmotionalColor = () => {
    switch (emotional) {
      case 'happy': return '#FFE4B5';
      case 'confused': return '#F0F8FF';
      case 'excited': return '#FFB6C1';
      case 'focused': return '#E6E6FA';
      default: return '#FAEBD7';
    }
  };

  return (
    <group>
      {/* Torse */}
      <group ref={shouldersRef}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.8, 1.2, 2]} />
          <meshLambertMaterial color="#4A90E2" />
        </mesh>
        
        {/* Épaules */}
        <mesh position={[-1.2, 0.5, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshLambertMaterial color="#4A90E2" />
        </mesh>
        <mesh position={[1.2, 0.5, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshLambertMaterial color="#4A90E2" />
        </mesh>
      </group>

      {/* Tête */}
      <group ref={headRef} position={[0, 1.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.7]} />
          <meshLambertMaterial color={getEmotionalColor()} />
        </mesh>
        
        {/* Yeux */}
        <mesh position={[-0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.08]} />
          <meshLambertMaterial color="#000" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.6]}>
          <sphereGeometry args={[0.08]} />
          <meshLambertMaterial color="#000" />
        </mesh>
        
        {/* Direction du regard */}
        <mesh position={[-0.2 + eyeDirection.x * 0.03, 0.1 + eyeDirection.y * 0.03, 0.62]}>
          <sphereGeometry args={[0.03]} />
          <meshLambertMaterial color="#FFF" />
        </mesh>
        <mesh position={[0.2 + eyeDirection.x * 0.03, 0.1 + eyeDirection.y * 0.03, 0.62]}>
          <sphereGeometry args={[0.03]} />
          <meshLambertMaterial color="#FFF" />
        </mesh>
      </group>
    </group>
  );
};

const AvatarScene: React.FC<{
  currentKeyframe: SignKeyframe | null;
  emotional: string;
  showDebugInfo: boolean;
}> = ({ currentKeyframe, emotional, showDebugInfo }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (!currentKeyframe) {
    // Position neutre
    return (
      <group>
        <BodyMesh 
          headTilt={0}
          shoulderTilt={0}
          eyeDirection={{ x: 0, y: 0 }}
          emotional={emotional}
        />
        <HandMesh 
          position={[-1.5, 0, 0]}
          rotation={[0, 0, 0]}
          fingerConfig={null}
          color="#FAEBD7"
        />
        <HandMesh 
          position={[1.5, 0, 0]}
          rotation={[0, 0, 0]}
          fingerConfig={null}
          color="#FAEBD7"
        />
        {showDebugInfo && (
          <Text
            position={[0, 3, 0]}
            fontSize={0.3}
            color="white"
          >
            CODA Avatar - Position neutre
          </Text>
        )}
      </group>
    );
  }

  const { leftHand, rightHand, leftFingers, rightFingers, bodyPosture, faceExpression } = currentKeyframe;

  return (
    <group>
      <BodyMesh 
        headTilt={bodyPosture?.headTilt || 0}
        shoulderTilt={bodyPosture?.shoulderTilt || 0}
        eyeDirection={bodyPosture?.eyeDirection || { x: 0, y: 0 }}
        emotional={faceExpression || emotional}
      />
      
      <HandMesh 
        position={[leftHand.x, leftHand.y, leftHand.z]}
        rotation={[leftHand.rotationX, leftHand.rotationY, leftHand.rotationZ]}
        fingerConfig={leftFingers}
        color="#FAEBD7"
      />
      
      <HandMesh 
        position={[rightHand.x, rightHand.y, rightHand.z]}
        rotation={[rightHand.rotationX, rightHand.rotationY, rightHand.rotationZ]}
        fingerConfig={rightFingers}
        color="#FAEBD7"
      />

      {showDebugInfo && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color="white"
        >
          Timestamp: {currentKeyframe.timestamp.toFixed(2)}s
        </Text>
      )}
    </group>
  );
};

export const CODAAvatar3D: React.FC<CODAAvatar3DProps> = ({
  isActive = false,
  currentSign,
  onSignCompleted,
  onAvatarReady,
  className = '',
  showDebugInfo = false,
  emotional = 'neutral'
}) => {
  const avatarServiceRef = useRef<AvatarSigningService>(new AvatarSigningService());
  const [currentKeyframe, setCurrentKeyframe] = useState<SignKeyframe | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Initialisation de l'avatar
  useEffect(() => {
    const initAvatar = async () => {
      try {
        await avatarServiceRef.current.initialize();
        onAvatarReady?.();
      } catch (error) {
        console.error('Erreur initialisation avatar:', error);
        setPlaybackError('Échec initialisation avatar');
      }
    };

    initAvatar();
  }, [onAvatarReady]);

  // Jouer un signe quand currentSign change
  useEffect(() => {
    if (!currentSign || !isActive) {
      setCurrentKeyframe(null);
      setIsPlaying(false);
      return;
    }

    const playSign = async () => {
      try {
        setIsPlaying(true);
        setPlaybackError(null);
        
        const animation = avatarServiceRef.current.playSign(currentSign);
        
        for await (const keyframe of animation) {
          setCurrentKeyframe(keyframe);
          // Petite pause pour l'animation fluide
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        setIsPlaying(false);
        onSignCompleted?.(currentSign);
      } catch (error) {
        console.error('Erreur lecture signe:', error);
        setPlaybackError(`Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
        setIsPlaying(false);
      }
    };

    playSign();
  }, [currentSign, isActive, onSignCompleted]);

  // Animation de respiration quand l'avatar est inactif
  useFrame((_, delta) => {
    if (!isPlaying && !currentKeyframe) {
      const breatheIntensity = Math.sin(Date.now() * 0.001) * 0.02;
      // Implémenter une légère animation de respiration
    }
  });

  const handleCanvasError = useCallback((error: any) => {
    console.error('Erreur Canvas Three.js:', error);
    setPlaybackError('Erreur rendu 3D');
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Indicateurs d'état */}
      {isActive && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-2 py-1 rounded text-sm">
          Avatar Actif
        </div>
      )}
      
      {isPlaying && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-2 py-1 rounded text-sm">
          Signe: {currentSign}
        </div>
      )}

      {playbackError && (
        <div className="absolute bottom-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm">
          {playbackError}
        </div>
      )}

      {/* Scène 3D */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        onError={handleCanvasError}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        {/* Avatar */}
        <AvatarScene 
          currentKeyframe={currentKeyframe}
          emotional={emotional}
          showDebugInfo={showDebugInfo}
        />

        {/* Contrôles */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>

      {/* Panneau de débogage */}
      {showDebugInfo && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded text-xs">
          <div>État: {isPlaying ? 'Animation' : 'Repos'}</div>
          <div>Signe: {currentSign || 'Aucun'}</div>
          <div>Émotion: {emotional}</div>
          <div>Keyframe: {currentKeyframe ? 'Oui' : 'Non'}</div>
        </div>
      )}
    </div>
  );
};

export default CODAAvatar3D;