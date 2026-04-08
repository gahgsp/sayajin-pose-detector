import { createWebGLRenderer } from './webGLRenderer.js'
import { drawKeypoint, transform3DKeypoints } from './utils/keypoints.js'
import { GE } from './gestureEstimator.js'

const video = document.getElementById('webcam')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

/**
 * If we play / stop at inference time there is a short sttutering when displaying the aura effect.
 * To avoid it, we keep playing it for as long as this page is visible.
 */
auraVideo.play()

let animationId = 0

let currentHands = []
let isAuraActive = false

// TODO: Probably move this to the HTML since it is always created anyways.
const maskedCanvas = document.createElement('canvas')
let auraRenderer = null

const worker = new Worker('worker.js')
let isWorkerReady = false
let isInferencing = false

let lastInferenceTime = 0
const HAND_INFERENCE_INTERVAL_IN_MS = 60

worker.addEventListener('message', ({ data: { type, hands } }) => {
  if (type === 'READY') {
    isWorkerReady = true
  } else if (type === 'RESULT') {
    currentHands = hands

    // We only want to start the detection of the gesture after identifying two hands...
    isAuraActive = currentHands.length >= 2 && currentHands.every((currentHand) => {
      // As for this pose we require both hands to be doing the same gesture, we iterateve and estimate them individually.
      return GE.estimate(transform3DKeypoints(currentHand.keypoints3D), 9).gestures.length > 0
    })

    isInferencing = false
  }
})

async function runInference() {
  isInferencing = true

  /**
   * We extract the image as a hardware-accelerated bitmap object, so we can bypass a drawing to the canvas.
   */
  const bitmap = await createImageBitmap(video, {
    resizeQuality: 'pixelated' // Reducing the quality for better performance.
  })

  /**
   * When using Web Workers, we can post a message with the second parameter to "transfer the ownership" to the worker.
   * This means that instead of creating and sending a copy to the worker, we are giving the original reference to it.
   */
  worker.postMessage({ type: 'INFERENCE', frame: bitmap }, [bitmap])
}

function draw(timestamp) {
  if (canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    maskedCanvas.width = video.videoWidth
    maskedCanvas.height = video.videoHeight
    // Initiate the WebGL Renderer and Shaders.
    auraRenderer = createWebGLRenderer(maskedCanvas)
  }

  if (video.readyState >= 2 && isWorkerReady && !isInferencing && timestamp - lastInferenceTime >= HAND_INFERENCE_INTERVAL_IN_MS) {
    lastInferenceTime = timestamp
    runInference()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(video, 0, 0)

  if (isAuraActive && auraRenderer) {
    // If we identified the gesture, we can render the aura effect.
    auraRenderer.render(auraVideo)

    ctx.save()
    const scale = 2
    // Currently we do not have the proper position of the segmented person so we position the effect in the middle of the screen.
    const dx = (canvas.width - canvas.width * scale) / 2
    const dy = (canvas.height - canvas.height * scale) / 2

    // Finally we draw the final composition's result to the main canvas to show the effect.
    ctx.drawImage(maskedCanvas, dx, dy, canvas.width * scale, canvas.height * scale)
    ctx.restore()
  }

  for (let i = 0; i < currentHands.length; i++) {
    drawKeypoint(ctx, currentHands[i].keypoints)
  }

  animationId = requestAnimationFrame(draw)
}

async function initialize() {
  try {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
        // We want to start immediately inferecing so we pass 0.
        draw(0)
      }
    }).catch(console.error)

  } catch (error) {
    console.error('An error happened while loading the models.', error)
  }
}

initialize()