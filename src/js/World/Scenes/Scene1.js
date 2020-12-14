import { Object3D, Mesh, Vector3, Vector2, Euler, DoubleSide, Raycaster, ShaderMaterial, MeshBasicMaterial, MeshStandardMaterial,RepeatWrapping, EquirectangularReflectionMapping, MeshFaceMaterial, PlaneBufferGeometry } from 'three'
import AmbientLightSource from '../AmbientLight'
import PointLightSource from '../PointLight'
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";


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
        this.camera.position.z = 27
        this.camera.position.y = 2.5


        // raycast
        // TODO: make this optional so that it is not set on all scenes
        const camera = this.cameraInstance = App.camera
        camera.raycaster = new Raycaster(
          camera.camera.position,
          new Vector3(0, -1, 0)
        )
        camera.time.on('tick', () => camera.raycaster.set(
          camera.camera.position,
          new Vector3(0, -1, 0)
        ))
        window.addEventListener('keypress', e => console.log(camera.raycaster.intersectObject(this.stairs.getObjectByName('Escalier'), true)))

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
          y: '+=1',
          ease: EaseY,
          duration: 1,
        }).to(this.camera.position, {
          z: "-=2.1",
          ease: "linear",
          duration: 1,
        }, "-=1")
        .to(this.cameraContainer.rotation, {
          x: -0.02 * mult,
          y: 0.01,
          z: 0.01 * mult,
          ease: "linear",
          duration: 1,
          onComplete: () => this.createFootstep(i)
        }, "-=1")
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

    createFootstep(stepIndex) {
      const stairs = this.stairs.getObjectByName('Escalier')
      const position = this.cameraInstance.raycaster.intersectObject(stairs, true)[0].point
      const orientation = new Euler(-Math.PI/2, 0, 0)
      const size = new Vector3(2, 1.2, 200)
      // const geometry = new DecalGeometry( stairs, position, orientation , size );
      const geometry = new PlaneBufferGeometry(2, 2)
      const material = new ShaderMaterial( { 
        side: DoubleSide,
        transparent: true,
        vertexShader: require('@shaders/footstep.vert').default,
        fragmentShader: [require('@shaders/utils/simplexNoise.glsl').default, require('@shaders/footstep.frag').default].join('\n'),
        // fragmentShader: require('@shaders/footstep.frag').default
      } );

      console.log(material.fragmentShader);

      // /** @type Texture */
      // this.assets.textures.banksy.wrapS = RepeatWrapping
      // this.assets.textures.banksy.wrapT = RepeatWrapping
      // this.assets.textures.banksy.mapping = EquirectangularReflectionMapping

      // const material = new MeshStandardMaterial({
      //   map: this.assets.textures.banksy
      // })

      // const material = new MeshBasicMaterial( { color: 0x00ff00, side: DoubleSide } )
      const mesh = new Mesh( geometry, material );
      mesh.position.copy(position)
      mesh.rotation.copy(orientation)
      mesh.position.z += 0.1
      mesh.position.y += 0.01
      
      if(stepIndex % 2 === 0) mesh.position.x += 1
      else mesh.position.x -= 1

      this.container.add( mesh )
    }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}