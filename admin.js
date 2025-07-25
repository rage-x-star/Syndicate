const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(match) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[match];
    });
}

function getVisitorList() {
    return JSON.parse(localStorage.getItem("visitors") || "[]");
}
function setVisitorList(list) {
    localStorage.setItem("visitors", JSON.stringify(list));
}

function showAdminPanel() {
    document.getElementById('login-section').style.display = "none";
    document.getElementById('admin-panel-section').style.display = "block";
    loadAdminAnnouncements();
    loadVisitorList();
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

function loadVisitorList() {
    const vList = document.getElementById('visitor-list');
    if (!vList) return;
    vList.innerHTML = "";
    const visitors = getVisitorList();
    if (!visitors.length) {
        vList.innerHTML = `<li><i class="fa-solid fa-user-slash"></i> No registered visitors.</li>`;
        return;
    }
    visitors.forEach(username => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-user"></i> ${escapeHtml(username)}`;
        vList.appendChild(li);
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

    // Visitor registration logic
    const registerForm = document.getElementById("register-visitor-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("new-visitor-username").value.trim();
            const errorP = document.getElementById("register-visitor-error");
            const successP = document.getElementById("register-visitor-success");
            errorP.textContent = "";
            successP.textContent = "";
            if (!username) {
                errorP.textContent = "Username cannot be empty.";
                return;
            }
            if (username.toLowerCase() === ADMIN_USER || username.toLowerCase() === "admin") {
                errorP.textContent = "Username reserved.";
                return;
            }
            let visitors = getVisitorList();
            if (visitors.includes(username)) {
                errorP.textContent = "Username already registered.";
                return;
            }
            visitors.push(username);
            setVisitorList(visitors);
            document.getElementById("new-visitor-username").value = "";
            successP.textContent = `Visitor "${username}" registered!`;
            loadVisitorList();
            // Notify all tabs
            localStorage.setItem("visitors", JSON.stringify(visitors));
        });
    }

    // Listen for visitor list changes
    window.addEventListener("storage", function(e) {
        if (e.key === "visitors") loadVisitorList();
        if (e.key === "announcements") loadAdminAnnouncements();
    });
});