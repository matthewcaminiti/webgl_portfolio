/*
Lots of the utils in here were solidly inspired by the WebGL fundamentals king

https://github.com/gfxfundamentals/webgl-fundamentals/blob/a1e698333c08be38acf1536f2b98494b14fff7cc/webgl/resources/webgl-utils.js

Most modifications were to clean up and simplify over-complex code, and to limit functionality
to 2d operations

*/

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement): boolean => {
	// Lookup the size the browser is displaying the canvas in CSS pixels
	const displayWidth = canvas.clientWidth;
	const displayHeight = canvas.clientHeight;

	// Check if the canvas is not the same size
	const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
 
	if (needResize) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}

	return needResize;
}

export const loadContext = (canvas: HTMLCanvasElement): WebGLRenderingContext => {
	const gl = canvas.getContext("webgl")
	if (!gl) {
		throw "Failed to load WebGL context"
	}

	return gl
}

const createShader = (
	gl: WebGLRenderingContext,
	type: number,
	sourceId: string,
): WebGLShader => {
	const shader = gl.createShader(type)

	if (!shader) {
		throw new Error("Failed to create shader")
	}

	gl.shaderSource(shader, document.getElementById(sourceId)?.innerHTML ?? '')
	gl.compileShader(shader)

	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	if (!success) {
		const infoLog = gl.getShaderInfoLog(shader)
		gl.deleteShader(shader)
		throw new Error(infoLog ?? 'Unknown error occurred')
	}

	return shader
}

const createProgram = (
	gl: WebGLRenderingContext,
	vertexId: string,
	fragmentId: string,
): WebGLProgram => {
	const program = gl.createProgram()

	if (!program) {
		throw new Error("Failed to create program")
	}

	gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexId))
	gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentId))

	gl.linkProgram(program)

	const success = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (!success) {
		const infoLog = gl.getProgramInfoLog(program)
		gl.deleteProgram(program)
		throw new Error(infoLog ?? 'Unknown error occurred')
	}

	return program
}

const createUniformSetters = (
	gl: WebGLRenderingContext,
	program: WebGLProgram
): Record<string, (x: any) => void> => {
	let textureUnit = 0

	const createUniformSetter = (
		info: WebGLActiveInfo
	): (x: any) => void => {
		const location = gl.getUniformLocation(program, info.name)
		const type = info.type
		// check if this uniform is an array
		const isArray = (info.size > 1 && info.name.substring(-3) === '[0]')

		switch (type) {
			case gl.FLOAT:
				if (isArray)
					return (v) => gl.uniform1fv(location, v)
				else
					return (v) => gl.uniform1f(location, v)
			case gl.FLOAT_VEC2:
				return (v) => gl.uniform2fv(location, v)
			case gl.FLOAT_VEC3:
				return (v) => gl.uniform3fv(location, v)
			case gl.FLOAT_VEC4:
				return (v) => gl.uniform4fv(location, v)
			case gl.INT:
				if (isArray)
					return (v) => gl.uniform1iv(location, v)
				else
					return (v) => gl.uniform1i(location, v)
			case gl.INT_VEC2:
				return (v) => gl.uniform2iv(location, v)
			case gl.INT_VEC3:
				return (v) => gl.uniform3iv(location, v)
			case gl.INT_VEC4:
				return (v) => gl.uniform4iv(location, v)
			case gl.BOOL:
				return (v) => gl.uniform1iv(location, v)
			case gl.BOOL_VEC2:
				return (v) => gl.uniform2iv(location, v)
			case gl.BOOL_VEC3:
				return (v) => gl.uniform3iv(location, v)
			case gl.BOOL_VEC4:
				return (v) => gl.uniform4iv(location, v)
			case gl.FLOAT_MAT2:
				return (v) => gl.uniformMatrix2fv(location, false, v)
			case gl.FLOAT_MAT3:
				return (v) => gl.uniformMatrix3fv(location, false, v)
			case gl.FLOAT_MAT4:
				return (v) => gl.uniformMatrix4fv(location, false, v)
			case gl.SAMPLER_2D:
			case gl.SAMPLER_CUBE:
				const bindPoint = type === gl.SAMPLER_2D ? gl.TEXTURE_2D : gl.TEXTURE_CUBE_MAP

				if (isArray) {
					const units: Array<number> = []
					for (let i = 0; i < info.size; i++) {
						units.push(textureUnit++)
					}

					return (textures: Array<any>) => {
						gl.uniform1iv(location, units)
						textures.forEach((texture, i) => {
							gl.activeTexture(gl.TEXTURE0 + units[i])
							gl.bindTexture(bindPoint, texture)
						})
					}
				}

				const _textureUnit = textureUnit++
				return (texture: WebGLTexture) => {
					gl.uniform1i(location, _textureUnit)
					gl.activeTexture(gl.TEXTURE0 + _textureUnit)
					gl.bindTexture(bindPoint, texture)
				}
		}

		throw `Unkown type: 0x${type.toString(16)}`
	}

	const uniformSetters: Record<string, (x: any) => void> = {}

	const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)

	for (let i = 0; i < numUniforms; i++) {
		const uniformInfo = gl.getActiveUniform(program, i)
		if (!uniformInfo) break

		uniformSetters[uniformInfo.name] = createUniformSetter(uniformInfo)
	}

	return uniformSetters
}

