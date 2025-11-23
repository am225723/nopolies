import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useMonopoly } from "@/lib/stores/useMonopoly";
import { getPropertyColor } from "@/data/themes";

const BOARD_SIZE = 20;
const SPACE_SIZE = BOARD_SIZE / 10;

export function Board3D() {
  const { properties } = useMonopoly();
  const boardRef = useRef<THREE.Group>(null);

  const boardSpaces = useMemo(() => {
    const spaces = [];
    const cornerPositions = [
      { x: BOARD_SIZE / 2, z: BOARD_SIZE / 2 }, // GO (0)
      { x: -BOARD_SIZE / 2, z: BOARD_SIZE / 2 }, // Just Visiting (10)
      { x: -BOARD_SIZE / 2, z: -BOARD_SIZE / 2 }, // Free Parking (20)
      { x: BOARD_SIZE / 2, z: -BOARD_SIZE / 2 }, // Go To Jail (30)
    ];

    for (let i = 0; i < 40; i++) {
      let x = 0, z = 0;
      
      if (i === 0) {
        // GO
        x = cornerPositions[0].x;
        z = cornerPositions[0].z;
      } else if (i < 10) {
        // Bottom row
        x = BOARD_SIZE / 2 - (i * SPACE_SIZE);
        z = BOARD_SIZE / 2;
      } else if (i === 10) {
        // Just Visiting
        x = cornerPositions[1].x;
        z = cornerPositions[1].z;
      } else if (i < 20) {
        // Left column
        x = -BOARD_SIZE / 2;
        z = BOARD_SIZE / 2 - ((i - 10) * SPACE_SIZE);
      } else if (i === 20) {
        // Free Parking
        x = cornerPositions[2].x;
        z = cornerPositions[2].z;
      } else if (i < 30) {
        // Top row
        x = -BOARD_SIZE / 2 + ((i - 20) * SPACE_SIZE);
        z = -BOARD_SIZE / 2;
      } else if (i === 30) {
        // Go To Jail
        x = cornerPositions[3].x;
        z = cornerPositions[3].z;
      } else {
        // Right column
        x = BOARD_SIZE / 2;
        z = -BOARD_SIZE / 2 + ((i - 30) * SPACE_SIZE);
      }

      const property = properties.find(p => p.position === i);
      const isCorner = i === 0 || i === 10 || i === 20 || i === 30;

      spaces.push({
        position: i,
        x,
        z,
        property,
        isCorner
      });
    }
    return spaces;
  }, [properties]);

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE + 2, 0.2, BOARD_SIZE + 2]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Center logo area */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE - 4, 0.1, BOARD_SIZE - 4]} />
        <meshStandardMaterial color="#2E8B57" />
      </mesh>

      <Text
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        MONOPOLY
      </Text>

      {/* Board spaces */}
      {boardSpaces.map((space) => (
        <BoardSpace
          key={space.position}
          position={space.position}
          x={space.x}
          z={space.z}
          property={space.property}
          isCorner={space.isCorner}
        />
      ))}
    </group>
  );
}

function BoardSpace({ position, x, z, property, isCorner }: any) {
  const size = isCorner ? SPACE_SIZE * 1.2 : SPACE_SIZE;
  const color = property ? getPropertyColor(property.color) : "#EEEEEE";

  return (
    <group position={[x, 0, z]}>
      {/* Space base */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[size * 0.9, 0.15, size * 0.9]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Property color bar */}
      {property && (
        <mesh position={[0, 0.08, size * 0.35]} receiveShadow castShadow>
          <boxGeometry args={[size * 0.9, 0.01, size * 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Property name */}
      {property && (
        <Text
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.25}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={size * 0.8}
          font="/fonts/inter.json"
        >
          {property.name}
        </Text>
      )}

      {/* Corner labels */}
      {isCorner && (
        <Text
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.4}
          color="#2E8B57"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          {getCornerLabel(position)}
        </Text>
      )}

      {/* Price */}
      {property && (
        <Text
          position={[0, 0.1, -size * 0.25]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.2}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          ${property.price}
        </Text>
      )}
    </group>
  );
}

function getRotationForPosition(position: number): number {
  if (position <= 10) return 0;
  if (position <= 20) return Math.PI / 2;
  if (position <= 30) return Math.PI;
  return -Math.PI / 2;
}

function getCornerLabel(position: number): string {
  switch (position) {
    case 0: return "GO";
    case 10: return "JAIL";
    case 20: return "PARKING";
    case 30: return "GO TO JAIL";
    default: return "";
  }
}
