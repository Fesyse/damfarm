"use client"
import * as THREE from "three"

export function Barn() {
  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.2, 12]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>

      {/* Main barn structure */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[8, 6, 10]} />
        <meshStandardMaterial color='#CD5C5C' />
      </mesh>

      {/* Roof */}
      <group position={[0, 6.7, 0]}>
        {/* Left roof side */}
        <mesh position={[-2, 1.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[5.9, 0.3, 10.2]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>

        {/* Right roof side */}
        <mesh position={[2, 1.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[5.9, 0.3, 10.2]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>

        {/* Front triangular roof face */}
        <mesh position={[0, 0.7, 5.1]} castShadow>
          <shapeGeometry
            args={[
              (() => {
                const shape = new THREE.Shape()
                shape.moveTo(-4.45, -1.45)
                shape.lineTo(4.05, -1.45)
                shape.lineTo(0, 3)
                shape.lineTo(-4.05, -1.45)
                return shape
              })(),
            ]}
          />
          <meshStandardMaterial color='#8B4513' side={THREE.DoubleSide} />
        </mesh>

        {/* Back triangular roof face */}
        <mesh position={[0, 0.7, -5.1]} castShadow>
          <shapeGeometry
            args={[
              (() => {
                const shape = new THREE.Shape()
                shape.moveTo(-4.45, -1.45)
                shape.lineTo(4.05, -1.45)
                shape.lineTo(0, 3)
                shape.lineTo(-4.05, -1.45)
                return shape
              })(),
            ]}
          />
          <meshStandardMaterial color='#8B4513' side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Front and back walls (white) */}
      <mesh position={[0, 3, 5.01]} castShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color='#FFFFFF' />
      </mesh>
      <mesh position={[0, 3, -5.01]} castShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color='#FFFFFF' />
      </mesh>

      {/* Front door */}
      <mesh position={[0, 2, 5.1]} castShadow>
        <boxGeometry args={[3, 4, 0.1]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.8, 2, 5.16]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Windows */}
      {[-2.5, 2.5].map((x, i) => (
        <mesh key={`window-front-${i}`} position={[x, 4, 5.1]} castShadow>
          <boxGeometry args={[1.5, 1.5, 0.1]} />
          <meshStandardMaterial color='#87CEEB' transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Side windows */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`side-windows-${i}`}>
          <mesh position={[4.01, 4, z]} castShadow>
            <boxGeometry args={[0.1, 1.5, 1.5]} />
            <meshStandardMaterial color='#87CEEB' transparent opacity={0.7} />
          </mesh>
          <mesh position={[-4.01, 4, z]} castShadow>
            <boxGeometry args={[0.1, 1.5, 1.5]} />
            <meshStandardMaterial color='#87CEEB' transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Barn loft window (circular) */}
      <mesh position={[0, 5, 5.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 0.1, 16]} />
        <meshStandardMaterial color='#87CEEB' transparent opacity={0.7} />
      </mesh>

      {/* Decorative elements - hay bales */}
      {[-2.5, 2.5].map((x, i) => (
        <group key={`hay-${i}`} position={[x, 0.8, -3]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.4, 1.5]} />
            <meshStandardMaterial color='#DAA520' />
          </mesh>
        </group>
      ))}

      {/* Animal feeding trough */}
      <mesh position={[-2, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 0.5, 4]} />
        <meshStandardMaterial color='#A0522D' />
      </mesh>
      <mesh position={[-2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 3.8]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>
    </group>
  )
}
