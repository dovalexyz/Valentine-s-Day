// --- CONFIGURAÇÃO THREE.JS ---
const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 30;

// --- SISTEMA DE PARTÍCULAS ---
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);
const targetArray = new Float32Array(particlesCount * 3); // Onde elas devem ir
const colorsArray = new Float32Array(particlesCount * 3);

const geometry = new THREE.BufferGeometry();

// Inicializa partículas espalhadas (universo)
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; // Espalha bem
    colorsArray[i] = Math.random(); 
}

geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

// Material brilhante
const material = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
});

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

// --- FUNÇÕES DE FORMA (Matemática do Coração) ---
function getHeartPosition(t) {
    // Fórmula paramétrica do coração
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: x * 0.5, y: y * 0.5 }; // Escala 0.5
}

// Configurar o alvo das partículas para formar o coração
for (let i = 0; i < particlesCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const pos = getHeartPosition(t);
    
    // Adiciona um pouco de aleatoriedade para dar volume (fuzziness)
    const fuzz = 0.5;
    targetArray[i * 3] = pos.x + (Math.random() - 0.5) * fuzz;
    targetArray[i * 3 + 1] = pos.y + (Math.random() - 0.5) * fuzz;
    targetArray[i * 3 + 2] = (Math.random() - 0.5) * 2; // Profundidade Z
}

// --- VARIÁVEIS DE ESTADO ---
let phase = 'idle'; // idle, gathering, explosion, final
const mouse = { x: 0, y: 0 };

// --- ANIMAÇÃO (LOOP) ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotação suave do universo
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Acessar posições atuais
    const positions = particlesMesh.geometry.attributes.position.array;

    if (phase === 'gathering') {
        // Mover partículas para o formato do coração
        for(let i = 0; i < particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Interpolação Linear (Lerp) suave
            positions[ix] += (targetArray[ix] - positions[ix]) * 0.03;
            positions[iy] += (targetArray[iy] - positions[iy]) * 0.03;
            positions[iz] += (targetArray[iz] - positions[iz]) * 0.03;
        }
    } else if (phase === 'explosion') {
        // Explosão para fora
        for(let i = 0; i < particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;
            
            positions[ix] += (Math.random() - 0.5) * 2;
            positions[iy] += (Math.random() - 0.5) * 2;
            positions[iz] += (Math.random() - 0.5) * 2;
        }
        material.opacity -= 0.01;
    }

    particlesMesh.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// --- TIMELINE CINEMATOGRÁFICA (GSAP) ---
function startShow() {
    const tl = gsap.timeline();

    // 1. Partículas se juntam (Coração de partículas)
    tl.to({}, { duration: 2, onStart: () => { phase = 'gathering'; } })
      
    // 2. Coração vibra antes de explodir
      .to(particlesMesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, yoyo: true, repeat: 3 })
      
    // 3. Explosão
      .to({}, { duration: 0.1, onStart: () => { phase = 'explosion'; } })
      
    // 4. Letras Y e P entram
      .to('#letter-y', { 
          top: '40%', opacity: 1, duration: 1.5, ease: "power2.out" 
      }, "+=0.5")
      .to('#letter-p', { 
          bottom: '40%', opacity: 1, duration: 1.5, ease: "power2.out" 
      }, "<") // Começa junto com o anterior
      
    // 5. Letras giram e colidem
      .to('.flaming-letter', { 
          rotation: 360, scale: 0.1, opacity: 0, duration: 1, ease: "back.in(1.7)" 
      }, "+=0.5")
      
    // 6. Coração Gigante explode na tela
      .to({}, { onStart: () => {
          document.getElementById('main-heart').classList.remove('hidden');
          document.getElementById('main-heart').style.display = 'block';
      }})
      .fromTo('#main-heart', 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.3)" }
      )

    // 7. Elementos finais (Gatinhos, Texto, Dicas)
      .to({}, { onStart: () => {
          document.getElementById('floating-kittens').classList.remove('hidden');
          document.getElementById('floating-kittens').style.display = 'block';
          
          document.getElementById('final-text').classList.remove('hidden');
          document.getElementById('final-text').style.display = 'block';
          
          // Efeito de escrita no texto
          gsap.from('#final-text h1', { opacity: 0, y: 20, duration: 1 });
          gsap.from('#final-text p', { opacity: 0, duration: 1, delay: 0.5 });

          document.getElementById('interaction-hint').classList.remove('hidden');
          document.getElementById('interaction-hint').style.display = 'block';
      }})
}

// Iniciar show após 1 segundo
setTimeout(startShow, 1000);

// --- INTERATIVIDADE ---

// 1. Explosão de Mini Corações ao clicar no coração principal
const mainHeart = document.getElementById('main-heart');
mainHeart.addEventListener('click', (e) => {
    createMiniHearts(e.clientX, e.clientY);
    
    // Feedback tátil (vibração em mobile)
    if (navigator.vibrate) navigator.vibrate(50);
});

function createMiniHearts(x, y) {
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = 100;
        document.body.appendChild(heart);

        // Animação de queda
        const destX = x + (Math.random() - 0.5) * 200;
        const destY = y + (Math.random() - 0.5) * 200 + 100; // Cai um pouco
        const rotation = Math.random() * 360;

        gsap.to(heart, {
            x: destX - x,
            y: destY - y,
            rotation: rotation,
            opacity: 0,
            duration: 1 + Math.random(),
            onComplete: () => heart.remove()
        });
    }
}

// 2. Detecção de Swipe (Toque e deslize)
let touchStartY = 0;
let touchStartX = 0;
let touchEndY = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

const gallery = document.getElementById('kitten-gallery');
const secretMsg = document.getElementById('secret-message');
const messages = [
    "Você é meu universo inteiro ✨",
    "Cada átomo meu ama cada átomo seu ⚛️",
    "Yasmin, você é a razão do meu sorriso 😊",
    "Sua beleza ofusca qualquer galáxia 🌌",
    "Te amar é minha viagem favorita 🚀"
];

function handleSwipe() {
    const diffY = touchEndY - touchStartY;
    const diffX = touchEndX - touchStartX;

    // Swipe Up (Abrir Galeria)
    if (diffY < -50 && Math.abs(diffX) < 50) {
        gallery.classList.add('active');
    }
    
    // Swipe Down (Fechar Galeria)
    if (diffY > 50 && Math.abs(diffX) < 50 && gallery.classList.contains('active')) {
        gallery.classList.remove('active');
    }

    // Swipe Left/Right (Mensagens Secretas)
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50 && !gallery.classList.contains('active')) {
        showSecretMessage();
    }
}

function showSecretMessage() {
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    secretMsg.innerText = randomMsg;
    secretMsg.classList.add('show');
    secretMsg.style.display = 'block';
    
    // Esconder após 3 segundos
    setTimeout(() => {
        secretMsg.classList.remove('show');
    }, 3000);
}

// Ajuste de redimensionamento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});