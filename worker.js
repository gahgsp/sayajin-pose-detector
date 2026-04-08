importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection'
)

let detector = null

async function initializeModel() {
  console.log('[START] Loading Hand Detection model...')
  detector = await handPoseDetection.createDetector(
    handPoseDetection.SupportedModels.MediaPipeHands, {
    maxHands: 2,
    modelType: 'lite',
    runtime: 'tfjs',
  })
  console.log('[END] Loading Hand Detection model...')

  // After the loading of the model is done, we notify the main thread
  // that we are ready to start inferencing.
  postMessage({ type: 'READY' })
}

onmessage = async (event) => {
  if (!detector) return

  if (event.data.type === 'INFERENCE') {
    // Extract the frame from the received data from the main thread.
    const frame = event.data.frame
    // We run normally the estimation.
    const hands = await detector.estimateHands(frame)
    // Afterwards we send the message back to the main thread with the result of the estimation.
    postMessage({ type: 'RESULT', hands })
    // Close the BitMap channels to avoid memory leaks.
    frame.close()
  }
}

initializeModel()