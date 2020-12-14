varying vec2 vUv;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

void main() {

    float pct = 0.0;
    vec2 uv = vUv - .5;

    pct = distance( uv, vec2(0., 0.));
    // Convert to linear
    float dist = dot(pct,pct);
    float disc = smoothstep( 0.02, 0.1, dist);

    // disc += snoise(vec2(uv.x, uv.y));
    vec4 color = vec4(disc, disc, disc, 1. - disc);

    // vec3 color = vec3(1.);
    gl_FragColor = vec4( color );

}
