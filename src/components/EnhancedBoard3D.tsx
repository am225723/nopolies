import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text, RoundedBox, Cylinder, Cone, Box, Sphere, Torus } from "@react-three/drei";
import { useMonopoly } from "@/lib/stores/useMonopoly";
import { getPropertyColor } from "@/data/themes";
import { PropertyBuildings } from "./PropertyBuildings";

const BOARD_SIZE = 20;
const SPACE_SIZE = BOARD_SIZE / 10;

export function EnhancedBoard3D() {
  const { properties, board } = useMonopoly();
  const boardRef = useRef<THREE.Group>(null);
  
  // Use board if properties is empty (fallback)
  const activeProperties = properties.length > 0 ? properties : board;

  console.log('EnhancedBoard3D rendering, properties:', activeProperties.length);

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
        x = cornerPositions[0].x;
        z = cornerPositions[0].z;
      } else if (i < 10) {
        x = BOARD_SIZE / 2 - (i * SPACE_SIZE);
        z = BOARD_SIZE / 2;
      } else if (i === 10) {
        x = cornerPositions[1].x;
        z = cornerPositions[1].z;
      } else if (i < 20) {
        x = -BOARD_SIZE / 2;
        z = BOARD_SIZE / 2 - ((i - 10) * SPACE_SIZE);
      } else if (i === 20) {
        x = cornerPositions[2].x;
        z = cornerPositions[2].z;
      } else if (i < 30) {
        x = -BOARD_SIZE / 2 + ((i - 20) * SPACE_SIZE);
        z = -BOARD_SIZE / 2;
      } else if (i === 30) {
        x = cornerPositions[3].x;
        z = cornerPositions[3].z;
      } else {
        x = BOARD_SIZE / 2;
        z = -BOARD_SIZE / 2 + ((i - 30) * SPACE_SIZE);
      }

      const property = activeProperties.find(p => p.position === i);
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
  }, [activeProperties]);

  // Gentle rotation animation for the board
  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group ref={boardRef}>
      {/* Wooden table surface */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE + 8, 0.5, BOARD_SIZE + 8]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Board base with beveled edges */}
      <RoundedBox 
        args={[BOARD_SIZE + 2, 0.4, BOARD_SIZE + 2]} 
        radius={0.3} 
        smoothness={8} 
        position={[0, -0.15, 0]} 
        receiveShadow 
        castShadow
      >
        <meshStandardMaterial 
          color="#654321" 
          metalness={0.3} 
          roughness={0.7}
        />
      </RoundedBox>

      {/* Inner board surface */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE, 0.1, BOARD_SIZE]} />
        <meshStandardMaterial 
          color="#E8DCC4" 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Center area - City Skyline */}
      <CityCenter />

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

      {/* Decorative border */}
      <BorderDecoration />
    </group>
  );
}

function CityCenter() {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Water feature base */}
      <Cylinder args={[6, 6, 0.2, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#4A90E2" 
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </Cylinder>

      {/* Central skyscraper cluster */}
      <Building height={4} width={0.8} depth={0.8} position={[0, 2, 0]} color="#2C3E50" />
      <Building height={3.5} width={0.7} depth={0.7} position={[-1.2, 1.75, 0.5]} color="#34495E" />
      <Building height={3.2} width={0.6} depth={0.6} position={[1.1, 1.6, -0.6]} color="#2C3E50" />
      <Building height={2.8} width={0.5} depth={0.5} position={[-0.8, 1.4, -1]} color="#34495E" />
      <Building height={3} width={0.65} depth={0.65} position={[0.9, 1.5, 0.8]} color="#2C3E50" />
      
      {/* Smaller buildings */}
      <Building height={2} width={0.4} depth={0.4} position={[-1.8, 1, 1.2]} color="#7F8C8D" />
      <Building height={2.2} width={0.45} depth={0.45} position={[1.7, 1.1, 1]} color="#95A5A6" />
      <Building height={1.8} width={0.4} depth={0.4} position={[-1.5, 0.9, -1.5]} color="#7F8C8D" />
      <Building height={2.1} width={0.42} depth={0.42} position={[1.6, 1.05, -1.3]} color="#95A5A6" />

      {/* Trees */}
      <Tree position={[-2.5, 0, 2]} />
      <Tree position={[2.3, 0, 2.2]} />
      <Tree position={[-2.4, 0, -2.1]} />
      <Tree position={[2.5, 0, -2.3]} />
      <Tree position={[-3, 0, 0]} />
      <Tree position={[3, 0, 0.5]} />

      {/* Park area */}
      <Cylinder args={[1.5, 1.5, 0.05, 32]} position={[2.5, 0.025, 2.5]}>
        <meshStandardMaterial color="#2ECC71" roughness={0.9} />
      </Cylinder>
    </group>
  );
}

