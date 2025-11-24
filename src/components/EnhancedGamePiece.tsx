import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox, Cylinder, Cone, Sphere, Torus, Box } from "@react-three/drei";
import { Player } from "@/lib/stores/useMonopoly";
import { getPositionFromIndex } from "./EnhancedBoard3D";

interface GamePieceProps {
  player: Player;
  targetPosition: number;
}

export function EnhancedGamePiece({ player, targetPosition }: GamePieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState({ x: 0, z: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const targetRef = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const newPos = getPositionFromIndex(targetPosition);
    const distance = Math.sqrt(
      Math.pow(newPos.x - currentPos.x, 2) + 
      Math.pow(newPos.z - currentPos.z, 2)
    );
    
    if (distance > 0.1) {
      setIsMoving(true);
      targetRef.current = newPos;
    }
  }, [targetPosition]);

  useFrame((state) => {
    if (groupRef.current) {
      const target = targetRef.current;
      const current = groupRef.current.position;
      
      // Smooth movement with easing
      const speed = isMoving ? 0.08 : 0.15;
      const dx = target.x - current.x;
      const dz = target.z - current.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 0.05) {
        current.x += dx * speed;
        current.z += dz * speed;
        
        // Jumping animation while moving
        const jumpHeight = Math.sin(state.clock.elapsedTime * 10) * 0.3;
        current.y = 0.5 + Math.max(0, jumpHeight);
        
        // Rotate towards movement direction
        const angle = Math.atan2(dz, dx);
        groupRef.current.rotation.y += (angle - groupRef.current.rotation.y) * 0.1;
      } else {
        // Arrived at destination
        if (isMoving) {
          setIsMoving(false);
          setCurrentPos({ x: target.x, z: target.z });
        }
        
        // Gentle bobbing when stationary
        current.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        
        // Gentle rotation when stationary
        groupRef.current.rotation.y += 0.005;
      }
    }
  });

  const isCustomToken = player.token && (player.token.startsWith('http') || player.token.startsWith('data:'));
  const pieceType = isCustomToken ? 'custom' : player.token;

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Piece shadow */}
      <Cylinder args={[0.4, 0.4, 0.02, 32]} position={[0, -0.49, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.3}
          roughness={1}
        />
      </Cylinder>

      {/* Render appropriate piece */}
      {pieceType === 'car' && <DetailedCarPiece color={player.color} />}
      {pieceType === 'ship' && <DetailedShipPiece color={player.color} />}
      {pieceType === 'hat' && <DetailedHatPiece color={player.color} />}
      {pieceType === 'dog' && <DetailedDogPiece color={player.color} />}
      {pieceType === 'thimble' && <DetailedThimblePiece color={player.color} />}
      {pieceType === 'boot' && <DetailedBootPiece color={player.color} />}
      {pieceType === 'wheelbarrow' && <DetailedWheelbarrowPiece color={player.color} />}
      {pieceType === 'iron' && <DetailedIronPiece color={player.color} />}
      
      {/* Player indicator */}
      <Sphere args={[0.15, 16, 16]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial 
          color={player.color} 
          emissive={player.color} 
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
    </group>
  );
}

function DetailedCarPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Car body - main */}
      <RoundedBox args={[0.7, 0.35, 1]} radius={0.08} smoothness={8} position={[0, 0.175, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1}
        />
      </RoundedBox>
      
      {/* Car cabin */}
      <RoundedBox args={[0.55, 0.3, 0.55]} radius={0.08} smoothness={8} position={[0, 0.475, -0.05]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
        />
      </RoundedBox>
      
      {/* Windows */}
      <Box args={[0.5, 0.25, 0.02]} position={[0, 0.475, 0.27]} castShadow>
        <meshStandardMaterial 
          color="#87CEEB" 
          metalness={0.9} 
          roughness={0.05}
          transparent
          opacity={0.7}
        />
      </Box>
      
      {/* Wheels */}
      {[[-0.3, -0.35], [0.3, -0.35], [-0.3, 0.35], [0.3, 0.35]].map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]}>
          <Cylinder args={[0.15, 0.15, 0.12, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial 
              color="#1a1a1a" 
              metalness={0.3} 
              roughness={0.7}
            />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 0.14, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial 
              color="#C0C0C0" 
              metalness={0.9} 
              roughness={0.1}
            />
          </Cylinder>
        </group>
      ))}
      
      {/* Headlights */}
      {[-0.2, 0.2].map((x, i) => (
        <Sphere key={i} args={[0.08, 16, 16]} position={[x, 0.15, 0.52]} castShadow>
          <meshStandardMaterial 
            color="#FFFF00" 
            emissive="#FFFF00"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      ))}
    </group>
  );
}

function DetailedShipPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Hull */}
      <Cone args={[0.5, 0.8, 4]} position={[0, 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
        />
      </Cone>
      
      {/* Deck */}
      <Cylinder args={[0.4, 0.5, 0.15, 4]} position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.3} 
          roughness={0.8}
        />
      </Cylinder>
      
      {/* Mast */}
      <Cylinder args={[0.05, 0.05, 1.2, 8]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.2} 
          roughness={0.9}
        />
      </Cylinder>
      
      {/* Sail */}
      <Box args={[0.02, 0.8, 0.6]} position={[0.3, 1.5, 0]} castShadow>
        <meshStandardMaterial 
          color="#FFFFFF" 
          metalness={0.1} 
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </Box>
      
      {/* Flag */}
      <Cone args={[0.15, 0.2, 3]} position={[0, 2.2, 0]} castShadow>
        <meshStandardMaterial 
          color="#FF0000" 
          metalness={0.3} 
          roughness={0.7}
        />
      </Cone>
    </group>
  );
}

function DetailedHatPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Brim */}
      <Cylinder args={[0.6, 0.6, 0.08, 32]} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Crown base */}
      <Cylinder args={[0.35, 0.4, 0.5, 32]} position={[0, 0.33, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Crown top */}
      <Cylinder args={[0.35, 0.35, 0.3, 32]} position={[0, 0.73, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Hat band */}
      <Torus args={[0.37, 0.05, 16, 32]} position={[0, 0.58, 0]} castShadow>
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Torus>
      
      {/* Top button */}
      <Sphere args={[0.08, 16, 16]} position={[0, 0.92, 0]} castShadow>
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Sphere>
    </group>
  );
}

function DetailedDogPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Body */}
      <RoundedBox args={[0.4, 0.3, 0.7]} radius={0.1} smoothness={8} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </RoundedBox>
      
      {/* Head */}
      <Sphere args={[0.25, 16, 16]} position={[0, 0.5, 0.4]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </Sphere>
      
      {/* Snout */}
      <Cylinder args={[0.12, 0.15, 0.25, 16]} position={[0, 0.45, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </Cylinder>
      
      {/* Ears */}
      {[-0.15, 0.15].map((x, i) => (
        <Cone key={i} args={[0.12, 0.25, 16]} position={[x, 0.65, 0.35]} rotation={[0.3, 0, i === 0 ? -0.3 : 0.3]} castShadow>
          <meshStandardMaterial 
            color={color} 
            metalness={0.6} 
            roughness={0.4}
          />
        </Cone>
      ))}
      
      {/* Legs */}
      {[[-0.15, -0.25], [0.15, -0.25], [-0.15, 0.25], [0.15, 0.25]].map((pos, i) => (
        <Cylinder key={i} args={[0.08, 0.08, 0.3, 16]} position={[pos[0], 0, pos[1]]} castShadow>
          <meshStandardMaterial 
            color={color} 
            metalness={0.6} 
            roughness={0.4}
          />
        </Cylinder>
      ))}
      
      {/* Tail */}
      <Cone args={[0.08, 0.35, 16]} position={[0, 0.35, -0.4]} rotation={[0.5, 0, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </Cone>
      
      {/* Eyes */}
      {[-0.08, 0.08].map((x, i) => (
        <Sphere key={i} args={[0.04, 16, 16]} position={[x, 0.55, 0.5]} castShadow>
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Sphere>
      ))}
    </group>
  );
}

function DetailedThimblePiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Main body */}
      <Cylinder args={[0.3, 0.35, 0.6, 32]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Top dome */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.6, 0]} scale={[1, 0.5, 1]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
        />
      </Sphere>
      
      {/* Dimples pattern */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 0.32;
        const height = 0.2 + (i % 4) * 0.12;
        return (
          <Sphere 
            key={i} 
            args={[0.03, 8, 8]} 
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#000000" 
              metalness={0.9} 
              roughness={0.1}
            />
          </Sphere>
        );
      })}
    </group>
  );
}

function DetailedBootPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Sole */}
      <RoundedBox args={[0.35, 0.1, 0.7]} radius={0.05} smoothness={8} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial 
          color="#2C1810" 
          metalness={0.3} 
          roughness={0.9}
        />
      </RoundedBox>
      
      {/* Foot */}
      <RoundedBox args={[0.3, 0.25, 0.6]} radius={0.08} smoothness={8} position={[0, 0.225, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </RoundedBox>
      
      {/* Ankle */}
      <Cylinder args={[0.18, 0.2, 0.4, 32]} position={[0, 0.55, -0.05]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
        />
      </Cylinder>
      
      {/* Laces */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Torus 
          key={i} 
          args={[0.15, 0.02, 8, 16]} 
          position={[0, 0.35 + i * 0.08, 0.15]} 
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.8} 
            roughness={0.2}
          />
        </Torus>
      ))}
    </group>
  );
}

function DetailedWheelbarrowPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Bucket */}
      <Cone args={[0.4, 0.5, 4]} position={[0, 0.25, 0.1]} rotation={[0.2, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cone>
      
      {/* Handles */}
      {[-0.2, 0.2].map((x, i) => (
        <Cylinder 
          key={i} 
          args={[0.03, 0.03, 0.8, 16]} 
          position={[x, 0.3, -0.3]} 
          rotation={[0.5, 0, 0]}
          castShadow
        >
          <meshStandardMaterial 
            color="#8B4513" 
            metalness={0.3} 
            roughness={0.8}
          />
        </Cylinder>
      ))}
      
      {/* Wheel */}
      <Cylinder args={[0.2, 0.2, 0.1, 32]} position={[0, 0.2, 0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.4} 
          roughness={0.7}
        />
      </Cylinder>
      
      {/* Wheel rim */}
      <Torus args={[0.2, 0.03, 16, 32]} position={[0, 0.2, 0.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial 
          color="#C0C0C0" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Torus>
    </group>
  );
}

function DetailedIronPiece({ color }: { color: string }) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Base plate */}
      <RoundedBox args={[0.5, 0.08, 0.7]} radius={0.04} smoothness={8} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
        />
      </RoundedBox>
      
      {/* Body */}
      <RoundedBox args={[0.45, 0.35, 0.6]} radius={0.08} smoothness={8} position={[0, 0.265, 0]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
        />
      </RoundedBox>
      
      {/* Handle */}
      <Torus args={[0.15, 0.04, 16, 32]} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial 
          color="#8B4513" 
          metalness={0.3} 
          roughness={0.8}
        />
      </Torus>
      
      {/* Steam holes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Cylinder 
          key={i} 
          args={[0.03, 0.03, 0.1, 16]} 
          position={[-0.15 + (i % 3) * 0.15, 0.09, -0.2 + Math.floor(i / 3) * 0.4]} 
          castShadow
        >
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Cylinder>
      ))}
    </group>
  );
}