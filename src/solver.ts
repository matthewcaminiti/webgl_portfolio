import {Vec2, Vec3, Ray} from "./math"
import {colorCodes} from "./consts"

export class Player {
	pos: Vec2
	movedir: number
	lookdir: Vec2
	r: number
	v: number
	turnSpeedRad: number

	constructor(x: number, y: number, movedir: number, r: number) {
		this.pos = new Vec2(x, y)
		this.movedir = movedir
		this.lookdir = new Vec2(movedir, 0)
		this.r = r
		this.v = 150
		this.turnSpeedRad = 3.0
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
	nRays: number
	rayDistCap: number
	fov: Vec2
	mousePos: Vec2

	constructor(
		w: number,
		h: number,
	) {
		this.w = w
		this.h = h
		this.cells = [
			4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 4,
			4, 7, 7, 7, 7, 7, 7, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 7, 7, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 7, 0, 0, 7, 7, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 7, 0, 0, 0, 7, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 5, 5, 5, 5, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 8, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 0, 7, 6, 0, 0, 0, 0, 2, 0, 0, 4, 7, 7, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 7, 0, 0, 2, 0, 0, 4, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 4,
			4, 0, 7, 7, 3, 0, 0, 0, 0, 5, 7, 0, 0, 0, 3, 7, 0, 0, 2, 0, 0, 2, 0, 0, 4,
			4, 0, 7, 7, 3, 0, 0, 0, 0, 7, 6, 0, 0, 0, 2, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 7, 7, 3, 0, 0, 0, 0, 3, 7, 0, 0, 0, 1, 7, 7, 6, 0, 0, 0, 1, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 5, 5, 0, 0, 0, 1, 0, 0, 4,
			4, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
			4, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4,
			4, 0, 0, 0, 0, 7, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 7, 0, 0, 0, 3, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 4, 0, 0, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 4, 7, 7, 4,
			4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 4,
			4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
		]
		this.nx = Math.sqrt(this.cells.length)
		this.ny = this.nx

		this.cellWidth = Math.floor(this.h / this.nx)
		this.cellHeight = this.cellWidth
		console.log(`Num cells: (${this.nx}, ${this.ny})`)
		console.log(`Cell dims: (${this.cellWidth}, ${this.cellHeight})`)

		this.player = new Player(450, 500, 0, this.cellHeight * 0.4)
		this.keys = {
			"KeyW": false,
			"KeyA": false,
			"KeyS": false,
			"KeyD": false,
			"ArrowLeft": false,
			"ArrowRight": false,
			"ArrowUp": false,
			"ArrowDown": false,
		}

		this.nRays = 1000
		this.rayDistCap = 500
		this.fov = new Vec2(Math.PI/2, Math.PI/2)
		this.mousePos = new Vec2(0, 0)
	}

	bindControls(canvas: HTMLCanvasElement) {
		canvas.addEventListener("click", () => {
			if (!document.pointerLockElement) {
				canvas.requestPointerLock()
			}
		})

		const focusWarningEle = document.getElementById("focus-warning") as HTMLDivElement
		if (document.activeElement !== canvas) {
			focusWarningEle.style.display = "block"
		}

		canvas.addEventListener("focusin", () => {
			focusWarningEle.style.display = "none"
		})

		canvas.addEventListener("focusout", () => {
			focusWarningEle.style.display = "block"
		})

		const updateMousePosition = (e: MouseEvent) => {
			this.mousePos.x += e.movementX
			this.mousePos.y -= e.movementY
		}

		document.addEventListener("pointerlockerror", () => {
			console.log("Pointer lock failed")
		})

		document.addEventListener("pointerlockchange", () => {
			if (document.pointerLockElement === canvas) {
				document.addEventListener("mousemove", updateMousePosition, false)
				focusWarningEle.style.display = "none"
			} else {
				document.removeEventListener("mousemove", updateMousePosition, false)
				focusWarningEle.style.display = "block"
			}
		})

		canvas.addEventListener("keydown", (e) => {
			this.keys[e.code] = true
		})

		canvas.addEventListener("keyup", (e) => {
			this.keys[e.code] = false
		})
	}

	executeControls(dt: number) {
		Object.entries(this.keys).forEach(([keyname, isDown]) => {
			if (!isDown) return

			switch (keyname) {
				case "KeyW":
					this.player.pos.x += Math.cos(this.player.movedir) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.movedir) * this.player.v * dt
					break
				case "KeyA":
					this.player.pos.x += Math.cos(this.player.movedir - Math.PI/2) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.movedir - Math.PI/2) * this.player.v * dt
					break
				case "KeyS":
					this.player.pos.x -= Math.cos(this.player.movedir) * this.player.v * dt
					this.player.pos.y -= Math.sin(this.player.movedir) * this.player.v * dt
					break
				case "KeyD":
					this.player.pos.x += Math.cos(this.player.movedir + Math.PI/2) * this.player.v * dt
					this.player.pos.y += Math.sin(this.player.movedir + Math.PI/2) * this.player.v * dt
					break
				case "ArrowLeft":
					this.player.movedir -= this.player.turnSpeedRad * dt
					this.player.lookdir.x -= this.player.turnSpeedRad * dt
					break
				case "ArrowRight":
					this.player.movedir += this.player.turnSpeedRad * dt
					this.player.lookdir.x += this.player.turnSpeedRad * dt
					break
				case "ArrowUp":
					this.player.lookdir.y += this.player.turnSpeedRad * dt
					break
				case "ArrowDown":
					this.player.lookdir.y -= this.player.turnSpeedRad * dt
					break
				default:
					break
			}
		})

