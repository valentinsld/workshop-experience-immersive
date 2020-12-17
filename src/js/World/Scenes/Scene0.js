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
            document.querySelector('.Intro__title'),
            {
                type: 'chars',
                charsClass: 'char',
            }
        ).chars
        this.textLines = new SplitText(
            document.querySelectorAll('.Intro__text'),
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
        this.light = new DirectionalLight(0xffffff, 0.5)
        this.light.position.set(-1, 0, 1)
        this.container.add(this.light)

        this.createSmoke()
    }

    createSmoke() {
        this.smokeContainer = new Group()

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

            this.smokeContainer.add(particle)
            this.particles.push(particle)
        }

        this.container.add(this.smokeContainer)
        this.smokeContainer.position.set(-.6, -2, -2.7)
        this.smokeContainer.rotation.y = -0.380

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
            .to(document.querySelector('#Intro .link'), {
                opacity: 1,
                y: 0,
                delay: 0.5,
            })
    }

    sceneOut() {
        this.chapitre = document.getElementById('Intro')

        this.timeline.to(this.chapitre, {
            opacity: 0,
            duration: 1,
            ease: 'Power3.out',
        }).to(this.smokeContainer.position, {
            y: -5,
            duration: 1,
            ease: 'Power3.inOut',
            onComplete: () => {
                this.destruct()
                App.world.sceneManager.next()
            },
        }, "-=.5")
    }

    destruct() {
        this.chapitre.style.display = 'none'
        this.container.remove(this.light)
    }
}