export interface Attrib {
	value?: Array<number>,
	buffer?: WebGLBuffer,
	size?: number,
	numComponents?: number,
	type?: number,
	normalize?: boolean,
	stride?: number,
	offset?: number,
}

const createAttributeSetters = (
	gl: WebGLRenderingContext,
	program: WebGLProgram
): Record<string, (x: Attrib) => void> => {
	const createAttribSetter = (index: number): (x: Attrib) => void => {
		return (b) => {
			if (b.value) {
				gl.disableVertexAttribArray(index)
				switch (b.value.length) {
					case 4:
						gl.vertexAttrib4fv(index, b.value)
						break
					case 3:
						gl.vertexAttrib3fv(index, b.value)
						break
					case 2:
						gl.vertexAttrib2fv(index, b.value)
						break
					case 1:
						gl.vertexAttrib1fv(index, b.value)
						break
					default:
						throw 'the length of a float constant value must be [1, 4]'
				}
			} else {
				if (!b.buffer) {
					throw 'Cannot create setter for array attribute without `buffer` field'
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer)
				gl.enableVertexAttribArray(index)
				gl.vertexAttribPointer(
					index, // location
					b.size || b.numComponents || 2, // size (num values to pull from buffer per iteration)
					b.type || gl.FLOAT, // type of data in buffer
					b.normalize || false, // normalize
					b.stride || 0, // stride (0 = compute from size and type above)
					b.offset || 0 // offset in buffer
				)
			}
		}
	}

	const attribSetters: Record<string, (x: any) => void> = {}

	const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
	for (let i = 0; i < numAttribs; i++) {
		const attribInfo = gl.getActiveAttrib(program, i)
		if (!attribInfo) break

		const index = gl.getAttribLocation(program, attribInfo.name)
		attribSetters[attribInfo.name] = createAttribSetter(index)
	}

	return attribSetters
}

export interface ProgramInfo {
	program: WebGLProgram,
	uniformSetters: Record<string, (x: any) => void>,
	attributeSetters: Record<string, (x: Attrib) => void>
}

export const createProgramInfo = (
	gl: WebGLRenderingContext,
	vertexSrcId: string,
	fragmentSrcId: string,
): ProgramInfo => {
	const program = createProgram(gl, vertexSrcId, fragmentSrcId)

	const uniformSetters = createUniformSetters(gl, program)
	const attributeSetters = createAttributeSetters(gl, program)

	return {
		program,
		uniformSetters,
		attributeSetters
	}
}

const createBufferFromTypedArray = (
	gl: WebGLRenderingContext,
	array: Float64Array | Float32Array,
	type = gl.ARRAY_BUFFER,
	drawType = gl.STATIC_DRAW,
): WebGLBuffer => {
	const buffer = gl.createBuffer()
	gl.bindBuffer(type, buffer)
	gl.bufferData(type, array, drawType)

	if (!buffer) {
		throw 'Failed to create buffer'
	}
	return buffer
}

export interface BufferInfo {
	numElements: number,
	attribs: Record<string, Attrib>
}

export interface AttribArray {
	numComponents: number,
	data: Float32Array | Float64Array
}

export const createBufferInfoFromArrays = (
	gl: WebGLRenderingContext,
	attribArrays: Record<string, AttribArray>,
): BufferInfo => {
	const attribs: Record<string, Attrib> = {}

	Object.keys(attribArrays).forEach((attribName) => {
		const array = attribArrays[attribName]
		attribs[attribName] = {
			buffer: createBufferFromTypedArray(gl, array.data),
			numComponents: array.numComponents
		}
	})

	if (!attribArrays.a_position) {
		throw 'Cannot create buffer info without `a_position` attribute'
	}

	if (attribArrays.a_position.data.length % attribArrays.a_position.numComponents) {
		throw '`a_position` data length and num components do not match!'
	}

	return {
		numElements: Math.round(attribArrays.a_position.data.length / attribArrays.a_position.numComponents),
		attribs: attribs
	}
}

export const setBuffersAndAttributes = (
	setters: Record<string, (x: Attrib) => void>,
	bufferInfo: BufferInfo
) => {
	Object.keys(bufferInfo.attribs).forEach((attribName) => {
		const setter = setters[attribName]
		if (setter) {
			setter(bufferInfo.attribs[attribName])
		}
	})
}

export const setUniforms = (
	setters: Record<string, (x: any) => void>,
	uniforms: Record<string, any>
) => {
	Object.keys(uniforms).forEach((uniformName) => {
		const setter = setters[uniformName]
		if (setter) {
			setter(uniforms[uniformName])
		}
	})
}
