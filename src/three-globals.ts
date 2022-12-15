import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

export let scene: THREE.Scene = new THREE.Scene()
export let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
	60,
	WIDTH / HEIGHT,
	0.1,
	1000
)
export let renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
	antialias: true, alpha: true
})

export let controls: OrbitControls
export let cameraGroup = new THREE.Group()

const loopFunctions = []

export const initTHREE = () => {
	//scene.background = new THREE.Color(0x505050)

    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.RGBAEncoding;
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(WIDTH, HEIGHT)
	renderer.xr.enabled = true
	let sessioninit = {};

	sessioninit.requiredFeatures = [`expression-tracking`];

	document.body.appendChild(ARButton.createButton(renderer, sessioninit))
	//document.body.appendChild(VRButton.createButton(renderer))
	document.body.appendChild(renderer.domElement)

	;(camera as any).position.set(0, 1.6, 0)
	cameraGroup.add(camera)
	scene.add(cameraGroup)

	renderer.setAnimationLoop(loop)

	window.addEventListener('resize', onWindowResize)

	controls = new OrbitControls(camera, renderer.domElement)

	return { scene, camera, renderer }
}

export const addLoopFunction = (f) => {
	loopFunctions.push(f)
}

const loop = (time, frame) => {
	for (let f of loopFunctions) {
		f(time, frame, renderer)
	}

	// the render needs to be the last thing that happens, after we have
	// performed every other calculation
	renderer.render(scene, camera)
}

const onWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}
