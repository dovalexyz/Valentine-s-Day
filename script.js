const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 30;

// Sistema de Partículas Principal (Coração/Explosão)
const particlesCount = 2500;
const posArray = new Float32Array(particlesCount * 3);
const targetArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xff00ff,
    blending: THREE.AdditiveBlending,
    transparent: true
});

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

// NOVO: Sistema de Partículas Rosa Contínuas ao Fundo
const bgParticlesCount = 1000;
const bgPosArray = new Float32Array(bgParticlesCount * 3);
for(let i = 0; i < bgParticlesCount * 3; i++) {
    bgPosArray[i] = (Math.random() - 0.5) * 150;
}
const bgGeometry = new THREE.BufferGeometry();
bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPosArray, 3));
const bgMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xff00ff,
    transparent: true,
    opacity: 0.4
});
const bgParticlesMesh = new THREE.Points(bgGeometry, bgMaterial);
scene.add(bgParticlesMesh);

function getHeartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: x * 0.6, y: y * 0.6 };
}

for (let i = 0; i < particlesCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const point = getHeartPoint(t);
    targetArray[i * 3] = point.x;
    targetArray[i * 3 + 1] = point.y;
    targetArray[i * 3 + 2] = (Math.random() - 0.5) * 5;
}

let phase = 'idle';

function animate() {
    const positions = particlesMesh.geometry.attributes.position.array;
    
    // Animação das partículas de fundo (rosa constante)
    bgParticlesMesh.rotation.y += 0.001;
    bgParticlesMesh.rotation.x += 0.0005;

    if (phase === 'gathering') {
        for(let i = 0; i < particlesCount * 3; i++) {
            positions[i] += (targetArray[i] - positions[i]) * 0.02;
        }
    } else if (phase === 'explosion') {
        for(let i = 0; i < particlesCount * 3; i++) {
            positions[i] += (Math.random() - 0.5) * 1.5;
        }
        material.opacity -= 0.005;
    }
    
    particlesMesh.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

function startSequence() {
    const tl = gsap.timeline();
    const ly = document.getElementById('letter-y');
    const lp = document.getElementById('letter-p');
    const plus = document.getElementById('symbol-plus');

    tl.to({}, { duration: 2, onStart: () => phase = 'gathering' })
      .to(particlesMesh.scale, { x: 1.3, y: 1.3, duration: 0.6, yoyo: true, repeat: 2 })
      .to({}, { duration: 0.1, onStart: () => phase = 'explosion' })
      
      .to([ly, plus, lp], { opacity: 1, duration: 1.2, ease: "power2.out" }, "+=0.2")
      .to(ly, { top: '42%' }, "<")
      .to(lp, { bottom: '42%' }, "<")
      
      .to([ly, plus, lp], { rotation: 720, scale: 0, opacity: 0, duration: 1.2, ease: "back.in(2)" }, "+=0.5")
      
      .to({}, { onStart: () => {
          showElement('main-heart');
          showElement('floating-kittens');
          showElement('final-text');

          gsap.set([ly, lp, plus], { rotation: 0, scale: 1, opacity: 0 });
          ly.classList.add('at-top');
          lp.classList.add('at-top');
          plus.classList.add('at-top');
          
          gsap.to([ly, lp, plus], { opacity: 1, duration: 2, delay: 0.8 });
      }})
      .from('#main-heart', { scale: 0, duration: 1, ease: "elastic.out(1, 0.3)" })
      .from('#final-text', { y: 30, opacity: 0, duration: 1.5 }, "<");
}

function showElement(id) {
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    gsap.to(el, { opacity: 1, duration: 1 });
}

setTimeout(startSequence, 1000);

document.getElementById('main-heart').addEventListener('click', (e) => {
    for (let i = 0; i < 12; i++) {
        const h = document.createElement('div');
        h.innerHTML = '❤️';
        h.style.cssText = `position:fixed; left:${e.clientX}px; top:${e.clientY}px; font-size:20px; pointer-events:none; z-index:100;`;
        document.body.appendChild(h);
        gsap.to(h, {
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            opacity: 0,
            duration: 1.5,
            onComplete: () => h.remove()
        });
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Efeito de partículas rosa flutuantes no fundo
function createFloatingParticles() {
    const floatingContainer = document.createElement('div');
    floatingContainer.id = 'floating-particles-bg';
    floatingContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(floatingContainer);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 105, 180, 0.5);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.3};
        `;
        floatingContainer.appendChild(particle);

        gsap.to(particle, {
            y: Math.random() * 200 - 100,
            x: Math.random() * 200 - 100,
            opacity: 0,
            duration: Math.random() * 4 + 6,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}

createFloatingParticles();

// Aumentar visibilidade e quantidade de partículas
const style = document.createElement('style');
style.textContent = `
    #floating-particles-bg div {
        box-shadow: 0 0 8px rgba(255, 105, 180, 0.8);
    }
`;
document.head.appendChild(style);

// Criar mais camadas de partículas
for (let layer = 0; layer < 2; layer++) {
    const container = document.getElementById('floating-particles-bg');
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 3;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 105, 180, 0.7);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.7 + 0.4};
            box-shadow: 0 0 10px rgba(255, 105, 180, 0.9);
        `;
        container.appendChild(particle);

        gsap.to(particle, {
            y: Math.random() * 300 - 150,
            x: Math.random() * 300 - 150,
            opacity: 0,
            duration: Math.random() * 5 + 5,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}

// Removido/alterado: código antigo da borda neon
(function replaceNeonBorder() {
  // remove qualquer style anterior que o script possa ter criado
  const old = document.getElementById('neon-border-style');
  if (old) old.remove();

  const css = `
    /* gradiente rosa-azul pulsante ao redor da janela */
    #neon-border-proxy { position: fixed; inset: 0; pointer-events: none; z-index: 9999; }
    #neon-border-proxy::before {
      content: "";
      position: absolute;
      inset: 0;
      padding: 8px; /* espessura da borda */
      background: linear-gradient(90deg, #ff66cc, #5500ff, #ff66cc);
      background-size: 200% 200%;
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      border-radius: 0;
      filter: drop-shadow(0 0 12px rgba(255,102,204,0.85));
      animation: neonPulse 2.2s ease-in-out infinite, gradientShift 4s linear infinite;
    }

    @keyframes neonPulse {
      0%   { filter: drop-shadow(0 0 8px rgba(255,102,204,0.9)); opacity: 1; }
      50%  { filter: drop-shadow(0 0 30px rgba(102,204,255,0.95)); opacity: 0.9; }
      100% { filter: drop-shadow(0 0 8px rgba(255,102,204,0.9)); opacity: 1; }
    }

    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  const style = document.createElement('style');
  style.id = 'neon-border-style';
  style.textContent = css;
  document.head.appendChild(style);

  // cria/garante o proxy fixed que serve como camada da borda
  let proxy = document.getElementById('neon-border-proxy');
  if (!proxy) {
    proxy = document.createElement('div');
    proxy.id = 'neon-border-proxy';
    document.documentElement.appendChild(proxy);
  }
})();

