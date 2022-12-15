import * as THREE from "three";
import {
  getExpressionName,
  getExpressionWeight,
  XRExpressionType,
} from "./face-api";

export type LerpedAction = any & {
  targetWeight: number
}

export const getAnimationByName = (
  list: THREE.AnimationClip[],
  name: string
): THREE.AnimationClip => {
  return list.find((clip) => {
    return clip.name === name;
  });
};

// CALL THIS ONCE - after the model has been initialized.
// This is very opinionated for this specific model, which assumes that there is
// a 1 frame animation for every facetracking parameter, and a 'rest' pose that
// is the frame of reference.
export const initAnimationsForFacetracking = (
  mixer: THREE.AnimationMixer,
  list: THREE.AnimationClip[]
) => {
  const poseAnimations = [];
  const restPose = getAnimationByName(list, "Rest");
  mixer.clipAction(restPose);
  for (let clip of list) {
    const expression = XRExpressionType[clip.name];
    if (expression !== undefined) {
      THREE.AnimationUtils.makeClipAdditive(clip, 1, restPose);
      poseAnimations.push(clip);
      const action = mixer.clipAction(clip);
      action.play();
      action.setEffectiveWeight(0);
      setAnimationWeight(mixer, clip, 0);
    }
  }
  return poseAnimations;
};

/**
 * Called per-frame while in VR
 */
export const setWeightsForFacetracking = (
  mixer: THREE.AnimationMixer,
  poseList: THREE.AnimationClip[],
  frame
) => {
  for (let clip of poseList) {
    const expression = XRExpressionType[clip.name as string];
    if (expression !== undefined) {
      const weight = getExpressionWeight(frame, expression);
      setAnimationWeight(mixer, clip, weight);
    }
  }
};

export const setRandomWeightsForFace = (
  mixer: THREE.AnimationMixer,
  poseList: THREE.AnimationClip[]
) => {
  for (let clip of poseList) {
    const expression = XRExpressionType[clip.name as string];
    if (expression !== undefined) {
      const weight = Math.random()
      setAnimationWeight(mixer, clip, weight);
    }
  }
}

/**
 * Set animation weight manually, if we don't have any face tracking enabled
 * @param mixer
 * @param clip
 * @param weight
 * @returns
 */
export const setAnimationWeight = (
  mixer: THREE.AnimationMixer,
  clip: THREE.AnimationClip,
  weight: number
) => {
  if (!clip) {
    return;
  }

  const action = mixer.clipAction(clip) as LerpedAction;
  action.setEffectiveTimeScale(1);
  action.targetWeight = weight;
};

export const lerpAnimationWeights = (
  mixer: THREE.AnimationMixer,
  poseList: THREE.AnimationClip[]
) => {
  for (let clip of poseList) {
    const expression = XRExpressionType[clip.name as string];
    if (expression !== undefined) {
      const action = mixer.clipAction(clip) as LerpedAction;
      const expectedWeight = lerp(action.weight || 0, action.targetWeight || 0, 0.5)
      action.setEffectiveWeight(expectedWeight)
    }
  }
}

function lerp(v0, v1, t) {
  return v0*(1-t)+v1*t
}
