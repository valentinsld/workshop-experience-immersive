// This scene aims to contain everything related to home screen, in case we want to add some deco models

import gsap from 'gsap'
import SplitText from '../../SplitText'
gsap.registerPlugin(SplitText)

export default class Scene0 {
    constructor() {
        console.log('init scene 1')

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

        this.animationOpen()
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
            .to(
                this.textLines,
                {
                    delay: .2,
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    from: 'random',
                    ease: 'Power2.inOut',
                },
            )
            .to(document.querySelector('#chapter1 .link'), { opacity: 1, y: 0, delay: 0.5 })
    }

    sceneOut() {
        const chapitre = document.getElementById('chapter1')

        this.timeline.to(chapitre, {
            opacity: 0,
            onComplete: () => {
                chapitre.style.display = 'none'
                App.world.sceneManager.next()
            },
        })
    }

    destruct() {}
}
