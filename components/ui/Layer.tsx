'use client'

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { BackgroundSmoke } from './Smoke';
import { FinancialFlow } from './Flow';


export const LayeredFinancialBackground: React.FC = () => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.0003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* FumaÃ§a no fundo - renderizada primeiro */}
      <BackgroundSmoke /> 
      
      {/* Flow na frente - renderizado por Ãºltimo */}
      <FinancialFlow />
    </group>
  );
};