function Building({ height, width, depth, position, color }: any) {
  const buildingRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (buildingRef.current) {
      // Subtle breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.01;
      buildingRef.current.scale.y = scale;
    }
  });

  return (
    <group ref={buildingRef} position={position}>
      {/* Main building */}
      <Box args={[width, height, depth]} position={[0, height / 2, 0]} castShadow>
        <meshStandardMaterial 
          color={color}
          metalness={0.6}
          roughness={0.3}
        />
      </Box>
      
      {/* Windows effect */}
      {Array.from({ length: Math.floor(height * 3) }).map((_, i) => (
        <Box 
          key={i}
          args={[width * 0.15, height / 15, depth * 0.02]} 
          position={[0, (i * height / 15) + 0.2, depth / 2 + 0.01]}
          castShadow
        >
          <meshStandardMaterial 
            color="#FFE4B5"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </Box>
      ))}
      
      {/* Roof */}
      <Cone args={[width * 0.7, height * 0.2, 4]} position={[0, height + height * 0.1, 0]} castShadow>
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.8}
          roughness={0.2}
        />
      </Cone>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <Cylinder args={[0.1, 0.12, 0.5, 8]} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Cylinder>
      {/* Foliage */}
      <Sphere args={[0.3, 16, 16]} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0, 0.85, 0]} castShadow>
        <meshStandardMaterial color="#32CD32" roughness={0.8} />
      </Sphere>
    </group>
  );
}

