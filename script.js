// For public index.html

function renderAnnouncements() {
    const list = document.getElementById('announcements-list');
    const noAnn = document.getElementById('no-announcements');
    list.innerHTML = "";
    let announcements = JSON.parse(localStorage.getItem('announcements') || "[]");
    if (!announcements.length) {
        list.style.display = "none";
        noAnn.style.display = "block";
        return;
    }
    noAnn.style.display = "none";
    list.style.display = "block";
    announcements.slice().reverse().forEach(a => {
        const li = document.createElement('li');
        li.className = 'announcement-card';
        li.innerHTML = `
            <div class="announcement-title"><i class="fa-solid fa-bullhorn"></i> ${escapeHtml(a.title)}</div>
            <div class="announcement-message">${escapeHtml(a.message)}</div>
            <div class="announcement-date"><i class="fa-regular fa-clock"></i> ${escapeHtml(a.date)}</div>
        `;
        list.appendChild(li);
    });
}

// Sync across tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'announcements') renderAnnouncements();
});

document.addEventListener("DOMContentLoaded", renderAnnouncements);

function escapeHtml(text) {
    // Prevent XSS
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(match) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[match];
    });
}
