import * as glUtil from "./glUtil"
import {Player} from "./solver"
import {Vec2, degToRad, Ray} from "./math"

export class Renderer {
	gl: WebGLRenderingContext
	canvas: HTMLCanvasElement
	programs: Record<string, glUtil.ProgramInfo>
	textures: Record<string, WebGLTexture>

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		this.gl = glUtil.loadContext(canvas)

		this.refreshCanvas()

		const wallProgram = glUtil.createProgramInfo(
			this.gl,
			"vertex-shader-walls",
			"fragment-shader-walls"
		)

		this.programs = {
			walls: wallProgram
		}

		this.textures = {
			1: this.gl.createTexture() as WebGLTexture
		}
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1])

		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
			new Uint8Array([0, 0, 255, 255]))

		const image = new Image()
		image.src = "assets/tex_atlas.png"
		image.addEventListener("load", () => {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1])
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
			this.gl.generateMipmap(this.gl.TEXTURE_2D)
		})
	}

	get w() {
		return this.gl.canvas.width
	}

	get h() {
		return this.gl.canvas.height
	}

	refreshCanvas() {
		glUtil.resizeCanvasToDisplaySize(this.canvas)

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

		// Clear the canvas
		this.gl.clearColor(0, 0, 0, 0)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}

	drawGrid(nx: number, ny: number, cellWidth: number, cellHeight: number) {
		let indices: Array<number> = []
		for (let i = 0; i <= nx; i++) {
			indices.push(i * cellWidth, 0, i * cellWidth, ny * cellHeight)
		}
		for (let i = 0; i <= ny; i++) {
			indices.push(0, i * cellHeight, nx * cellWidth, i * cellHeight)
		}

		this.gl.useProgram(this.programs.walls.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)},
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.1, 0.1, 0.1, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.LINES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawCells(nx: number, cellWidth: number, cellHeight: number, cells: Array<number>) {
		let indices: Array<number> = []
		let texIndices: Array<number> = []

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
			texIndices.push(
				0, 0,
				1, 0,
				1, 1,
				0, 0,
				0, 1,
				1, 1,
			)
		}

		this.gl.useProgram(this.programs.walls.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)},
			a_texcoord: {numComponents: 2, data: new Float32Array(texIndices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.8, 0.8, 0.8, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

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

		this.gl.useProgram(this.programs.walls.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [1, 1, 1, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)

		let dirLineIndices = [
			player.pos.x, player.pos.y,
			Math.cos(player.lookdir.x) * player.r + player.pos.x, Math.sin(player.lookdir.x) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.lookdir.x + Math.PI/8) * player.r + player.pos.x, Math.sin(player.lookdir.x + Math.PI/8) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.lookdir.x - Math.PI/8) * player.r + player.pos.x, Math.sin(player.lookdir.x - Math.PI/8) * player.r + player.pos.y,
		]

		{
			const attribArrays: Record<string, glUtil.AttribArray> = {
				a_position: {numComponents: 2, data: new Float32Array(dirLineIndices)}
			}

			const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

			glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

			const uniforms = {
				u_resolution: [this.w, this.h],
				u_color: [0.1, 0.1, 0.1, 1]
			}

			glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)
		}

		this.gl.drawArrays(
			this.gl.LINES,
			0, // offset
			dirLineIndices.length/2 // num vertices per instance
		)
	}

	drawRays(origin: Vec2, rays: Array<Vec2>) {
		this.gl.useProgram(this.programs.walls.program)

		const uniforms: Record<string, any> = {
			u_resolution: [this.w, this.h],
			u_color: [1, 1, 1, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		const indices: Array<number> = []
		rays.forEach((ray) => {
			const circlePos = origin.add(ray)

			const r = 2
			const _r = Math.floor(r * 0.8)
			const steps = _r <= 10 ? 10 : _r

			let prevPoint = {x : circlePos.x + r, y: circlePos.y}
			for (let i = 1; i <= steps; i++) {
				// push origin, prev point, next point
				let newX = r * Math.cos(degToRad((360/steps) * i)) + circlePos.x
				let newY = r * Math.sin(degToRad((360/steps) * i)) + circlePos.y

				indices.push(
					circlePos.x,
					circlePos.y,
					prevPoint.x,
					prevPoint.y,
					newX,
					newY,
				)

				prevPoint.x = newX
				prevPoint.y = newY
			}
		})

		const attribs: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribs)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawWalls(rays: Array<Ray>, rayDistCap: number, fov: Vec2, lookDirY: number) {
		const cellHeight = 50
		const verticalFovRad = Math.PI/2
		const projectionDist = cellHeight / Math.tan(verticalFovRad/2) * 0.5

		// incorrectly assumes rays collide at fixed distances
		const radIncr = fov.x / rays.length

		const relative = lookDirY / fov.y * .5
		const relativeH = this.h * (0.5 + relative)

		const indices: Array<number> = []
		const texIndices: Array<number> = []
		const distIndices: Array<number> = []
		rays.forEach(({pos, cellIdx, cellVal, distToAxis}, i) => {
			const perc = 1 - pos.mag / rayDistCap
			distIndices.push(
				perc,
				perc,
				perc,
				perc,
				perc,
				perc,
			)

			// angle of ray relative to center of horizontal FOV
			const fovAdjustedAngle = fov.x/2 - i*radIncr

			const rayAdjY = pos.mag * Math.cos(fovAdjustedAngle)
			const rayAdjX = pos.mag * Math.sin(fovAdjustedAngle)

			const relativeProjection = projectionDist / rayAdjY
			const relativeHeight = this.h * relativeProjection

			// width of half of FOV, rayAdjY far away
			const fovAdjX = rayAdjY * Math.tan(fov.x/2)

			const relativeHalfScreenRatio = rayAdjX / fovAdjX
			const xpos = this.w/2 - relativeHalfScreenRatio * this.w/2

			let nextXpos = this.w
			if (i < rays.length - 1) {
				const nextFovAdjustAngle = fov.x/2 - (i+1)*radIncr
				const nextRayAdjX = rays[i+1].pos.mag * Math.sin(nextFovAdjustAngle)
				const nextRayAdjY = rays[i+1].pos.mag * Math.cos(nextFovAdjustAngle)

				const nextFovAdjX = nextRayAdjY * Math.tan(fov.x/2)

				const nextRelativeHalfScreenRatio = nextRayAdjX / nextFovAdjX
				nextXpos = this.w/2 - nextRelativeHalfScreenRatio * this.w/2
			}

			const topleft = {
				x: xpos,
				y: relativeH - relativeHeight/2
			}
			const botRight = {
				x: nextXpos,
				y: relativeH + relativeHeight/2
			}

			indices.push(
				topleft.x, topleft.y,
				botRight.x, topleft.y,
				botRight.x, botRight.y,
				topleft.x, topleft.y,
				topleft.x, botRight.y,
				botRight.x, botRight.y,
			)

			let nextDistToNextAxis = 1
			// look forward, if cell is same and reldist is greater than current, draw to it
			if (
				i < rays.length - 1 &&
				rays[i+1].cellIdx === cellIdx &&
				rays[i+1].distToAxis > distToAxis
			) {
				nextDistToNextAxis = rays[i+1].distToAxis
			} else if (i === rays.length - 1) {
				// if last ray, fudge it
				nextDistToNextAxis = 2*distToAxis - rays[i-1].distToAxis
			}

			const texIndex = cellVal - 1
			const texOffset = {x : texIndex / 16, y: Math.floor(texIndex / 16) % 16}

			const texTopLeft = {
				x: texOffset.x + distToAxis*64/1024,
				y: texOffset.y
			}
			// possibly look back?
			if (i >= 1 && rays[i-1].cellIdx !== rays[i].cellIdx) {
				texTopLeft.x = texOffset.x
			}
			const texBotRight = {
				x: texOffset.x + nextDistToNextAxis*64/1024,
				y: texOffset.y + 64/1024
			}

			texIndices.push(
				texTopLeft.x, texTopLeft.y,
				texBotRight.x, texTopLeft.y,
				texBotRight.x, texBotRight.y,
				texTopLeft.x, texTopLeft.y,
				texTopLeft.x, texBotRight.y,
				texBotRight.x, texBotRight.y,
			)
		})

		this.gl.useProgram(this.programs.walls.program)

		const attribArrays = {
			a_position: { numComponents: 2, data: new Float32Array(indices)},
			a_texcoord: { numComponents: 2, data: new Float32Array(texIndices)},
			a_dist: { numComponents: 1, data: new Float32Array(distIndices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)
		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0, 0, 0, 1],
			u_texture: this.textures[1],
		}
		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices (x, y)
		)
	}

	drawGround(verticalFov: number, lookDirY: number) {
		const relative = lookDirY / verticalFov * .5
		const relativeH = this.h * (0.5 + relative)

		const indices: Array<number> = [
			0, relativeH,
			this.w, relativeH,
			this.w, this.h,
			0, relativeH,
			0, this.h,
			this.w, this.h,
		]

		this.gl.useProgram(this.programs.walls.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.475, 0.490, 0.498, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawSky(verticalFov: number, lookDirY: number) {
		const relative = lookDirY / verticalFov * .5
		const relativeH = this.h * (0.5 + relative)

		const indices: Array<number> = [
			0, 0,
			this.w, 0,
			this.w, relativeH,
			0, 0,
			0, relativeH,
			this.w, relativeH,
		]

		this.gl.useProgram(this.programs.walls.program)

		const attribs: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribs)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms: Record<string, any> = {
			u_resolution: [this.w, this.h],
			u_color: [0.384, 0.396, 0.404, 1]
		}

		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}
}
