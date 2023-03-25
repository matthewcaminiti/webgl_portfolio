import {resizeCanvasToDisplaySize} from "./canvas"
import {Player} from "./solver"
import {Vec2, degToRad} from "./math"

export class Renderer {
	gl: WebGLRenderingContext
	canvas: HTMLCanvasElement
	program: WebGLProgram
	attributes: Record<string, number>
	uniforms: Record<string, WebGLUniformLocation>
	buffers: Record<string, WebGLBuffer>

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		const gl = this.canvas.getContext("webgl")
		if (!gl) {
			throw "Failed to load WebGL context"
		}
		this.gl = gl

		this.refreshCanvas()

		const vertexShaderSrc = `
			// an attribute will receive data from a buffer
			attribute vec2 a_position;

			uniform vec2 u_resolution;

			// all shaders have a main function
			void main() {
				// convert the position from pixels to 0.0 to 1.0
				vec2 zeroToOne = a_position / u_resolution;

				// convert from 0->1 to 0->2
				vec2 zeroToTwo = zeroToOne * 2.0;

				// convert from 0->2 to -1->+1 (clip space)
				vec2 clipSpace = zeroToTwo - 1.0;

				vec2 yFlipped = vec2(clipSpace.x, clipSpace.y * -1.0);
				
				// gl_Position is a special variable a vertex shader
				// is responsible for setting
				gl_Position = vec4(yFlipped, 0, 1);
			}
		`
		const fragmentShaderSrc = `
			// fragment shaders don't have a default precision so we need to pick one.
			// mediump is a good default. it means "medium precision"
			precision mediump float;

			uniform vec4 u_color;

			void main() {
				// gl_FragColor is a special variable a fragment shader is responsible for setting
				gl_FragColor = u_color;
			}
		`

