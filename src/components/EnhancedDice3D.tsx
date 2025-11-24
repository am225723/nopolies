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

export function EnhancedDice3D({ value, position, isRolling, onRollComplete, onClick }: DiceProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [rollTime, setRollTime] = useState(0);
  const hasCompletedRoll = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isRolling) {
      hasCompletedRoll.current = false;
      setRollTime(0);
      // Generate random velocity for realistic rolling
      setVelocity({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      });
    } else {
      // Update to final value when rolling stops
      setCurrentValue(value);
      setRotation(getRotationForValue(value));
    }
  }, [value, isRolling]);

  useFrame((state, delta) => {
    if (meshRef.current && isRolling) {
      setRollTime((prev) => prev + delta);
      
      // Apply physics-based rotation with damping
      const damping = Math.max(0, 1 - rollTime * 0.4);
      meshRef.current.rotation.x += velocity.x * damping;
      meshRef.current.rotation.y += velocity.y * damping;
      meshRef.current.rotation.z += velocity.z * damping;

      // Bouncing effect
      const bounceHeight = Math.max(0, Math.sin(rollTime * 10) * 0.8 * damping);
      meshRef.current.position.y = position[1] + bounceHeight;

      // Show random values while rolling
      if (Math.floor(rollTime * 10) % 2 === 0) {
        setCurrentValue(Math.floor(Math.random() * 6) + 1);
      }

      // Complete roll after 2.5 seconds
      if (rollTime > 2.5 && !hasCompletedRoll.current) {
        hasCompletedRoll.current = true;
        setCurrentValue(value);
        if (onRollComplete) {
          onRollComplete();
        }
      }
    } else if (meshRef.current) {
      // Smoothly interpolate to final rotation
      meshRef.current.rotation.x += (rotation[0] - meshRef.current.rotation.x) * 0.15;
      meshRef.current.rotation.y += (rotation[1] - meshRef.current.rotation.y) * 0.15;
      meshRef.current.rotation.z += (rotation[2] - meshRef.current.rotation.z) * 0.15;
      
      // Return to base position
      meshRef.current.position.y += (position[1] - meshRef.current.position.y) * 0.15;
      
      // Hover effect
      if (isHovered && !isRolling) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.15;
        meshRef.current.rotation.y += 0.02;
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
      <group ref={meshRef}>
        <RoundedBox
          args={[1, 1, 1]}
          radius={0.15}
          smoothness={10}
          castShadow
          receiveShadow
          onClick={handleClick}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        >
          <meshStandardMaterial 
            color={isHovered && !isRolling ? "#FFF8DC" : "#FFFFFF"} 
            metalness={0.2}
            roughness={0.3}
            envMapIntensity={1}
          />
        </RoundedBox>
        
        {/* Render dots for current value */}
        <DiceDots value={currentValue} />
      </group>

      {/* Glow effect when hovering */}
      {isHovered && !isRolling && (
        <Sphere args={[0.7, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#FFD700"
            transparent
            opacity={0.2}
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </Sphere>
      )}
    </group>
  );
}

function DiceDots({ value }: { value: number }) {
  const dotRadius = 0.09;
  const dotDepth = 0.52;
  const dotColor = "#000000";

  const renderDots = (positions: [number, number, number][], rotation: [number, number, number]) => {
    return (
      <group rotation={rotation}>
        {positions.map((pos, i) => (
          <Sphere key={i} args={[dotRadius, 16, 16]} position={pos}>
            <meshStandardMaterial 
              color={dotColor} 
              metalness={0.9} 
              roughness={0.1}
            />
          </Sphere>
        ))}
      </group>
    );
  };

  const dotPatterns: Record<number, [number, number, number][]> = {
    1: [[0, 0, dotDepth]],
    2: [[-0.25, 0.25, dotDepth], [0.25, -0.25, dotDepth]],
    3: [[-0.25, 0.25, dotDepth], [0, 0, dotDepth], [0.25, -0.25, dotDepth]],
    4: [
      [-0.25, 0.25, dotDepth], 
      [0.25, 0.25, dotDepth], 
      [-0.25, -0.25, dotDepth], 
      [0.25, -0.25, dotDepth]
    ],
    5: [
      [-0.25, 0.25, dotDepth], 
      [0.25, 0.25, dotDepth], 
      [0, 0, dotDepth], 
      [-0.25, -0.25, dotDepth], 
      [0.25, -0.25, dotDepth]
    ],
    6: [
      [-0.25, 0.25, dotDepth], 
      [0.25, 0.25, dotDepth], 
      [-0.25, 0, dotDepth], 
      [0.25, 0, dotDepth], 
      [-0.25, -0.25, dotDepth], 
      [0.25, -0.25, dotDepth]
    ],
  };

  // Render all 6 faces with their respective dot patterns
  return (
    <>
      {/* Face 1 (front) - shows value */}
      {renderDots(dotPatterns[value] || dotPatterns[1], [0, 0, 0])}
      
      {/* Face 2 (right) */}
      {renderDots(dotPatterns[7 - value] || dotPatterns[6], [0, Math.PI / 2, 0])}
      
      {/* Face 3 (top) */}
      {renderDots(dotPatterns[value === 1 ? 6 : value === 6 ? 1 : value], [-Math.PI / 2, 0, 0])}
      
      {/* Face 4 (bottom) */}
      {renderDots(dotPatterns[value === 1 ? 6 : value === 6 ? 1 : 7 - value], [Math.PI / 2, 0, 0])}
      
      {/* Face 5 (left) */}
      {renderDots(dotPatterns[value === 2 ? 5 : value === 5 ? 2 : value], [0, -Math.PI / 2, 0])}
      
      {/* Face 6 (back) */}
      {renderDots(dotPatterns[7 - value] || dotPatterns[1], [0, Math.PI, 0])}
    </>
  );
}

function getRotationForValue(value: number): [number, number, number] {
  const rotations: Record<number, [number, number, number]> = {
    1: [0, 0, 0],
    2: [0, Math.PI / 2, 0],
    3: [0, 0, -Math.PI / 2],
    4: [0, 0, Math.PI / 2],
    5: [0, -Math.PI / 2, 0],
    6: [Math.PI, 0, 0],
  };
  return rotations[value] || [0, 0, 0];
}

interface DicePairProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRollComplete: () => void;
  onRollRequest: () => void;
}

export function EnhancedDicePair({ dice1, dice2, isRolling, onRollComplete, onRollRequest }: DicePairProps) {
  const [dice1Complete, setDice1Complete] = useState(false);
  const [dice2Complete, setDice2Complete] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setDice1Complete(false);
      setDice2Complete(false);
    }
  }, [isRolling]);

  useEffect(() => {
    if (dice1Complete && dice2Complete && !isRolling) {
      // Both dice have completed their rolls
      onRollComplete();
    }
  }, [dice1Complete, dice2Complete, isRolling, onRollComplete]);

  const handleDice1Complete = () => {
    setDice1Complete(true);
  };

  const handleDice2Complete = () => {
    setDice2Complete(true);
  };

  return (
    <group>
      <EnhancedDice3D
        value={dice1}
        position={[-12, 2, -8]}
        isRolling={isRolling}
        onRollComplete={handleDice1Complete}
        onClick={onRollRequest}
      />
      <EnhancedDice3D
        value={dice2}
        position={[-10, 2, -8]}
        isRolling={isRolling}
        onRollComplete={handleDice2Complete}
        onClick={onRollRequest}
      />
    </group>
  );
}