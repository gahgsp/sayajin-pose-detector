# Sayajin Pose Detector

The main goal of this project was to have a quick hands-on experience using
tools from the so-called AI on the Edge.

Besides having a working project, I worked and iterated over it during my
learning process applying best practices from the field of AI on the Edge and
learned a bit more about WebGL as well.

## Stack

For this project I mainly used the following technologies:

- JavaScript
- [TensorFlow](https://www.tensorflow.org/js)
- [MediaPipe](https://ai.google.dev/edge/mediapipe/)
- [FingerPose](https://github.com/andypotato/fingerpose)

## How to Run

First you will need some way of serving this application. For this goal, I used
the package [serve](https://www.npmjs.com/package/serve).

As for the video effect, you can download any video from platforms like Youtube
that contains the chroma-key effect (a strong green background color) to be
applied.

When the application is executed for the first time, you will probably be
required to allow the browser to access your camera / webcam. Please, allow it
and refresh the page.

```bash
npx serve
```

## How to Use

After the initialization of the application, looking at the camera you can make
the gesture of a clenched fist with both hands. After a few miliseconds for
inference, you should see the effect being applied to video coming from your
camera / webcam.

## Learnings

### MediaPipe vs Bundlers

This project first initiated of a Vite project and afterwards moved to the
NextJS platform.

However, as it is possible to see, both of these previous approaches were
unsuccessful.

I learned that `MediaPipe` is packaged as a browser library and not a true
`ES module`. It loads `WebAssembly` files during runtime using specific file
paths and exposes its API through `CommonJS`.

By importing it directly from a CDN via script tag, it can resolve the paths
correctly.

### WebGL Shaders

I already knew that handling individual pixels by using shaders had a gain in
performance. But in this project I could really experience how a big of a
difference it makes.

The first version of drawing the effect in the canvas and applying the
chroma-key effect looked like this:

```js
/**
 * We draw the composition for the aura effect offscreen and then we append afterwards the result to the main canvas.
 */
maskedCtx.drawImage(auraVideo, 0, 0, maskedCanvas.width, maskedCanvas.height);
// As we need to have information from every single pixel, we extract this information as Uint8ClampedArray.
const frame = maskedCtx.getImageData(
  0,
  0,
  maskedCanvas.width,
  maskedCanvas.height,
);
// Each pixel takes 4 places in the array we just extracted: [R, G, B, A].
// Therefore, dividing it by 4 gives us the total amount of pixels being displayed.
const data = frame.data;
const amountOfPixels = data.length / 4;

for (let i = 0; i < amountOfPixels; i++) {
  // As each pixels takes 4 places (as previously explained), we need to use it as a "padding" to access
  // the correct pixel information.
  const pIdx = i * 4;
  // To apply the chroma-key effect, we check if the color of the current pixel is extremely green.
  if (data[pIdx + 0] < 100 && data[pIdx + 1] > 100 && data[pIdx + 2] < 100) {
    // If it is, then we apply to the "opacity slot" the value of 0 to make it "transparent".
    data[pIdx + 3] = 0;
  }
}
maskedCtx.putImageData(frame, 0, 0);
```

When the effect was being displayed, I achieved a bit more than 50 ~ 60 FPS.

After moving to a `WebGL Shader` the FPS remains at 90~100+ FPS even when
running the effect.

### Canvas Optimization

Something completely new for me was to discover about the property
`willReadFrequently` in the `canvas` element.

When this property is set to `true`, we tell the user agent that the webpage
will perform many readback operations and therefore it can apply specific
software optimizations to the `canvas`.
