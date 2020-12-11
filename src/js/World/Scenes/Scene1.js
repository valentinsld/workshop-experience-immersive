import { Object3D, BoxGeometry, MeshNormalMaterial, Mesh } from 'three'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
gsap.registerPlugin(CustomEase)

export default class Scene1 {
    constructor({ assets }) {
        this.assets = assets

        this.container = new Object3D()
        this.setupScene()
        App.scene.add(this.container)
    }

    setupScene() {
        // this.suzanne = this.assets.models.suzanne.scene
        // this.container.add(this.suzanne)

      // create
      for(let i = -5 ; i < 5; i++) {
          const geometry = new BoxGeometry( 20, 2, 2 );
          const material = new MeshNormalMaterial();
          const cube = new Mesh( geometry, material );
          cube.position.y = i * 2
          cube.position.z = -i * 2
          this.container.add( cube );
      }

    // init camera
    this.camera = App.camera.camera
    this.camera.position.y = -4
    this.camera.position.z = 20

    setTimeout(
      () => {this.climbStairs(8)},
     1000)
  }

  climbStairs(nbStairs) {
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
      .to(this.camera.rotation, {
        x: -0.02 * mult,
        y: 0.01,
        z: 0.01 * mult,
        ease: "linear",
        duration: 1,
      }, "-=1")
    }

    console.log('played')

    gsap.to(this.camera.rotation, {
      x: 0,
      y: 0,
      z: 0,
      ease: "power1.inOut",
      delay: nbStairs,
      duration: 1.2,
    })

  }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}