import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

interface DiceProps {
  value: number;
  position: [number, number, number];
  isRolling: boolean;
}

export function Dice3D({ value, position, isRolling }: DiceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState([0, 0, 0]);

  useEffect(() => {
    if (!isRolling) {
      setRotation(getRotationForValue(value));
    }
  }, [value, isRolling]);

  useFrame(() => {
    if (meshRef.current && isRolling) {
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.3;
      meshRef.current.rotation.z += 0.1;
    } else if (meshRef.current) {
      meshRef.current.rotation.x += (rotation[0] - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (rotation[1] - meshRef.current.rotation.y) * 0.1;
      meshRef.current.rotation.z += (rotation[2] - meshRef.current.rotation.z) * 0.1;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1, 1, 1]}
      radius={0.1}
      smoothness={4}
      position={position}
      castShadow
    >
      <meshStandardMaterial color="#FFFFFF" />
    </RoundedBox>
  );
}

function getRotationForValue(value: number): [number, number, number] {
  switch (value) {
    case 1: return [0, 0, 0];
    case 2: return [0, 0, Math.PI / 2];
    case 3: return [0, Math.PI / 2, 0];
    case 4: return [0, -Math.PI / 2, 0];
    case 5: return [0, 0, -Math.PI / 2];
    case 6: return [Math.PI, 0, 0];
    default: return [0, 0, 0];
  }
}
