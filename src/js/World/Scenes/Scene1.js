import { Object3D, BoxGeometry, MeshNormalMaterial, Mesh, Vector2, Vector3 } from 'three'
import AmbientLightSource from '../AmbientLight'
import PointLightSource from '../PointLight'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
gsap.registerPlugin(CustomEase)

export default class Scene1 {
    constructor({ assets, time }) {
        this.assets = assets
        this.time = time

        this.container = new Object3D()
        this.setupScene()
        App.scene.add(this.container)
    }

    setupScene() {
        this.stairs = this.assets.models.Ernest_M2.scene
        this.stairs.scale.set(0.06, 0.06, 0.06)
        this.stairs.position.x = -60
        this.stairs.position.z = 36
        this.stairs.position.y = -4
        this.stairs.rotation.y = Math.PI/2
        this.container.add(this.stairs)

        this.ambientlight = new AmbientLightSource({
            debug: this.debugFolder,
        })
        this.container.add(this.ambientlight.container)

        this.light = new PointLightSource({
            debug: this.debugFolder,
        })
        this.container.add(this.light.container)

        // init camera
        this.camera = App.camera.camera
        this.cameraContainer = App.camera.container
        this.camera.position.z = 20

        setTimeout(
            () => {this.climbStairs(8)},
        1000)
    }

    climbStairs(nbStairs) {
        console.log('hey');
      const EaseY = CustomEase.create(
        'custom',
        'M0,0 C0.134,0.022 0.524,1.027 0.856,1.028 0.92,1.028 0.96,1.01 1,1 '
      )

          // init camera position rotation
          gsap.to(this.camera.rotation, {
            x: 0,
            y: 0,
            z: 0,
            ease: "power1.inOut",
            duration: 1.2,
          })

      let tl = gsap.timeline().play(-.8)

      for (let i = 0; i < nbStairs; i++) {
          const mult = i % 2 == 0 ? -1 : 1
          
        tl.to(this.camera.position, {
          y: '+=2',
          ease: EaseY,
          duration: 1,
        }).to(this.camera.position, {
          z: "-=2",
          ease: "linear",
          duration: 1,
        }, "-=1")
        .to(this.cameraContainer.rotation, {
          x: -0.02 * mult,
          y: 0.01,
          z: 0.01 * mult,
          ease: "linear",
          duration: 1,
        }, "-=1")

        this.createFootstep()
      }

      console.log('played')

      gsap.to(this.cameraContainer.rotation, {
        x: 0,
        y: 0,
        z: 0,
        ease: "power1.inOut",
        delay: nbStairs,
        duration: 1.2,
      })

    }

    createFootstep() {}

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}