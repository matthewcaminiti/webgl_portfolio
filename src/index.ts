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

	solver.bindControls(canvas)

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
		solver.updateSprites(dt)
		const rays = solver.castRays()
		const sprites = solver.visibleSprites()
		perfWindow.addSolverTime(performance.now() - start)

		start = performance.now()
		renderer.drawGround(solver.fov.y, solver.player.lookDir.y)
		renderer.drawSky(solver.fov.y, solver.player.lookDir.y)

		renderer.drawEntities(rays, sprites, solver.player, solver.fov, solver.renderDistance)

		if (controlPanel.is2dVisible) {
			renderer.drawCells(solver.nx, solver.cellWidth, solver.cellHeight, solver.cells)
			renderer.drawGrid(solver.nx, solver.ny, solver.cellWidth, solver.cellHeight)

			renderer.drawPlayer(solver.player)
			renderer.drawRays(solver.player.pos, rays.map((x) => x.pos))
		}
		perfWindow.addRenderTime(performance.now() - start)

		perfWindow.update(dt)

		requestAnimationFrame(drawScene)
	}

	drawScene(0)
}

main()
