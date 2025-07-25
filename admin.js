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
    let announcements = JSON.parse(localStorage.getItem('announcements') || "[]");
    if (!announcements.length) {
        list.innerHTML = `<li class="no-announcements"><i class="fa-solid fa-inbox"></i><p>No announcements yet.</p></li>`;
        return;
    }
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

document.addEventListener("DOMContentLoaded", function() {
    // Login logic
    if (sessionStorage.getItem("admin_logged_in") === "true") {
        showAdminPanel();
    }

    // Login process
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem("admin_logged_in", "true");
                document.getElementById('login-error').textContent = "";
                showAdminPanel();
            } else {
                document.getElementById('login-error').textContent = "Invalid credentials!";
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem("admin_logged_in");
            hideAdminPanel();
        });
    }

    // FAB modal logic
    const fab = document.getElementById('fab-add');
    const modal = document.getElementById('fab-modal');
    const closeModal = document.getElementById('close-modal');

    if (fab && modal && closeModal) {
        fab.addEventListener('click', () => modal.style.display = "block");
        closeModal.addEventListener('click', () => modal.style.display = "none");
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = "none";
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
                let announcements = JSON.parse(localStorage.getItem('announcements') || "[]");
                const date = new Date().toLocaleString();
                announcements.push({ title, message, date });
                localStorage.setItem('announcements', JSON.stringify(announcements));
                modal.style.display = "none";
                announcementForm.reset();
                loadAdminAnnouncements();
                // Trigger update for all tabs
                localStorage.setItem('announcements', JSON.stringify(announcements));
            }
        });
    }
});

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(match) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[match];
    });
}
