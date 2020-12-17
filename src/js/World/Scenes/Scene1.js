import {
    MeshStandardMaterial,
    Object3D,
    PlaneBufferGeometry,
    PointLight,
    AmbientLight,
    SpotLight,
    Mesh,
    Vector3,
    Euler,
    Raycaster,
    Vector2,
    RectAreaLight,
    MeshLambertMaterial,
    Group,
    Fog,
    BufferAttribute,
    Quaternion,
    Geometry,
    MeshBasicMaterial,
} from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry'

import { cloneDeep } from 'lodash'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import SplitText from '../../SplitText'
gsap.registerPlugin(CustomEase, SplitText)

import QTE from '../../QTE'

export default class Scene1 {
    constructor({ assets, time, options }) {
        this.assets = assets
        this.time = time
        this.debug = options.debug

        this.container = new Object3D()
        this.setupScene()
        App.scene.add(this.container)

        this.state = { step: 0, side: 0, hasWalkedOver: 0 }
    }

    setupScene() {
        
        this.regitserSceneActions()

        this.stairs = this.assets.models['01_ERNEST_0002'].scene

        // uv duplication
        // const sol = this.stairs.getObjectByName('Sol')
        // const uv1Array = sol.geometry.getAttribute('uv').array
        // sol.geometry.setAttribute( 'uv2', new BufferAttribute( uv1Array, 1, false ) )

        // sol.material.aoMap = this.assets.textures.aomap
        // // sol.material.map = this.assets.textures.colormap
        // sol.material.needsUpdate = true;  
        // this.debugFolder = this.debug.addFolder('Sol')
        // this.debugFolder.open()
        // this.debugFolder.add(sol.material, 'aoMapIntensity', 0, 1, 0.1).name('Intensité occlusion map')

        // const sol = this.stairs.getObjectByName('Sol')
        // const solMaterial = sol.children[0].material

        // const solGeometry = new Geometry()
        // sol.traverse(child => {
        //   const mesh = new Mesh(child.geometry)
        //   mesh.updateMatrix()
        //   solGeometry.merge(mesh.geometry, mesh.matrix)

        // })

        this.stairs.scale.set(0.06, 0.06, 0.06)
        this.stairs.position.x = -60
        this.stairs.position.z = 36
        this.stairs.position.y = -4
        this.stairs.rotation.y = Math.PI / 2
        this.container.add(this.stairs)

        this.stairs.children[0].children.forEach((child) => {
            if (child.material) child.material.roughness = 0.75
            if (child.children)
                child.children.forEach((cc) => {
                    cc.material.roughness = 0.6
                })
        })

        const plan = this.stairs.getObjectByName('mesh_12_5')
        if (plan) plan.material.roughness = 1

        // Ambient light
        this.ambienteLight = new AmbientLight(0x316fcc, 0.12)
        this.container.add(this.ambienteLight)
        
        // // Ambient light 2
        // this.ambienteLight = new AmbientLight(0xffffff, 1)
        // this.container.add(this.ambienteLight)

        // Light
        this.light = new PointLight(0x316fcc, 0.32, 0, 2)
        this.light.castShadow = true
        this.light.position.set(9.45, 7, 45)
        this.container.add(this.light)

        // Spot light
        this.spotLight = new SpotLight(0x3a5dde, 3, 400, 0.45, 1, 6.9)
        this.spotLight.position.set(-10, 55, -10)

        this.container.add(this.spotLight)

        const targetObject = new Object3D()
        targetObject.position.set(15, 0, 45)
        this.container.add(targetObject)

        this.spotLight.target = targetObject

        // // rectLight Bis
        const rectLightG = new RectAreaLight(0x3a5dde, 1, 20, 50)
        rectLightG.position.set(3.3, 20, 0)
        rectLightG.rotation.set(1.9, Math.PI, 0)
        this.container.add(rectLightG)

        // // light for metro maps
        // const rectLight = new RectAreaLight( 0xffffff, .15,  8.42, 6 );
        // rectLight.position.set( -14.14, 3.410, 30.8 );
        // this.container.add( rectLight )

        // init camera
        this.camera = App.camera.camera
        this.cameraContainer = App.camera.container
        const camera = this.cameraInstance = App.camera

        // init camera position
        this.camera.position.set(
          -16.05,
          2.64,
          40.8
        )
        this.cameraInstance.baseRotation.x = -0.4

        // raycast
        camera.raycaster = new Raycaster(
          new Vector3(camera.camera.position.x, camera.camera.position.y, camera.camera.position.z + 0.2),
          new Vector3(0, -1, 0)
        )
        camera.time.on('tick', () => camera.raycaster.set(
          new Vector3(camera.camera.position.x, camera.camera.position.y, camera.camera.position.z + 0.2),
          new Vector3(0, -1, 0)
        ))

        const stairs = this.stairs.getObjectByName('Escaliers_3')

        // const texture1 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        // texture1.offset = new Vector2(0, -0.1)
        // texture1.repeat = new Vector2(2.04, 3.03)
        // const texture2 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        // texture2.offset = new Vector2(-1.71, -1.07)
        // texture2.repeat = new Vector2(2.04, 3.03)
        // const texture3 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        // texture3.offset = new Vector2(0, -1.95)
        // texture3.repeat = new Vector2(2.04, 3.03)

        const colorTexture = this.assets.textures['Texture-Pignon-transpa']

        colorTexture.rotation = 3
        colorTexture.repeat = new Vector2(1.2, 1)
        colorTexture.offset = new Vector2(0.720, 1.04)
        // this.assets.textures['affiches-alpha-revert'].rotation = 3
        // this.assets.textures['affiches-alpha-revert'].repeat = new Vector2(0.75, 1)
        // this.assets.textures['affiches-alpha-revert'].offset = new Vector2(0.320, 1.061)

        const materials = [
            cloneDeep(this.stairs.getObjectByName('Sol-Mat').material),
          new MeshStandardMaterial({ 
            map: colorTexture, 
            transparent: true, 
            // alphaMap: this.assets.textures['affiches-alpha-revert'] 
          }),
        ]
        
        stairs.geometry.clearGroups()
        stairs.geometry.addGroup(0, 1000, 0)
        stairs.geometry.addGroup(0, 1000, 1)
        
        stairs.material = materials
        // stairs.material = new MeshStandardMaterial({ map: this.assets.textures['affiches'], transparent: true }),

        this.stairs.traverse((child) => {
            child.matrixAutoUpdate = false
            child.updateMatrix()
        })

        this.createSmoke()

        App.scene.fog = new Fog(0x030B24, 1, 50)
    }

