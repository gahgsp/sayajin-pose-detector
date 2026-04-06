const VS_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`

const FS_SOURCE = `
  precision lowp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  const float THRESHOLD = 0.39;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    if (color.r < THRESHOLD && color.g > THRESHOLD && color.b < THRESHOLD) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      gl_FragColor = color;
    }
  }
`

export function createWebGLRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true })

  const createProgram = (vs, fs) => {
    const p = gl.createProgram();
    [vs, fs].forEach((src, i) => {
      const s = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      gl.attachShader(p, s)
    })
    gl.linkProgram(p)
    return p
  }

  const program = createProgram(VS_SOURCE, FS_SOURCE)
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW)

  const posLoc = gl.getAttribLocation(program, "a_position")
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0 // Note: Y is flipped for WebGL
  ]), gl.STATIC_DRAW)

  const texLoc = gl.getAttribLocation(program, "a_texCoord")
  gl.enableVertexAttribArray(texLoc)
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  return {
    render: (sourceVideo) => {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceVideo)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  }
}