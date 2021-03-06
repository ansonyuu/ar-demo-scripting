import Scene from "Scene";
import Animation from "Animation";
import Diagnostics from "Diagnostics";
import TouchGestures from "TouchGestures";
import Reactive from "Reactive";

const sceneRoot = Scene.root;

// finds base in object, runs function when found
Promise.all([
  sceneRoot.findFirst("base_jnt"),
  sceneRoot.findFirst("speaker_left_jnt"),
  sceneRoot.findFirst("speaker_right_jnt"),
  sceneRoot.findFirst("planeTracker0"),
  sceneRoot.findFirst("placer")
]).then(function (objects) {
  // 0. IDENTIFY ITEMS IN OBJECT
  const base = objects[0];
  const speakerLeft = objects[1];
  const speakerRight = objects[2];
  const planeTracker = objects[3];
  const placer = objects[4];

  // 1.0 CREATING DRIVER FOR BASE
  // sets parameters for animation driver
  const baseDriverParameters = {
    durationMilliseconds: 600, //l ength of animation
    loopCount: Infinity, // animation loop count
    mirror: true // specifies return to starting value after loop
  };
  // creates driver based off parameters
  const baseDriver = Animation.timeDriver(baseDriverParameters);
  baseDriver.start();

  // 1.1 CREATING SAMPLER FOR BASE
  // specifies beginning and end values + easing function
  const baseSampler = Animation.samplers.easeInQuint(0.9, 1);

  // 1.2 COMBINE SAMPLER AND DRIVER FOR BASE
  // return Scalarsignal
  const baseAnimation = Animation.animate(baseDriver, baseSampler);

  // 1.3 TRANSFORM BASE
  // access transform details of base, returns TransformSignal
  const baseTransform = base.transform;
  // changes scale of base, binds to
  baseTransform.scaleX = baseAnimation;
  baseTransform.scaleY = baseAnimation;
  baseTransform.scaleZ = baseAnimation;

  // 2.0 CREATING DRIVER FOR SPEAKER
  const speakerDriverParameters = {
    durationMilliseconds: 200, //l ength of animation
    loopCount: Infinity, // animation loop count
    mirror: true // specifies return to starting value after loop
  };
  // creates driver based off parameters
  const speakerDriver = Animation.timeDriver(speakerDriverParameters);
  speakerDriver.start();

  // 2.1 CREATING SAMPLER FOR SPEAKER
  // specifies beginning and end values + easing function
  const speakerSampler = Animation.samplers.easeOutElastic(0.7, 0.85);

  // 2.2 COMBINE SAMPLER AND DRIVER FOR BASE
  // return Scalarsignal
  const speakerAnimation = Animation.animate(speakerDriver, speakerSampler);

  // 2.3 TRANSFORM SPEAKERS
  // access transform details of base, returns TransformSignal
  const speakerLeftTransform = speakerLeft.transform;
  // changes scale of base, binds to
  speakerLeftTransform.scaleX = speakerAnimation;
  speakerLeftTransform.scaleY = speakerAnimation;
  speakerLeftTransform.scaleZ = speakerAnimation;

  const speakerRightTransform = speakerRight.transform;
  // changes scale of base, binds to
  speakerRightTransform.scaleX = speakerAnimation;
  speakerRightTransform.scaleY = speakerAnimation;
  speakerRightTransform.scaleZ = speakerAnimation;

  // 3.0 MOVING OBJECT ON PAN
  // callback function running every time pan gesture is detected, returns EventSource
  TouchGestures.onPan().subscribe(function (gesture) {
    // move plane tracker according to location and state of gesture
    planeTracker.trackPoint(gesture.location, gesture.state);
  });

  // 4.0 MOVING OBJECT ON PINCH
  const placerTransform = placer.transform;

  // 4.1 TRANSFORM ON PINCH
  // callback function running every time pan gesture is detected, returns EventSource
  TouchGestures.onPinch().subscribeWithSnapshot(
    {
      lastScaleX: placerTransform.scaleX,
      lastScaleY: placerTransform.scaleY,
      lastScaleZ: placerTransform.scaleZ
    },
    function (gesture, snapshot) {
      placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
      placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
      placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
    }
  );

  // 5.0 MOVING OBJECT ON ROTATE
  // callback function running every time pan gesture is detected, returns EventSource
  TouchGestures.onRotate().subscribeWithSnapshot(
    {
      lastRotationY: placerTransform.rotationY
    },
    function (gesture, snapshot) {
      const correctRotation = gesture.rotation.mul(-1);
      placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
    }
  );
});
