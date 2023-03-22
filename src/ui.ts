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
