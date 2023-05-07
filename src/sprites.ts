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

export const defaultSprites = (h: number) => {
	return [
	new Sprite(555, 470, 100, 500, 90, "greetings", assetType.TEXT, () => {}, true),
	new Sprite(555, 470, 0, 900, 40, "welcome", assetType.TEXT, () => {}, true),
	new Sprite(555, 470, -100, 900, 40, "look", assetType.TEXT, () => {}, true),
	/* new Sprite(555, 470, -400, 150, 150, "DIRT_1A", assetType.IMAGE, () => {}, true), */
	new Sprite(725, 469, 100, 500, 90, "spenny_title", assetType.TEXT, () => {}, true),
	new Sprite(725, 664, 100, 500, 90, "voichess_title", assetType.TEXT, () => {}, true),
	new Sprite(725, 278, 100, 500, 90, "staiir_title", assetType.TEXT, () => {}, true),
	new Sprite(663, 215, 100, 700, 90, "particlelife_title", assetType.TEXT, () => {}, true),
	new Sprite(663, 725, 100, 500, 90, "helcim_title", assetType.TEXT, () => {}, true),
	new Sprite(468, 725, 100, 700, 90, "gosocket_title", assetType.TEXT, () => {}, true),
	new Sprite(278, 725, 100, 700, 90, "teetris_title", assetType.TEXT, () => {}, true),
	new Sprite(468, 215, 100, 700, 90, "noti_title", assetType.TEXT, () => {}, true),
	new Sprite(278, 215, 100, 700, 90, "truthjournal_title", assetType.TEXT, () => {}, true),
	].map((s) => {
		s.pos.x = (s.pos.x/949)*h
		s.pos.y = (s.pos.y/949)*h
		return s
	})
}