		if (this.mousePos.x || this.mousePos.y) {
			this.player.lookdir.x += this.mousePos.x * dt * 0.1
			this.player.lookdir.y += this.mousePos.y * dt * 0.1

			this.player.movedir = this.player.lookdir.x

			this.mousePos.x = 0
			this.mousePos.y = 0
		}
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

		// order top, left, center, right, bottom first! avoids corner blocking
		const cellIdxs = [
			playerCellIdx - this.nx,
			playerCellIdx - 1, playerCellIdx, playerCellIdx + 1,
			playerCellIdx + this.nx,
			playerCellIdx - this.nx - 1,  playerCellIdx - this.nx + 1,
			playerCellIdx + this.nx - 1, playerCellIdx + this.nx + 1,
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

	castRay(origin: Vec2, dirRad: number, maxDist: number): Ray {
		const normd = new Vec2(
			Math.cos(dirRad),
			Math.sin(dirRad),
		)

		const h = normd.x >= 0 ? 1 : -1
		const v = normd.y >= 0 ? 1 : -1

		const pcol = Math.floor(origin.x / this.cellWidth)
		const prow = Math.floor(origin.y / this.cellHeight)

		const playerCellIdx = prow * this.nx + pcol

		let nextXi = h > 0 ? playerCellIdx + 1 : playerCellIdx
		let nextYi = v > 0 ? playerCellIdx + this.nx : playerCellIdx

		const playerDirTan = Math.tan(dirRad)

		const nextdx = (nextXi % this.nx) * this.cellWidth - origin.x
		const rx = new Vec2(
			nextdx,
			nextdx * playerDirTan
		)

		const nextdy = Math.floor(nextYi / this.ny) * this.cellHeight - origin.y
		const ry = new Vec2(
			nextdy / playerDirTan,
			nextdy
		)

		while (true) {
			// whichever has less dist (rx/ry), check if (rx/ry) touching wall
			// if wall, return ray
			// if not wall, recalc (rx/ry) and set (rx/ry)
			const magx = rx.mag
			const magy = ry.mag

			if (magx > maxDist && magy > maxDist) return {
				pos: normd.scale(maxDist),
				cellIdx: -1,
				cellVal: 1,
				distToAxis: 1
			}

			if (magx <= magy) {
				const col = Math.floor((rx.x + origin.x + h) / this.cellWidth)
				const row = Math.floor((rx.y + origin.y) / this.cellHeight)

				const cellIdx = row * this.nx + col
				if (this.cells[cellIdx]) {
					let distToAxis = ((rx.y + origin.y) % this.cellHeight)/this.cellHeight
					// distToAxis is y-directional, if ray dir is (-x) then want 1-dist
					if (h < 0) distToAxis = 1 - distToAxis

					return {
						pos: rx,
						cellIdx: cellIdx,
						cellVal: this.cells[cellIdx],
						distToAxis: distToAxis
					}
				}

				rx.x += this.cellWidth*h
				rx.y = rx.x * playerDirTan
			} else {
				const col = Math.floor((ry.x + origin.x) / this.cellWidth)
				const row = Math.floor((ry.y + origin.y + v) / this.cellHeight)

				const cellIdx = row * this.nx + col
				if (this.cells[cellIdx]) {
					let distToAxis = ((ry.x + origin.x) % this.cellWidth)/this.cellWidth
					// distToAxis is x-directional, if ray dir is (+y) then want 1-dist
					if (v > 0) distToAxis = 1 - distToAxis

					return {
						pos: ry,
						cellIdx: cellIdx,
						cellVal: this.cells[cellIdx],
						distToAxis: distToAxis
					}
				}

				ry.y += this.cellHeight*v
				ry.x = ry.y / playerDirTan
			}
		}
	}

	castRays(): Array<Ray> {
		let rays: Array<Ray> = []

		const radIncr = this.fov.x / this.nRays

		const halfFovX = this.fov.x / 2

		for (let rot = -1 * halfFovX; rot <= halfFovX; rot += radIncr) {
			rays.push(this.castRay(this.player.pos, this.player.lookdir.x + rot, this.rayDistCap))
		}

		return rays
	}
}
