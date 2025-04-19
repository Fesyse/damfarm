export function Tree({ position, scale = 1 }) {
  return (
    <group
      position={[position[0], 0, position[2]]}
      scale={[scale, scale, scale]}
    >
      {/* Trunk */}
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Leaves */}
      <mesh castShadow position={[0, 3, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#2e8b57" />
      </mesh>
    </group>
  );
}
