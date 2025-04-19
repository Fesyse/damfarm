"use client"

export function StockExchange() {
  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.2, 8.4]} />
        <meshStandardMaterial color='#505050' />
      </mesh>

      {/* Building base with enhanced materials */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 8]} />
        <meshStandardMaterial color='#f0f0f0' metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Improved roof with detail */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[8.1, 0.5, 8.1]} />
        <meshStandardMaterial color='#616161' />
      </mesh>

      {/* Roof edge detail */}
      <mesh position={[0, 4.26, 0]} castShadow>
        <boxGeometry args={[8.4, 0.1, 8.4]} />
        <meshStandardMaterial color='#424242' />
      </mesh>

      {/* Windows with better materials */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={`window-front-${i}`} position={[x, 2, 4.1]} castShadow>
          <boxGeometry args={[2, 2, 0.15]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={`window-back-${i}`} position={[x, 2, -4.1]} castShadow>
          <boxGeometry args={[2, 2, 0.2]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((z, i) => (
        <mesh key={`window-right-${i}`} position={[4.1, 2, z]} castShadow>
          <boxGeometry args={[0.2, 2, 2]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((z, i) =>
        i === 1 ? null : (
          <mesh key={`window-left-${i}`} position={[-4.1, 2, z]} castShadow>
            <boxGeometry args={[0.2, 2, 2]} />
            <meshStandardMaterial
              color='#ADD8E6'
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        )
      )}

      {/* Right window frames */}
      {[-3, 0, 3].map((x, i) => (
        <group key={`frame-right-${i}`}>
          <mesh position={[x, 2, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 3.05, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 1, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x - 1, 2, 4.075]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x + 1, 2, 4.075]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}
      {/* Left window frames */}
      {[-3, 0, 3].map((x, i) => (
        <group key={`frame-left-${i}`}>
          <mesh position={[x, 2, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 3.05, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 1, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x - 1, 2, -4.1]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x + 1, 2, -4.1]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}
      {/* Front window frames */}
      {[-3, 0, 3].map((z, i) =>
        i == 1 ? null : (
          <group key={`frame-front-${i}`}>
            <mesh
              position={[-4.1, 2, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 3.05, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 1, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 2, z - 1]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 2.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 2, z + 1]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 2.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
          </group>
        )
      )}
      {/* Back window frames */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`frame-back-${i}`}>
          <mesh
            position={[4.1, 2, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 3.05, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 1, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 2, z - 1]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 2, z + 1]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}

      {/* Improved door with frame */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door frame */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2.2, 3.1, 0.1]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Door handle */}
      <mesh
        position={[-4.1, 1.5, 0.7]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
