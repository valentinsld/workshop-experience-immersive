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
        `varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

    fragmentShader:
        `uniform float cameraNear;
        uniform float cameraFar;
        uniform float fogNear;
        uniform float fogFar;
        uniform bool fogEnabled;
        uniform bool onlyAO;
        uniform vec2 size;
        uniform float aoClamp;
        uniform float lumInfluence;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        varying vec2 vUv;
        #define DL 2.399963229728653
        #define EULER 2.718281828459045

        #ifndef SAMPLES
        #define SAMPLES 8
        #endif
        #ifndef RADIUS
        #define RADIUS 5.0
        #endif
        #if !defined( FLOAT_DEPTH ) && !defined( RGBA_DEPTH )
        #define RGBA_DEPTH
        #endif
        #ifndef ONLY_AO_COLOR
        #define ONLY_AO_COLOR 1.0, 1.0, 1.0
        #endif
        const int samples = SAMPLES;
        const float radius = RADIUS;
        const bool useNoise = false;
        const float noiseAmount = 0.0003;
        const float diffArea = 0.4;
        const float gDisplace = 0.4;
        const vec3 onlyAOColor = vec3( ONLY_AO_COLOR );
        float unpackDepth( const in vec4 rgba_depth ) {
            float depth = 0.0;
            #if defined( RGBA_DEPTH )
            const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
            depth = dot( rgba_depth, bit_shift );
            #elif defined( FLOAT_DEPTH )
            depth = rgba_depth.w;
            #endif
            return depth;
        }
        vec2 rand( const vec2 coord ) {
            vec2 noise;
            if ( useNoise ) {
            float nx = dot ( coord, vec2( 12.9898, 78.233 ) );
            float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );
            noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );
        } else {
            float width = size.x;
            float height = size.y;


            float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );
            float gg = fract( coord.t * ( height / 2.0 ) );
            noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;
        }
        return ( noise * 2.0  - 1.0 ) * noiseAmount;
    }
        float doFog() {
            float cameraFarMinusNear = cameraFar - cameraNear;

            float zdepth = unpackDepth( texture2D( tDepth, vUv ) );
            float depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );
            return smoothstep( fogNear, fogFar, depth );
        }
        float readDepth( const in vec2 coord ) {
            float cameraFarPlusNear = cameraFar + cameraNear;
            float cameraFarMinusNear = cameraFar - cameraNear;
            float cameraCoef = 2.0 * cameraNear;


            return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );
        }
        float compareDepths( const in float depth1, const in float depth2, inout int far ) {
            float garea = 2.0;
            float diff = ( depth1 - depth2 ) * 100.0;
            if ( diff < gDisplace ) {
            garea = diffArea;
        } else {
            far = 1;
        }
        float dd = diff - gDisplace;
        float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );
        return gauss;
    }
        float calcAO( float depth, float dw, float dh ) {
            float dd = radius - depth * radius;
            vec2 vv = vec2( dw, dh );
            vec2 coord1 = vUv + dd * vv;
            vec2 coord2 = vUv - dd * vv;
            float temp1 = 0.0;
            float temp2 = 0.0;
            int far = 0;
            temp1 = compareDepths( depth, readDepth( coord1 ), far );
            if ( far > 0 ) {
            temp2 = compareDepths( readDepth( coord2 ), depth, far );
            temp1 += ( 1.0 - temp1 ) * temp2;
        }
        return temp1;
    }
        void main() {
            float width = size.x;
            float height = size.y;


            vec2 noise = rand( vUv );
            float depth = readDepth( vUv );
            float tt = clamp( depth, aoClamp, 1.0 );
            float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );
            float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );
            float pw;
            float ph;
            float ao = 0.0;
            float dz = 1.0 / float( samples );
            float z = 1.0 - dz / 2.0;
            float l = 0.0;
            for ( int i = 0; i <= samples; i ++ ) {
            float r = sqrt( 1.0 - z );
            pw = cos( l ) * r;
            ph = sin( l ) * r;
            ao += calcAO( depth, pw * w, ph * h );
            z = z - dz;
            l = l + DL;
        }
        ao /= float( samples );
        ao = 1.0 - ao;
        if ( fogEnabled ) {
            ao = mix( ao, 1.0, doFog() );
        }
        vec3 color = texture2D( tDiffuse, vUv ).rgb;
        vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );
        float lum = dot( color.rgb, lumcoeff );
        vec3 luminance = vec3( lum );
        vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );
        if ( onlyAO ) {
            final = onlyAOColor * vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );
        }
        gl_FragColor = vec4( final, 1.0 );
    }`,
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