		const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSrc)
		const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSrc)

		this.program = this.createProgram(vertexShader, fragmentShader)

		this.attributes = {}
		this.uniforms = {}
		this.buffers = {}

		this.attributes["a_position"] = this.gl.getAttribLocation(this.program, "a_position")
		const positionBuffer = this.gl.createBuffer()
		if (!positionBuffer) {
			throw new Error("Failed to create position buffer")
		}
		this.buffers["a_position"] = positionBuffer

		const colorUniformLocation = this.gl.getUniformLocation(this.program, "u_color")
		if (!colorUniformLocation) {
			throw new Error("Failed to get 'u_color' location")
		}
		this.uniforms["u_color"] = colorUniformLocation

		this.gl.useProgram(this.program)

		// Set the resolution uniform
		const resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution")
		this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height)
		console.log(`~~~Resolution~~~\n(${gl.canvas.width} x ${gl.canvas.height}) px`)
	}

	get w() {
		return this.gl.canvas.width
	}

	get h() {
		return this.gl.canvas.height
	}

	refreshCanvas() {
		resizeCanvasToDisplaySize(this.canvas)

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

		// Clear the canvas
		this.gl.clearColor(0, 0, 0, 0)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}

	createShader(
		type: number,
		source: string
	): WebGLShader {
		const shader = this.gl.createShader(type)

		if (!shader) {
			throw new Error("Failed to create shader")
		}

		this.gl.shaderSource(shader, source)
		this.gl.compileShader(shader)

		const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)
		if (!success) {
			const infoLog = this.gl.getShaderInfoLog(shader)
			this.gl.deleteShader(shader)
			throw new Error(infoLog ?? 'Unknown error occurred')
		}

		return shader
	}

	createProgram(
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader,
	): WebGLProgram {
		const program = this.gl.createProgram()

		if (!program) {
			throw new Error("Failed to create program")
		}

		this.gl.attachShader(program, vertexShader)
		this.gl.attachShader(program, fragmentShader)

		this.gl.linkProgram(program)

		const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)
		if (!success) {
			const infoLog = this.gl.getProgramInfoLog(program)
			this.gl.deleteProgram(program)
			throw new Error(infoLog ?? 'Unknown error occurred')
		}

		return program
	}

	drawGrid(nx: number, ny: number, cellWidth: number, cellHeight: number) {
		let indices: Array<number> = []
		for (let i = 0; i <= nx; i++) {
			indices.push(i * cellWidth, 0, i * cellWidth, ny * cellHeight)
		}
		for (let i = 0; i <= ny; i++) {
			indices.push(0, i * cellHeight, nx * cellWidth, i * cellHeight)
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(indices), this.gl.STATIC_DRAW)

		this.gl.vertexAttribPointer(
			this.attributes["a_position"], // location
			2, // size (num values to pull from buffer per iteration)
			this.gl.FLOAT, // type of data in buffer
			false, // normalize
			0, // stride (0 = compute from size and type above)
			0 // offset in buffer
		)

		this.gl.enableVertexAttribArray(this.attributes["a_position"])

		this.gl.uniform4f(this.uniforms["u_color"], 0.95, 0.95, 0.95, 1)

		this.gl.drawArrays(
			this.gl.LINES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawCells(nx: number, cellWidth: number, cellHeight: number, cells: Array<number>) {
		let indices: Array<number> = []
		for (let i = 0; i < cells.length; i++) {
			if (!cells[i]) continue

			const x = (i % nx) * cellWidth
			const y = Math.floor(i / nx) * cellHeight
			indices.push(
				x, y,
				x + cellWidth, y,
				x + cellWidth, y + cellHeight,
				x, y,
				x, y + cellWidth,
				x + cellWidth, y + cellHeight,
			)
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(indices), this.gl.STATIC_DRAW)

		this.gl.vertexAttribPointer(
			this.attributes["a_position"], // location
			2, // size (num values to pull from buffer per iteration)
			this.gl.FLOAT, // type of data in buffer
			false, // normalize
			0, // stride (0 = compute from size and type above)
			0 // offset in buffer
		)

		this.gl.enableVertexAttribArray(this.attributes["a_position"])

		this.gl.uniform4f(this.uniforms["u_color"], .5, .5, .5, 1)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawPlayer(player: Player) {
		const _r = Math.floor(player.r * 0.8)
		const steps = _r <= 10 ? 10 : _r
		let indices: Array<number> = Array(steps*6).map(() => 0)

		let prevPoint = {x : player.pos.x + player.r, y: player.pos.y}
		for (let i = 1; i <= steps; i++) {
			// push origin, prev point, next point
			let newX = player.r * Math.cos(degToRad((360/steps) * i)) + player.pos.x
			let newY = player.r * Math.sin(degToRad((360/steps) * i)) + player.pos.y

			let adjIdx = (i - 1) * 6
			indices[adjIdx] = player.pos.x
			indices[adjIdx + 1] = player.pos.y
			indices[adjIdx + 2] = prevPoint.x
			indices[adjIdx + 3] = prevPoint.y
			indices[adjIdx + 4] = newX
			indices[adjIdx + 5] = newY

			prevPoint.x = newX
			prevPoint.y = newY
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(indices), this.gl.STATIC_DRAW)

		this.gl.vertexAttribPointer(
			this.attributes["a_position"], // location
			2, // size (num values to pull from buffer per iteration)
			this.gl.FLOAT, // type of data in buffer
			false, // normalize
			0, // stride (0 = compute from size and type above)
			0 // offset in buffer
		)

		this.gl.enableVertexAttribArray(this.attributes["a_position"])

		this.gl.uniform4f(this.uniforms["u_color"], 0.95, 0.95, 0.95, 1)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)

		let dirLineIndices = [
			player.pos.x, player.pos.y,
			Math.cos(player.dirRad) * player.r + player.pos.x, Math.sin(player.dirRad) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.dirRad + Math.PI/8) * player.r + player.pos.x, Math.sin(player.dirRad + Math.PI/8) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.dirRad - Math.PI/8) * player.r + player.pos.x, Math.sin(player.dirRad - Math.PI/8) * player.r + player.pos.y,
		]

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(dirLineIndices), this.gl.STATIC_DRAW)

		this.gl.vertexAttribPointer(
			this.attributes["a_position"], // location
			2, // size (num values to pull from buffer per iteration)
			this.gl.FLOAT, // type of data in buffer
			false, // normalize
			0, // stride (0 = compute from size and type above)
			0 // offset in buffer
		)

		this.gl.enableVertexAttribArray(this.attributes["a_position"])

		this.gl.uniform4f(this.uniforms["u_color"], 0, 0, 0, 1)

		this.gl.drawArrays(
			this.gl.LINES,
			0, // offset
			dirLineIndices.length/2 // num vertices per instance
		)
	}

	drawRay(v: Vec2, playerPos: Vec2) {
		const circlePos = playerPos.add(v)

		const r = 2
		const _r = Math.floor(r * 0.8)
		const steps = _r <= 10 ? 10 : _r
		let indices: Array<number> = Array(steps*6).map(() => 0)

		let prevPoint = {x : circlePos.x + r, y: circlePos.y}
		for (let i = 1; i <= steps; i++) {
			// push origin, prev point, next point
			let newX = r * Math.cos(degToRad((360/steps) * i)) + circlePos.x
			let newY = r * Math.sin(degToRad((360/steps) * i)) + circlePos.y

			let adjIdx = (i - 1) * 6
			indices[adjIdx] = circlePos.x
			indices[adjIdx + 1] = circlePos.y
			indices[adjIdx + 2] = prevPoint.x
			indices[adjIdx + 3] = prevPoint.y
			indices[adjIdx + 4] = newX
			indices[adjIdx + 5] = newY

			prevPoint.x = newX
			prevPoint.y = newY
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(indices), this.gl.STATIC_DRAW)

		this.gl.vertexAttribPointer(
			this.attributes["a_position"], // location
			2, // size (num values to pull from buffer per iteration)
			this.gl.FLOAT, // type of data in buffer
			false, // normalize
			0, // stride (0 = compute from size and type above)
			0 // offset in buffer
		)

		this.gl.enableVertexAttribArray(this.attributes["a_position"])

		this.gl.uniform4f(this.uniforms["u_color"], 0.95, 0.95, 0.95, 1)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawRays(origin: Vec2, rays: Array<Vec2>) {
		rays.forEach((ray) => {
			this.drawRay(origin, ray)
		})
	}

	drawWalls(rays: Array<Vec2>, rayDistCap: number, fov: Vec2) {
		const wallWidth = this.w / rays.length

		const cellHeight = 50
		const verticalFovRad = Math.PI/2
		const projectionDist = cellHeight / Math.tan(verticalFovRad/2) * 0.5

		// incorrectly assumes rays collide at fixed distances
		const radIncr = fov.x / rays.length

		rays.forEach((ray, i) => {
			const perc = 1 - ray.mag / rayDistCap

			// angle of ray relative to center of horizontal FOV
			const fovAdjustedAngle = fov.x/2 - i*radIncr

			const rayAdjY = ray.mag * Math.cos(fovAdjustedAngle)
			const rayAdjX = ray.mag * Math.sin(fovAdjustedAngle)

			const relativeProjection = projectionDist / rayAdjY
			const relativeHeight = this.h * relativeProjection

			// width of half of FOV, rayAdjY far away
			const fovAdjX = rayAdjY * Math.tan(fov.x/2)

			const relativeHalfScreenRatio = rayAdjX / fovAdjX
			const xpos = this.w/2 - relativeHalfScreenRatio * this.w/2

			const topleft = {x: xpos, y: this.h/2 - relativeHeight/2}
			const botRight = {x: topleft.x + wallWidth, y: this.h/2 + relativeHeight/2}

			const indices: Array<number> = [
				topleft.x, topleft.y,
				botRight.x, topleft.y,
				botRight.x, botRight.y,
				topleft.x, topleft.y,
				topleft.x, botRight.y,
				botRight.x, botRight.y,
			]

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["a_position"])
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(indices), this.gl.STATIC_DRAW)

			this.gl.vertexAttribPointer(
				this.attributes["a_position"], // location
				2, // size (num values to pull from buffer per iteration)
				this.gl.FLOAT, // type of data in buffer
				false, // normalize
				0, // stride (0 = compute from size and type above)
				0 // offset in buffer
			)

			this.gl.enableVertexAttribArray(this.attributes["a_position"])

			this.gl.uniform4f(this.uniforms["u_color"], 0, 0, perc, 1)

			this.gl.drawArrays(
				this.gl.TRIANGLES,
				0, // offset
				indices.length/2 // num vertices per instance
			)
		})
	}
}
