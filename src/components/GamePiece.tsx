import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox, Cylinder, Cone, Sphere, Torus, Image } from "@react-three/drei";
import { Player } from "@/lib/stores/useMonopoly";

const BOARD_SIZE = 20;
const SPACE_SIZE = BOARD_SIZE / 10;

interface GamePieceProps {
  player: Player;
  targetPosition: number;
}

export function GamePiece({ player, targetPosition }: GamePieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const pos = getPositionFromIndex(targetPosition);
    targetRef.current = pos;
  }, [targetPosition]);

  useFrame(() => {
    if (groupRef.current) {
      // Smooth movement
      groupRef.current.position.x += (targetRef.current.x - groupRef.current.position.x) * 0.1;
      groupRef.current.position.z += (targetRef.current.z - groupRef.current.position.z) * 0.1;
      
      // Gentle bobbing animation
      groupRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.05;
      
      // Gentle rotation
      groupRef.current.rotation.y += 0.01;
    }
  });

  const isCustomToken = player.token && (player.token.startsWith('http') || player.token.startsWith('data:'));
  const pieceType = isCustomToken ? 'custom' : player.token;

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {pieceType === 'car' && <CarPiece color={player.color} />}
      {pieceType === 'ship' && <ShipPiece color={player.color} />}
      {pieceType === 'hat' && <HatPiece color={player.color} />}
      {pieceType === 'dog' && <DogPiece color={player.color} />}
      {pieceType === 'thimble' && <ThimblePiece color={player.color} />}
      {pieceType === 'boot' && <BootPiece color={player.color} />}
      {pieceType === 'wheelbarrow' && <WheelbarrowPiece color={player.color} />}
      {pieceType === 'iron' && <IronPiece color={player.color} />}
      {pieceType === 'custom' && <CustomPiece url={player.token} color={player.color} />}
      
      {/* Player name label */}
      <Sphere args={[0.15, 16, 16]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color={player.color} emissive={player.color} emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

function CustomPiece({ url, color }: { url: string; color: string }) {
  return (
    <group>
      {/* Base */}
      <Cylinder args={[0.3, 0.35, 0.1, 32]} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </Cylinder>
      {/* Token Image Billboard */}
      <group position={[0, 0.4, 0]}>
        <Image url={url} transparent scale={[0.8, 0.8, 1]} />
      </group>
      {/* Frame for image */}
      <Torus args={[0.42, 0.03, 8, 32]} position={[0, 0.4, 0]} castShadow>
         <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Torus>
    </group>
  );
}

function CarPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Car body */}
      <RoundedBox args={[0.6, 0.3, 0.9]} radius={0.05} smoothness={4} position={[0, 0.15, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      {/* Car top */}
      <RoundedBox args={[0.5, 0.25, 0.5]} radius={0.05} smoothness={4} position={[0, 0.4, -0.1]} castShadow>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      {/* Wheels */}
      {[[-0.25, -0.3], [0.25, -0.3], [-0.25, 0.3], [0.25, 0.3]].map((pos, i) => (
        <Cylinder key={i} args={[0.12, 0.12, 0.1, 16]} position={[pos[0], 0, pos[1]]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.5} />
        </Cylinder>
      ))}
    </group>
  );
}

function ShipPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Hull */}
      <RoundedBox args={[0.5, 0.3, 0.8]} radius={0.05} smoothness={4} position={[0, 0.15, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </RoundedBox>
      {/* Deck */}
      <RoundedBox args={[0.4, 0.15, 0.6]} radius={0.03} smoothness={4} position={[0, 0.35, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </RoundedBox>
      {/* Mast */}
      <Cylinder args={[0.03, 0.03, 0.8, 8]} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </Cylinder>
      {/* Sail */}
      <mesh position={[0.2, 0.7, 0]} rotation={[0, 0, 0.2]} castShadow>
        <planeGeometry args={[0.4, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HatPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Brim */}
      <Cylinder args={[0.5, 0.5, 0.05, 32]} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Cylinder>
      {/* Crown */}
      <Cylinder args={[0.3, 0.35, 0.5, 32]} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Cylinder>
      {/* Top */}
      <Cylinder args={[0.3, 0.25, 0.15, 32]} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Cylinder>
      {/* Band */}
      <Cylinder args={[0.36, 0.36, 0.08, 32]} position={[0, 0.35, 0]} castShadow>
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.5} />
      </Cylinder>
    </group>
  );
}

function DogPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <RoundedBox args={[0.4, 0.3, 0.6]} radius={0.08} smoothness={4} position={[0, 0.2, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </RoundedBox>
      {/* Head */}
      <Sphere args={[0.2, 16, 16]} position={[0, 0.4, 0.35]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </Sphere>
      {/* Ears */}
      <RoundedBox args={[0.08, 0.15, 0.05]} radius={0.02} smoothness={4} position={[-0.15, 0.45, 0.35]} rotation={[0, 0, -0.3]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.15, 0.05]} radius={0.02} smoothness={4} position={[0.15, 0.45, 0.35]} rotation={[0, 0, 0.3]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </RoundedBox>
      {/* Legs */}
      {[[-0.15, -0.2], [0.15, -0.2], [-0.15, 0.2], [0.15, 0.2]].map((pos, i) => (
        <Cylinder key={i} args={[0.06, 0.06, 0.25, 8]} position={[pos[0], 0, pos[1]]} castShadow>
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
        </Cylinder>
      ))}
      {/* Tail */}
      <Cylinder args={[0.04, 0.02, 0.3, 8]} position={[0, 0.3, -0.35]} rotation={[0.5, 0, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </Cylinder>
    </group>
  );
}

function ThimblePiece({ color }: { color: string }) {
  return (
    <group>
      {/* Main body */}
      <Cylinder args={[0.25, 0.3, 0.5, 32]} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </Cylinder>
      {/* Top */}
      <Sphere args={[0.25, 16, 16]} position={[0, 0.5, 0]} scale={[1, 0.5, 1]} castShadow>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </Sphere>
      {/* Dimples pattern */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <Sphere key={i} args={[0.03, 8, 8]} position={[Math.cos(angle) * 0.22, 0.3, Math.sin(angle) * 0.22]}>
            <meshStandardMaterial color="#000000" />
          </Sphere>
        );
      })}
    </group>
  );
}

function BootPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Sole */}
      <RoundedBox args={[0.3, 0.08, 0.6]} radius={0.02} smoothness={4} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      {/* Foot */}
      <RoundedBox args={[0.25, 0.2, 0.5]} radius={0.05} smoothness={4} position={[0, 0.18, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </RoundedBox>
      {/* Shaft */}
      <Cylinder args={[0.15, 0.18, 0.5, 16]} position={[0, 0.5, -0.05]} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </Cylinder>
      {/* Laces */}
      {[0.1, 0.2, 0.3].map((y, i) => (
        <Torus key={i} args={[0.08, 0.01, 8, 16]} position={[0, 0.3 + y, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#8B4513" />
        </Torus>
      ))}
    </group>
  );
}

function WheelbarrowPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Bucket */}
      <Cone args={[0.35, 0.4, 16]} position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </Cone>
      {/* Handles */}
      <Cylinder args={[0.03, 0.03, 0.6, 8]} position={[-0.2, 0.2, -0.3]} rotation={[0.3, 0, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.6, 8]} position={[0.2, 0.2, -0.3]} rotation={[0.3, 0, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" metalness={0.2} roughness={0.8} />
      </Cylinder>
      {/* Wheel */}
      <Cylinder args={[0.15, 0.15, 0.08, 16]} position={[0, 0.15, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.5} />
      </Cylinder>
    </group>
  );
}

function IronPiece({ color }: { color: string }) {
  return (
    <group>
      {/* Base plate */}
      <RoundedBox args={[0.5, 0.05, 0.6]} radius={0.02} smoothness={4} position={[0, 0.025, 0]} castShadow>
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </RoundedBox>
      {/* Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Handle */}
      <Torus args={[0.15, 0.04, 8, 16]} position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.5} />
      </Torus>
      {/* Steam holes */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <Cylinder key={i} args={[0.02, 0.02, 0.06, 8]} position={[x, 0.06, 0.1]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Cylinder>
      ))}
    </group>
  );
}

function getPositionFromIndex(index: number): { x: number; z: number } {
  let x = 0, z = 0;
  
  if (index === 0) {
    x = BOARD_SIZE / 2;
    z = BOARD_SIZE / 2;
  } else if (index < 10) {
    x = BOARD_SIZE / 2 - (index * SPACE_SIZE);
    z = BOARD_SIZE / 2;
  } else if (index === 10) {
    x = -BOARD_SIZE / 2;
    z = BOARD_SIZE / 2;
  } else if (index < 20) {
    x = -BOARD_SIZE / 2;
    z = BOARD_SIZE / 2 - ((index - 10) * SPACE_SIZE);
  } else if (index === 20) {
    x = -BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2;
  } else if (index < 30) {
    x = -BOARD_SIZE / 2 + ((index - 20) * SPACE_SIZE);
    z = -BOARD_SIZE / 2;
  } else if (index === 30) {
    x = BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2;
  } else {
    x = BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2 + ((index - 30) * SPACE_SIZE);
  }

  return { x, z };
}
