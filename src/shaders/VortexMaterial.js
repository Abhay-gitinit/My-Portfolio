import * as THREE from "three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

export const VortexMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color("#6b7cff") },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv - 0.5;
      float r = length(uv);
      float a = atan(uv.y, uv.x);

      a += time * 2.0 - r * 4.0;
      float swirl = sin(a * 6.0);
      float glow = smoothstep(0.55, 0.05, r);

      vec3 finalColor = color * glow * (0.6 + 0.4 * swirl);
      finalColor = pow(finalColor, vec3(1.0 / 2.2));

      gl_FragColor = vec4(finalColor, glow);
    }
  `
)

extend({ VortexMaterial })