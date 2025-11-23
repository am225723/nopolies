import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Player } from "@/lib/stores/useMonopoly";
import { useSpring, animated } from "@react-spring/three";

const BOARD_SIZE = 20;
const SPACE_SIZE = BOARD_SIZE / 10;

interface GamePieceProps {
  player: Player;
  targetPosition: number;
}

export function GamePiece({ player, targetPosition }: GamePieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(getPositionForSpace(0));

  useEffect(() => {
    const newPos = getPositionForSpace(targetPosition);
    setPosition(newPos);
  }, [targetPosition]);

  const { pos } = useSpring({
    pos: position,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.sin(time * 2 + player.id) * 0.1;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={pos as any}
      castShadow
    >
      {player.tokenUrl ? (
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 16]} />
          <meshStandardMaterial color={player.color} metalness={0.5} roughness={0.3} />
        </mesh>
      ) : (
        <mesh>
          <coneGeometry args={[0.3, 0.6, 8]} />
          <meshStandardMaterial color={player.color} metalness={0.5} roughness={0.3} />
        </mesh>
      )}
    </animated.mesh>
  );
}

function getPositionForSpace(spaceIndex: number): [number, number, number] {
  const offset = 0.4;
  let x = 0, z = 0;

  if (spaceIndex === 0) {
    x = BOARD_SIZE / 2;
    z = BOARD_SIZE / 2;
  } else if (spaceIndex < 10) {
    x = BOARD_SIZE / 2 - (spaceIndex * SPACE_SIZE);
    z = BOARD_SIZE / 2;
  } else if (spaceIndex === 10) {
    x = -BOARD_SIZE / 2;
    z = BOARD_SIZE / 2;
  } else if (spaceIndex < 20) {
    x = -BOARD_SIZE / 2;
    z = BOARD_SIZE / 2 - ((spaceIndex - 10) * SPACE_SIZE);
  } else if (spaceIndex === 20) {
    x = -BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2;
  } else if (spaceIndex < 30) {
    x = -BOARD_SIZE / 2 + ((spaceIndex - 20) * SPACE_SIZE);
    z = -BOARD_SIZE / 2;
  } else if (spaceIndex === 30) {
    x = BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2;
  } else {
    x = BOARD_SIZE / 2;
    z = -BOARD_SIZE / 2 + ((spaceIndex - 30) * SPACE_SIZE);
  }

  return [x + offset, 0.5, z + offset];
}
