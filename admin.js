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

function getMemberList() {
    // Members: array of {username, password}
    return JSON.parse(localStorage.getItem("members") || "[]");
}
function setMemberList(list) {
    localStorage.setItem("members", JSON.stringify(list));
}

function showAdminPanel() {
    document.getElementById('login-section').style.display = "none";
    document.getElementById('admin-panel-section').style.display = "block";
    loadAdminAnnouncements();
    loadMemberList();
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

function loadMemberList() {
    const mList = document.getElementById('member-list');
    if (!mList) return;
    mList.innerHTML = "";
    const members = getMemberList();
    if (!members.length) {
        mList.innerHTML = `<li><i class="fa-solid fa-user-slash"></i> No registered members.</li>`;
        return;
    }
    members.forEach(member => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-user"></i> ${escapeHtml(member.username)}`;
        mList.appendChild(li);
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

    // Member registration logic
    const registerForm = document.getElementById("register-member-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("new-member-username").value.trim();
            const password = document.getElementById("new-member-password").value;
            const errorP = document.getElementById("register-member-error");
            const successP = document.getElementById("register-member-success");
            errorP.textContent = "";
            successP.textContent = "";
            if (!username || !password) {
                errorP.textContent = "Username and password cannot be empty.";
                return;
            }
            if (username.toLowerCase() === ADMIN_USER || username.toLowerCase() === "admin") {
                errorP.textContent = "Username reserved.";
                return;
            }
            let members = getMemberList();
            if (members.some(m => m.username === username)) {
                errorP.textContent = "Username already registered.";
                return;
            }
            members.push({ username, password });
            setMemberList(members);
            document.getElementById("new-member-username").value = "";
            document.getElementById("new-member-password").value = "";
            successP.textContent = `Member "${username}" registered!`;
            loadMemberList();
            // Notify all tabs
            localStorage.setItem("members", JSON.stringify(members));
        });
    }

    // Listen for member list changes
    window.addEventListener("storage", function(e) {
        if (e.key === "members") loadMemberList();
        if (e.key === "announcements") loadAdminAnnouncements();
    });
});
