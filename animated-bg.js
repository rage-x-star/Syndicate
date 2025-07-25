// GitHub 404-style spinning globe, centered right, draggable

const canvas = document.querySelector('.animated-bg-canvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;

// Globe settings (right center, like old GitHub 404)
function GLOBE_RADIUS() { return Math.min(width, height) / 3.1; }
function GLOBE_CX() { return width - GLOBE_RADIUS() - 80; }
function GLOBE_CY() { return height / 2; }

let globeLon = 0; // Rotation (longitude offset, radians)
let globeLat = 0; // Tilt (latitude offset, radians)

// Mouse drag for globe
let dragging = false;
let lastX = 0, lastY = 0;
canvas.addEventListener('mousedown', e => {
    if (isOnGlobe(e.offsetX, e.offsetY)) {
        dragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }
});
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', e => {
    if (dragging) {
        let dx = e.clientX - lastX;
        let dy = e.clientY - lastY;
        globeLon += dx * 0.008;
        globeLat += dy * 0.008;
        globeLat = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, globeLat));
        lastX = e.clientX;
        lastY = e.clientY;
    }
});
canvas.addEventListener('touchstart', function(e){
    let t = e.touches[0];
    if (isOnGlobe(t.clientX, t.clientY)) {
        dragging = true;
        lastX = t.clientX;
        lastY = t.clientY;
    }
});
window.addEventListener('touchend', ()=>dragging=false);
window.addEventListener('touchmove', function(e){
    if (dragging && e.touches.length) {
        let t = e.touches[0];
        globeLon += (t.clientX - lastX) * 0.008;
        globeLat += (t.clientY - lastY) * 0.008;
        globeLat = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, globeLat));
        lastX = t.clientX;
        lastY = t.clientY;
    }
});

// Helper to check globe hit
function isOnGlobe(x, y) {
    let dx = x - GLOBE_CX();
    let dy = y - GLOBE_CY();
    return dx * dx + dy * dy < GLOBE_RADIUS() * GLOBE_RADIUS();
}

// Responsive canvas
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particles
let particles = [];
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
window.addEventListener('resize', () => createParticles(70));

// --- Dots for globe: longitude/latitude ---
const globeDots = [];
for (let lat = -80; lat <= 80; lat += 6) {
    let radLat = lat * Math.PI / 180;
    let cosLat = Math.cos(radLat);
    let step = 8 / Math.max(1, cosLat);
    for (let lon = -180; lon <= 180; lon += step) {
        globeDots.push({ lat: radLat, lon: lon * Math.PI / 180 });
    }
}
const continents = [
    [0,0],[20,20],[10,30],[-10,30],[30,40],[0,60],[-30,40],
    [40,-80],[10,-60],[25,-30],[-15,-70],[-30,-40],[-45,-65],
    [60,100],[40,140],[0,120],[30,80],[50,-10],[65,40],[60,-20],
    [-20,140],[0,-120],[20,-100],[45,-60],[60,-30],[0,-60]
].map(([lat,lon]) => ({lat:lat*Math.PI/180, lon:lon*Math.PI/180}));

// --- Project a lat/lon point on globe to 2D ---
function project(lat, lon, rotLon, rotLat) {
    let x = Math.cos(lat) * Math.cos(lon + rotLon);
    let y = Math.sin(lat + rotLat);
    let z = Math.cos(lat + rotLat) * Math.sin(lon + rotLon);
    let px = GLOBE_CX() + GLOBE_RADIUS() * x;
    let py = GLOBE_CY() + GLOBE_RADIUS() * y * 0.92;
    return {x: px, y: py, z: z};
}

// --- Animation Loop ---
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw particles
    for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.baseX, p.baseY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#2de3ff';
        ctx.shadowBlur = 6 * p.size;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Draw globe shadow
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(GLOBE_CX(), GLOBE_CY() + GLOBE_RADIUS()*0.35, GLOBE_RADIUS()*0.96, 0, Math.PI*2);
    ctx.fillStyle = '#082030';
    ctx.shadowColor = '#222';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.restore();

    // Draw globe outline
    ctx.save();
    ctx.beginPath();
    ctx.arc(GLOBE_CX(), GLOBE_CY(), GLOBE_RADIUS(), 0, Math.PI*2);
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = "#2de3ff";
    ctx.shadowColor = "#2de3ff";
    ctx.shadowBlur = 9;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw globe dots (surface)
    for (let d of globeDots) {
        let p = project(d.lat, d.lon, globeLon, globeLat);
        if (p.z < 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.1, 0, Math.PI*2);
        ctx.fillStyle = "#2de3ff";
        ctx.globalAlpha = 0.16 + 0.13*p.z;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Draw continents
    for (let d of continents) {
        let p = project(d.lat, d.lon, globeLon, globeLat);
        if (p.z < 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.7, 0, Math.PI*2);
        ctx.fillStyle = "#2de3ff";
        ctx.globalAlpha = 0.88;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    requestAnimationFrame(animate);
}
animate();
