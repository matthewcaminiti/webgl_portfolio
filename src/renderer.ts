import * as glUtil from "./glUtil"
import {Player} from "./solver"
import {Sprite, makeTextCanvas, assetType} from "./sprites"
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

		this.programs = {
			plainColor: glUtil.createProgramInfo(this.gl, "v-plainColor", "f-plainColor"),
			walls: glUtil.createProgramInfo(this.gl, "v-walls", "f-walls")
		}

		console.log(`Resolution: (${this.w} x ${this.h})`)

		this.textures = {}

		this.loadAssets()
	}

	get w() {
		return this.gl.canvas.width
	}

	get h() {
		return this.gl.canvas.height
	}

	loadAssets() {
		const isPowerOf2 = (x: number): boolean => {
			return (x & (x - 1)) == 0
		}

		const loadAsset = (filepath: string) => {
			const comps = filepath.split('/')
			const filenamePrefix = comps[comps.length - 1].split('.')[0]

			this.textures[filenamePrefix] = this.gl.createTexture() as WebGLTexture
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[filenamePrefix])

			this.gl.texImage2D(
				this.gl.TEXTURE_2D,
				0,
				this.gl.RGBA,
				1,
				1,
				0,
				this.gl.RGBA,
				this.gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 255, 255])
			)

			const image = new Image()
			image.src = filepath
			image.addEventListener("load", () => {
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[filenamePrefix])
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
				if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
					this.gl.generateMipmap(this.gl.TEXTURE_2D)
				} else {
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
				}
			})
		}

		const textureAssets = ['atlas.png']
		textureAssets.forEach((filename) => loadAsset(`assets/textures/${filename}`))

		const spriteAssets = [
			'react_icon.png',
			'nginx_icon.png',
			'expressjs_icon.png',
			'nodejs_icon.png',
			'mongodb_icon.png',
			'sqlite_icon.png',
			'ts_icon.png',
			'webgl_icon.png',
			'socketio_icon.png',
			'go_icon.png',
			'vue_icon.png',
			'php_icon.png',
			'mysql_icon.png',
			'docker_icon.png',
		]
		spriteAssets.forEach((filename) => loadAsset(`assets/sprites/${filename}`))

		const textAssets = [
			{key: "greetings", text: "Greetings", w: 1000, h: 180},
			{key: "welcome", text: "Welcome to my developer portfolio!", w: 1800, h: 80},
			{key: "look", text: "Have a look around!", w: 1800, h: 80},
			{key: "wip", text: "WIP", w: 1400, h: 180},
			{key: "this", text: "this.tech (you're standing in it)", w: 1800, h: 80},
			// spenny
			{key: "spenny_title", text: "spenny", w: 1000, h: 180},
			// staiir
			{key: "staiir_title", text: "staiir", w: 1000, h: 180},
			// particlelife
			{key: "particlelife_title", text: "particlelife", w: 1400, h: 180},
			// voichess
			{key: "voichess_title", text: "Voichess", w: 1000, h: 180},
			// helcim
			{key: "helcim_title", text: "Helcim", w: 1000, h: 180},
			// gosocket
			{key: "gosocket_title", text: "gosocket", w: 1400, h: 180},
			// noti
			{key: "noti_title", text: "noti", w: 1400, h: 180},
			// truthjournal
			{key: "truthjournal_title", text: "TruthJournal", w: 1400, h: 180},
			// teetris
			{key: "teetris_title", text: "teetris", w: 1400, h: 180},
		]
		textAssets.forEach(({key, text, w, h}) => {
			const textCanvas = makeTextCanvas(text, w, h) as HTMLCanvasElement

			this.textures[key] = this.gl.createTexture() as WebGLTexture
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[key])

			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textCanvas)
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
		})
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

		this.gl.useProgram(this.programs.plainColor.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)},
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.1, 0.1, 0.1, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

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

		this.gl.useProgram(this.programs.plainColor.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)},
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.8, 0.8, 0.8, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

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

		this.gl.useProgram(this.programs.plainColor.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [1, 1, 1, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)

		let dirLineIndices = [
			player.pos.x, player.pos.y,
			Math.cos(player.lookDir.x) * player.r + player.pos.x, Math.sin(player.lookDir.x) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.lookDir.x + Math.PI/8) * player.r + player.pos.x, Math.sin(player.lookDir.x + Math.PI/8) * player.r + player.pos.y,
			player.pos.x, player.pos.y,
			Math.cos(player.lookDir.x - Math.PI/8) * player.r + player.pos.x, Math.sin(player.lookDir.x - Math.PI/8) * player.r + player.pos.y,
		]

		{
			const attribArrays: Record<string, glUtil.AttribArray> = {
				a_position: {numComponents: 2, data: new Float32Array(dirLineIndices)}
			}

			const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

			glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

			const uniforms = {
				u_resolution: [this.w, this.h],
				u_color: [0.1, 0.1, 0.1, 1]
			}

			glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)
		}

		this.gl.drawArrays(
			this.gl.LINES,
			0, // offset
			dirLineIndices.length/2 // num vertices per instance
		)
	}

	drawRays(origin: Vec2, rays: Array<Vec2>) {
		this.gl.useProgram(this.programs.plainColor.program)

		const uniforms: Record<string, any> = {
			u_resolution: [this.w, this.h],
			u_color: [1, 1, 1, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

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

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawWalls(rays: Array<Ray>, fov: Vec2, lookDir: Vec2, nRays: number, offset: number) {
		const projectionPlaneHeight = 50
		const projectionDist = projectionPlaneHeight / Math.tan(fov.y/2) * 0.5

		// incorrectly assumes rays collide at fixed distances
		const radIncr = fov.x / nRays

		const relative = lookDir.y / fov.y * .5
		const relativeH = this.h * (0.5 + relative)

		const indices: Array<number> = []
		const texIndices: Array<number> = []
		const distIndices: Array<number> = []
		let prevXPos = 0
		rays.forEach(({pos, cellIdx, cellVal, distToAxis, relMaxDist}, i) => {
			distIndices.push(
				relMaxDist,
				relMaxDist,
				relMaxDist,
				relMaxDist,
				relMaxDist,
				relMaxDist,
			)

			// angle of ray relative to center of horizontal FOV
			const fovAdjustedAngle = fov.x/2 - (i+offset)*radIncr

			const rayAdjY = pos.mag * Math.cos(fovAdjustedAngle)
			const rayAdjX = pos.mag * Math.sin(fovAdjustedAngle)

			const relativeProjection = projectionDist / rayAdjY
			const relativeHeight = this.h * relativeProjection

			// width of half of FOV, rayAdjY far away
			const fovAdjX = rayAdjY * Math.tan(fov.x/2)

			const relativeHalfScreenRatio = rayAdjX / fovAdjX
			const xpos = this.w/2 - relativeHalfScreenRatio * this.w/2

			let nextXpos = xpos + xpos - prevXPos
			if (rays.length === 1) {
				// fudge next pos to be a ray at same dist, radIncr theta increase
				const nextFovAdjustAngle = fov.x/2 - (i+offset+1)*radIncr
				const nextRayAdjX = rays[i].pos.mag * Math.sin(nextFovAdjustAngle)
				const nextRayAdjY = rays[i].pos.mag * Math.cos(nextFovAdjustAngle)

				const nextFovAdjX = nextRayAdjY * Math.tan(fov.x/2)

				const nextRelativeHalfScreenRatio = nextRayAdjX / nextFovAdjX
				nextXpos = this.w/2 - nextRelativeHalfScreenRatio * this.w/2
			} else if (i < rays.length - 1) {
				const nextFovAdjustAngle = fov.x/2 - (i+offset+1)*radIncr
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
			prevXPos = xpos

			let nextDistToNextAxis = 1
			// look forward, if cell is same and reldist is greater than current, draw to it
			if (
				i < rays.length - 1 &&
				rays[i+1].cellIdx === cellIdx &&
				rays[i+1].distToAxis > distToAxis
			) {
				nextDistToNextAxis = rays[i+1].distToAxis
			} else if (i === rays.length - 1 && i > 0) {
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
			u_texture: this.textures['atlas'],
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

		this.gl.useProgram(this.programs.plainColor.program)

		const attribArrays: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribArrays)

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_color: [0.380, 0.416, 0.419, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

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

		this.gl.useProgram(this.programs.plainColor.program)

		const attribs: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribs)

		glUtil.setBuffersAndAttributes(this.programs.plainColor.attributeSetters, bufferInfo)

		const uniforms: Record<string, any> = {
			u_resolution: [this.w, this.h],
			u_color: [0.259, 0.286, 0.286, 1]
		}

		glUtil.setUniforms(this.programs.plainColor.uniformSetters, uniforms)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0, // offset
			indices.length/2 // num vertices per instance
		)
	}

	drawSprite(sprite: Sprite, fov: Vec2, playerPos: Vec2, lookDir: Vec2, renderDistance: number) {
		const projectionPlaneHeight = 100
		const projectionDist = projectionPlaneHeight / Math.tan(fov.y/2) * 0.5

		const relative = lookDir.y / fov.y * .5
		const relativeH = this.h * (0.5 + relative)

		const vsprite = sprite.pos.sub(playerPos)
		const theta = Math.atan2(vsprite.y, vsprite.x)

		const spriteDist = vsprite.mag

		const d = lookDir.x - theta
		const adjX = spriteDist * Math.sin(d)
		const adjY = spriteDist * Math.cos(Math.abs(d))

		const relativeY = adjY !== 0 ? projectionDist / adjY : 0

		// width of half of FOV, adjY far away
		const fovAdjX = adjY * Math.tan(fov.x/2)

		const relativeHalfScreenRatio = adjX / fovAdjX
		const xpos = this.w/2 - relativeHalfScreenRatio * this.w/2

		const topLeft = {
			x: xpos - sprite.w * relativeY * .5,
			y: relativeH - sprite.z * relativeY - sprite.h * relativeY * .5
		}

		const botRight = {
			x: topLeft.x + sprite.w * relativeY,
			y: topLeft.y + sprite.h * relativeY
		}

		const indices: Array<number> = [
			topLeft.x, topLeft.y,
			topLeft.x, botRight.y,
			botRight.x, botRight.y,
			topLeft.x, topLeft.y,
			botRight.x, topLeft.y,
			botRight.x, botRight.y,
		]
		const texIndices = [
			0, 0,
			0, 1,
			1, 1,
			0, 0,
			1, 0,
			1, 1,
		]

		const relDist = 1 - spriteDist/renderDistance
		const distIndices = [
			relDist,
			relDist,
			relDist,
			relDist,
			relDist,
			relDist,
		]

		this.gl.useProgram(this.programs.walls.program)

		const attribs: Record<string, glUtil.AttribArray> = {
			a_position: {numComponents: 2, data: new Float32Array(indices)},
			a_texcoord: {numComponents: 2, data: new Float32Array(texIndices)},
			a_dist: {numComponents: 1, data: new Float32Array(distIndices)}
		}

		const bufferInfo = glUtil.createBufferInfoFromArrays(this.gl, attribs)

		glUtil.setBuffersAndAttributes(this.programs.walls.attributeSetters, bufferInfo)

		const uniforms = {
			u_resolution: [this.w, this.h],
			u_texture: this.textures[sprite.asset],
		}
		glUtil.setUniforms(this.programs.walls.uniformSetters, uniforms)

		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
		this.gl.depthMask(false)

		this.gl.drawArrays(
			this.gl.TRIANGLES,
			0,
			indices.length/2
		)

		this.gl.disable(this.gl.BLEND)
	}

	drawEntities(
		rays: Array<Ray>,
		sprites: Array<Sprite>,
		player: Player,
		fov: Vec2,
		renderDistance: number
	) {
		const nRays = rays.length
		sprites.sort((a, b) => a.pos.sub(player.pos).mag - b.pos.sub(player.pos).mag)

		let unrenderedSprites = sprites
		let unrenderedRays = rays

		const groupRays = (_rays: Array<Ray>): Array<Array<Ray>> => {
			return _rays.reduce((acc, curr) => {
				if (!acc.length) {
					acc = [[curr]]
					return acc
				}

				const lastGroup = acc[acc.length - 1]
				if (lastGroup[lastGroup.length - 1].index === curr.index - 1) {
					acc[acc.length - 1].push(curr)
				} else {
					acc.push([curr])
				}

				return acc
			}, [] as Array<Array<Ray>>)
		}

		while (unrenderedSprites.length) {
			const furthestUnrenderedSprite = unrenderedSprites.pop()
			if (!furthestUnrenderedSprite) break

			const spriteDist = furthestUnrenderedSprite.pos.sub(player.pos).mag

			const {furtherRays, closerRays} = unrenderedRays.reduce((acc, curr) => {
				if (curr.pos.mag > spriteDist) {
					acc.furtherRays.push(curr)
				} else {
					acc.closerRays.push(curr)
				}

				return acc
			}, {furtherRays: [] as Array<Ray>, closerRays: [] as Array<Ray>})

			unrenderedRays = closerRays

			if (furtherRays.length) {
				const rayGroups = groupRays(furtherRays)

				rayGroups.forEach((_rays) => {
					this.drawWalls(
						_rays,
						fov,
						player.lookDir,
						nRays,
						_rays[0].index
					)
				})
			}

			this.drawSprite(furthestUnrenderedSprite, fov, player.pos, player.lookDir, renderDistance)
		}

		if (unrenderedRays.length) {
			const rayGroups = groupRays(unrenderedRays)

			rayGroups.forEach((_rays) => {
				this.drawWalls(
					_rays,
					fov,
					player.lookDir,
					nRays,
					_rays[0].index
				)
			})
		}
	}
}
