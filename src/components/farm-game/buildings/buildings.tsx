"use client";

import { useEffect, useCallback, useMemo, memo } from "react";
import { Billboard, Text } from "@react-three/drei";
import { Position, InteractionPoint } from "../types";
import { INTERACTION_POINTS } from "../constants";
import { Greenhouse } from "./greenhouse";
import { Kiosk } from "./kiosk";
import { House } from "./house";
import { StockExchange } from "./stock-exchange";
import { Mailbox } from "./mailbox";
import { Barn } from "./barn";
import { FishingPond } from "../world/fishing-pond";
import { Tree } from "./tree";
import { Bush } from "./bush";

interface BuildingsProps {
  setNearInteraction: (point: InteractionPoint | null) => void;
  playerPosition: Position;
}

// Memoized individual building components for better performance
const MemoizedBillboard = memo(
  ({
    position,
    text,
  }: {
    position: [number, number, number];
    text: string;
  }) => (
    <Billboard position={position}>
      <Text fontSize={1} color="black">
        {text}
      </Text>
    </Billboard>
  )
);
MemoizedBillboard.displayName = "MemoizedBillboard";

const MemoizedGreenhouse = memo(() => <Greenhouse />);
MemoizedGreenhouse.displayName = "MemoizedGreenhouse";

const MemoizedKiosk = memo(() => <Kiosk />);
MemoizedKiosk.displayName = "MemoizedKiosk";

const MemoizedHouse = memo(() => <House />);
MemoizedHouse.displayName = "MemoizedHouse";

const MemoizedStockExchange = memo(() => <StockExchange />);
MemoizedStockExchange.displayName = "MemoizedStockExchange";

const MemoizedBarn = memo(() => <Barn />);
MemoizedBarn.displayName = "MemoizedBarn";

const MemoizedFishingPond = memo(() => <FishingPond />);
MemoizedFishingPond.displayName = "MemoizedFishingPond";

