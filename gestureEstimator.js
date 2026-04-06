/**
 * Creates a new gesture for the Sayajin Effect to be used by the Gesture Estimator.
 * @returns A new gesture to be registed in the Gesture Estimar.
 */
function createSayajinAuraGesture() {
    const sayajinAura = new fp.GestureDescription('sayajin_aura')
    sayajinAura.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1)
    sayajinAura.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1)
    sayajinAura.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1)
    sayajinAura.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1)
    sayajinAura.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1)
    sayajinAura.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1)
    return sayajinAura
}

export const GE = new fp.GestureEstimator([createSayajinAuraGesture()])