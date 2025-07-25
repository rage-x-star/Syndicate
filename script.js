// For public index.html
function loadAnnouncements() {
    const list = document.getElementById('announcements-list');
    list.innerHTML = "";
    const announcements = JSON.parse(localStorage.getItem('announcements') || "[]");
    if (announcements.length === 0) {
        list.innerHTML = "<li>No announcements yet.</li>";
        return;
    }
    announcements.slice().reverse().forEach(a => {
        const li = document.createElement('li');
        li.className = 'announcement';
        li.innerHTML = `
            <div class="announcement-title">${a.title}</div>
            <div class="announcement-date">${a.date}</div>
            <div class="announcement-message">${a.message}</div>
        `;
        list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", loadAnnouncements);