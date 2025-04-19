export function Bush({ position, scale = 1 }) {
  return (
    <group
      position={[position[0], 0, position[2]]}
      scale={[scale, scale, scale]}
    >
      <mesh castShadow position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}
