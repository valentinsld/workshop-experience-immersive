import gsap from 'gsap'

class QTE {
    constructor() {
        this.pluralChoose = [
            document.getElementById('pluralChoose__one'),
            document.getElementById('pluralChoose__two'),
        ]
        this.pluralChooseBar = document.getElementById('pluralChoose__bar')

        this.monoChoose = document.getElementById('monoChoose')

        this.initValues()

        this.initValues = this.initValues.bind(this)

        window.addEventListener('keypress', (ev) => {
            if (this.keys.length == 1) {
                this.resetProgress()
                this.functionsEnd[0](this.initValues)
                return
            }

            const t = this.keys.indexOf(ev.key.toUpperCase())
            if ( t >= 0) {
                this.resetProgress()
                this.functionsEnd[t](this.initValues)
            }
        })
    }

    initValues() {
        this.keys = []
        this.functionsEnd = []

        // init Styles
        this.pluralChoose[0].classList.remove('show')
        this.pluralChoose[1].classList.remove('show')
        this.pluralChooseBar.classList.remove('show')
        this.monoChoose.classList.remove('show')
    }

    newPluralChoose ({ chooses, duration = 5, defaultChoose }) {
        if (this.keys.length > 0) {
            console.log('Attention mutltiplication QTE')
            this.clear()
        }

        chooses.forEach((choose, index) => {
            const { keyCode, text, functionEnd } = choose

            this.keys.push(keyCode.toUpperCase())
            this.functionsEnd.push(functionEnd)

            const pluralElmenet = this.pluralChoose[index]
            pluralElmenet.classList.add('show')

            pluralElmenet.querySelector('p').innerHTML = text
            pluralElmenet.querySelector('div').innerHTML = keyCode
        })

        

        this.pluralChooseBar.classList.add('show')
        this.stackedAnimation = gsap.to(this.pluralChooseBar.querySelector('.line'), {
            width: '100%',
            duration: duration,
            delay: 1,
            ease: 'linear',
            onComplete: () => {
                if (this.keys.length == 0) return
                this.resetProgress()
                this.functionsEnd[defaultChoose](this.initValues)
            },
        })
    }

    /**
     * 
     * @param {Function} choose.funtion the function to be fired at the key entered 
     */
    newMonoChoose({ choose, duration = 1 }) {
        if (this.keys.length > 0) {
            console.warn('Attention mutltiplication QTE')
            this.clear()
        }
        this.anim = true

        this.keys = [choose.keyCode]
        this.functionsEnd = [choose.functionEnd]

        this.monoChoose.classList.add('show')
        this.monoChoose.querySelector('p').innerHTML = choose.text
    }

    resetProgress() {
        this.stackedAnimation?.kill()
        this.pluralChooseBar.querySelector('.line').style.width = `0%`
    }

    throttle(func, wait, leading, trailing, context) {
        var ctx, args, result
        var timeout = null
        var previous = 0
        var later = function () {
            previous = new Date()
            timeout = null
            result = func.apply(ctx, args)
        }
        return function () {
            var now = new Date()
            if (!previous && !leading) previous = now
            var remaining = wait - (now - previous)
            ctx = context || this
            args = arguments
            // Si la période d'attente est écoulée
            if (remaining <= 0) {
                // Réinitialiser les compteurs
                clearTimeout(timeout)
                timeout = null
                // Enregistrer le moment du dernier appel
                previous = now
                // Appeler la fonction
                result = func.apply(ctx, args)
            } else if (!timeout && trailing) {
                // Sinon on s’endort pendant le temps restant
                timeout = setTimeout(later, remaining)
            }
            return result
        }
    }

    clear() { this.keys = [] }
}

export default new QTE()
