import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox, Cylinder, Cone, Box } from "@react-three/drei";

interface PropertyBuildingsProps {
  position: [number, number, number];
  color: string;
  houseCount: number;
  hasHotel: boolean;
}

export function PropertyBuildings({ position, color, houseCount, hasHotel }: PropertyBuildingsProps) {
  if (hasHotel) {
    return <Hotel position={position} color={color} />;
  }

  return (
    <group position={position}>
      {Array.from({ length: houseCount }).map((_, i) => (
        <House 
          key={i} 
          position={[
            -0.3 + (i * 0.2), 
            0, 
            0
          ]} 
          color={color}
          delay={i * 0.2}
        />
      ))}
    </group>
  );
}

function House({ position, color, delay }: { position: [number, number, number]; color: string; delay: number }) {
  const houseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (houseRef.current) {
      // Gentle breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.05;
      houseRef.current.scale.set(scale, scale, scale);
      
      // Gentle rotation
      houseRef.current.rotation.y = Math.sin(state.clock.elapsedTime + delay) * 0.1;
    }
  });

  return (
    <group ref={houseRef} position={position}>
      {/* House base */}
      <RoundedBox args={[0.15, 0.2, 0.15]} radius={0.02} smoothness={4} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial 
          color={color}
          metalness={0.6}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      {/* Roof */}
      <Cone args={[0.12, 0.15, 4]} position={[0, 0.275, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial 
          color="#8B4513"
          metalness={0.3}
          roughness={0.7}
        />
      </Cone>
      
      {/* Door */}
      <Box args={[0.05, 0.08, 0.02]} position={[0, 0.04, 0.077]} castShadow>
        <meshStandardMaterial 
          color="#654321"
          metalness={0.2}
          roughness={0.8}
        />
      </Box>
      
      {/* Windows */}
      {[[-0.04, 0.04], [0.04, 0.04]].map((pos, i) => (
        <Box key={i} args={[0.03, 0.03, 0.02]} position={[pos[0], 0.12, 0.077]} castShadow>
          <meshStandardMaterial 
            color="#87CEEB"
            metalness={0.9}
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </Box>
      ))}
      
      {/* Chimney */}
      <Cylinder args={[0.02, 0.02, 0.08, 8]} position={[0.05, 0.32, 0.03]} castShadow>
        <meshStandardMaterial 
          color="#8B4513"
          metalness={0.2}
          roughness={0.9}
        />
      </Cylinder>
    </group>
  );
}

function Hotel({ position, color }: { position: [number, number, number]; color: string }) {
  const hotelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (hotelRef.current) {
      // Majestic breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      hotelRef.current.scale.set(scale, scale, scale);
      
      // Slow rotation
      hotelRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={hotelRef} position={position}>
      {/* Main tower */}
      <RoundedBox args={[0.3, 0.6, 0.3]} radius={0.03} smoothness={6} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial 
          color={color}
          metalness={0.7}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </RoundedBox>
      
      {/* Windows - multiple floors */}
      {Array.from({ length: 5 }).map((_, floor) => (
        <group key={floor}>
          {Array.from({ length: 3 }).map((_, col) => (
            <Box 
              key={col}
              args={[0.04, 0.06, 0.02]} 
              position={[-0.08 + col * 0.08, 0.1 + floor * 0.11, 0.152]}
              castShadow
            >
              <meshStandardMaterial 
                color="#FFE4B5"
                metalness={0.9}
                roughness={0.1}
                emissive="#FFD700"
                emissiveIntensity={0.4}
              />
            </Box>
          ))}
        </group>
      ))}
      
      {/* Roof structure */}
      <Cone args={[0.18, 0.15, 4]} position={[0, 0.675, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.5}
        />
      </Cone>
      
      {/* Spire */}
      <Cylinder args={[0.02, 0.02, 0.15, 8]} position={[0, 0.825, 0]} castShadow>
        <meshStandardMaterial 
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Flag on top */}
      <Cone args={[0.05, 0.08, 3]} position={[0, 0.92, 0]} castShadow>
        <meshStandardMaterial 
          color="#FF0000"
          metalness={0.5}
          roughness={0.5}
        />
      </Cone>
      
      {/* Side wings */}
      {[-0.2, 0.2].map((x, i) => (
        <RoundedBox 
          key={i}
          args={[0.15, 0.4, 0.15]} 
          radius={0.02} 
          smoothness={4} 
          position={[x, 0.2, 0]} 
          castShadow
        >
          <meshStandardMaterial 
            color={color}
            metalness={0.7}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </RoundedBox>
      ))}
      
      {/* Entrance */}
      <RoundedBox args={[0.12, 0.15, 0.05]} radius={0.02} smoothness={4} position={[0, 0.075, 0.175]} castShadow>
        <meshStandardMaterial 
          color="#654321"
          metalness={0.4}
          roughness={0.6}
        />
      </RoundedBox>
      
      {/* Entrance columns */}
      {[-0.05, 0.05].map((x, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.15, 8]} position={[x, 0.075, 0.2]} castShadow>
          <meshStandardMaterial 
            color="#FFFFFF"
            metalness={0.6}
            roughness={0.4}
          />
        </Cylinder>
      ))}
      
      {/* Hotel sign */}
      <Box args={[0.25, 0.08, 0.02]} position={[0, 0.65, 0.16]} castShadow>
        <meshStandardMaterial 
          color="#000000"
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      
      {/* Glowing "HOTEL" text effect */}
      <Box args={[0.22, 0.06, 0.03]} position={[0, 0.65, 0.17]} castShadow>
        <meshStandardMaterial 
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </Box>
    </group>
  );
}

// Component to show building animation when property is purchased
export function BuildingPlacementAnimation({ 
  position, 
  color, 
  type 
}: { 
  position: [number, number, number]; 
  color: string; 
  type: 'house' | 'hotel';
}) {
  const animRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (animRef.current) {
      // Descend from sky
      if (animRef.current.position.y > position[1]) {
        animRef.current.position.y -= delta * 2;
      }
      
      // Rotate while descending
      animRef.current.rotation.y += delta * 3;
      
      // Scale up
      const targetScale = 1;
      if (animRef.current.scale.x < targetScale) {
        animRef.current.scale.x += delta * 2;
        animRef.current.scale.y += delta * 2;
        animRef.current.scale.z += delta * 2;
      }
    }
  });

  return (
    <group ref={animRef} position={[position[0], position[1] + 5, position[2]]} scale={[0.1, 0.1, 0.1]}>
      {type === 'house' ? (
        <House position={[0, 0, 0]} color={color} delay={0} />
      ) : (
        <Hotel position={[0, 0, 0]} color={color} />
      )}
    </group>
  );
}