export function Buildings({
  setNearInteraction,
  playerPosition,
}: BuildingsProps) {
  // Use useCallback with memoized distance calculation for finding the closest interaction point
  const findClosestInteraction = useCallback(
    (playerPos: Position): InteractionPoint | null => {
      let closestPoint: InteractionPoint | null = null;
      let minDistanceSquared = 25; // 5^2, using squared distance for performance

      // Use for loop instead of forEach for better performance
      for (let i = 0; i < INTERACTION_POINTS.length; i++) {
        const point = INTERACTION_POINTS[i];
        const dx = point.position[0] - playerPos[0];
        const dz = point.position[2] - playerPos[2];
        // Use squared distance to avoid expensive square root operations
        const distanceSquared = dx * dx + dz * dz;

        if (distanceSquared < minDistanceSquared) {
          minDistanceSquared = distanceSquared;
          closestPoint = point;
        }
      }

      return closestPoint;
    },
    []
  );

  // Throttle the interaction updates for better performance
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdateTime = 0;

    const updateInteraction = (time: number) => {
      // Only update every 100ms for performance
      if (time - lastUpdateTime > 100) {
        const closestPoint = findClosestInteraction(playerPosition);
        setNearInteraction(closestPoint);
        lastUpdateTime = time;
      }

      animationFrameId = requestAnimationFrame(updateInteraction);
    };

    animationFrameId = requestAnimationFrame(updateInteraction);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [playerPosition, setNearInteraction, findClosestInteraction]);

  // Memoize locations to prevent unnecessary recalculations
  const locations = useMemo(
    () => ({
      center: [0, 0, 0] as Position,
      house: {
        position: [0, 0, -10] as Position,
        door: [0, 0, -7] as Position,
      },
      greenhouse: {
        position: [-15, 0, 0] as Position,
        door: [-13.9, 0, 3.5] as Position,
      },
      kiosk: {
        position: [5, 0, 15] as Position,
        door: [5, 0, 17] as Position,
      },
      stockExchange: {
        position: [15, 0, -8] as Position,
        door: [13.7, 0, -6] as Position,
      },
      fishingPond: {
        position: [-20, 0, 20] as Position,
        dock: [-15.5, 0, 17.6] as Position,
      },
      mailbox: {
        position: [2.1, 0, -6] as Position,
      },
      barn: {
        position: [15, 0, 8] as Position,
        door: [15, 0, 12] as Position,
      },
    }),
    []
  );
  const treePositions = useMemo(
    () => [
      { x: -30, z: -15, scale: 1.6 },
      { x: -32, z: 12, scale: 1.5 },
      { x: -35, z: 25, scale: 1.8 },
      { x: -38, z: 5, scale: 1.7 },
      { x: -36, z: -10, scale: 1.5 },
      { x: 30, z: 15, scale: 1.6 },
      { x: 33, z: -12, scale: 1.5 },
      { x: 28, z: -25, scale: 1.7 },
      { x: 26, z: -18, scale: 1.6 },
      { x: -22, z: -28, scale: 1.6 },
      { x: -28, z: -20, scale: 1.5 },
      { x: 5, z: 35, scale: 1.7 },
      { x: 15, z: 32, scale: 1.4 },
      { x: 36, z: 10, scale: 1.8 },
      { x: 34, z: -22, scale: 1.6 },
      { x: -35, z: 18, scale: 1.7 },
      { x: -30, z: -25, scale: 1.6 },
      { x: -25, z: -30, scale: 1.5 },
      { x: 22, z: -32, scale: 1.6 },
      { x: 10, z: -35, scale: 1.4 },
      { x: -36, z: 15, scale: 1.9 },
      { x: -34, z: -25, scale: 1.7 },
      { x: -25, z: -35, scale: 1.6 },
      { x: 36, z: 20, scale: 1.8 },
      { x: 38, z: -15, scale: 1.6 },
      { x: 25, z: 32, scale: 1.7 },
      { x: 15, z: 35, scale: 1.5 },
      { x: 10, z: 38, scale: 1.4 },
      { x: -15, z: 36, scale: 1.6 },
      { x: -22, z: 38, scale: 1.7 },
      { x: -10, z: 33, scale: 1.5 },
      { x: 5, z: -38, scale: 1.6 },
      { x: 15, z: -35, scale: 1.8 },
      { x: 25, z: -36, scale: 1.7 },
      { x: -15, z: -36, scale: 1.6 },
    ],
    []
  );
  const bushPositions = [
    { x: -25, z: 5, scale: 0.75 },
    { x: 5, z: -25, scale: 0.8 },
    { x: -15, z: -20, scale: 0.85 },
    { x: 20, z: -25, scale: 0.8 },
    { x: -25, z: 10, scale: 0.75 },
    { x: 10, z: -30, scale: 0.7 },
    { x: -20, z: -30, scale: 0.8 },
    { x: 15, z: 20, scale: 0.9 },
    { x: -25, z: -5, scale: 0.75 },
    { x: 12, z: -25, scale: 0.7 },

    { x: 25, z: 5, scale: 0.8 },
    { x: -30, z: 15, scale: 0.75 },
    { x: 30, z: -5, scale: 0.85 },
    { x: 15, z: -20, scale: 0.7 },
    { x: -10, z: 15, scale: 0.8 },
    { x: -35, z: -5, scale: 0.9 },
    { x: 30, z: -20, scale: 0.75 },
    { x: -18, z: 27, scale: 0.8 },
    { x: 10, z: -15, scale: 0.75 },
    { x: 12, z: -20, scale: 0.7 },

    { x: -22, z: 0, scale: 0.75 },
    { x: 30, z: 5, scale: 0.8 },
    { x: -30, z: -5, scale: 0.75 },
    { x: 20, z: 15, scale: 0.7 },
    { x: 35, z: -25, scale: 0.8 },
  ];

  // Pre-calculate rotations to avoid doing it in the render
  const rotations = useMemo(
    () => ({
      greenhouse: Math.PI / 6,
      kiosk: Math.atan2(
        -locations.kiosk.position[0],
        -locations.kiosk.position[2]
      ),
      stockExchange: Math.PI / 4,
      barn: Math.atan2(
        -locations.barn.position[0],
        -locations.barn.position[2]
      ),
    }),
    [locations]
  );

  return (
    <group>
      {/* Greenhouse */}
      <group
        position={locations.greenhouse.position}
        rotation-y={rotations.greenhouse}
      >
        <MemoizedGreenhouse />
        <MemoizedBillboard position={[0, 10, 0]} text="Теплица" />
      </group>
      <group>
        {treePositions.map((tree, i) => (
          <Tree key={i} position={[tree.x, 0, tree.z]} scale={tree.scale} />
        ))}
      </group>

      <group>
        {bushPositions.map((tree, i) => (
          <Bush key={i} position={[tree.x, 0, tree.z]} scale={tree.scale} />
        ))}
      </group>
      {/* Kiosk */}
      <group position={locations.kiosk.position} rotation-y={rotations.kiosk}>
        <MemoizedKiosk />
        <MemoizedBillboard position={[0, 6, 0]} text="Киоск" />
      </group>

      {/* House */}
      <group position={locations.house.position}>
        <MemoizedHouse />
        <MemoizedBillboard position={[0, 6.5, 0]} text="Дом" />

        {/* Mailbox */}
        <Mailbox position={[2.1, 0, 4]} />
      </group>

      {/* Stock Exchange */}
      <group
        position={locations.stockExchange.position}
        rotation-y={rotations.stockExchange}
      >
        <MemoizedStockExchange />
        <MemoizedBillboard position={[0, 5.5, 0]} text="Биржа" />
      </group>

      {/* Fishing Pond */}
      <group position={locations.fishingPond.position}>
        <MemoizedFishingPond />
        <MemoizedBillboard position={[0, 4, 0]} text="Пруд" />
      </group>

      {/* Barn */}
      <group position={locations.barn.position} rotation-y={rotations.barn}>
        <MemoizedBarn />
        <MemoizedBillboard position={[0, 11.5, 0]} text="Амбар" />
      </group>
    </group>
  );
}
