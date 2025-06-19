'use client'

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, ShaderMaterial, Vector3, InstancedMesh, SphereGeometry, Matrix4, Color } from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSize;
  uniform float uDispersionWave;
  uniform float uEnergyField;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aDelay;
  attribute float aRadius;
  attribute float aViscosity;
  attribute float aBlobSize;
  attribute float aLifecycle;
  attribute float aEnergyLevel;
  attribute float aClusterID;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vDistance;
  varying float vEnergyLevel;
  varying float vBlobSize;
  varying float vLifecycle;

  // Enhanced noise functions for plasma simulation
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  // Plasma field noise for organic movement
  float plasmaField(vec3 p, float time) {
    float n1 = noise(p * 0.8 + vec3(time * 0.1));
    float n2 = noise(p * 1.6 + vec3(time * 0.15, time * 0.12, time * 0.08));
    float n3 = noise(p * 3.2 + vec3(time * 0.05, time * 0.18, time * 0.22));
    return (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
  }
  
  void main() {
    vec3 pos = position;
    float timeOffset = uTime * aSpeed + aDelay;

    // Plasma lifecycle simulation
    float lifecycle = mod(aLifecycle + uTime * 0.1, 6.28318); // 2π cycle
    float birthPhase = smoothstep(0.0, 1.0, lifecycle);
    float deathPhase = 1.0 - smoothstep(5.0, 6.28318, lifecycle);
    float lifeIntensity = birthPhase * deathPhase;

    // Energy-based dispersion waves
    float wavePhase = sin(uTime * 0.3 + aClusterID * 2.0) * 0.5 + 0.5;
    float dispersionWave = sin(uTime * 0.2 + aRadius * 0.5) * wavePhase;

    // Plasma field forces
    vec3 plasmaForce = vec3(
      plasmaField(pos + vec3(timeOffset * 0.1), uTime),
      plasmaField(pos + vec3(0.0, timeOffset * 0.08, 0.0), uTime),
      plasmaField(pos + vec3(0.0, 0.0, timeOffset * 0.12), uTime)
    ) - 0.5;

    // Energy-based movement intensity
    float energyFactor = aEnergyLevel * uEnergyField;
    float viscosityFactor = 1.0 / (1.0 + aRadius * aViscosity * 1.5);

    // Blob dispersion mechanics
    float disperseIntensity = energyFactor * dispersionWave * 0.4;
    vec3 disperseDirection = normalize(position + plasmaForce * 0.1);
    pos += disperseDirection * disperseIntensity * lifeIntensity;

    // Organic plasma flow
    pos += plasmaForce * 0.3 * viscosityFactor * energyFactor;

    // Cluster-based attraction/repulsion
    float clusterPhase = sin(uTime * 0.15 + aClusterID) * 0.5 + 0.5;
    vec3 clusterForce = -normalize(pos) * 0.08 * clusterPhase * (1.0 - aRadius * 0.3);
    pos += clusterForce * viscosityFactor;
    
    // Subtle mouse interaction with energy field
    vec2 mouseInfluence = (uMouse - 0.5) * 0.15;
    float mouseEnergy = length(mouseInfluence) * energyFactor;
    pos.x += mouseInfluence.x * aScale * 0.1 * viscosityFactor;
    pos.y += mouseInfluence.y * aScale * 0.1 * viscosityFactor;

    // Calculate distance and energy metrics
    vDistance = length(pos);
    vEnergyLevel = aEnergyLevel * energyFactor * lifeIntensity;
    vBlobSize = aBlobSize * (0.8 + 0.4 * energyFactor) * lifeIntensity;
    vLifecycle = lifeIntensity;

    // Energy-based alpha with plasma density
    float plasmaDensity = 1.0 / (1.0 + vDistance * 0.4);
    vAlpha = plasmaDensity * aScale * lifeIntensity;

    // Energy pulsation
    float energyPulse = 0.6 + 0.4 * sin(timeOffset * 2.0 + vEnergyLevel * 3.0);
    vAlpha *= energyPulse;

    // Plasma breathing effect
    float plasmaBreath = 0.7 + 0.3 * sin(uTime * 0.25 + aClusterID);
    vAlpha *= plasmaBreath;
    
    // Energy-based color evolution
    float colorPhase = sin(vDistance * 0.3 + uTime * 0.15 + vEnergyLevel * 2.0) * 0.5 + 0.5;
    float centerGlow = 1.0 - smoothstep(0.0, 2.5, vDistance);

    // Plasma temperature colors (blue → purple → warm)
    vec3 coldPlasma = vec3(0.2, 0.4, 0.9);    // Deep blue (low energy)
    vec3 mediumPlasma = vec3(0.6, 0.3, 0.9);  // Purple (medium energy)
    vec3 hotPlasma = vec3(0.9, 0.5, 0.3);     // Warm orange (high energy)
    vec3 coreGlow = vec3(0.95, 0.9, 0.8);     // Bright core

    // Energy-based color mixing
    float energyTemp = vEnergyLevel * (0.5 + 0.5 * colorPhase);
    vec3 plasmaColor = mix(
      mix(coldPlasma, mediumPlasma, smoothstep(0.0, 0.6, energyTemp)),
      hotPlasma,
      smoothstep(0.4, 1.0, energyTemp)
    );

    // Core glow for high-energy centers
    vColor = mix(plasmaColor, coreGlow, centerGlow * energyTemp * 0.7);

    // Energy shimmer effect
    float energyShimmer = 1.0 + 0.3 * sin(uTime * 3.0 + vEnergyLevel * 5.0);
    vColor *= energyShimmer;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Dynamic blob sizing based on energy and lifecycle
    float energySizeMultiplier = 1.0 + vEnergyLevel * 1.5 + centerGlow * 1.2;
    float lifecycleSizeMultiplier = 0.3 + 0.7 * lifeIntensity;
    gl_PointSize = uSize * vBlobSize * energySizeMultiplier * lifecycleSizeMultiplier * (200.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  uniform float uTime;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vDistance;
  varying float vEnergyLevel;
  varying float vBlobSize;
  varying float vLifecycle;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Blob-like shape with soft edges
    float blobShape = 1.0 - smoothstep(0.0, 0.5, dist);
    blobShape = pow(blobShape, 0.4); // Softer edges for organic feel

    // Energy-based inner glow
    float energyGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    energyGlow = pow(energyGlow, 0.8) * vEnergyLevel;

    // Plasma shimmer effect
    float plasmaShimmer = 0.8 + 0.2 * sin(vDistance * 8.0 + uTime * 4.0 + vEnergyLevel * 6.0);

    // Lifecycle fade for birth/death effects
    float lifecycleFade = vLifecycle * (0.7 + 0.3 * sin(uTime * 2.0 + vDistance * 3.0));

    // Combine all effects
    float alpha = blobShape * plasmaShimmer * lifecycleFade;
    alpha += energyGlow * 0.6; // Add energy glow

    // Energy-based density
    float energyDensity = 1.0 / (1.0 + vDistance * 0.25);
    alpha *= energyDensity;

    alpha *= vAlpha * uOpacity;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export const FinancialFlow: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { pointer } = useThree();

  const particlesData = useMemo(() => {
    const count = 1500; // Increased for denser plasma effect
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const delays = new Float32Array(count);
    const radiuses = new Float32Array(count);
    const viscosities = new Float32Array(count);
    const blobSizes = new Float32Array(count);
    const lifecycles = new Float32Array(count);
    const energyLevels = new Float32Array(count);
    const clusterIDs = new Float32Array(count);
    
    // Create plasma clusters for organic distribution
    const clusterCount = 8;
    const clusters = Array.from({ length: clusterCount }, () => ({
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 4,
      energy: Math.random() * 0.8 + 0.2
    }));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Assign to cluster with some randomness
      const clusterIndex = Math.floor(Math.random() * clusterCount);
      const cluster = clusters[clusterIndex];

      // Position around cluster center with plasma-like distribution
      const radiusBase = Math.pow(Math.random(), 2.5) * 2.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2;

      positions[i3] = cluster.x + Math.cos(angle) * radiusBase;
      positions[i3 + 1] = cluster.y + height;
      positions[i3 + 2] = cluster.z + Math.sin(angle) * radiusBase;

      // Blob characteristics
      scales[i] = (Math.random() * 0.7 + 0.3) * (1.2 - radiusBase * 0.3);
      speeds[i] = (Math.random() * 0.15 + 0.03) * (1.0 - radiusBase * 0.2);
      delays[i] = Math.random() * Math.PI * 2;
      radiuses[i] = radiusBase;
      viscosities[i] = Math.random() * 1.5 + 0.8;

      // New plasma attributes
      blobSizes[i] = Math.random() * 0.6 + 0.7;
      lifecycles[i] = Math.random() * Math.PI * 2;
      energyLevels[i] = cluster.energy * (Math.random() * 0.6 + 0.4);
      clusterIDs[i] = clusterIndex;
    }

    return {
      positions, scales, speeds, delays, radiuses, viscosities,
      blobSizes, lifecycles, energyLevels, clusterIDs
    };
  }, []);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: { x: 0.5, y: 0.5 } },
    uSize: { value: 4.0 },
    uOpacity: { value: 0.85 },
    uDispersionWave: { value: 1.0 },
    uEnergyField: { value: 1.0 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Enhanced pointer interaction
      const targetX = (pointer.x + 1) / 2;
      const targetY = (pointer.y + 1) / 2;

      materialRef.current.uniforms.uMouse.value.x += (targetX - materialRef.current.uniforms.uMouse.value.x) * 0.01;
      materialRef.current.uniforms.uMouse.value.y += (targetY - materialRef.current.uniforms.uMouse.value.y) * 0.01;

      // Dynamic plasma parameters
      materialRef.current.uniforms.uDispersionWave.value = 0.8 + 0.4 * Math.sin(state.clock.elapsedTime * 0.2);
      materialRef.current.uniforms.uEnergyField.value = 0.9 + 0.2 * Math.sin(state.clock.elapsedTime * 0.15);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[particlesData.scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[particlesData.speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aDelay"
          args={[particlesData.delays, 1]}
        />
        <bufferAttribute
          attach="attributes-aRadius"
          args={[particlesData.radiuses, 1]}
        />
        <bufferAttribute
          attach="attributes-aViscosity"
          args={[particlesData.viscosities, 1]}
        />
        <bufferAttribute
          attach="attributes-aBlobSize"
          args={[particlesData.blobSizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aLifecycle"
          args={[particlesData.lifecycles, 1]}
        />
        <bufferAttribute
          attach="attributes-aEnergyLevel"
          args={[particlesData.energyLevels, 1]}
        />
        <bufferAttribute
          attach="attributes-aClusterID"
          args={[particlesData.clusterIDs, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={2} // AdditiveBlending for plasma glow
      />
    </points>
  );
};