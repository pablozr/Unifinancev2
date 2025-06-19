
'use client'

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, ShaderMaterial } from 'three';

const smokeVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSize;
  uniform float uPlasmaInfluence;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aDelay;
  attribute float aNoiseScale;
  
  varying float vAlpha;
  varying vec3 vColor;
  varying float vNoise;
  
  // Função de noise 3D simplificada
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec3 pos = position;
    
    float timeOffset = uTime * aSpeed + aDelay;
    
    // Múltiplas camadas de noise para movimento de fumaça
    float noise1 = snoise(pos * aNoiseScale + vec3(timeOffset * 0.1, timeOffset * 0.08, timeOffset * 0.05));
    float noise2 = snoise(pos * aNoiseScale * 1.5 + vec3(timeOffset * 0.05, timeOffset * 0.12, timeOffset * 0.08));
    float noise3 = snoise(pos * aNoiseScale * 3.0 + vec3(timeOffset * 0.02, timeOffset * 0.04, timeOffset * 0.06));
    
    // Enhanced atmospheric movement influenced by plasma
    float plasmaResponse = uPlasmaInfluence * 0.3;
    pos.x += noise1 * (1.0 + plasmaResponse) + noise2 * 0.3;
    pos.y += noise2 * (0.6 + plasmaResponse * 0.5) + noise3 * 0.2;
    pos.z += noise3 * (0.5 + plasmaResponse * 0.3) + noise1 * 0.15;

    // Subtle upward drift with plasma influence
    pos.y += timeOffset * (0.03 + plasmaResponse * 0.02);

    // Minimal mouse interaction for atmospheric feel
    vec2 mouseInfluence = (uMouse - 0.5) * 0.03;
    pos.x += mouseInfluence.x * aScale * 0.015;
    pos.y += mouseInfluence.y * aScale * 0.015;
    
    // Alpha baseado na distância e noise
    float distFromCenter = length(pos.xy);
    vAlpha = 1.0 - smoothstep(0.0, 6.0, distFromCenter);
    
    // Usar noise para criar variações de densidade
    vNoise = (noise1 + noise2 + noise3) / 3.0;
    vAlpha *= 0.2 + 0.3 * (0.5 + 0.5 * vNoise);
    vAlpha *= aScale;
    
    // Atmospheric colors that complement plasma
    float colorVariation = 0.5 + 0.3 * vNoise;
    float plasmaGlow = uPlasmaInfluence * 0.1;

    vec3 baseSmoke = vec3(0.06, 0.08, 0.12);     // Deep blue-gray
    vec3 plasmaSmoke = vec3(0.08, 0.12, 0.16);   // Slightly warmer blue-gray

    vColor = mix(baseSmoke, plasmaSmoke, colorVariation);

    // Subtle plasma influence on smoke color
    vColor += vec3(0.02, 0.03, 0.05) * plasmaGlow;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Tamanho maior para efeito de fumaça
    float sizeVariation = 1.0 + 0.8 * abs(vNoise);
    gl_PointSize = uSize * aScale * sizeVariation * (200.0 / -mvPosition.z);
  }
`;

const smokeFragmentShader = `
  uniform float uOpacity;
  
  varying float vAlpha;
  varying vec3 vColor;
  varying float vNoise;
  
  void main() {
    // Criar partícula de fumaça com bordas muito difusas
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Efeito de fumaça com bordas extremamente suaves
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 0.2); // Bordas muito difusas
    
    // Variação baseada no noise para textura de fumaça
    alpha *= 0.4 + 0.6 * (0.5 + 0.5 * vNoise);
    
    alpha *= vAlpha * uOpacity;
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export const BackgroundSmoke: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  
  const smokeData = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const delays = new Float32Array(count);
    const noiseScales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribuição ampla para cobrir todo o fundo
      const radius = Math.random() * 8 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 12;
      
      positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 4;
      positions[i3 + 1] = height + (Math.random() - 0.5) * 4;
      positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 4;
      
      scales[i] = Math.random() * 0.8 + 0.3;
      speeds[i] = Math.random() * 0.15 + 0.03; // Muito lento
      delays[i] = Math.random() * Math.PI * 4;
      noiseScales[i] = Math.random() * 0.2 + 0.05;
    }
    
    return { positions, scales, speeds, delays, noiseScales };
  }, []);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: { x: 0.5, y: 0.5 } },
    uSize: { value: 14.0 }, // Larger particles for atmospheric effect
    uOpacity: { value: 0.15 }, // More subtle to complement plasma
    uPlasmaInfluence: { value: 1.0 } // New uniform for plasma interaction
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Atmospheric breathing effect that complements plasma
      const plasmaInfluence = 0.8 + 0.3 * Math.sin(state.clock.elapsedTime * 0.1);
      materialRef.current.uniforms.uPlasmaInfluence.value = plasmaInfluence;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[smokeData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[smokeData.scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[smokeData.speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aDelay"
          args={[smokeData.delays, 1]}
        />
        <bufferAttribute
          attach="attributes-aNoiseScale"
          args={[smokeData.noiseScales, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={smokeVertexShader}
        fragmentShader={smokeFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={1} // Normal blending para fumaça sutil
      />
    </points>
  );
};