export class Player {
	pos: {x: number, y: number}
	dirRad: number
	r: number
	v: number

	constructor(x: number, y: number, dirRad: number, r: number) {
		this.pos = {x, y}
		this.dirRad = dirRad
		this.r = r
		this.v = 100
	}
}

export class Solver {
	w: number
	h: number
	cells: Array<number>
	nx: number
	ny: number
	cellWidth: number
	cellHeight: number
	player: Player
	keys: Record<string, boolean>

	constructor(
		w: number,
		h: number,
	) {
		this.w = w
		this.h = h
		this.cells = [
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
			0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
			0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
			0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1,
			0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
		]
		this.nx = Math.sqrt(this.cells.length)
		this.ny = this.nx

		this.cellWidth = Math.floor(this.h / this.nx)
		this.cellHeight = this.cellWidth
		console.log(`Num cells: (${this.nx}, ${this.ny})`)
		console.log(`Cell dims: (${this.cellWidth}, ${this.cellHeight})`)

		this.player = new Player(w/4, h/2, 0, this.cellHeight * 0.4)
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
		const turnRateRad = 4.0

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
					this.player.dirRad -= turnRateRad * dt
					break
				case "KeyS":
					this.player.pos.x -= Math.cos(this.player.dirRad) * this.player.v * dt
					this.player.pos.y -= Math.sin(this.player.dirRad) * this.player.v * dt
					break
				case "KeyD":
					this.player.dirRad += turnRateRad * dt
					break
				default:
					break
			}
		})
	}

	applyPlayerConstraints() {
		const right = this.cellWidth * this.nx
		const bottom = this.cellHeight * this.ny

		if ((this.player.pos.x + this.player.r) >= right) {
			this.player.pos.x = right - this.player.r
		}
		if ((this.player.pos.x - this.player.r) <= 0) {
			this.player.pos.x = this.player.r
		}
		if ((this.player.pos.y + this.player.r) >= bottom) {
			this.player.pos.y = bottom - this.player.r
		}
		if ((this.player.pos.y - this.player.r) <= 0) {
			this.player.pos.y = this.player.r
		}
	}

	collidePlayer() {
		const col = Math.floor(this.player.pos.x / this.cellWidth)
		const row = Math.floor(this.player.pos.y / this.cellHeight)

		const playerCellIdx = row * this.nx + col

		const cellIdxs = [
			playerCellIdx - this.nx - 1, playerCellIdx - this.nx, playerCellIdx - this.nx + 1,
			playerCellIdx - 1, playerCellIdx, playerCellIdx + 1,
			playerCellIdx + this.nx - 1, playerCellIdx + this.nx, playerCellIdx + this.nx + 1,
		]

		cellIdxs.forEach((i) => {
			if (i < 0 || i >= this.cells.length || !this.cells[i]) return

			// bounding box check
			const pleft = this.player.pos.x - this.player.r
			const pright = this.player.pos.x + this.player.r
			const ptop = this.player.pos.y - this.player.r
			const pbottom = this.player.pos.y + this.player.r

			const bleft = (i % this.nx) * this.cellWidth
			const bright = bleft + this.cellWidth
			const btop = Math.floor(i / this.nx) * this.cellHeight
			const bbottom = btop + this.cellHeight

			let left = false
			let right = false
			let _top = false
			let bottom = false

			let ctr = 0
			if (btop < ptop && ptop < bbottom) {
				_top = true
				ctr++
			}

			if (btop < pbottom && pbottom < bbottom) {
				bottom = true
				ctr++
			}

			if (bleft < pleft && pleft < bright) {
				left = true
				ctr++
			}

			if (bleft < pright && pright < bright) {
				right = true
				ctr++
			}

			if (ctr < 2) return

			let yd = 0
			let xd = 0

			// i'm a genius
			if (_top) yd = Math.max(bbottom - ptop, 0)
			else if (bottom) yd = Math.min(btop - pbottom, 0)

			if (left) xd = Math.max(bright - pleft, 0)
			else if (right) xd = Math.min(bleft - pright, 0)

			if (Math.abs(yd) <= Math.abs(xd))
				this.player.pos.y += yd
			else
				this.player.pos.x += xd
		})
	}
}
