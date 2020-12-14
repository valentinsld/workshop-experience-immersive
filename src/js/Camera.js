import { Object3D, PerspectiveCamera, Euler } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

export default class Camera {
  constructor(options, time) {
    // Set Options
    this.sizes = options.sizes
    this.renderer = options.renderer
    this.debug = options.debug
    this.time = options.time

    // Set up
    this.container = new Object3D()
    this.container.name = 'Camera'

    // inspired from PointerLockControls
    this.euler = new Euler(0, 0, 0, 'YXZ')
    this.eulerStack = { x: 0, y: 0 }
    this.baseCursorPosition = {x: 0, y: 0}
    this.euler.setFromQuaternion( this.container.quaternion )

    // TODO: complete calibration
    window.addEventListener('mousemove', e => {
      this.baseCursorPosition.x = e.clientX
      this.baseCursorPosition.y = e.clientY
    }, { once: true })

    window.addEventListener('mousemove', e => {
      this.eulerStack.y -= e.movementX * 0.0002
      this.eulerStack.x -= e.movementY * 0.002
      
      if (this.animation) this.animation.kill()
      this.animation = gsap.to(this.euler, {
        y: this.eulerStack.y,
        x: this.eulerStack.x,
        duration: 0.5,
        ease: "power4.easeOut"
      })
    })
    
    this.time.on('tick', () => {
      if (!this.orbitControls.enabled) this.camera?.quaternion.setFromEuler( this.euler )
    })

    this.setCamera()
    this.setPosition()
    this.setOrbitControls()
  }
  setCamera() {
    // Create camera
    this.camera = new PerspectiveCamera(
      75,
      this.sizes.viewport.width / this.sizes.viewport.height,
      0.1,
      1000
    )
    this.container.add(this.camera)
    // Change camera aspect on resize
    this.sizes.on('resize', () => {
      this.camera.aspect =
        this.sizes.viewport.width / this.sizes.viewport.height
      // Call this method because of the above change
      this.camera.updateProjectionMatrix()
    })
  }
  setPosition() {
    // Set camera position
    this.camera.position.x = 0
    this.camera.position.y = 1
    this.camera.position.z = 5
  }
  setOrbitControls() {
    // Set orbit control
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.orbitControls.enabled = false
    this.orbitControls.enableKeys = true
    this.orbitControls.zoomSpeed = 1

    if (this.debug) {
      this.debugFolder = this.debug.addFolder('Camera')
      this.debugFolder.open()
      this.debugFolder
        .add(this.orbitControls, 'enabled')
        .name('Enable Orbit Control')
    }
  }
}
