import { MeshStandardMaterial, Object3D, PlaneBufferGeometry, PointLight, AmbientLight, SpotLight, SpotLightHelper, Mesh, Vector3, Euler, DoubleSide, Raycaster, ShaderMaterial, MeshBasicMaterial, Vector2, RectAreaLight } from 'three'
import AmbientLightSource from '../AmbientLight'
import PointLightSource from '../PointLight'
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";

import { cloneDeep } from 'lodash'

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
        this.stairs = this.assets.models['Ernest_1412H2140(2)'].scene
        this.stairs.scale.set(0.06, 0.06, 0.06)
        this.stairs.position.x = -60
        this.stairs.position.z = 36
        this.stairs.position.y = -4
        this.stairs.rotation.y = Math.PI/2
        this.container.add(this.stairs)

        this.stairs.children[0].children.forEach(child => {
            if(child.material) child.material.roughness = .75
            if(child.children) child.children.forEach(cc => {cc.material.roughness = .6})
        })
        
        const plan = this.stairs.getObjectByName("mesh_12_5")
        if(plan) plan.material.roughness = 1

        // Ambient light
        this.ambienteLight = new AmbientLight(0x316fcc, 0.12)
        this.container.add(this.ambienteLight)

        // Light
        this.light = new PointLight(0x316fcc, 0.32, 0, 2)
        this.light.castShadow = true
        this.light.position.set(9.45, 7, 45)
        this.container.add(this.light)

        // Spot light
        this.spotLight = new SpotLight( 0x3A5DDE, 3, 400, 0.450, 1, 6.9 );
        this.spotLight.position.set( -10, 55, -10 );

        this.container.add( this.spotLight );

        const targetObject = new Object3D();
        targetObject.position.set(15 ,0 ,45)
        this.container.add(targetObject);
        
        this.spotLight.target = targetObject;

        // rectLight Bis
        const rectLightG = new RectAreaLight( 0x3A5DDE, 1,  20, 50 );
        rectLightG.position.set( 3.3, 20, 0 );
        rectLightG.rotation.set( 1.9, Math.PI, 0 );
        this.container.add( rectLightG )

        // light for metro maps
        const rectLight = new RectAreaLight( 0xffffff, .15,  8.42, 6 );
        rectLight.position.set( -14.14, 3.410, 30.8 );
        this.container.add( rectLight )

        // init camera
        this.camera = App.camera.camera
        this.cameraContainer = App.camera.container
        this.camera.position.z = 27
        this.camera.position.y = 4.5

        // raycast
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

        const stairs = this.stairs.getObjectByName('Escaliers_3')

        const texture1 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture1.offset = new Vector2(0, -0.100)
        texture1.repeat = new Vector2(2.040, 3.030)
        const texture2 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture2.offset = new Vector2(-1.710, -1.070)
        texture2.repeat = new Vector2(2.040, 3.030)
        const texture3 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture3.offset = new Vector2(0, -2.100)
        texture3.repeat = new Vector2(2.040, 3.030)
        
        const materials = [
          cloneDeep(this.stairs.getObjectByName('barrière_Left').material),
          new MeshStandardMaterial({ map: texture1, transparent: true }),
          new MeshStandardMaterial({ map: texture2, transparent: true }),
          new MeshStandardMaterial({ map: texture3, transparent: true })
        ]
        stairs.geometry.clearGroups()
        stairs.geometry.addGroup( 0, 2000, 0 )
        stairs.geometry.addGroup( 0, 2000, 1 )
        stairs.geometry.addGroup( 0, 2000, 2 )
        stairs.geometry.addGroup( 0, 2000, 3 )

        stairs.material = materials
        
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
          z: "-=2.05",
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
      const stairs = this.stairs.getObjectByName('Escaliers_3')
      const position = this.cameraInstance.raycaster.intersectObject(stairs, true)[0].point
      const orientation = new Euler(-Math.PI/2, 0, 0)
      const size = new Vector3(2, 1.2, 200)
      // const geometry = new DecalGeometry( stairs, position, orientation , size );
      const geometry = new PlaneBufferGeometry(1, 2)
      // const material = new ShaderMaterial( { 
      //   side: DoubleSide,
      //   transparent: true,
      //   vertexShader: require('@shaders/footstep.vert').default,
      //   fragmentShader: [require('@shaders/utils/simplexNoise.glsl').default, require('@shaders/footstep.frag').default].join('\n'),
      //   // fragmentShader: require('@shaders/footstep.frag').default
      // } );

      // /** @type Texture */
      // this.assets.textures.banksy.wrapS = RepeatWrapping
      // this.assets.textures.banksy.wrapT = RepeatWrapping
      // this.assets.textures.banksy.mapping = EquirectangularReflectionMapping

      const material = new MeshStandardMaterial({
        map: this.assets.textures.footstep,
        transparent: true
      })

      // const material = new MeshBasicMaterial( { color: 0x00ff00, side: DoubleSide } )
      const mesh = new Mesh( geometry, material );
      mesh.position.copy(position)
      mesh.rotation.copy(orientation)
      mesh.position.z += 0.1
      mesh.position.y += 0.01
      
      if(stepIndex % 2 === 0) mesh.position.x += 1
      else mesh.position.x -= 1

      this.container.add( mesh )

      gsap.to(mesh.scale, {
        x: 2, y: 2, z: 2,
        duration: 0.3,
        ease: "power4.in"
      })
      debugger
      gsap.to(mesh.material, {
        opacity: 0,
        duration: 0.3,
        ease: "power4.in"
      })
    }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}