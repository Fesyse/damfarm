"use client"

export function Terrain() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[80, 80, 64, 64]} />
      <meshStandardMaterial
        color='#43a047'
        wireframe={false}
        displacementMap={null}
        displacementScale={0}
      />
    </mesh>
  )
}
