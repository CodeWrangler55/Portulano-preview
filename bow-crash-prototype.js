const scene = document.querySelector(".crash-scene");
const button = document.querySelector(".trigger-button");
const canvas = document.querySelector(".spray-canvas");
const ctx = canvas.getContext("2d");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let particles = [];
let animationFrame = 0;
let lastTime = 0;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * pixelRatio);
  canvas.height = Math.floor(canvas.clientHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function makeParticle(originX, originY, burst, index) {
  const spread = (Math.random() - 0.5) * burst.spread;
  const lift = Math.random() * burst.lift;
  const speed = burst.speedMin + Math.random() * (burst.speedMax - burst.speedMin);
  const mist = Math.random() > 0.62;

  return {
    x: originX + spread * 0.2,
    y: originY + Math.random() * 18,
    vx: spread * speed,
    vy: -lift - Math.random() * 9,
    gravity: mist ? 9 : 42,
    drag: mist ? 0.985 : 0.972,
    radius: mist ? 1 + Math.random() * 3 : 3 + Math.random() * 9,
    life: 0,
    ttl: mist ? 1200 + Math.random() * 700 : 760 + Math.random() * 520,
    alpha: mist ? 0.26 + Math.random() * 0.24 : 0.58 + Math.random() * 0.34,
    color: index % 5 === 0 ? "rgba(188, 225, 245," : "rgba(247, 252, 255,"
  };
}

function emitSpray() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const originX = width * 0.58;
  const originY = height * 0.72;
  const bursts = [
    { count: 150, spread: 1.55, lift: 180, speedMin: 95, speedMax: 210 },
    { count: 90, spread: 2.4, lift: 120, speedMin: 70, speedMax: 165 },
    { count: 110, spread: 3.8, lift: 74, speedMin: 42, speedMax: 118 }
  ];

  particles = [];
  bursts.forEach((burst) => {
    for (let i = 0; i < burst.count; i += 1) {
      particles.push(makeParticle(originX, originY, burst, i));
    }
  });
}

function drawParticle(particle) {
  const fade = Math.max(0, 1 - particle.life / particle.ttl);
  const alpha = particle.alpha * fade;

  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * (0.55 + fade), 0, Math.PI * 2);
  ctx.fillStyle = `${particle.color}${alpha})`;
  ctx.fill();

  if (particle.radius > 6) {
    ctx.beginPath();
    ctx.arc(particle.x - particle.radius * 0.36, particle.y - particle.radius * 0.3, particle.radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.58})`;
    ctx.fill();
  }
}

function render(time) {
  const delta = Math.min(time - lastTime || 16, 34);
  lastTime = time;
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  particles = particles.filter((particle) => {
    particle.life += delta;
    particle.vx *= particle.drag;
    particle.vy += particle.gravity * (delta / 1000);
    particle.x += particle.vx * (delta / 1000);
    particle.y += particle.vy * (delta / 1000);
    drawParticle(particle);
    return particle.life < particle.ttl;
  });

  if (particles.length > 0) {
    animationFrame = requestAnimationFrame(render);
  } else {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    animationFrame = 0;
  }
}

function triggerCrash() {
  scene.classList.remove("crash-active");
  window.setTimeout(() => scene.classList.add("crash-active"), 20);

  if (!prefersReducedMotion.matches) {
    emitSpray();
    cancelAnimationFrame(animationFrame);
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(render);
  }

  window.setTimeout(() => scene.classList.remove("crash-active"), 1400);
}

resizeCanvas();
button.addEventListener("click", triggerCrash);
window.addEventListener("resize", resizeCanvas);
