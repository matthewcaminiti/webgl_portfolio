import {Solver} from "./solver"

export class PerfWindow {
	fpsEle: HTMLDivElement
	fpsWalkingSum: number

	unknownEle: HTMLDivElement

	solverEle: HTMLDivElement
	solverTimeWalkingSum: number

	renderEle: HTMLDivElement
	renderTimeWalkingSum: number

	sampleCount: number

	constructor() {
		this.fpsEle = document.getElementById("fps-ele") as HTMLDivElement
		this.fpsWalkingSum = 0

		this.unknownEle = document.getElementById("unknown-ele") as HTMLDivElement

		this.solverEle = document.getElementById("solver-ele") as HTMLDivElement
		this.solverTimeWalkingSum = 0

		this.renderEle = document.getElementById("render-ele") as HTMLDivElement
		this.renderTimeWalkingSum = 0

		this.sampleCount = 0
	}

	update(dt: number) {
		if (this.sampleCount++ < 50) return

		this.fpsEle.textContent = (this.fpsWalkingSum / this.sampleCount).toFixed(2)
		this.fpsWalkingSum = 0

		this.unknownEle.textContent = `${(dt*1000 - (this.solverTimeWalkingSum/this.sampleCount + this.renderTimeWalkingSum/this.sampleCount)).toFixed(2)}ms`

		this.solverEle.textContent = `${(this.solverTimeWalkingSum/this.sampleCount).toFixed(2)}ms (${((this.solverTimeWalkingSum/this.sampleCount)/ (dt*1000) * 100).toFixed(2)}%)`
		this.solverTimeWalkingSum = 0

		this.renderEle.textContent = `${(this.renderTimeWalkingSum/this.sampleCount).toFixed(2)}ms (${((this.renderTimeWalkingSum/this.sampleCount)/ (dt*1000) * 100).toFixed(2)}%)`
		this.renderTimeWalkingSum = 0

		this.sampleCount = 0
	}

	addFps(x: number) {
		this.fpsWalkingSum += x
	}

	addSolverTime(x: number) {
		this.solverTimeWalkingSum += x
	}

	addRenderTime(x: number) {
		this.renderTimeWalkingSum += x
	}
}

export class ControlPanel {
	solver: Solver
	is2dVisible: boolean

	constructor(solver: Solver) {
		this.solver = solver
		this.is2dVisible = false

		const distEle = document.getElementById("raycast-dist-ele") as HTMLElement
		distEle.textContent = this.solver.maxRayDist.toString()

		document.querySelectorAll("#raycast-dist-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				this.solver.maxRayDist += btn.textContent ? +btn.textContent : 0

				distEle.textContent = this.solver.maxRayDist.toString()
			})
		})

		const rayCountEle = document.getElementById("raycast-count-ele") as HTMLElement
		rayCountEle.textContent = this.solver.nRays.toString()

		document.querySelectorAll("#raycast-count-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				this.solver.nRays += btn.textContent ? +btn.textContent : 0

				rayCountEle.textContent = this.solver.nRays.toString()
			})
		})

		const toggle2dBtn = document.getElementById("toggle-2d-view") as HTMLInputElement
		toggle2dBtn.addEventListener("click", () => {
			this.is2dVisible = !this.is2dVisible
			toggle2dBtn.textContent = `${this.is2dVisible ? 'Hide' : 'Show'} 2d view`
		})
	}
}