    regitserSceneActions() {
      QTE.newMonoChoose({
        choose: {
            keyCode: " ",
            text: '<p>Se déplacer devant l’oeuvre</p><div class="chooseLetter">Espace</div>',
            functionEnd: this.goToStairs,
          },
          duration: 1,
      })
    }

    createSmoke() {
        const smokeContainer = new Group()
        const smokeGeo = new PlaneBufferGeometry(25, 25)

        const smokeMaterial1 = new MeshLambertMaterial({
            map: this.assets.textures.smoke3,
            opacity: 0.2,
            transparent: true,
        })

        const smokeMaterial2 = new MeshLambertMaterial({
            map: this.assets.textures.smoke3,
            opacity: 0.2,
            transparent: true,
        })

        for (let i = 0; i < 50; i++) {
            const particle = new Mesh(
                smokeGeo,
                i % 2 === 0 ? smokeMaterial1 : smokeMaterial2
            )
            particle.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 4
            )
            particle.rotation.z = Math.random() * 360
            smokeContainer.add(particle)
        }

        this.time.on('tick', () => {
            smokeContainer.children.forEach((child) => {
                const z = child.rotation.z
                child.lookAt(this.camera.position)
                child.rotation.z = z + 0.008
            })
        })

        smokeContainer.position.set(0, 10, -5)
        this.container.add(smokeContainer)
    }

    goToStairs = (beforeCall) => {
      if(beforeCall) beforeCall()

      gsap.to(this.camera.position, {
        x: 0.5,
        duration: 6,
        ease: 'power2.out'
      })
      gsap.to(this.camera.position, {
        z: 36.5,
        duration: 5,
        ease: 'power2.inOut'
      })

      this.cameraInstance.baseRotation.x = 0

      setTimeout(() => {
        QTE.pause('À la sortie du métro parisien, vous vous trouvez face à un nombre impressionnant de gisants. \n <p><b>Que feriez- vous ?</b></p>')
        setTimeout(() => {
          this.createStairsChoice(5)
          QTE.unpause()
          gsap.to(this.camera.position, {
            z: 28.5,
            duration: 3,
            ease: 'power2.inOut'
          })
        }, 3000)
        gsap.to(this.cameraInstance.baseRotation, { y: -.4 })
      }, 4000)
    }

    createStairsChoice(duration = 5, reversed = false) {

      const labels = ['Marcher sur les collages', 'Esquiver les collages']
      const walkOverStatuses = [1, 0]

      if (reversed) {
        labels.reverse()
        walkOverStatuses.reverse()
      }

      const chooses = [
        {
          keyCode: "Q",
          text: labels[0],
          functionEnd: (beforeCall) => {
            if(beforeCall) beforeCall()
            this.state.side = 0
            this.state.hasWalkedOver = this.state.hasWalkedOver ?? walkOverStatuses[0]
            this.turnLeft()
            this.climbStairs(this.state.step === 2 ? 3 : 4).then(() => {
              if(this.state.step < 3) this.createStairsChoice(duration, !reversed)
              else this.finalPosition()
            })
            this.state.step++
          },
        },{
          keyCode: "D",
          text: labels[1],
          functionEnd: (beforeCall) => {
            if(beforeCall) beforeCall()
            this.state.side = 1
            this.state.hasWalkedOver = this.state.hasWalkedOver ?? walkOverStatuses[1]
            this.turnRight()
            this.climbStairs(this.state.step === 2 ? 3 : 4).then(() => {
              if(this.state.step < 3) this.createStairsChoice(duration, !reversed)
              else this.finalPosition()
            })
            this.state.step++
          },
        }
      ]

      QTE.newPluralChoose({ 
        chooses,
        duration,
        defaultChoose: this.state.side
      })
    }

    turnLeft = () => {
      this.cameraInstance.lock()

      // this.cameraInstance.baseRotation.x = 0.4
      gsap.to(this.camera.position, {
        x: -0.5,
        duration: 0.8,
        // onComplete: () => this.cameraInstance.baseRotation.x = 0
      })

      this.cameraInstance.unlock()
    }

    turnRight = () => {
      this.cameraInstance.lock()

      this.cameraInstance.smoothTurn(0, 0.4, 0, 1.5)

      gsap.to(this.camera.position, {
        x: 4.5,
        duration: 0.8,
      })

      this.cameraInstance.unlock()
    }

    finalPosition() {
      QTE.removeQuestion()
      gsap.to(this.camera.position, {
        x: 1.5,
        duration: 0.8,
        onComplete: () => {
          this.cameraInstance.baseRotation.x = 0
          this.cameraInstance.baseRotation.y = 0
          this.lockCamera()
          this.endScene(this.state.hasWalkedOver)
        }
      })
    }

    lockCamera() {
      this.cameraInstance.smoothTurn(0, 0, 0)
      this.cameraInstance.lock()
    }

    climbStairs(nbStairs) {
      return new Promise((resolve, reject) => {
        const EaseY = CustomEase.create(
          'custom',
          'M0,0 C0.134,0.022 0.524,1.027 0.856,1.028 0.92,1.028 0.96,1.01 1,1 '
        )
  
            // init camera position rotation
            gsap.to(this.camera.rotation, {
              // x: 0,
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
            onComplete: () => {
              this.createFootstep(i)
              if (i === nbStairs - 1) resolve()
            }
          }, "-=1")
        }
  
        gsap.to(this.cameraContainer.rotation, {
          // x: 0,
          y: 0,
          z: 0,
          ease: "power1.inOut",
          delay: nbStairs,
          duration: 1.2,
        })
      })
    }

    createFootstep(stepIndex) {

      const stairs = this.stairs.getObjectByName('Escaliers_3')
      const position = this.cameraInstance?.raycaster.intersectObject(stairs, true)?.[0].point
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

      const material = new MeshStandardMaterial({
        map: this.assets.textures.footstep,
        transparent: true
      })

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
      gsap.to(mesh.material, {
        opacity: 0,
        duration: 0.3,
        ease: "power4.in"
      })
    }

    endScene(end = 0) {
        const el = document.getElementById(`endScene${end+1}`)
        const steps = el.querySelectorAll('.endScene__step')
        el.style.display = 'block'

        var tl = gsap.timeline()

        steps.forEach((step, index) => {
            let mySplitText = new SplitText(step, {
                    type: 'words',
                    wordsClass: 'word',
                }),
                words = mySplitText.words

            tl.to(words, {
                y: 0,
                opacity: 1,
                duration: .7,
                stagger: .15,
                ease: "Power2.inOut",
            }, '-=.1')
            .to(step, {
              delay: words.length * 0.3,
              opacity: 0,
              duration: .6,
              ease: "Power4.out",
              y: "-50%"
            })
        })

    }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}
