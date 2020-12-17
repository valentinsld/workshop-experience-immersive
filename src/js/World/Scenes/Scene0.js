// This scene aims to contain everything related to home screen, in case we want to add some deco models

import {
    Object3D,
    Group,
    Mesh,
    DirectionalLight,
    PlaneBufferGeometry,
    PlaneGeometry,
    MeshLambertMaterial,
} from 'three'

import gsap from 'gsap'
import SplitText from '../../SplitText'
gsap.registerPlugin(SplitText)

export default class Scene0 {
    constructor({ assets, time }) {
        this.assets = assets
        this.time = time

        document.querySelector('.link').addEventListener('click', () => {
            this.sceneOut()
        })

        this.timeline = gsap.timeline()

        // init split text
        this.titleChars = new SplitText(
            document.querySelector('.chapter1__title'),
            {
                type: 'chars',
                charsClass: 'char',
            }
        ).chars
        this.textLines = new SplitText(
            document.querySelectorAll('.chapter1__text'),
            {
                type: 'lines',
                linesClass: 'line',
            }
        ).lines

        this.initScene()
        this.animationOpen()
    }

    initScene() {
        this.container = new Object3D()
        App.scene.add(this.container)

        // init camera
        this.camera = App.camera.camera
        this.cameraContainer = App.camera.container

        // Ambient light
        // this.ambienteLight = new AmbientLight(0xffffff, .5)
        // this.container.add(this.ambienteLight)
        const light = new DirectionalLight(0xffffff, 0.5)
        light.position.set(-1, 0, 1)
        this.container.add(light)

        this.createSmoke()
    }

    createSmoke() {
        const smokeContainer = new Group()
        // const smokeGeo = new PlaneBufferGeometry(100, 100)

        // const smokeMaterial1 = new MeshLambertMaterial({
        //     map: this.assets.textures.smoke3,
        //     opacity: 1,
        //     transparent: true,
        // })

        // const smokeMaterial2 = new MeshLambertMaterial({
        //     map: this.assets.textures.smoke3,
        //     opacity: 0,
        //     transparent: true,
        // })

        // for (let i = 0; i < 50; i++) {
        //     const particle = new Mesh(
        //         smokeGeo,
        //         i % 2 === 0 ? smokeMaterial1 : smokeMaterial2
        //     )
        //     particle.position.set(
        //         (Math.random() - 0.5) * 30,
        //         (Math.random() - 0.5) * 1,
        //         (Math.random() - 0.5) * 4
        //     )
        //     particle.rotation.z = Math.random() * 360
        //     smokeContainer.add(particle)
        // }

        // this.time.on('tick', () => {
        //     smokeContainer.children.forEach((child) => {
        //         const z = child.rotation.z
        //         child.lookAt(this.camera.position)
        //         child.rotation.z = z + 0.008
        //     })
        // })

        // smokeContainer.position.set(0, -5, -2)
        // this.container.add(smokeContainer)

        const material = new MeshLambertMaterial({
            color: 0xffffff,
            depthWrite: false,
            map: this.assets.textures.smoke4,
            transparent: true,
            opacity: .5,
        })
        const geometry = new PlaneGeometry(5, 5)
        this.particles = []

        const size = 5

        for (let i = 0; i < 40; i++) {
            const particle = new Mesh(geometry, material)
            particle.material.opacity = 0.2
            particle.position.set(
                i/10,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            )
            particle.rotation.z = Math.random() * Math.PI * 2

            smokeContainer.add(particle)
            this.particles.push(particle)
        }

        this.container.add(smokeContainer)
        smokeContainer.position.set(-.6, -2, -2.7)
        smokeContainer.rotation.y = -0.380

        this.time.on('tick', () => {
            this.particles.forEach((particle) => {
                const z = particle.rotation.z
                particle.lookAt(this.camera.position)
                particle.rotation.z = z + 0.004
            })
        })
    }

    animationOpen() {
        this.timeline
            .to(this.titleChars, {
                delay: 0.5,
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'Power3.out',
                stagger: 0.035,
            })
            .to(this.textLines, {
                delay: 0.2,
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                from: 'random',
                ease: 'Power2.inOut',
            })
            .to(document.querySelector('#chapter1 .link'), {
                opacity: 1,
                y: 0,
                delay: 0.5,
            })
    }

    sceneOut() {
        const chapitre = document.getElementById('chapter1')

        this.timeline.to(chapitre, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                chapitre.style.display = 'none'
                App.world.sceneManager.next()
            },
        })
    }

    destruct() {}
}
