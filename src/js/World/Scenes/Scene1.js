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
} from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry'

import { cloneDeep } from 'lodash'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import SplitText from '../../SplitText'
gsap.registerPlugin(CustomEase, SplitText)

import QTE from '../../QTE'

export default class Scene1 {
    constructor({ assets, time }) {
        this.assets = assets
        this.time = time

        this.container = new Object3D()
        this.setupScene()
        App.scene.add(this.container)
    }

    setupScene() {
        setTimeout(() => {
            this.endScene()
        }, 5000)

        return

        // QTE.newMonoChoose({
        //   choose: {
        //       keyCode: " ",
        //       text: 'Avancer vers la scene<br>Appuyez sur espace',
        //       functionEnd: () => {
        //         console.log('SPACE')
        //       },
        //     },
        //     duration: 1,
        // })

        // QTE.newPluralChoose({
        //   chooses : [
        //     {
        //       keyCode: "Q",
        //       text: 'Marcher sur les collages',
        //       functionEnd: () => {console.log('Q')},
        //     },{
        //       keyCode: "D",
        //       text: 'Esquivez les collages',
        //       functionEnd: () => {console.log('D')},
        //     }
        //   ],
        //   duration: 5,
        //   defaultChoose: 0
        // })

        this.stairs = this.assets.models['Ernest_1412H1645'].scene
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
        this.camera.position.z = 27
        this.camera.position.y = 4.5

        // raycast
        const camera = (this.cameraInstance = App.camera)
        camera.raycaster = new Raycaster(
            camera.camera.position,
            new Vector3(0, -1, 0)
        )
        camera.time.on('tick', () =>
            camera.raycaster.set(camera.camera.position, new Vector3(0, -1, 0))
        )
        // window.addEventListener('keypress', e => console.log(camera.raycaster.intersectObject(this.stairs.getObjectByName('Escalier'), true)))

        const stairs = this.stairs.getObjectByName('Escaliers_3')

        const texture1 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture1.offset = new Vector2(0, -0.1)
        texture1.repeat = new Vector2(2.04, 3.03)
        const texture2 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture2.offset = new Vector2(-1.71, -1.07)
        texture2.repeat = new Vector2(2.04, 3.03)
        const texture3 = cloneDeep(this.assets.textures['Texture-Pignopn'])
        texture3.offset = new Vector2(0, -1.95)
        texture3.repeat = new Vector2(2.04, 3.03)

        const materials = [
            cloneDeep(this.stairs.getObjectByName('barrière_Left').material),
            new MeshStandardMaterial({ map: texture1, transparent: true }),
            new MeshStandardMaterial({ map: texture2, transparent: true }),
            new MeshStandardMaterial({ map: texture3, transparent: true }),
        ]
        stairs.geometry.clearGroups()
        stairs.geometry.addGroup(0, 1000, 0)
        stairs.geometry.addGroup(0, 1000, 1)
        stairs.geometry.addGroup(0, 1000, 2)
        stairs.geometry.addGroup(0, 1000, 3)

        stairs.material = materials

        this.stairs.traverse((child) => {
            child.matrixAutoUpdate = false
            child.updateMatrix()
        })

        this.createSmoke()

        App.scene.fog = new Fog(0x030b24, 1, 50)
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
            ease: 'power1.inOut',
            duration: 1.2,
        })

        let tl = gsap.timeline().play(-0.8)

        for (let i = 0; i < nbStairs; i++) {
            const mult = i % 2 == 0 ? -1 : 1

            tl.to(this.camera.position, {
                y: '+=1',
                ease: EaseY,
                duration: 1,
            })
                .to(
                    this.camera.position,
                    {
                        z: '-=2.05',
                        ease: 'linear',
                        duration: 1,
                    },
                    '-=1'
                )
                .to(
                    this.cameraContainer.rotation,
                    {
                        x: -0.02 * mult,
                        y: 0.01,
                        z: 0.01 * mult,
                        ease: 'linear',
                        duration: 1,
                        onComplete: () => this.createFootstep(i),
                    },
                    '-=1'
                )
        }

        console.log('played')

        gsap.to(this.cameraContainer.rotation, {
            x: 0,
            y: 0,
            z: 0,
            ease: 'power1.inOut',
            delay: nbStairs,
            duration: 1.2,
        })
    }

    createFootstep(stepIndex) {
        const stairs = this.stairs.getObjectByName('Escaliers_3')
        const position = this.cameraInstance.raycaster.intersectObject(
            stairs,
            true
        )[0].point
        const orientation = new Euler(-Math.PI / 2, 0, 0)
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
            transparent: true,
        })

        const mesh = new Mesh(geometry, material)
        mesh.position.copy(position)
        mesh.rotation.copy(orientation)
        mesh.position.z += 0.1
        mesh.position.y += 0.01

        if (stepIndex % 2 === 0) mesh.position.x += 1
        else mesh.position.x -= 1

        this.container.add(mesh)

        gsap.to(mesh.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 0.3,
            ease: 'power4.in',
        })
        gsap.to(mesh.material, {
            opacity: 0,
            duration: 0.3,
            ease: 'power4.in',
        })
    }

    endScene(end = 0) {
        const el = document.getElementById(`endScene1`)
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
                stagger: 0.06,
                ease: "Power3.out",
            })
            .to(step, {
              delay: words.length * 0.3,
              opacity: 0,
              duration: .6,
              ease: "Power4.out",
              y: "-50%"
            })
        })

        // tl.to(words1, {
        //     y: 0,
        //     opacity: 1,
        //     stagger: 0.1,
        //     delay: 2,
        // })
    }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}
