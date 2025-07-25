// Simple hardcoded admin credentials (for demo only)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function showAdminPanel() {
    document.getElementById('login-section').style.display = "none";
    document.getElementById('admin-panel-section').style.display = "block";
    loadAdminAnnouncements();
}

function hideAdminPanel() {
    document.getElementById('login-section').style.display = "block";
    document.getElementById('admin-panel-section').style.display = "none";
}

function loadAdminAnnouncements() {
    const list = document.getElementById('admin-announcements-list');
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

document.addEventListener("DOMContentLoaded", function() {
    // Check if already logged in
    if (sessionStorage.getItem("admin_logged_in") === "true") {
        showAdminPanel();
    }

    // Login logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem("admin_logged_in", "true");
                document.getElementById('login-error').textContent = "";
                showAdminPanel();
            } else {
                document.getElementById('login-error').textContent = "Invalid credentials!";
            }
        });
    }

    // Announcement add logic
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('announcement-title').value.trim();
            const message = document.getElementById('announcement-message').value.trim();
            if (title && message) {
                const announcements = JSON.parse(localStorage.getItem('announcements') || "[]");
                const date = new Date().toLocaleString();
                announcements.push({ title, message, date });
                localStorage.setItem('announcements', JSON.stringify(announcements));
                announcementForm.reset();
                loadAdminAnnouncements();
            }
        });
    }

    // Logout logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem("admin_logged_in");
            hideAdminPanel();
        });
    }
});