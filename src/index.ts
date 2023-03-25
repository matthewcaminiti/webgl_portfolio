import {Renderer} from "./renderer"
import {Solver} from "./solver"
import {PerfWindow, ControlPanel} from "./ui"

const main = () => {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
	if (!canvas) {
		throw "Failed to get canvas element"
	}

	const renderer = new Renderer(canvas)
	renderer.refreshCanvas()

	const solver = new Solver(renderer.w, renderer.h)

	const controlPanel = new ControlPanel(solver)

	const perfWindow = new PerfWindow()

	solver.bindControls()

	let then = 0
	const drawScene = (time: number) => {
		time *= 0.001
		const dt = Math.abs(then - time)
		then = time
	
		perfWindow.addFps(1 / dt)

		renderer.refreshCanvas()

		let start = performance.now()
		solver.executeControls(dt)
		solver.applyPlayerConstraints()
		solver.collidePlayer()
		const rays = solver.castRays()
		perfWindow.addSolverTime(performance.now() - start)

		start = performance.now()
		renderer.drawGround()
		renderer.drawSky()
		renderer.drawWalls(rays, solver.rayDistCap, solver.fov)
		if (controlPanel.is2dVisible) {
			renderer.drawGrid(solver.nx, solver.ny, solver.cellWidth, solver.cellHeight)
			renderer.drawCells(solver.nx, solver.cellWidth, solver.cellHeight, solver.cells)

			renderer.drawPlayer(solver.player)
			renderer.drawRays(solver.player.pos, rays.map((x) => x[0]))
		}
		perfWindow.addRenderTime(performance.now() - start)

		perfWindow.update(dt)

		requestAnimationFrame(drawScene)
	}

	drawScene(0)
}

main()
