// Visitor login and announcement view logic

function getVisitorList() {
    return JSON.parse(localStorage.getItem("visitors") || "[]");
}
function setVisitorList(list) {
    localStorage.setItem("visitors", JSON.stringify(list));
}

function getVisitorSession() {
    return sessionStorage.getItem("visitor_username");
}
function setVisitorSession(username) {
    sessionStorage.setItem("visitor_username", username);
}
function clearVisitorSession() {
    sessionStorage.removeItem("visitor_username");
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
    document.getElementById("visitor-login-section").style.display = "none";
    document.getElementById("announcements-section").style.display = "block";
    document.getElementById("visitor-welcome-msg").textContent = `Welcome, ${username}!`;
    renderAnnouncements();
}

function showLogin() {
    document.getElementById("visitor-login-section").style.display = "block";
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

// Sync across tabs for announcements and visitors
window.addEventListener('storage', function(e) {
    if (e.key === 'announcements') renderAnnouncements();
    if (e.key === 'visitors') {
        // if visitor list changes, but user is logged in, re-check validity
        const username = getVisitorSession();
        if (username && !getVisitorList().includes(username)) {
            clearVisitorSession();
            showLogin();
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // If already logged in as visitor
    const username = getVisitorSession();
    if (username && getVisitorList().includes(username)) {
        showAnnouncements(username);
    } else {
        showLogin();
    }

    // Visitor login logic
    const loginForm = document.getElementById('visitor-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('visitor-username').value.trim();
            const errorP = document.getElementById('visitor-login-error');
            if (!username) {
                errorP.textContent = "Please enter your username.";
                return;
            }
            const visitors = getVisitorList();
            if (!visitors.includes(username)) {
                errorP.textContent = "Username not registered. Contact admin.";
                return;
            }
            errorP.textContent = "";
            setVisitorSession(username);
            showAnnouncements(username);
        });
    }

    // Visitor logout
    const logoutBtn = document.getElementById('visitor-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearVisitorSession();
            showLogin();
        });
    }
});