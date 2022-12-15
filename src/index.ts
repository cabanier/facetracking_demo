import * as THREE from "three";
import {
  addLoopFunction,
  controls,
  initTHREE,
  renderer,
  scene,
} from "./three-globals";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  getAnimationByName,
  initAnimationsForFacetracking,
  lerpAnimationWeights,
  setRandomWeightsForFace,
  setWeightsForFacetracking,
} from "./animations";

type TrackedBone = THREE.Bone & {
  transforms: Record<
    number,
    {
      minPosition: THREE.Vector3;
      maxPosition: THREE.Vector3;
    }
  >;
};

// TODO: move individual bones.
// These should control other bones that deal with face movement.
let headBone, neckBone;

const init = async () => {
  initTHREE();

  // Body parts

  const body_group = new THREE.Group();
  scene.add(body_group);
  //body_group.position.setY(1.6);
  //body_group.position.y  = - 1.2;
  body_group.position.setZ(-0.5);
  //const quaternion = new THREE.Quaternion();
  //quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI );
  //body_group.quaternion.multiply(quaternion);
  const scale = new THREE.Vector3(1, 1, -1);
  body_group.scale.multiply(scale);

  const body_geomtery = new THREE.BoxGeometry(0.02, 0.02, 0.02);

  for (let i = 0; i < 70; i++) {
    const part = new THREE.Mesh(
      body_geomtery,
      new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.7,
        metalness: 0.0,
      })
    );
    body_group.add(part);
  }

  const loader = new GLTFLoader();

  const gltf = await loader.loadAsync("/assets/facerig.glb");

  const model = gltf.scene;

  // head and neck bones can be manipulated in THREE.JS
  headBone = model.getObjectByName("DEF-Head");
  neckBone = model.getObjectByName("DEF-Neck");
  console.log(model);
  scene.add(model);
  model.position.setY(0.2);
  model.position.setZ(-0.5);

  controls.target = model.position;
  controls.update();

  // lights
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1.5, 1).multiplyScalar(10);
  light.shadow.mapSize.setScalar(2048);
  light.shadow.bias = -1e-4;
  light.shadow.normalBias = 0.05;
  light.castShadow = true;
  scene.add(light);

  const helper = new THREE.SkeletonHelper(model);
  // scene.add(helper);

  // animations
  const mixer = new THREE.AnimationMixer(model);

  const poseList = initAnimationsForFacetracking(mixer, gltf.animations as any);

  const demoAction = mixer.clipAction(
    getAnimationByName(gltf.animations, "BLockingAction")
  );
  demoAction.play();

  let firstFrame = true;

  renderer.xr.addEventListener("sessionstart", () => {
    if (renderer.xr.getSession().updateTargetFrameRate) {
      renderer.xr.getSession().updateTargetFrameRate(72);
    }
  });

  addLoopFunction((time, frame, renderer) => {
    controls.update();

    // gotcha: you need to run the mixer's update function in requestAnimationFrame...
    // https://discourse.threejs.org/t/cant-get-gltf-animation-to-play-but-it-works-in-the-gltf-viewer/14334
    mixer.update(0.016);

    if (renderer.xr.isPresenting) {
      lerpAnimationWeights(mixer, poseList);
      if (firstFrame) {
        firstFrame = false;
        demoAction.enabled = false;

        if (!frame.expressions) {
          setInterval(() => {
            setRandomWeightsForFace(mixer, poseList);
          }, 2000);
        }
      }
      // TODO: use a better way to check whether face tracking is enabled
      if (frame.expressions) {
        setWeightsForFacetracking(mixer, poseList, frame);
      }
    }
  });

  let ascending = true;
  let tempWeight = 0;

  let rightEyeTrack = model.getObjectByName("DEF-EyeR");
  let leftEyeTrack = model.getObjectByName("DEF-EyeL");

  let baseY = rightEyeTrack.position.y;
  addLoopFunction((time, frame, renderer) => {
    if (renderer.xr.isPresenting && frame.expressions) {
      rightEyeTrack.rotation.x = (frame.expressions.get("eyes_look_up_right")-frame.expressions.get("eyes_look_down_right"))/3;
      rightEyeTrack.rotation.z = (frame.expressions.get("eyes_look_right_right")-frame.expressions.get("eyes_look_left_right"))/3;
      leftEyeTrack.rotation.x = (frame.expressions.get("eyes_look_up_left")-frame.expressions.get("eyes_look_down_left"))/3;
      leftEyeTrack.rotation.z = (frame.expressions.get("eyes_look_right_left")-frame.expressions.get("eyes_look_left_left"))/3;
    } else {
      // just roll the eyes up and down if we're not presenting
      if (ascending) {
        tempWeight += 0.01;
        if (tempWeight >= 1) {
          tempWeight = 1;
          ascending = false;
        }
      } else {
        tempWeight -= 0.01;
        if (tempWeight <= 0) {
          tempWeight = 0;
          ascending = true;
        }
      }
      rightEyeTrack.rotation.x = tempWeight * 0.4;
      leftEyeTrack.rotation.x = tempWeight * 0.4;
    }
  });
};

window.addEventListener("load", init);
