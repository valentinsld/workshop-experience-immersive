import { Vector2 } from 'three'

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        tDepth: { type: 't', value: null },
        size: { type: 'v2', value: new Vector2(512, 512) },
        cameraNear: { type: 'f', value: 1 },
        cameraFar: { type: 'f', value: 100 },
        fogNear: { type: 'f', value: 5 },
        fogFar: { type: 'f', value: 100 },
        fogEnabled: { type: 'i', value: 0 },
        onlyAO: { type: 'i', value: 0 },
        aoClamp: { type: 'f', value: 0.3 },
        lumInfluence: { type: 'f', value: 0.9 },
    },
    vertexShader:
        'varying vec2 vUv;\nvoid main() {\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',

    fragmentShader:
        'uniform float cameraNear;\nuniform float cameraFar;\nuniform float fogNear;\nuniform float fogFar;\nuniform bool fogEnabled;\nuniform bool onlyAO;\nuniform vec2 size;\nuniform float aoClamp;\nuniform float lumInfluence;\nuniform sampler2D tDiffuse;\nuniform sampler2D tDepth;\nvarying vec2 vUv;\n#define DL 2.399963229728653\n#define EULER 2.718281828459045\nfloat width = size.x;\nfloat height = size.y;\nfloat cameraFarPlusNear = cameraFar + cameraNear;\nfloat cameraFarMinusNear = cameraFar - cameraNear;\nfloat cameraCoef = 2.0 * cameraNear;\n#ifndef SAMPLES\n#define SAMPLES 8\n#endif\n#ifndef RADIUS\n#define RADIUS 5.0\n#endif\n#if !defined( FLOAT_DEPTH ) && !defined( RGBA_DEPTH )\n#define RGBA_DEPTH\n#endif\n#ifndef ONLY_AO_COLOR\n#define ONLY_AO_COLOR 1.0, 1.0, 1.0\n#endif\nconst int samples = SAMPLES;\nconst float radius = RADIUS;\nconst bool useNoise = false;\nconst float noiseAmount = 0.0003;\nconst float diffArea = 0.4;\nconst float gDisplace = 0.4;\nconst vec3 onlyAOColor = vec3( ONLY_AO_COLOR );\nfloat unpackDepth( const in vec4 rgba_depth ) {\nfloat depth = 0.0;\n#if defined( RGBA_DEPTH )\nconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\ndepth = dot( rgba_depth, bit_shift );\n#elif defined( FLOAT_DEPTH )\ndepth = rgba_depth.w;\n#endif\nreturn depth;\n}\nvec2 rand( const vec2 coord ) {\nvec2 noise;\nif ( useNoise ) {\nfloat nx = dot ( coord, vec2( 12.9898, 78.233 ) );\nfloat ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );\nnoise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );\n} else {\nfloat ff = fract( 1.0 - coord.s * ( width / 2.0 ) );\nfloat gg = fract( coord.t * ( height / 2.0 ) );\nnoise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;\n}\nreturn ( noise * 2.0  - 1.0 ) * noiseAmount;\n}\nfloat doFog() {\nfloat zdepth = unpackDepth( texture2D( tDepth, vUv ) );\nfloat depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );\nreturn smoothstep( fogNear, fogFar, depth );\n}\nfloat readDepth( const in vec2 coord ) {\nreturn cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );\n}\nfloat compareDepths( const in float depth1, const in float depth2, inout int far ) {\nfloat garea = 2.0;\nfloat diff = ( depth1 - depth2 ) * 100.0;\nif ( diff < gDisplace ) {\ngarea = diffArea;\n} else {\nfar = 1;\n}\nfloat dd = diff - gDisplace;\nfloat gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );\nreturn gauss;\n}\nfloat calcAO( float depth, float dw, float dh ) {\nfloat dd = radius - depth * radius;\nvec2 vv = vec2( dw, dh );\nvec2 coord1 = vUv + dd * vv;\nvec2 coord2 = vUv - dd * vv;\nfloat temp1 = 0.0;\nfloat temp2 = 0.0;\nint far = 0;\ntemp1 = compareDepths( depth, readDepth( coord1 ), far );\nif ( far > 0 ) {\ntemp2 = compareDepths( readDepth( coord2 ), depth, far );\ntemp1 += ( 1.0 - temp1 ) * temp2;\n}\nreturn temp1;\n}\nvoid main() {\nvec2 noise = rand( vUv );\nfloat depth = readDepth( vUv );\nfloat tt = clamp( depth, aoClamp, 1.0 );\nfloat w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );\nfloat h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );\nfloat pw;\nfloat ph;\nfloat ao = 0.0;\nfloat dz = 1.0 / float( samples );\nfloat z = 1.0 - dz / 2.0;\nfloat l = 0.0;\nfor ( int i = 0; i <= samples; i ++ ) {\nfloat r = sqrt( 1.0 - z );\npw = cos( l ) * r;\nph = sin( l ) * r;\nao += calcAO( depth, pw * w, ph * h );\nz = z - dz;\nl = l + DL;\n}\nao /= float( samples );\nao = 1.0 - ao;\nif ( fogEnabled ) {\nao = mix( ao, 1.0, doFog() );\n}\nvec3 color = texture2D( tDiffuse, vUv ).rgb;\nvec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );\nfloat lum = dot( color.rgb, lumcoeff );\nvec3 luminance = vec3( lum );\nvec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );\nif ( onlyAO ) {\nfinal = onlyAOColor * vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );\n}\ngl_FragColor = vec4( final, 1.0 );\n}',
}

const EventDispatcher = function () {
    var a = {}
    this.addEventListener = function (b, c) {
        void 0 === a[b] && (a[b] = [])
        ;-1 === a[b].indexOf(c) && a[b].push(c)
    }
    this.removeEventListener = function (b, c) {
        var d = a[b].indexOf(c)
        ;-1 !== d && a[b].splice(d, 1)
    }
    this.dispatchEvent = function (b) {
        var c = a[b.type]
        if (void 0 !== c) {
            b.target = this
            for (var d = 0, e = c.length; d < e; d++) c[d].call(this, b)
        }
    }
}

export const WebGLRenderTarget = function (a, b, c) {
    EventDispatcher.call(this)
    this.width = a
    this.height = b
    c = c || {}
    this.wrapS = void 0 !== c.wrapS ? c.wrapS : 1001
    this.wrapT = void 0 !== c.wrapT ? c.wrapT : 1001
    this.magFilter = void 0 !== c.magFilter ? c.magFilter : 1006
    this.minFilter =
        void 0 !== c.minFilter ? c.minFilter : 1008
    this.anisotropy = void 0 !== c.anisotropy ? c.anisotropy : 1
    this.offset = new Vector2(0, 0)
    this.repeat = new Vector2(1, 1)
    this.format = void 0 !== c.format ? c.format : 1021
    this.type = void 0 !== c.type ? c.type : 1009
    this.depthBuffer = void 0 !== c.depthBuffer ? c.depthBuffer : !0
    this.stencilBuffer = void 0 !== c.stencilBuffer ? c.stencilBuffer : !0
    this.generateMipmaps = !0
    this.shareDepthFrom = null
}