// Animated background with Earth globe that can be rotated by mouse drag

const canvas = document.querySelector('.animated-bg-canvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;

let mouse = { x: width / 2, y: height / 2, isDragging: false, lastX: 0, lastY: 0 };
let particles = [];
let globeRotation = 0; // Radians
let globeLat = 0;

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

// Mouse interaction for globe
canvas.addEventListener('mousedown', e=>{
    if (isOnGlobe(e.offsetX, e.offsetY)) {
        mouse.isDragging = true;
        mouse.lastX = e.offsetX;
        mouse.lastY = e.offsetY;
    }
});
window.addEventListener('mouseup', ()=>mouse.isDragging=false);
window.addEventListener('mousemove', e=>{
    if (mouse.isDragging) {
        // Horizontal: rotate longitude (rotation)
        globeRotation += (e.clientX - mouse.lastX) * 0.01;
        // Vertical: rotate latitude (tilt)
        globeLat = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeLat + (e.clientY - mouse.lastY) * 0.01));
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener('touchstart', function(e){
    let t = e.touches[0];
    if (isOnGlobe(t.clientX, t.clientY)) {
        mouse.isDragging = true;
        mouse.lastX = t.clientX;
        mouse.lastY = t.clientY;
    }
});
window.addEventListener('touchend', ()=>mouse.isDragging=false);
window.addEventListener('touchmove', function(e){
    if (mouse.isDragging && e.touches.length) {
        let t = e.touches[0];
        globeRotation += (t.clientX - mouse.lastX) * 0.01;
        globeLat = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeLat + (t.clientY - mouse.lastY) * 0.01));
        mouse.lastX = t.clientX;
        mouse.lastY = t.clientY;
    }
    if (e.touches.length) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

// Globe helpers
function isOnGlobe(x, y) {
    const [cx, cy, r] = globeParams();
    return Math.pow(x-cx,2) + Math.pow(y-cy,2) < r*r;
}
function globeParams() {
    const r = Math.min(width, height)/6;
    const cx = width/2;
    const cy = height/2;
    return [cx, cy, r];
}

// Draw globe wireframe & simple continents
function drawGlobe(ctx, cx, cy, r, lon, lat) {
    // Draw main sphere
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0);
    // Sphere
    let gradient = ctx.createRadialGradient(0,0, r*0.4, 0,0,r);
    gradient.addColorStop(0, "#0be2ff");
    gradient.addColorStop(0.7, "#004c84");
    gradient.addColorStop(1, "#012d47");
    ctx.beginPath();
    ctx.arc(0,0, r, 0, Math.PI*2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.95;
    ctx.shadowColor = "#2de3ff";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Wire meridians/latitudes
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    for (let i=0;i<12;i++) {
        ctx.beginPath();
        for (let t=-Math.PI/2;t<=Math.PI/2;t+=Math.PI/60) {
            let pt = globePointOnSphere(r, lon+i*Math.PI/6, t, lat);
            ctx[(t===-Math.PI/2)?'moveTo':'lineTo'](pt.x, pt.y);
        }
        ctx.stroke();
    }
    for (let i=1;i<5;i++) {
        ctx.beginPath();
        for (let t=0;t<=Math.PI*2;t+=Math.PI/60) {
            let pt = globePointOnSphere(r, lon+t, Math.PI/2-i*Math.PI/10, lat);
            ctx[(t===0)?'moveTo':'lineTo'](pt.x, pt.y);
        }
        ctx.stroke();
    }

    // Draw simple continents (just some Bezier shapes)
    ctx.save();
    ctx.globalAlpha = 0.27;
    ctx.fillStyle = "#d0feff";
    drawContinent(ctx, r, lon, lat, 0, -0.3, 0.25, 0.15, 0.08);
    drawContinent(ctx, r, lon, lat, 1,  0.1, 0.15, 0.15, 0.11);
    drawContinent(ctx, r, lon, lat, 2, -0.6, 0.13, 0.12, 0.10);
    ctx.restore();

    ctx.restore();
}
function globePointOnSphere(r, lon, lat, tilt) {
    // lat/tilt in radians
    let x = r * Math.cos(lat) * Math.sin(lon);
    let y = r * (Math.sin(lat) * Math.cos(tilt) - Math.cos(lat)*Math.cos(lon)*Math.sin(tilt));
    return {x, y};
}
function drawContinent(ctx, r, lon, lat, seed, baseLat, dLat, dLon, dLon2) {
    // Randomish continents
    let theta = lon + seed;
    ctx.beginPath();
    let first = true;
    for(let i=0;i<=16;i++) {
        let phi = baseLat + Math.cos(theta+i/16*2*Math.PI)*dLat;
        let lamb = theta + Math.sin(i/16*2*Math.PI)*dLon + Math.cos(i/32*Math.PI)*dLon2;
        let pt = globePointOnSphere(r, lamb, phi, lat);
        if (first) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
        first = false;
    }
    ctx.closePath();
    ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    // Particles
    for (let p of particles) {
        let dx = (mouse.x - width/2) * p.parallax;
        let dy = (mouse.y - height/2) * p.parallax;
        ctx.beginPath();
        ctx.arc(p.baseX + dx, p.baseY + dy, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#2de3ff';
        ctx.shadowBlur = 6 * p.size;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    // Globe
    let [cx, cy, r] = globeParams();
    drawGlobe(ctx, cx, cy, r, globeRotation, globeLat);

    // Cursor holding effect (if dragging)
    if (mouse.isDragging) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI*2);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#2de3ff";
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(animate);
}
animate();
