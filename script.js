const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 30;

// Sistema de Partículas
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

// Lógica do Coração de Partículas
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

// Timeline da Animação
function startSequence() {
    const tl = gsap.timeline();

    tl.to({}, { duration: 2, onStart: () => phase = 'gathering' })
      .to(particlesMesh.scale, { x: 1.3, y: 1.3, duration: 0.6, yoyo: true, repeat: 2 })
      .to({}, { duration: 0.1, onStart: () => phase = 'explosion' })
      .to('#letter-y', { top: '42%', opacity: 1, duration: 1.2, ease: "power2.out" }, "+=0.2")
      .to('#letter-p', { bottom: '42%', opacity: 1, duration: 1.2, ease: "power2.out" }, "<")
      .to('.flaming-letter', { rotation: 720, scale: 0, opacity: 0, duration: 1.2, ease: "back.in(2)" }, "+=0.5")
      .to({}, { onStart: () => {
          showElement('main-heart');
          showElement('floating-kittens');
          showElement('final-text');
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

// Interação de Toque
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