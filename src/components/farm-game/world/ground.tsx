"use client"

export function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color='#795548' />
    </mesh>
  )
}
