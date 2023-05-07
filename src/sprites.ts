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
		if (this.zDir > 0 && this.z - this.zAnchor > 5) {
			this.zDir = -1
		} else if (this.zDir < 0 && this.zAnchor - this.z > 5) {
			this.zDir = 1
		}
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

export const defaultSprites = [
	new Sprite(555, 470, 100, 500, 90, "greetings", assetType.TEXT, () => {}, true),
	new Sprite(555, 470, 0, 900, 40, "welcome", assetType.TEXT, () => {}, true),
	new Sprite(555, 470, -100, 900, 40, "look", assetType.TEXT, () => {}, true),
	new Sprite(515, 530, 120, 900, 40, "this", assetType.TEXT, () => {}, true),
	new Sprite(140, 600, 0, 350, 20, "boo", assetType.TEXT, () => {}, true),
	new Sprite(530, 530, 0, 150, 150, "ts_icon", assetType.IMAGE, () => {}, true),
	new Sprite(520, 530, 0, 150, 150, "nginx_icon", assetType.IMAGE, () => {}, true),
	new Sprite(504, 530, 0, 350, 150, "webgl_icon", assetType.IMAGE, () => {}, true),
	new Sprite(463, 530, 90, 600, 20, "this_desc_0", assetType.TEXT, () => {}, false),
	new Sprite(463, 530, 50, 800, 20, "this_desc_1", assetType.TEXT, () => {}, false),
	new Sprite(463, 530, 10, 1000, 20, "this_desc_2", assetType.TEXT, () => {}, false),
	new Sprite(463, 530, -30, 400, 20, "this_desc_3", assetType.TEXT, () => {}, false),

	// spenny
	new Sprite(725, 469, 100, 500, 90, "spenny_title", assetType.TEXT, () => {}, true),
	new Sprite(822, 405, 100, 700, 20, "spenny_0", assetType.TEXT, () => {}, false),
	new Sprite(822, 405, 60, 800, 20, "spenny_1", assetType.TEXT, () => {}, false),
	new Sprite(822, 405, 20, 700, 20, "spenny_2", assetType.TEXT, () => {}, false),
	new Sprite(822, 405, -20, 600, 20, "spenny_3", assetType.TEXT, () => {}, false),
	new Sprite(822, 405, -60, 800, 20, "spenny_4", assetType.TEXT, () => {}, false),
	new Sprite(822, 530, 100, 800, 20, "spenny_5", assetType.TEXT, () => {}, false),
	new Sprite(822, 530, 60, 800, 20, "spenny_6", assetType.TEXT, () => {}, false),
	new Sprite(822, 530, 20, 800, 20, "spenny_7", assetType.TEXT, () => {}, false),
	new Sprite(881, 405, 0, 150, 150, "react_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 415, 0, 150, 150, "nginx_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 425, 0, 150, 150, "expressjs_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 435, 0, 150, 150, "nodejs_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 445, 0, 150, 150, "mongodb_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 530, 0, 300, 300, "spenny_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 460, 0, 300, 550, "spenny_input", assetType.IMAGE, () => {}, false),
	new Sprite(881, 480, 0, 300, 550, "spenny_graph", assetType.IMAGE, () => {}, false),
	new Sprite(881, 500, 0, 300, 550, "spenny_profile", assetType.IMAGE, () => {}, false),

	// staiir
	new Sprite(725, 278, 100, 500, 90, "staiir_title", assetType.TEXT, () => {}, true),
	new Sprite(822, 210, 100, 700, 20, "staiir_0", assetType.TEXT, () => {}, false),
	new Sprite(822, 210, 60, 900, 20, "staiir_1", assetType.TEXT, () => {}, false),
	new Sprite(822, 210, 20, 800, 20, "staiir_2", assetType.TEXT, () => {}, false),
	new Sprite(822, 210, -20, 700, 20, "staiir_3", assetType.TEXT, () => {}, false),
	new Sprite(822, 335, 100, 800, 20, "staiir_4", assetType.TEXT, () => {}, false),
	new Sprite(822, 335, 60, 900, 20, "staiir_5", assetType.TEXT, () => {}, false),
	new Sprite(822, 335, 20, 700, 20, "staiir_6", assetType.TEXT, () => {}, false),
	new Sprite(822, 335, -20, 400, 20, "staiir_7", assetType.TEXT, () => {}, false),
	new Sprite(881, 210, 0, 150, 150, "react_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 230, 0, 350, 150, "sqlite_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 335, 0, 300, 300, "staiir_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 254, 0, 300, 500, "staiir_entropy", assetType.IMAGE, () => {}, false),
	new Sprite(881, 274, 0, 300, 500, "staiir_customize", assetType.IMAGE, () => {}, false),
	new Sprite(881, 294, 0, 300, 500, "staiir_repertoire", assetType.IMAGE, () => {}, false),
	new Sprite(881, 314, 0, 300, 500, "staiir_workout", assetType.IMAGE, () => {}, false),

	// particlelife
	new Sprite(663, 215, 100, 700, 90, "particlelife_title", assetType.TEXT, () => {}, true),
	new Sprite(600, 105, 100, 900, 20, "plife_0", assetType.TEXT, () => {}, false),
	new Sprite(600, 105, 60, 900, 20, "plife_1", assetType.TEXT, () => {}, false),
	new Sprite(600, 105, 20, 900, 20, "plife_2", assetType.TEXT, () => {}, false),
	new Sprite(600, 105, -20, 900, 20, "plife_3", assetType.TEXT, () => {}, false),
	new Sprite(725, 105, 100, 900, 20, "plife_4", assetType.TEXT, () => {}, false),
	new Sprite(725, 105, 60, 900, 20, "plife_5", assetType.TEXT, () => {}, false),
	new Sprite(725, 105, 20, 1000, 20, "plife_6", assetType.TEXT, () => {}, false),
	new Sprite(600, 54, 0, 150, 150, "ts_icon", assetType.IMAGE, () => {}, true),
	new Sprite(610, 54, 0, 150, 150, "nginx_icon", assetType.IMAGE, () => {}, true),
	new Sprite(628, 54, 0, 350, 150, "webgl_icon", assetType.IMAGE, () => {}, true),
	new Sprite(685, 54, 0, 700, 400, "particlelife_0", assetType.IMAGE, () => {}, false),

	// voichess
	new Sprite(725, 664, 100, 500, 90, "voichess_title", assetType.TEXT, () => {}, true),
	new Sprite(818, 600, 100, 700, 20, "voichess_0", assetType.TEXT, () => {}, false),
	new Sprite(818, 600, 60, 900, 20, "voichess_1", assetType.TEXT, () => {}, false),
	new Sprite(818, 600, 20, 500, 20, "voichess_2", assetType.TEXT, () => {}, false),
	new Sprite(818, 725, 100, 900, 20, "voichess_3", assetType.TEXT, () => {}, false),
	new Sprite(818, 725, 60, 900, 20, "voichess_4", assetType.TEXT, () => {}, false),
	new Sprite(818, 725, 20, 900, 20, "voichess_5", assetType.TEXT, () => {}, false),
	new Sprite(818, 725, -20, 900, 20, "voichess_6", assetType.TEXT, () => {}, false),
	new Sprite(881, 600, 0, 150, 150, "react_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 610, 0, 150, 150, "nginx_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 620, 0, 150, 150, "expressjs_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 630, 0, 150, 150, "nodejs_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 640, 0, 150, 150, "socketio_icon", assetType.IMAGE, () => {}, true),
	new Sprite(881, 674, 0, 400, 400, "voichess_home", assetType.IMAGE, () => {}, false),
	new Sprite(881, 704, 0, 500, 400, "voichess_play", assetType.IMAGE, () => {}, false),

	// helcim
	new Sprite(663, 725, 100, 500, 90, "helcim_title", assetType.TEXT, () => {}, true),
	new Sprite(663, 725, 0, 350, 45, "wip", assetType.TEXT, () => {}, true),
	new Sprite(725, 881, 150, 150, 150, "vue_icon", assetType.IMAGE, () => {}, true),
	new Sprite(715, 881, 150, 150, 150, "go_icon", assetType.IMAGE, () => {}, true),
	new Sprite(705, 881, 150, 150, 150, "ts_icon", assetType.IMAGE, () => {}, true),
	new Sprite(725, 881, 0, 150, 150, "php_icon", assetType.IMAGE, () => {}, true),
	new Sprite(715, 881, 0, 150, 150, "expressjs_icon", assetType.IMAGE, () => {}, true),
	new Sprite(705, 881, 0, 150, 150, "nginx_icon", assetType.IMAGE, () => {}, true),
	new Sprite(725, 881, -150, 150, 150, "mysql_icon", assetType.IMAGE, () => {}, true),
	new Sprite(715, 881, -150, 150, 150, "docker_icon", assetType.IMAGE, () => {}, true),

	// teetris
	new Sprite(468, 725, 100, 700, 90, "teetris_title", assetType.TEXT, () => {}, true),
	new Sprite(468, 725, 0, 350, 45, "wip", assetType.TEXT, () => {}, true),
	new Sprite(530, 881, 0, 150, 150, "go_icon", assetType.IMAGE, () => {}, true),
	new Sprite(520, 881, 0, 150, 150, "react_icon", assetType.IMAGE, () => {}, true),
	new Sprite(471, 881, 0, 650, 500, "teetris_websocket", assetType.IMAGE, () => {}, false),

	// noti
	new Sprite(468, 215, 100, 700, 90, "noti_title", assetType.TEXT, () => {}, true),
	new Sprite(468, 215, 0, 350, 45, "wip", assetType.TEXT, () => {}, true),

	// truthjournal
	new Sprite(278, 215, 100, 700, 90, "truthjournal_title", assetType.TEXT, () => {}, true),
	new Sprite(278, 215, 0, 350, 45, "wip", assetType.TEXT, () => {}, true),
]

