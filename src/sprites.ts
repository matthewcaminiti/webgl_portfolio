import {Vec2} from "./math"

export const assetType = {
	IMAGE: 1,
	TEXT: 2,
}

export class Sprite {
	pos: Vec2
	z: number
	zAnchor: number
	zDir: number
	mobile: boolean
	w: number
	h: number
	asset: string
	type: number
	onClick: () => void

	constructor(
		x: number,
		y: number,
		z: number,
		w: number,
		h: number,
		asset: string,
		type: number,
		onClick: () => void,
		mobile: boolean
	) {
		this.pos = new Vec2(x, y)
		this.z = z
		this.zAnchor = z
		this.zDir = 1
		this.mobile = mobile
		this.w = w
		this.h = h
		this.asset = asset
		this.type = type
		this.onClick = onClick
	}

	bob(dt: number) {
		if (!this.mobile) return

		this.z += 15 * dt * this.zDir
		this.zDir *= Math.abs(this.z - this.zAnchor) > 5 ? -1 : 1
	}
}

export const makeTextCanvas = (text: string, w: number, h: number) => {
	const textCtx = document.createElement("canvas").getContext("2d")

	if (!textCtx) {
		console.error(`Failed to create text canvas for: "${text}"`)
		return
	}

	textCtx.canvas.width = w
	textCtx.canvas.height = h
	textCtx.font = `${h}px monospace`
	textCtx.textAlign = "center"
	textCtx.textBaseline = "middle"
	textCtx.fillStyle = "white"
	textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height)
	textCtx.fillText(text, w/2, h/2)
	return textCtx.canvas
}

