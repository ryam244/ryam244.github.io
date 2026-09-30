// Decorative, locally rendered fire. No tracking, network services, or audio.
const host = document.querySelector('.fire-scene');
const control = document.querySelector('.motion-control');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motion.matches;

async function startFire() {
  const THREE = await import('./vendor/three.min.js');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = { uTime: { value: 13.7 }, uResolution: { value: new THREE.Vector2(1, 1) } };
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, uniforms,
    vertexShader: `void main(){ gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return v;}
      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float logShape(vec2 p,float a,vec2 offset){p=rot(a)*(p-offset);vec2 q=p-vec2(clamp(p.x,-.16,.16),0);return 1.-smoothstep(.018,.025,length(q));}
      void main(){
        vec2 uv=gl_FragCoord.xy/uResolution;
        vec2 p=(gl_FragCoord.xy-uResolution*vec2(.51,.29))/min(uResolution.x,uResolution.y);
        float t=uTime;
        vec3 col=vec3(0.);float alpha=0.;
        // A large, soft halo lets the fire illuminate the night without a hard border.
        float halo=exp(-length((p-vec2(0,.13))*vec2(2.6,2.))*7.);
        col+=vec3(.57,.19,.045)*halo*.48;alpha+=halo*.29;
        float ground=exp(-dot(p*vec2(2.,15.),p*vec2(2.,15.))*9.);
        col+=vec3(.54,.17,.035)*ground*.34;alpha+=ground*.2;
        float flame=0.;float hot=0.;
        for(int i=0;i<3;i++){
          float k=float(i);float h=.39+k*.055;
          float y=p.y/h;float x=p.x+(k-1.)*.063;
          float n=fbm(vec2(x*12.+k*5.,y*3.5-t*(.63+k*.08)));
          x+=sin(y*5.-t*1.2+k)*.018*y+(n-.5)*.10*y;
          float width=(.067-k*.008)*pow(max(0.,1.-y),.72);
          float d=(width-abs(x))+(n-.48)*.065;
          float f=smoothstep(-.012,.032,d)*smoothstep(-.035,.04,p.y)*(1.-smoothstep(.72,1.12,y));
          flame=max(flame,f);
          hot=max(hot,f*(1.-smoothstep(.02,.3,p.y))*(.58+.42*n));
        }
        vec3 fire=mix(vec3(1.,.20,.022),vec3(1.,.61,.15),smoothstep(.06,.8,flame));
        fire=mix(fire,vec3(1.,.92,.61),hot);
        col=mix(col,fire,flame);alpha=max(alpha,flame);
        // Crossed charred logs, with thin orange seams and warm upper edges.
        for(int i=0;i<3;i++){
          float k=float(i);float angle=-.29+k*.29;
          vec2 off=vec2((k-1.)*.022,-.012-k*.017);
          float m=logShape(p,angle,off);
          vec2 q=rot(angle)*(p-off);
          float bark=fbm(q*vec2(15.,130.)+k*3.);
          float seam=pow(noise(q*vec2(9.,180.)+k*8.),15.);
          float rim=smoothstep(.001,.021,q.y);
          vec3 wood=vec3(.13,.066,.036)+vec3(.22,.065,.012)*bark;
          wood+=vec3(.76,.21,.026)*(seam*.65+rim*.27);
          col=mix(col,wood,m);alpha=max(alpha,m);
        }
        // Each ember rises on its own, fading out before it reaches the sky.
        for(int i=0;i<28;i++){
          float k=float(i);float seed=hash(vec2(k,9.));
          float age=fract(t*(.075+seed*.065)+seed*13.);
          float y=age*(.58+seed*.23);float x=(hash(vec2(k,4.))-.5)*.23;
          x+=sin(age*8.+k+t*.19)*.026+age*age*.10;
          float d=length((p-vec2(x,y))*vec2(1.,.65));
          float spark=(1.-smoothstep(.0005,.0028+seed*.001,d))*(1.-age)*smoothstep(0.,.09,age);
          col+=vec3(1.,.55,.14)*spark;alpha=max(alpha,spark);
        }
        // Sparse distant stars stay quiet; the warm fire remains the focal point.
        vec2 cell=floor(uv*vec2(52.,48.));vec2 st=fract(uv*vec2(52.,48.))-.5;
        float star=step(.989,hash(cell))*exp(-dot(st,st)*800.)*smoothstep(.35,.7,uv.y)*.35;
        col+=vec3(.63,.75,.78)*star;alpha=max(alpha,star);
        gl_FragColor=vec4(col,clamp(alpha,0.,1.));
      }
    `
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  let failed = false, visible = true, last = 0, lastDraw = 0;
  function fallback() {
    failed = true;
    renderer.setAnimationLoop(null);
    host.removeAttribute('data-ready');
    control.hidden = true;
    renderer.domElement.remove();
  }
  renderer.debug.onShaderError = fallback;
  function draw() { if (!failed) renderer.render(scene, camera); }
  function size() {
    if (failed) return;
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.getDrawingBufferSize(uniforms.uResolution.value);
    draw();
  }
  function frame(now) {
    if (!last) last = now;
    const delta = Math.min((now - last) / 1000, .1); last = now;
    uniforms.uTime.value += delta;
    if (now - lastDraw >= 1000 / 30) { draw(); lastDraw = now; }
  }
  function sync() {
    last = 0;
    renderer.setAnimationLoop(!failed && !paused && visible && !document.hidden ? frame : null);
  }
  function label() {
    control.setAttribute('aria-pressed', String(paused));
    control.innerHTML = paused ? '炎の動きを再開する <span aria-hidden="true">▷</span>' : '炎の動きを止める <span aria-hidden="true">Ⅱ</span>';
  }
  host.append(renderer.domElement);
  size();
  if (failed) return;
  host.dataset.ready = 'true';
  control.hidden = false;
  label();
  control.addEventListener('click', () => { paused = !paused; label(); sync(); });
  motion.addEventListener('change', e => { paused = e.matches; label(); sync(); });
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(size).observe(host);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(host);
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); fallback(); });
  window.addEventListener('pagehide', () => renderer.setAnimationLoop(null));
  window.addEventListener('pageshow', sync);
  sync();
}
startFire().catch(() => { /* The inline SVG remains visible without WebGL or JavaScript modules. */ });
