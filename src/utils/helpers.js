import * as THREE from "three";

export const getHoverLabel = (name) => {
  if (!name) return "";
  if (name.includes("Hospital")) return "HOSPITAL PROJECT";
  if (name.includes("Wallet")) return "WALLET PROJECT";
  if (name.includes("About")) return "ABOUT ME";
  if (name.includes("Mail")) return "SEND EMAIL?? SURE !!";
  if (name.includes("Gaming")) return "LET'S PLAY";
  return "";
};

export const getTargetYRotation = (panel) => {
  if (panel.includes("Hospital")) return Math.PI;
  if (panel.includes("AboutMe")) return Math.PI / 2;
  if (panel.includes("Mail")) return -Math.PI / 2;
  if (panel.includes("Wallet")) return 0;
  if (panel.includes("Game")) return -Math.PI / 2;
  return 0;
};

export function createFresnelGlassMaterial({
  tint = "#0b1f1a",
  ior = 1.45,
  thickness = 0.35,
  roughness = 0.05,
  envIntensity = 1.2,
} = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    transmission: 1,
    thickness,
    roughness,
    metalness: 0,
    ior,
    transparent: true,
    opacity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: envIntensity,
  });
}

export function computeFresnelIntensity(mesh, camera, power = 2) {
  const worldNormal = new THREE.Vector3(0, 0, 1)
    .applyQuaternion(mesh.quaternion)
    .normalize();

  const viewDir = camera.position
    .clone()
    .sub(mesh.getWorldPosition(new THREE.Vector3()))
    .normalize();

  const dot = worldNormal.dot(viewDir);
  return Math.pow(1 - Math.abs(dot), power);
}