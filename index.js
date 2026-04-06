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

async function initializeModel() {
  console.log('[START] Loading Hand Detection model...')
  const detector = await handPoseDetection.createDetector(
    handPoseDetection.SupportedModels.MediaPipeHands, {
    maxHands: 2,
    modelType: 'lite',
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
  })
  console.log('[END] Loading Hand Detection model...')
  return detector
}

async function runInference(handDetector) {
  const HAND_INFERENCE_INTERVAL_IN_MS = 60

  // We will only run the inference if the video is actually playing.
  if (video.readyState >= 2) {
    currentHands = await handDetector.estimateHands(video)

    // We only want to start the detection of the gesture after identifying two hands...
    isAuraActive = currentHands.length >= 2 && currentHands.every((currentHand) => {
      // As for this pose we require both hands to be doing the same gesture, we iterateve and estimate them individually.
      return GE.estimate(transform3DKeypoints(currentHand.keypoints3D), 9).gestures.length > 0
    })
  }

  // For performance reasons, we can allow ourselves to run the inference only every a specific time interval.
  setTimeout(() => runInference(handDetector), HAND_INFERENCE_INTERVAL_IN_MS)
}

function draw() {
  if (canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    maskedCanvas.width = video.videoWidth
    maskedCanvas.height = video.videoHeight
    // Initiate the WebGL Renderer and Shaders.
    auraRenderer = createWebGLRenderer(maskedCanvas)
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(video, 0, 0)

  if (isAuraActive && auraRenderer) {
    if (maskedCanvas.width !== video.videoWidth) {
      maskedCanvas.width = video.videoWidth
      maskedCanvas.height = video.videoHeight
    }

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
    const handDetector = await initializeModel()

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
        runInference(handDetector)
        draw()
      }
    }).catch(console.error)

  } catch (error) {
    console.error('An error happened while loading the models.', error)
  }
}

initialize()