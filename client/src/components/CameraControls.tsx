import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function CameraControls() {
  const { camera } = useThree();
  const targetRotation = useRef(0);
  const targetZoom = useRef(25);
  const currentRotation = useRef(0);
  const currentZoom = useRef(25);
  const flipAngle = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'q':
          targetRotation.current += Math.PI / 4;
          break;
        case 'e':
          targetRotation.current -= Math.PI / 4;
          break;
        case 'r':
          flipAngle.current = flipAngle.current === 0 ? Math.PI : 0;
          break;
        case '+':
        case '=':
          targetZoom.current = Math.max(15, targetZoom.current - 2);
          break;
        case '-':
          targetZoom.current = Math.min(35, targetZoom.current + 2);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useFrame(() => {
    currentRotation.current += (targetRotation.current - currentRotation.current) * 0.1;
    currentZoom.current += (targetZoom.current - currentZoom.current) * 0.1;

    const angle = currentRotation.current;
    const radius = currentZoom.current;
    
    camera.position.x = Math.sin(angle) * radius;
    camera.position.y = 15 + Math.cos(flipAngle.current) * 5;
    camera.position.z = Math.cos(angle) * radius;
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}
