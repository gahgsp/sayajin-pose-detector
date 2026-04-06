/**
 * Represents the index position for the keypoints respective to a specific finger.
 * The 0 index is the index for the wrist keypoint which is used as the starting point for all the fingers.
 */
export const FINGER_KEYPOINTS = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinkyFinger: [0, 17, 18, 19, 20]
}

/**
 * Defines the colors for the lines when detecting hands for each finger.
 */
export const FINGER_COLORS = {
  thumb: 'green',
  indexFinger: 'yellow',
  middleFinger: 'red',
  ringFinger: 'blue',
  pinkyFinger: 'pink'
}