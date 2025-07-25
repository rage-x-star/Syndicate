// Member login and announcement view logic

function getMemberList() {
    // Members: array of {username, password}
    return JSON.parse(localStorage.getItem("members") || "[]");
}
function setMemberList(list) {
    localStorage.setItem("members", JSON.stringify(list));
}

function getMemberSession() {
    return sessionStorage.getItem("member_username");
}
function setMemberSession(username) {
    sessionStorage.setItem("member_username", username);
}
function clearMemberSession() {
    sessionStorage.removeItem("member_username");
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(match) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[match];
    });
}

function showAnnouncements(username) {
    document.getElementById("member-login-section").style.display = "none";
    document.getElementById("announcements-section").style.display = "block";
    document.getElementById("member-welcome-msg").textContent = `Welcome, ${username}!`;
    renderAnnouncements();
}

function showLogin() {
    document.getElementById("member-login-section").style.display = "block";
    document.getElementById("announcements-section").style.display = "none";
}

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

// Sync across tabs for announcements and members
window.addEventListener('storage', function(e) {
    if (e.key === 'announcements') renderAnnouncements();
    if (e.key === 'members') {
        // If member list changes, but user is logged in, re-check validity
        const username = getMemberSession();
        const members = getMemberList();
        if (username && !members.some(m => m.username === username)) {
            clearMemberSession();
            showLogin();
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // If already logged in as member
    const username = getMemberSession();
    if (username && getMemberList().some(m => m.username === username)) {
        showAnnouncements(username);
    } else {
        showLogin();
    }

    // Member login logic
    const loginForm = document.getElementById('member-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('member-username').value.trim();
            const password = document.getElementById('member-password').value;
            const errorP = document.getElementById('member-login-error');
            if (!username || !password) {
                errorP.textContent = "Please enter your username and password.";
                return;
            }
            const members = getMemberList();
            const member = members.find(m => m.username === username);
            if (!member) {
                errorP.textContent = "Username not registered. Contact admin.";
                return;
            }
            if (member.password !== password) {
                errorP.textContent = "Incorrect password.";
                return;
            }
            errorP.textContent = "";
            setMemberSession(username);
            showAnnouncements(username);
        });
    }

    // Member logout
    const logoutBtn = document.getElementById('member-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearMemberSession();
            showLogin();
        });
    }
});
