// Moving animated background (particle parallax effect)
const canvas = document.querySelector('.animated-bg-canvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
let mouse = { x: width / 2, y: height / 2 };
let particles = [];

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let radius = Math.random() * (width + height) / 3;
        particles.push({
            baseX: width / 2 + Math.cos(angle) * radius,
            baseY: height / 2 + Math.sin(angle) * radius,
            size: Math.random() * 2.3 + 1,
            color: `hsla(${170 + Math.random()*80}, 80%, 61%, 0.14)`,
            parallax: Math.random() * 0.14 + 0.03
        });
    }
}
createParticles(70);

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', e => {
    if (e.touches && e.touches.length) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
        let dx = (mouse.x - width/2) * p.parallax;
        let dy = (mouse.y - height/2) * p.parallax;
        ctx.beginPath();
        ctx.arc(p.baseX + dx, p.baseY + dy, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#00ffe7';
        ctx.shadowBlur = 6 * p.size;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    requestAnimationFrame(animate);
}
animate();
