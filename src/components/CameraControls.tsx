import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function CameraControls() {
  const { camera, gl } = useThree();
  const targetRotation = useRef(0);
  const targetZoom = useRef(25);
  const currentRotation = useRef(0);
  const currentZoom = useRef(25);
  const flipAngle = useRef(0);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

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
        case ' ':
          // Space bar to reset camera
          targetRotation.current = 0;
          targetZoom.current = 25;
          flipAngle.current = 0;
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      gl.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      targetRotation.current += deltaX * 0.01;
      
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom.current = Math.max(15, Math.min(35, targetZoom.current + e.deltaY * 0.01));
    };

    window.addEventListener('keydown', handleKeyDown);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('wheel', handleWheel);
    gl.domElement.style.cursor = 'grab';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl]);

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