function BorderDecoration() {
  return (
    <group>
      {/* Corner decorations */}
      {[
        [BOARD_SIZE / 2 + 0.5, BOARD_SIZE / 2 + 0.5],
        [-BOARD_SIZE / 2 - 0.5, BOARD_SIZE / 2 + 0.5],
        [-BOARD_SIZE / 2 - 0.5, -BOARD_SIZE / 2 - 0.5],
        [BOARD_SIZE / 2 + 0.5, -BOARD_SIZE / 2 - 0.5],
      ].map((pos, i) => (
        <Sphere key={i} args={[0.3, 16, 16]} position={[pos[0], 0.2, pos[1]]} castShadow>
          <meshStandardMaterial 
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
}

function BoardSpace({ position, x, z, property, isCorner, isChance, isCommunityChest }: any) {
  const { setSelectedProperty } = useMonopoly();
  const size = isCorner ? SPACE_SIZE * 1.2 : SPACE_SIZE;
  const color = property ? getPropertyColor(property.color) : "#EEEEEE";
  const spaceRef = useRef<THREE.Group>(null);

  const handleClick = () => {
    if (property) {
      console.log('Property clicked:', property.name);
      setSelectedProperty(property);
    }
  };

  useFrame((state) => {
    if (spaceRef.current && property) {
      // Gentle pulsing effect for properties
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position * 0.5) * 0.02;
      spaceRef.current.scale.set(scale, 1, scale);
    }
  });

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
    <group ref={spaceRef} position={[x, 0, z]} onClick={handleClick}>
      {/* Space base */}
      <RoundedBox 
        args={[size * 0.9, 0.2, size * 0.9]} 
        radius={0.05} 
        smoothness={4} 
        position={[0, 0.1, 0]} 
        receiveShadow 
        castShadow
      >
        <meshStandardMaterial 
          color="#FFFFFF" 
          metalness={0.1} 
          roughness={0.8}
        />
      </RoundedBox>

      {/* Property color bar */}
      {property && (
        <RoundedBox 
          args={[size * 0.9, 0.15, size * 0.25]} 
          radius={0.02} 
          smoothness={4} 
          position={[0, 0.18, size * 0.32]} 
          receiveShadow 
          castShadow
        >
          <meshStandardMaterial 
            color={color} 
            metalness={0.4}
            roughness={0.6}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </RoundedBox>
      )}

      {/* Property name */}
      {property && (
        <Text
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
          fontSize={0.18}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={size * 0.8}
        >
          {property.name}
        </Text>
      )}

      {/* Buildings on property */}
      {property && (property.houses || property.hasHotel) && (
        <PropertyBuildings
          position={[0, 0.25, 0]}
          color={color}
          houseCount={property.houses || 0}
          hasHotel={property.hasHotel || false}
        />
      )}

      {/* Price */}
      {property && property.price && (
        <>
          <RoundedBox 
            args={[size * 0.5, 0.05, size * 0.2]} 
            radius={0.01} 
            smoothness={4} 
            position={[0, 0.21, -size * 0.25]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#FFD700" 
              metalness={0.7} 
              roughness={0.3}
            />
          </RoundedBox>
          <Text
            position={[0, 0.24, -size * 0.25]}
            rotation={[-Math.PI / 2, 0, getRotationForPosition(position)]}
            fontSize={0.15}
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
  const cornerNames = ['GO', 'JAIL', 'FREE PARKING', 'GO TO JAIL'];
  const cornerColors = ['#FFD700', '#FF6347', '#32CD32', '#FF4500'];
  const name = cornerNames[position / 10];
  const color = cornerColors[position / 10];

  return (
    <group position={[x, 0, z]}>
      <RoundedBox 
        args={[size, 0.25, size]} 
        radius={0.1} 
        smoothness={4} 
        position={[0, 0.125, 0]} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial 
          color={color}
          metalness={0.5}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </RoundedBox>
      <Text
        position={[0, 0.26, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  );
}

function ChanceSpace({ position, x, z, size }: any) {
  const spaceRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (spaceRef.current) {
      spaceRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <RoundedBox 
        args={[size * 0.9, 0.2, size * 0.9]} 
        radius={0.05} 
        smoothness={4} 
        position={[0, 0.1, 0]} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial color="#FF6B6B" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      <group ref={spaceRef} position={[0, 0.3, 0]}>
        <Box args={[0.4, 0.6, 0.02]} castShadow>
          <meshStandardMaterial 
            color="#FFFFFF"
            metalness={0.2}
            roughness={0.8}
          />
        </Box>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.25}
          color="#FF0000"
          anchorX="center"
          anchorY="middle"
        >
          ?
        </Text>
      </group>
    </group>
  );
}

function CommunityChestSpace({ position, x, z, size }: any) {
  const chestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (chestRef.current) {
      chestRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <RoundedBox 
        args={[size * 0.9, 0.2, size * 0.9]} 
        radius={0.05} 
        smoothness={4} 
        position={[0, 0.1, 0]} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial color="#4ECDC4" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      <group ref={chestRef} position={[0, 0.3, 0]}>
        <RoundedBox args={[0.5, 0.3, 0.4]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial 
            color="#8B4513"
            metalness={0.4}
            roughness={0.6}
          />
        </RoundedBox>
        <RoundedBox args={[0.52, 0.15, 0.42]} radius={0.05} smoothness={4} position={[0, 0.15, 0]} castShadow>
          <meshStandardMaterial 
            color="#DAA520"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

function getRotationForPosition(position: number): number {
  if (position < 10) return 0;
  if (position < 20) return Math.PI / 2;
  if (position < 30) return Math.PI;
  return -Math.PI / 2;
}

export function getPositionFromIndex(index: number): { x: number; z: number } {
  const cornerPositions = [
    { x: BOARD_SIZE / 2, z: BOARD_SIZE / 2 },
    { x: -BOARD_SIZE / 2, z: BOARD_SIZE / 2 },
    { x: -BOARD_SIZE / 2, z: -BOARD_SIZE / 2 },
    { x: BOARD_SIZE / 2, z: -BOARD_SIZE / 2 },
  ];

  if (index === 0) return cornerPositions[0];
  if (index < 10) return { x: BOARD_SIZE / 2 - (index * SPACE_SIZE), z: BOARD_SIZE / 2 };
  if (index === 10) return cornerPositions[1];
  if (index < 20) return { x: -BOARD_SIZE / 2, z: BOARD_SIZE / 2 - ((index - 10) * SPACE_SIZE) };
  if (index === 20) return cornerPositions[2];
  if (index < 30) return { x: -BOARD_SIZE / 2 + ((index - 20) * SPACE_SIZE), z: -BOARD_SIZE / 2 };
  if (index === 30) return cornerPositions[3];
  return { x: BOARD_SIZE / 2, z: -BOARD_SIZE / 2 + ((index - 30) * SPACE_SIZE) };
}
