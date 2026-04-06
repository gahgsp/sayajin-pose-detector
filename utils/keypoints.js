import { FINGER_COLORS, FINGER_KEYPOINTS } from '../constants.js'

/**
 * Draws a circle / point in the respective position passed as parameter.
 * @param {*} ctx The Canvas Context.
 * @param {*} x The x position.
 * @param {*} y The y position.
 * @param {*} r The radius of the circle / point.
 */
function drawPoint(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = 'white'
  ctx.fill()
}

/**
 * Creates a single Array to store all the mapped 3D keypoints from the hands: 1 for wrist and 4 for the 5 fingers that totals to 21 keypoints.
 * This is created for performance purposes since in the first draft I was creating an Array every iteration (a lot of times per second).
 * To avoid the GC pausing the application to free up RAM, we have a permanent and single stored Array to save the values for the keypoints.
 */
const THREE_D_KEYPOINTS_POOL = Array.from({ length: 21 }, () => [0, 0, 0])
/**
 * Transforms an object of type { x: number, y: number, z: number } to single positions in an Array.
 * @param keypoints3D The keypoints mapped by the vision model. 
 * @returns The updated pool of keypoints with the corresponding values from the hand that is currently being iterated on.
 */
export function transform3DKeypoints(keypoints3D) {
  for (let i = 0; i < keypoints3D.length; i++) {
    THREE_D_KEYPOINTS_POOL[i][0] = keypoints3D[i].x
    THREE_D_KEYPOINTS_POOL[i][1] = keypoints3D[i].y
    THREE_D_KEYPOINTS_POOL[i][2] = keypoints3D[i].z
  }
  return THREE_D_KEYPOINTS_POOL
}

export function drawKeypoint(ctx, keypoints) {
  for (let i = 0; i < keypoints.length; i++) {
    drawPoint(ctx, keypoints[i].x, keypoints[i].y, 3)
  }

  const fingers = Object.keys(FINGER_KEYPOINTS)
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i]
    const fingerPath = FINGER_KEYPOINTS[finger].map((idx) => keypoints[idx])

    ctx.beginPath()
    ctx.strokeStyle = FINGER_COLORS[finger]
    ctx.moveTo(fingerPath[0].x, fingerPath[0].y)
    for (let j = 1; j < fingerPath.length; j++) {
      ctx.lineTo(fingerPath[j].x, fingerPath[j].y)
    }
    ctx.stroke()
  }
}
