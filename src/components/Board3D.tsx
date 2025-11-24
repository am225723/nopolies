import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, RoundedBox, Cylinder, Cone, Box } from "@react-three/drei";
import { useMonopoly } from "@/lib/stores/useMonopoly";
import { getPropertyColor } from "@/data/themes";

const BOARD_SIZE = 20;
const SPACE_SIZE = BOARD_SIZE / 10;

export function Board3D() {
  const { properties } = useMonopoly();
  const boardRef = useRef<THREE.Group>(null);

  // Debug log to check if component is rendering
  console.log('Board3D rendering, properties:', properties.length);

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
      const isChance = i === 7 || i === 22 || i === 36;
      const isCommunityChest = i === 2 || i === 17 || i === 33;

      spaces.push({
        position: i,
        x,
        z,
        property,
        isCorner,
        isChance,
        isCommunityChest
      });
    }
    return spaces;
  }, [properties]);

  return (
    <group ref={boardRef}>
      {/* Board base with beveled edges */}
      <RoundedBox args={[BOARD_SIZE + 2, 0.3, BOARD_SIZE + 2]} radius={0.2} smoothness={4} position={[0, -0.15, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#8B7355" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Inner board surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE, 0.1, BOARD_SIZE]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Center logo area with gradient effect */}
      <RoundedBox args={[BOARD_SIZE - 4, 0.15, BOARD_SIZE - 4]} radius={0.3} smoothness={4} position={[0, 0.08, 0]} receiveShadow castShadow>
        <meshStandardMaterial 
          color="#2E8B57" 
          metalness={0.4}
          roughness={0.6}
          emissive="#1a5c3a"
          emissiveIntensity={0.2}
        />
      </RoundedBox>

      {/* Decorative border around center */}
      <RoundedBox args={[BOARD_SIZE - 3.5, 0.2, BOARD_SIZE - 3.5]} radius={0.25} smoothness={4} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      <Text
        position={[0, 0.25, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.8}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
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
          isChance={space.isChance}
          isCommunityChest={space.isCommunityChest}
        />
      ))}
    </group>
  );
}

function BoardSpace({ position, x, z, property, isCorner, isChance, isCommunityChest }: any) {
  const { setSelectedProperty } = useMonopoly();
  const handleClick = () => {
    if (property) {
      console.log('Property clicked:', property.name);
      setSelectedProperty(property);
    }
  };
  const size = isCorner ? SPACE_SIZE * 1.2 : SPACE_SIZE;
  const color = property ? getPropertyColor(property.color) : "#EEEEEE";

  if (isCorner) {
    return <CornerSpace position={position} x={x} z={z} size={size} />;
  }

  if (isChance) {
    return <ChanceSpace position={position} x={x} z={z} size={size} />;
  }

  if (isCommunityChest) {
    return <CommunityChestSpace position={position} x={x} z={z} size={size} />;
  }

  return (
    <group position={[x, 0, z]} onClick={handleClick}>
      {/* Space base with rounded corners */}
      <RoundedBox args={[size * 0.9, 0.2, size * 0.9]} radius={0.05} smoothness={4} position={[0, 0.1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.8} />
      </RoundedBox>

      {/* Property color bar with 3D depth */}
      {property && (
        <RoundedBox args={[size * 0.9, 0.15, size * 0.25]} radius={0.02} smoothness={4} position={[0, 0.18, size * 0.32]} receiveShadow castShadow>
          <meshStandardMaterial 
            color={color} 
            metalness={0.3}
            roughness={0.7}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </RoundedBox>
      )}

      {/* Property name */}
      {property && (
        <Text
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.22}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={size * 0.8}
        >
          {property.name}
        </Text>
      )}

      {/* Price with background */}
      {property && (
        <>
          <RoundedBox args={[size * 0.5, 0.05, size * 0.2]} radius={0.01} smoothness={4} position={[0, 0.21, -size * 0.25]} castShadow>
            <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.5} />
          </RoundedBox>
          <Text
            position={[0, 0.24, -size * 0.25]}
            rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
            fontSize={0.18}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            ${property.price}
          </Text>
        </>
      )}
    </group>
  );
}

function CornerSpace({ position, x, z, size }: any) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Corner base */}
      <RoundedBox args={[size * 0.95, 0.25, size * 0.95]} radius={0.1} smoothness={4} position={[0, 0.125, 0]} receiveShadow castShadow>
        <meshStandardMaterial 
          color={getCornerColor(position)} 
          metalness={0.4}
          roughness={0.6}
          emissive={getCornerColor(position)}
          emissiveIntensity={0.15}
        />
      </RoundedBox>

      {/* Decorative border */}
      <RoundedBox args={[size * 0.85, 0.3, size * 0.85]} radius={0.08} smoothness={4} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Corner-specific 3D elements */}
      {position === 0 && <GoSpaceElements size={size} />}
      {position === 10 && <JailSpaceElements size={size} />}
      {position === 20 && <FreeParkingElements size={size} />}
      {position === 30 && <GoToJailElements size={size} />}

      {/* Corner label */}
      <Text
        position={[0, 0.35, 0]}
        rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
        fontSize={0.5}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {getCornerLabel(position)}
      </Text>
    </group>
  );
}

