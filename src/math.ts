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
}

export const degToRad = (deg: number): number => {
	return deg * Math.PI / 180
}

export const radToDeg = (rad: number): number => {
	return rad * 180 / Math.PI
}
