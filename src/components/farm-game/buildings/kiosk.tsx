"use client"

import { Text } from "@react-three/drei"

export function Kiosk() {
  return (
    <group>
      {/* Concrete platform foundation */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.4, 8]} />
        <meshStandardMaterial color='#9e9e9e' />
      </mesh>

      {/* Main structure */}
      <group position={[0, 2, 0]}>
        {/* Floor */}
        <mesh position={[0, -1.6, 0]} receiveShadow>
          <boxGeometry args={[6.9, 0.2, 6]} />
          <meshStandardMaterial color='#8d6e63' />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 0, -3.2]} castShadow>
          <boxGeometry args={[7, 3.6, 0.2]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Left wall */}
        <mesh position={[-3.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 3.6, 6.6]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Right wall */}
        <mesh position={[3.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 3.6, 6.6]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Front counter - only bottom half */}
        <mesh position={[0, -0.9, 3.2]} castShadow>
          <boxGeometry args={[7, 1.8, 0.3]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Counter top */}
        <mesh position={[0, 0.1, 3.2]} castShadow>
          <boxGeometry args={[6.9, 0.2, 0.5]} />
          <meshStandardMaterial color='#5d4037' />
        </mesh>

        {/* Interior back wall panel */}
        <mesh position={[0, 0, -3.1]} castShadow>
          <boxGeometry args={[6.7, 3.4, 0.1]} />
          <meshStandardMaterial color='#bbdefb' />
        </mesh>

        {/* Simple roof */}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[7.4, 0.2, 7.4]} />
          <meshStandardMaterial color='#795548' />
        </mesh>
      </group>

      {/* Simple striped awning - front only, no overlap */}
      <group position={[0, 4, 1.6]}>
        {/* Awning base frame */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[7.8, 0.2, 3.8]} />
          <meshStandardMaterial color='#795548' />
        </mesh>

        {/* Colored awning stripes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <mesh
            key={`awning-${i}`}
            position={[0, 0.11, -1.65 + i * 0.45]}
            castShadow
          >
            <boxGeometry args={[7.6, 0.1, 0.4]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#f44336" : "#ffffff"} />
          </mesh>
        ))}

        {/* Awning front trim */}
        <mesh position={[0, 0, 1.8]} castShadow>
          <boxGeometry args={[7.9, 0.3, 0.3]} />
          <meshStandardMaterial color='#5d4037' />
        </mesh>
      </group>

      {/* Simple shop sign */}
      <mesh position={[0, 4.8, 3.5]} castShadow>
        <boxGeometry args={[4.4, 1.2, 0.2]} />
        <meshStandardMaterial color='#4a148c' />
      </mesh>
      <mesh position={[0, 4.8, 3.6]} castShadow>
        <boxGeometry args={[4, 0.9, 0.1]} />
        <meshStandardMaterial color='#f9a825' />

        <Text position={[0, 0, 0.1]} fontSize={0.7} color='#f9a825'>
          DAMSHOP
        </Text>
      </mesh>

      {/* Cash register */}
      <group position={[2.2, 2.35, 3]} castShadow>
        <mesh>
          <boxGeometry args={[0.9, 0.5, 0.6]} />
          <meshStandardMaterial color='#455a64' />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.7, 0.2, 0.4]} />
          <meshStandardMaterial color='#263238' />
        </mesh>
      </group>

      {/* Interior shelving */}
      {/* Back shelf */}
      <mesh position={[0, 2.6, -2.4]} castShadow>
        <boxGeometry args={[6.5, 0.1, 1.2]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      <mesh position={[0, 1.2, -2.4]} castShadow>
        <boxGeometry args={[6.5, 0.1, 1.2]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      {/* Side shelves */}
      <mesh position={[-2.8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      <mesh position={[2.8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      {/* Simple product displays - bigger */}
      {/* Seed packets on back shelf */}
      {[-2, 0, 2].map((x, i) => (
        <group key={`seed-${i}`} position={[x, 2.8, -2.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.6, 0.08]} />
            <meshStandardMaterial
              color={i === 0 ? "#f44336" : i === 1 ? "#4caf50" : "#2196f3"}
            />
          </mesh>
        </group>
      ))}

      {/* Baskets on lower shelf */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={`basket-${i}`} position={[x, 1.4, -2.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.4, 0.6, 16]} />
            <meshStandardMaterial color='#d7ccc8' />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry
              args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]}
            />
            <meshStandardMaterial
              color={i === 0 ? "#795548" : i === 1 ? "#fdd835" : "#558b2f"}
            />
          </mesh>
        </group>
      ))}

      {/* Garden tools on side shelf */}
      <group position={[-2.8, 2.2, 0]}>
        <mesh rotation={[0.2, Math.PI / 2, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        <mesh
          position={[0, 0, -1.2]}
          rotation={[0.2, 0, Math.PI / 2]}
          castShadow
        >
          <boxGeometry args={[0.6, 0.15, 0.6]} />
          <meshStandardMaterial color='#607d8b' />
        </mesh>
      </group>

      {/* Watering can */}
      <group position={[2.8, 2.2, 1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.8, 16]} />
          <meshStandardMaterial color='#42a5f5' />
        </mesh>
        <mesh
          position={[-0.5, 0.2, 0]}
          rotation={[0, 0, Math.PI / 10]}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color='#42a5f5' />
        </mesh>
      </group>

      {/* Simple decorative plant */}
      <group position={[-2, 2.35, 2.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
          <meshStandardMaterial color='#a1887f' />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color='#388e3c' />
        </mesh>
      </group>

      {/* Interior light - simple ceiling light */}
      <mesh position={[0, 3.6, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
        <meshStandardMaterial
          color='#f5f5f5'
          emissive='#f5f5f5'
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}