function GoSpaceElements({ size }: { size: number }) {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Arrow pointing forward */}
      <Cone args={[0.3, 0.6, 8]} position={[0, 0.3, 0]} rotation={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </Cone>
      <Cylinder args={[0.15, 0.15, 0.4, 16]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
}

function JailSpaceElements({ size }: { size: number }) {
  return (
    <group position={[0, 0.3, 0]}>
      {/* Prison bars */}
      {[-0.3, -0.1, 0.1, 0.3].map((xPos, i) => (
        <Box key={i} args={[0.05, 0.6, 0.05]} position={[xPos, 0.3, 0]} castShadow>
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </Box>
      ))}
      {/* Horizontal bars */}
      <Box args={[0.7, 0.05, 0.05]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.7, 0.05, 0.05]} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
}

function FreeParkingElements({ size }: { size: number }) {
  return (
    <group position={[0, 0.3, 0]}>
      {/* Parking meter */}
      <Cylinder args={[0.08, 0.08, 0.6, 16]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </Cylinder>
      <RoundedBox args={[0.25, 0.35, 0.1]} radius={0.02} smoothness={4} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color="#4CAF50" metalness={0.5} roughness={0.5} emissive="#2E7D32" emissiveIntensity={0.3} />
      </RoundedBox>
    </group>
  );
}

function GoToJailElements({ size }: { size: number }) {
  return (
    <group position={[0, 0.3, 0]}>
      {/* Police badge */}
      <Cylinder args={[0.35, 0.35, 0.1, 8]} position={[0, 0.3, 0]} rotation={[0, Math.PI / 8, 0]} castShadow>
        <meshStandardMaterial color="#1565C0" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.12, 16]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </Cylinder>
    </group>
  );
}

function ChanceSpace({ position, x, z, size }: any) {
  const cardRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Space base */}
      <RoundedBox args={[size * 0.9, 0.2, size * 0.9]} radius={0.05} smoothness={4} position={[0, 0.1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#FF6B6B" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Floating card */}
      <group ref={cardRef} position={[0, 0.5, 0]}>
        <RoundedBox args={[0.6, 0.02, 0.9]} radius={0.02} smoothness={4} castShadow>
          <meshStandardMaterial 
            color="#FF6B6B" 
            metalness={0.4}
            roughness={0.6}
            emissive="#FF6B6B"
            emissiveIntensity={0.2}
          />
        </RoundedBox>
        <Text
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.25}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ?
        </Text>
      </group>

      {/* Label */}
      <Text
        position={[0, 0.22, 0]}
        rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        CHANCE
      </Text>
    </group>
  );
}

function CommunityChestSpace({ position, x, z, size }: any) {
  const chestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (chestRef.current) {
      chestRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Space base */}
      <RoundedBox args={[size * 0.9, 0.2, size * 0.9]} radius={0.05} smoothness={4} position={[0, 0.1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#4ECDC4" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Treasure chest */}
      <group ref={chestRef} position={[0, 0.5, 0]}>
        <RoundedBox args={[0.6, 0.4, 0.5]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial 
            color="#8B4513" 
            metalness={0.2}
            roughness={0.8}
          />
        </RoundedBox>
        {/* Chest lid */}
        <RoundedBox args={[0.6, 0.15, 0.5]} radius={0.05} smoothness={4} position={[0, 0.275, 0]} castShadow>
          <meshStandardMaterial color="#654321" metalness={0.2} roughness={0.8} />
        </RoundedBox>
        {/* Lock */}
        <Cylinder args={[0.08, 0.08, 0.1, 16]} position={[0, 0.1, 0.26]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </Cylinder>
      </group>

      {/* Label */}
      <Text
        position={[0, 0.22, 0]}
        rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        COMMUNITY
      </Text>
      <Text
        position={[0, 0.22, -0.2]}
        rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        CHEST
      </Text>
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
    case 20: return "FREE PARKING";
    case 30: return "GO TO JAIL";
    default: return "";
  }
}

function getCornerColor(position: number): string {
  switch (position) {
    case 0: return "#4CAF50"; // Green for GO
    case 10: return "#FF9800"; // Orange for Jail
    case 20: return "#2196F3"; // Blue for Free Parking
    case 30: return "#F44336"; // Red for Go To Jail
    default: return "#9E9E9E";
  }
}