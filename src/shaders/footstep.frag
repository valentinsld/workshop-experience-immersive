varying vec2 vUv;

void main() {

    float pct = 0.0;
    vec2 uv = vUv - .5;

    pct = distance( uv, vec2(0., 0.));
    // Convert to linear
    float dist = dot(pct,pct);
    float disc = smoothstep( 0.003, 0.002, dist);
    vec3 color = vec3(disc);


    // vec3 color = vec3(1.);
    gl_FragColor = vec4( color, .5 );

}
