"use client"

type GreenhouseProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function Greenhouse({ position, rotation }: GreenhouseProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.2, 10.4]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>

      {/* Glass walls */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 10]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.6} />
      </mesh>

      {/* Glass roof */}
      <mesh
        position={[0, 4, 0]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
        castShadow
      >
        <cylinderGeometry args={[4, 4, 10, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color='#FFFFFF'
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Frame edges */}
      {[-3.95, 3.95].map((x, i) => (
        <mesh
          key={`greenhouse-roof-edge-${i}`}
          position={[x, 4.1, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.2, 10]} />
          <meshStandardMaterial
            color='#555555'
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Frame supports */}
      {/* Vertical supports */}
      {[-3.91, -2, 0, 2, 3.91].map((x, i, arr) => (
        <group key={`vs-${i}`}>
          <mesh position={[x, 2, -5]} castShadow>
            <boxGeometry
              args={[
                0.2 + (i === 0 || i === arr.length - 1 ? 0.01 : 0),
                4,
                0.2,
              ]}
            />
            <meshStandardMaterial
              color='#555555'
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[x, i !== 2 ? 2 : 3.5, 5]} castShadow>
            <boxGeometry args={[0.2, i !== 2 ? 4 : 1, 0.2]} />
            <meshStandardMaterial
              color='#555555'
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Horizontal supports */}
      {[-4.9, -2.5, 0, 2.5, 4.9].map((z, i, arr) => (
        <mesh
          key={`hs-${i}`}
          position={[
            0,
            4.1,
            z + (i === 0 ? -0.1 : i === arr.length - 1 ? 0.1 : 0),
          ]}
          castShadow
        >
          <boxGeometry args={[8, 0.2, 0.2]} />
          <meshStandardMaterial
            color='#555555'
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Improved Door with handle */}
      <mesh position={[0, 1.5, 5.01]} castShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.5, 1.5, 5.07]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Plants */}
      <group position={[0, 0.5, 0]}>
        {[-2.5, -1, 0.5, 2].map((x, i) => {
          return (
            <group key={`plant-${i}`} position={[x, 0, -2]}>
              <mesh position={[0, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
                <meshStandardMaterial color='#8B4513' />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow>
                <sphereGeometry args={[0.4 + Math.random() * 0.2, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#2e8b57" : "#3cb371"}
                />
              </mesh>
            </group>
          )
        })}

        {[-2, 0, 2].map((x, i) => {
          return (
            <group key={`plant2-${i}`} position={[x, 0, -3.5]}>
              <mesh position={[0, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
                <meshStandardMaterial color='#8B4513' />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow>
                <sphereGeometry args={[0.4 + Math.random() * 0.2, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#228b22" : "#32cd32"}
                />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Gardening tools */}
      <mesh position={[3, 0.5, -4]} rotation-y={Math.PI / 4} castShadow>
        <boxGeometry args={[0.1, 1.5, 0.1]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>
      <mesh position={[3, 1.3, -4]} rotation-y={Math.PI / 4} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color='#A52A2A' />
      </mesh>
    </group>
  )
}
