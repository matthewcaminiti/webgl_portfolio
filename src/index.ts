import {Renderer} from "./renderer"
import { Solver } from "./solver"

const main = () => {
	console.log("main")

	const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
	if (!canvas) {
		throw "Failed to get canvas element"
	}

	const renderer = new Renderer(canvas)
	renderer.refreshCanvas()

	const solver = new Solver(renderer.w, renderer.h)

	solver.bindControls()

	let ctr = 0
	let then = 0
	const drawScene = (time: number) => {
		time *= 0.001
		const dt = Math.abs(then - time)
		then = time

		renderer.refreshCanvas()

		solver.executeControls(dt)
		solver.applyPlayerConstraints()
		solver.collidePlayer()
		const rays = solver.castRays()

		renderer.drawGrid(solver.nx, solver.ny, solver.cellWidth, solver.cellHeight)
		renderer.drawCells(solver.nx, solver.cellWidth, solver.cellHeight, solver.cells)

		renderer.drawTriangle()
		renderer.drawPlayer(solver.player)
		renderer.drawRays(solver.player.pos, rays)

		requestAnimationFrame(drawScene)
		ctr++
	}

	drawScene(0)
}

main()
