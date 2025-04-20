export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
	return start + (end - start) * clamp(t, 0, 1);
}

export function smoothDamp(
	current: number,
	target: number,
	currentVelocityRef: { value: number },
	smoothTime: number,
	deltaTime: number,
	maxSpeed: number = Infinity
): number {
	const dt = Math.max(0.0001, deltaTime);

	smoothTime = Math.max(0.0001, smoothTime);

	const omega = 2 / smoothTime;
	const x = omega * dt;
	const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

	let change = current - target;

	const maxChange = maxSpeed * smoothTime;
	change = clamp(change, -maxChange, maxChange);

	const temp = (currentVelocityRef.value + omega * change) * dt;
	currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;

	let output = target + (change + temp) * exp;

	if (target - current > 0 === output > target) {
		output = target;
		currentVelocityRef.value = 0;
	}

	return output;
}

export function smoothDampVector(
	currentX: number,
	currentZ: number,
	targetX: number,
	targetZ: number,
	velocityRef: { x: number; z: number },
	smoothTime: number,
	deltaTime: number,
	maxSpeed: number = Infinity
): [number, number] {
	const x = smoothDamp(
		currentX,
		targetX,
		{ value: velocityRef.x },
		smoothTime,
		deltaTime,
		maxSpeed
	);
	velocityRef.x = { value: velocityRef.x }.value;

	const z = smoothDamp(
		currentZ,
		targetZ,
		{ value: velocityRef.z },
		smoothTime,
		deltaTime,
		maxSpeed
	);
	velocityRef.z = { value: velocityRef.z }.value;

	return [x, z];
}
