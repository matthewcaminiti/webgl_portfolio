export class Vec2 {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	get mag(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2)
	}

	get normalized(): Vec2 {
		const mag = this.mag
		return mag !== 0 ? new Vec2(this.x / mag, this.y / mag) : new Vec2(0, 0)
	}

	sub(v: Vec2): Vec2 {
		return new Vec2(this.x - v.x, this.y - v.y)
	}

	add(v: Vec2): Vec2 {
		return new Vec2(this.x + v.x, this.y + v.y)
	}

	scale(n: number): Vec2 {
		return new Vec2(this.x * n, this.y * n)
	}

	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y
	}
}

export class Vec3 {
	x: number
	y: number
	z: number

	constructor(x: number, y: number, z: number) {
		this.x = x
		this.y = y
		this.z = z
	}

	scale(x: number): Vec3 {
		return new Vec3(this.x * x, this.y * x, this.z * x)
	}
}

export const degToRad = (deg: number): number => {
	return deg * Math.PI / 180
}

export const radToDeg = (rad: number): number => {
	return rad * 180 / Math.PI
}

// return the diff between two angles (input radians, output radians), clamped [-180, -180]
export const absAngleDiff = (a1: number, a2: number): number => {
	const x = a1 - a2
	return x + (x > Math.PI ? -2*Math.PI : x < -1*Math.PI ? 2*Math.PI : 0)
}

export interface Ray {
	pos: Vec2,
	cellIdx: number,
	cellVal: number,
	distToAxis: number
}
