import {Vec3} from "./math"

export const colorCodes: Record<number, Vec3>  = {
	1: new Vec3(0, 0, 0), // black
	2: new Vec3(1, 0, 0), // red
	3: new Vec3(0, 1, 0), // green
	4: new Vec3(0, 0, 1), // blue
	5: new Vec3(1, 1, 0), // yellow
	6: new Vec3(1, 0, 1), // purple
	7: new Vec3(0, 1, 1), // cyan
	8: new Vec3(1, 1, 1), // white
}

