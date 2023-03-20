export class Player {
	pos: {x: number, y: number}
	dirRad: number
	r: number
	v: number

	constructor(x: number, y: number, dirRad: number, r: number) {
		this.pos = {x, y}
		this.dirRad = dirRad
		this.r = r
		this.v = 75
	}
}

export class Solver {
	w: number
	h: number
	cells: Array<number>
	player: Player
	keys: Record<string, boolean>

	constructor(w: number, h: number, cells: Array<number>) {
		this.w = w
		this.h = h
		this.cells = cells
		this.player = new Player(w/2, h/2, 0, 15)
		this.keys = {
			"KeyQ": false,
			"KeyW": false,
			"KeyE": false,
			"KeyA": false,
			"KeyS": false,
			"KeyD": false,
		}
	}

	bindControls() {
		document.addEventListener("keydown", (e) => {
			this.keys[e.code] = true
		})

		document.addEventListener("keyup", (e) => {
			this.keys[e.code] = false
		})
	}

	executeControls(dt: number) {
		Object.entries(this.keys).forEach(([keyname, isDown]) => {
			if (!isDown) return

			switch (keyname) {
				case "KeyQ":
					this.player.pos.x += Math.cos(this.player.dirRad - Math.PI/2) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.dirRad - Math.PI/2) * this.player.v * dt
					break
				case "KeyW":
					this.player.pos.x += Math.cos(this.player.dirRad) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.dirRad) * this.player.v * dt
					break
				case "KeyE":
					this.player.pos.x += Math.cos(this.player.dirRad + Math.PI/2) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.dirRad + Math.PI/2) * this.player.v * dt
					break
				case "KeyA":
					this.player.dirRad -= 3.0 * dt
					break
				case "KeyS":
					this.player.pos.x -= Math.cos(this.player.dirRad) * this.player.v * dt
					this.player.pos.y -= Math.sin(this.player.dirRad) * this.player.v * dt
					break
				case "KeyD":
					this.player.dirRad += 3.0 * dt
					break
				default:
					break
			}
		})
	}
}
