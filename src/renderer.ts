import {resizeCanvasToDisplaySize} from "./canvas"
import {degToRad} from "./util"
import {Player} from "./solver"

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

	drawTriangle() {
		const indices = [
			0, 0,
			50, 0,
			50, 50
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

		this.gl.uniform4f(this.uniforms["u_color"], 0, 1, 0, 1)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawGrid(nx: number, ny: number) {
		const cellWidth = Math.floor(this.h / nx)
		const cellHeight = cellWidth
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
}
