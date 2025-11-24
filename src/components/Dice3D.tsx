import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox, Sphere } from "@react-three/drei";

interface DiceProps {
  value: number;
  position: [number, number, number];
  isRolling: boolean;
  onRollComplete?: () => void;
  onClick?: () => void;
}

export function Dice3D({ value, position, isRolling, onRollComplete, onClick }: DiceProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [rollTime, setRollTime] = useState(0);
  const hasCompletedRoll = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isRolling) {
      // Reset roll state
      hasCompletedRoll.current = false;
      setRollTime(0);
      // Generate random initial velocity for realistic rolling
      setVelocity({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
      });
    } else {
      setRotation(getRotationForValue(value));
    }
  }, [value, isRolling]);

  useFrame((state, delta) => {
    if (meshRef.current && isRolling) {
      setRollTime((prev) => prev + delta);
      
      // Apply physics-based rotation with damping
      const damping = Math.max(0, 1 - rollTime * 0.5);
      meshRef.current.rotation.x += velocity.x * damping;
      meshRef.current.rotation.y += velocity.y * damping;
      meshRef.current.rotation.z += velocity.z * damping;

      // Add bouncing effect
      const bounceHeight = Math.max(0, Math.sin(rollTime * 8) * 0.5 * damping);
      meshRef.current.position.y = position[1] + bounceHeight;

      // Check if roll is complete (after 2 seconds)
      if (rollTime > 2 && !hasCompletedRoll.current) {
        hasCompletedRoll.current = true;
        if (onRollComplete) {
          onRollComplete();
        }
      }
    } else if (meshRef.current) {
      // Smoothly interpolate to final rotation
      meshRef.current.rotation.x += (rotation[0] - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (rotation[1] - meshRef.current.rotation.y) * 0.1;
      meshRef.current.rotation.z += (rotation[2] - meshRef.current.rotation.z) * 0.1;
      
      // Ensure dice is at correct height
      meshRef.current.position.y += (position[1] - meshRef.current.position.y) * 0.1;
      
      // Hover effect
      if (isHovered && !isRolling) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  const handleClick = () => {
    if (onClick && !isRolling) {
      onClick();
    }
  };

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1, 1, 1]}
        radius={0.15}
        smoothness={8}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <meshStandardMaterial 
          color={isHovered && !isRolling ? "#FFE4B5" : "#FFFFFF"} 
          metalness={0.1}
          roughness={0.4}
        />
      </RoundedBox>
      
      {/* Dice dots */}
      <DiceDots value={value} />
    </group>
  );
}

function DiceDots({ value }: { value: number }) {
  const dotRadius = 0.08;
  const dotDepth = 0.52;
  const dotColor = "#000000";

  const renderDots = (face: number, rotation: [number, number, number], positions: [number, number, number][]) => {
    return (
      <group rotation={rotation}>
        {positions.map((pos, i) => (
          <Sphere key={`${face}-${i}`} args={[dotRadius, 16, 16]} position={pos}>
            <meshStandardMaterial color={dotColor} metalness={0.8} roughness={0.2} />
          </Sphere>
        ))}
      </group>
    );
  };

  const dotPatterns: Record<number, [number, number, number][]> = {
    1: [[0, 0, dotDepth]],
    2: [[-0.25, 0.25, dotDepth], [0.25, -0.25, dotDepth]],
    3: [[-0.25, 0.25, dotDepth], [0, 0, dotDepth], [0.25, -0.25, dotDepth]],
    4: [[-0.25, 0.25, dotDepth], [0.25, 0.25, dotDepth], [-0.25, -0.25, dotDepth], [0.25, -0.25, dotDepth]],
    5: [[-0.25, 0.25, dotDepth], [0.25, 0.25, dotDepth], [0, 0, dotDepth], [-0.25, -0.25, dotDepth], [0.25, -0.25, dotDepth]],
    6: [[-0.25, 0.25, dotDepth], [0.25, 0.25, dotDepth], [-0.25, 0, dotDepth], [0.25, 0, dotDepth], [-0.25, -0.25, dotDepth], [0.25, -0.25, dotDepth]],
  };

  return (
    <>
      {/* Face 1 (front) */}
      {renderDots(1, [0, 0, 0], dotPatterns[1])}
      
      {/* Face 2 (right) */}
      {renderDots(2, [0, Math.PI / 2, 0], dotPatterns[2])}
      
      {/* Face 3 (top) */}
      {renderDots(3, [-Math.PI / 2, 0, 0], dotPatterns[3])}
      
      {/* Face 4 (bottom) */}
      {renderDots(4, [Math.PI / 2, 0, 0], dotPatterns[4])}
      
      {/* Face 5 (left) */}
      {renderDots(5, [0, -Math.PI / 2, 0], dotPatterns[5])}
      
      {/* Face 6 (back) */}
      {renderDots(6, [0, Math.PI, 0], dotPatterns[6])}
    </>
  );
}

function getRotationForValue(value: number): [number, number, number] {
  switch (value) {
    case 1: return [0, 0, 0];
    case 2: return [0, Math.PI / 2, 0];
    case 3: return [-Math.PI / 2, 0, 0];
    case 4: return [Math.PI / 2, 0, 0];
    case 5: return [0, -Math.PI / 2, 0];
    case 6: return [Math.PI, 0, 0];
    default: return [0, 0, 0];
  }
}

// Enhanced dice pair component with click handler
interface DicePairProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRollComplete?: () => void;
  onRollRequest?: () => void;
}

export function DicePair({ dice1, dice2, isRolling, onRollComplete, onRollRequest }: DicePairProps) {
  const [dice1Complete, setDice1Complete] = useState(false);
  const [dice2Complete, setDice2Complete] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setDice1Complete(false);
      setDice2Complete(false);
    }
  }, [isRolling]);

  useEffect(() => {
    if (dice1Complete && dice2Complete && onRollComplete) {
      onRollComplete();
    }
  }, [dice1Complete, dice2Complete, onRollComplete]);

  const handleDiceClick = () => {
    if (onRollRequest && !isRolling) {
      onRollRequest();
    }
  };

  return (
    <group>
      <Dice3D 
        value={dice1} 
        position={[-0.7, 1, 0]} 
        isRolling={isRolling}
        onRollComplete={() => setDice1Complete(true)}
        onClick={handleDiceClick}
      />
      <Dice3D 
        value={dice2} 
        position={[0.7, 1, 0]} 
        isRolling={isRolling}
        onRollComplete={() => setDice2Complete(true)}
        onClick={handleDiceClick}
      />
    </group>
  );
}