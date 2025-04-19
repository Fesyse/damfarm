"use client"

export function House() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.1, 6.4]} />
        <meshStandardMaterial color='#555' />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 6]} />
        <meshStandardMaterial color='#f0f0f0' roughness={0.8} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4.2, 2.2, 4]} />
        <meshStandardMaterial color='#8B4513' roughness={0.7} />
      </mesh>

      {/* Chimney */}
      <mesh position={[2, 4.5, 0]} castShadow>
        <boxGeometry args={[0.8, 2, 0.8]} />
        <meshStandardMaterial color='#B22222' roughness={0.9} />
      </mesh>

      {/* Chimney cap */}
      <mesh position={[2, 5.6, 0]} castShadow>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color='#8B0000' />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door frame */}
      <mesh position={[0, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2.2, 3.1, 0.1]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.7, 1.5, 3.2]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Windows with frames */}
      {/* Left windows */}
      <mesh position={[3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>
      <mesh position={[3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Right windows */}
      <mesh position={[-3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[-3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>
      <mesh position={[-3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[-3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Back window */}
      <mesh position={[0, 2, -3]} castShadow>
        <boxGeometry args={[1.5, 1.5, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2, -3]} castShadow>
        <boxGeometry args={[1.6, 1.6, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Flower pots */}
      <group position={[-2, 0.3, 3.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
          <meshStandardMaterial color='#A0522D' />
        </mesh>
        {/* Flowers */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color='#FF6347' />
        </mesh>
      </group>
    </group>
  )
}
