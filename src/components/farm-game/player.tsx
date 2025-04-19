"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { BUILDING_BOUNDARIES, FENCE_BOUNDARIES } from "./constants";
import { Position } from "./types";

interface PlayerProps {
	setPlayerPosition: (pos: Position) => void;
}

export function Player({ setPlayerPosition }: PlayerProps) {
	const [position, setPosition] = useState<Position>([0, 0, 0]);
	const [rotation, setRotation] = useState(0);
	// Store position in a ref for smoother transitions
	const positionRef = useRef<Position>([0, 0, 0]);
	// Lower base speed to make movement less jerky
	const baseSpeed = 0.15;
	const { camera } = useThree();
	const cameraRef = useRef({
		distance: 10,
		height: 5,
		angle: 0,
		targetHeight: 1,
		needsUpdate: false,
	});

	// Add state for mouse control
	const mouseControlRef = useRef({
		isRightMouseDown: false,
		lastMouseX: 0,
		lastMouseY: 0,
		sensitivity: 0.003,
		heightSensitivity: 0.01,
	});

	// Animation frame reference to avoid memory leaks
	const animationFrameId = useRef<number | null>(null);

	// Optimized collision detection function using pre-calculated boundaries
	const checkCollision = useCallback((newX: number, newZ: number): boolean => {
		const playerRadius = 0.5;

		// First check fence boundaries (faster check, as there are fewer fences)
		const fenceCollision = FENCE_BOUNDARIES.some(
			(fence) =>
				newX + playerRadius > fence.minX &&
				newX - playerRadius < fence.maxX &&
				newZ + playerRadius > fence.minZ &&
				newZ - playerRadius < fence.maxZ
		);

		if (fenceCollision) return true;

		// Then check building boundaries if no fence collision
		return BUILDING_BOUNDARIES.some((building) => {
			// First check if player is near door - allow access if close to door
			if (building.doorPosition) {
				const dx = newX - building.doorPosition.x;
				const dz = newZ - building.doorPosition.z;
				const distanceToDoor = Math.sqrt(dx * dx + dz * dz);

				// If player is close to a door, don't apply collision
				if (distanceToDoor < building.doorPosition.radius) {
					return false;
				}
			}

			// Apply normal collision check if not near door
			return (
				newX + playerRadius > building.minX &&
				newX - playerRadius < building.maxX &&
				newZ + playerRadius > building.minZ &&
				newZ - playerRadius < building.maxZ
			);
		});
	}, []);

	// Separate camera update function using requestAnimationFrame for smoother updates
	const updateCamera = useCallback(() => {
		const { angle, distance, height, targetHeight } = cameraRef.current;
		const currentPosition = positionRef.current;

		// Calculate camera position only when needed
		const cameraX = currentPosition[0] + Math.sin(angle) * distance;
		const cameraZ = currentPosition[2] + Math.cos(angle) * distance;

		camera.position.set(cameraX, currentPosition[1] + height, cameraZ);
		camera.lookAt(
			currentPosition[0],
			currentPosition[1] + targetHeight,
			currentPosition[2]
		);

		// Continue animation loop
		animationFrameId.current = requestAnimationFrame(updateCamera);
	}, [camera]);

	// Start camera animation loop
	useEffect(() => {
		animationFrameId.current = requestAnimationFrame(updateCamera);

		// Clean up animation frame on unmount
		return () => {
			if (animationFrameId.current !== null) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [updateCamera]);

	// Update player position separately from camera position
	useEffect(() => {
		setPlayerPosition(position);
		positionRef.current = position;
	}, [position, setPlayerPosition]);

	// Handle keyboard input with proper types
	useEffect(() => {
		const keys: Record<string, boolean> = {
			KeyW: false,
			KeyS: false,
			KeyA: false,
			KeyD: false,
			Space: false,
			ArrowLeft: false,
			ArrowRight: false,
			ArrowUp: false,
			ArrowDown: false,
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code in keys) {
				keys[e.code] = true;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code in keys) {
				keys[e.code] = false;
			}
		};

		// Add mouse event handlers for camera control
		const handleMouseDown = (e: MouseEvent) => {
			if (e.button === 2) {
				// Right mouse button
				mouseControlRef.current.isRightMouseDown = true;
				mouseControlRef.current.lastMouseX = e.clientX;
				mouseControlRef.current.lastMouseY = e.clientY;
			}
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (e.button === 2) {
				// Right mouse button
				mouseControlRef.current.isRightMouseDown = false;
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (mouseControlRef.current.isRightMouseDown) {
				const deltaX = e.clientX - mouseControlRef.current.lastMouseX;
				const deltaY = e.clientY - mouseControlRef.current.lastMouseY;

				// Horizontal movement controls camera angle (rotation)
				cameraRef.current.angle -= deltaX * mouseControlRef.current.sensitivity;

				// Vertical movement controls camera height
				cameraRef.current.height = Math.max(
					2,
					Math.min(
						15,
						cameraRef.current.height +
							deltaY * mouseControlRef.current.heightSensitivity
					)
				);

				mouseControlRef.current.lastMouseX = e.clientX;
				mouseControlRef.current.lastMouseY = e.clientY;
			}
		};

		// Prevent context menu on right-click
		const handleContextMenu = (e: MouseEvent) => {
			e.preventDefault();
		};

		// Throttled wheel handler to improve performance during rapid scrolling
		const handleWheel = (e: WheelEvent) => {
			cameraRef.current.distance = Math.max(
				5,
				Math.min(20, cameraRef.current.distance + e.deltaY * 0.01)
			);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("wheel", handleWheel, { passive: true }); // Add passive flag for better scroll performance

		// Add mouse event listeners
		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("contextmenu", handleContextMenu);

		// Use requestAnimationFrame for movement updates with delta time
		let lastTime = 0;
		const movePlayer = (currentTime: number) => {
			// Calculate delta time for smooth movement regardless of frame rate
			const deltaTime = lastTime === 0 ? 16.67 : currentTime - lastTime;
			lastTime = currentTime;

			// Limit maximum delta to prevent large jumps after tab switching
			const clampedDelta = Math.min(deltaTime, 100);

			// Calculate speed based on delta time (60fps equivalent)
			const speed = baseSpeed * (clampedDelta / 16.67);

			let moveX = 0;
			let moveZ = 0;

			// Calculate forward and right vectors based on camera angle
			const forward = {
				x: Math.sin(cameraRef.current.angle),
				z: Math.cos(cameraRef.current.angle),
			};

			const right = {
				x: Math.sin(cameraRef.current.angle + Math.PI / 2),
				z: Math.cos(cameraRef.current.angle + Math.PI / 2),
			};

			// Apply movement vectors independently to allow diagonal movement
			if (keys.KeyW) {
				moveX -= forward.x * speed;
				moveZ -= forward.z * speed;
			}
			if (keys.KeyS) {
				moveX += forward.x * speed;
				moveZ += forward.z * speed;
			}
			if (keys.KeyA) {
				moveX -= right.x * speed;
				moveZ -= right.z * speed;
			}
			if (keys.KeyD) {
				moveX += right.x * speed;
				moveZ += right.z * speed;
			}

			// Normalize diagonal movement to maintain consistent speed
			if (moveX !== 0 && moveZ !== 0) {
				const magnitude = Math.sqrt(moveX * moveX + moveZ * moveZ);
				moveX = (moveX / magnitude) * speed;
				moveZ = (moveZ / magnitude) * speed;
			}

			// Smooth camera angle changes based on delta time
			if (keys.ArrowLeft)
				cameraRef.current.angle -= 0.05 * (clampedDelta / 16.67);
			if (keys.ArrowRight)
				cameraRef.current.angle += 0.05 * (clampedDelta / 16.67);

			if (keys.ArrowUp)
				cameraRef.current.height = Math.min(
					15,
					cameraRef.current.height + 0.2 * (clampedDelta / 16.67)
				);
			if (keys.ArrowDown)
				cameraRef.current.height = Math.max(
					2,
					cameraRef.current.height - 0.2 * (clampedDelta / 16.67)
				);

			if (moveX !== 0 || moveZ !== 0) {
				const currentPos = positionRef.current;
				const newX = currentPos[0] + moveX;
				const newZ = currentPos[2] + moveZ;

				if (!checkCollision(newX, newZ)) {
					// Set player rotation to face direction of movement
					const angle = Math.atan2(moveX, moveZ);
					setRotation(angle);

					// Update position with smooth transition
					// Use the current position from ref for calculation to avoid animation lag
					setPosition([newX, currentPos[1], newZ]);

					// Immediately update the ref to ensure camera follows smoothly
					positionRef.current = [newX, currentPos[1], newZ];
				}
			}

			movementFrameId = requestAnimationFrame(movePlayer);
		};

		let movementFrameId = requestAnimationFrame(movePlayer);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("contextmenu", handleContextMenu);
			cancelAnimationFrame(movementFrameId);
		};
	}, [checkCollision]);

	return (
		<group
			position={[position[0], position[1], position[2]]}
			rotation-y={rotation}
		>
			{/* Mushroom stem */}
			<mesh castShadow position={[0, 0.4, 0]}>
				<cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
				<meshStandardMaterial color="#f5f5dc" />
			</mesh>

			{/* Mushroom cap - rounded */}
			<mesh
				castShadow
				position={[0, 0.9, 0]}
				rotation={[Math.PI / 2, Math.PI, 0]}
			>
				<sphereGeometry args={[0.6, 16, 16, 0, Math.PI]} />
				<meshStandardMaterial color="#ff4d4d" flatShading={false} />
			</mesh>

			{/* Mushroom spots */}
			<mesh position={[0.25, 1.33, 0.3]}>
				<sphereGeometry args={[0.07, 8, 8]} />
				<meshStandardMaterial color="#ffffff" />
			</mesh>
			<mesh position={[-0.2, 1.38, 0.25]}>
				<sphereGeometry args={[0.08, 8, 8]} />
				<meshStandardMaterial color="#ffffff" />
			</mesh>
			<mesh position={[0.15, 1.4, -0.25]}>
				<sphereGeometry args={[0.07, 8, 8]} />
				<meshStandardMaterial color="#ffffff" />
			</mesh>
			<mesh position={[-0.3, 1.35, -0.3]}>
				<sphereGeometry args={[0.06, 8, 8]} />
				<meshStandardMaterial color="#ffffff" />
			</mesh>

			{/* Eyes */}
			<mesh position={[0.15, 0.5, 0.25]}>
				<sphereGeometry args={[0.05, 8, 8]} />
				<meshStandardMaterial color="#000000" />
			</mesh>
			<mesh position={[-0.15, 0.5, 0.25]}>
				<sphereGeometry args={[0.05, 8, 8]} />
				<meshStandardMaterial color="#000000" />
			</mesh>
		</group>
	);
}
