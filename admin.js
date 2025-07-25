// Admin panel logic for The Syndicate

// --- Utility Functions ---
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
    return JSON.parse(localStorage.getItem("members") || "[]");
}
function setMemberList(list) {
    localStorage.setItem("members", JSON.stringify(list));
}
function getAnnouncements() {
    return JSON.parse(localStorage.getItem("announcements") || "[]");
}
function setAnnouncements(list) {
    localStorage.setItem("announcements", JSON.stringify(list));
}
function getMessages() {
    return JSON.parse(localStorage.getItem("messages") || "[]");
}
function setMessages(list) {
    localStorage.setItem("messages", JSON.stringify(list));
}
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Password hashing ---
async function hashPassword(pw) {
    if (window.sha256) {
        return await window.sha256(pw);
    } else if (window.crypto && window.crypto.subtle) {
        return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw)).then(buf =>
            Array.from(new Uint8Array(buf)).map(x => ('00'+x.toString(16)).slice(-2)).join('')
        );
    }
    return pw;
}

// --- Admin Auth ---
const ADMIN_USER = "admin";
let ADMIN_PASS_HASH = "";
(async function() {
    ADMIN_PASS_HASH = await hashPassword("admin123");
})();

function showAdminPanel() {
    document.getElementById('login-section').style.display = "none";
    document.getElementById('admin-panel-section').style.display = "block";
    loadAdminAnnouncements();
    loadMemberList();
    loadActivityLog();
}
function hideAdminPanel() {
    document.getElementById('login-section').style.display = "block";
    document.getElementById('admin-panel-section').style.display = "none";
}

// --- Member Registration ---
document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem("admin_logged_in") === "true") {
        showAdminPanel();
    }
    // Login process
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const hash = await hashPassword(password);
            if (username === ADMIN_USER && hash === ADMIN_PASS_HASH) {
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
    // Member registration with role
    const registerForm = document.getElementById("register-member-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const username = document.getElementById("new-member-username").value.trim();
            const password = document.getElementById("new-member-password").value;
            const role = document.getElementById("new-member-role").value;
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
            const hash = await hashPassword(password);
            members.push({ username, passwordHash: hash, role, lastLogin: "", lastPost: "", lastComment: "" });
            setMemberList(members);
            document.getElementById("new-member-username").value = "";
            document.getElementById("new-member-password").value = "";
            successP.textContent = `Member "${username}" registered!`;
            loadMemberList();
            localStorage.setItem("members", JSON.stringify(members));
        });
    }
    // FAB modal logic
    const fab = document.getElementById('fab-add');
    const modal = document.getElementById('fab-modal');
    const closeModal = document.getElementById('close-modal');
    if (fab && modal && closeModal) {
        fab.addEventListener('click', () => {
            resetAnnouncementForm();
            document.getElementById('announcement-modal-title').textContent = "Add Announcement";
            modal.style.display = "block";
        });
        closeModal.addEventListener('click', () => modal.style.display = "none");
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    }
    // Announcement CRUD logic
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('announcement-title').value.trim();
            const message = document.getElementById('announcement-message').value.trim();
            const tags = document.getElementById('announcement-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
            const category = document.getElementById('announcement-category').value;
            let attachmentData = "";
            const fileInput = document.getElementById('announcement-attachment');
            if (fileInput.files[0]) {
                const file = fileInput.files[0];
                if (file.type.startsWith("image/")) {
                    attachmentData = await new Promise(res=>{
                        const reader = new FileReader();
                        reader.onload = e => res(e.target.result);
                        reader.readAsDataURL(file);
                    });
                }
            }
            const pollQ = document.getElementById('poll-question').value.trim();
            const pollOptions = document.getElementById('poll-options').value.split(",").map(t=>t.trim()).filter(Boolean);
            let poll = null;
            if (pollQ && pollOptions.length > 1) {
                poll = { question: pollQ, options: pollOptions, votes: {} };
            }
            let announcements = getAnnouncements();
            let editingId = announcementForm.getAttribute("data-editing");
            if (editingId) {
                // Edit
                let idx = announcements.findIndex(a=>a.id===editingId);
                if(idx !== -1){
                    announcements[idx].title = title;
                    announcements[idx].message = message;
                    announcements[idx].tags = tags;
                    announcements[idx].category = category;
                    if (attachmentData) announcements[idx].attachment = attachmentData;
                    announcements[idx].poll = poll;
                }
            } else {
                // Add
                announcements.push({
                    id: generateId(),
                    title, message, tags, category, attachment: attachmentData, 
                    date: new Date().toLocaleString(), author: ADMIN_USER, 
                    views: [], comments: [], poll
                });
            }
            setAnnouncements(announcements);
            modal.style.display = "none";
            resetAnnouncementForm();
            loadAdminAnnouncements();
        });
    }
    // Listen for announcement/member changes
    window.addEventListener("storage", function(e) {
        if (e.key === "members") loadMemberList();
        if (e.key === "announcements") loadAdminAnnouncements();
    });
});

// --- Announcement CRUD & UI ---
function resetAnnouncementForm() {
    document.getElementById('announcement-form').reset();
    document.getElementById('announcement-form').removeAttribute('data-editing');
}
function loadAdminAnnouncements() {
    const list = document.getElementById('admin-announcements-list');
    list.innerHTML = "";
    let announcements = getAnnouncements();
    if (!announcements.length) {
        list.innerHTML = `<li class="no-announcements"><i class="fa-solid fa-inbox"></i><p>No announcements yet.</p></li>`;
        return;
    }
    announcements.slice().reverse().forEach(a => {
        const li = document.createElement('li');
        li.className = 'announcement-card animated';
        li.innerHTML = `
            <div class="announcement-title">
                <i class="fa-solid fa-bullhorn"></i> ${escapeHtml(a.title)}
                <span class="badge">${escapeHtml(a.category || "General")}</span>
                ${a.tags && a.tags.length ? a.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('') : ''}
            </div>
            <div class="announcement-message">${escapeHtml(a.message)}</div>
            ${a.attachment ? `<img src="${a.attachment}" class="announcement-img" alt="Attachment">` : ''}
            ${a.poll ? renderPollAdmin(a) : ''}
            <div class="announcement-date"><i class="fa-regular fa-clock"></i> ${escapeHtml(a.date)} | 
                <i class="fa-solid fa-eye"></i> ${a.views ? a.views.length : 0} views
            </div>
            <div class="card-actions">
                <button class="edit-btn btn-primary" data-id="${a.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-btn btn-primary" data-id="${a.id}"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
            <div class="comments"><strong>Comments:</strong>${a.comments && a.comments.length ? a.comments.map(c=>`<div class="comment"><b>${escapeHtml(c.author)}</b>: ${escapeHtml(c.text)} <span style="font-size:0.85em;color:#888;">${escapeHtml(c.date)}</span></div>`).join('') : '<div style="color:#888;">No comments yet.</div>'}</div>
        `;
        list.appendChild(li);
        li.querySelector('.edit-btn').onclick = ()=>editAnnouncement(a.id);
        li.querySelector('.delete-btn').onclick = ()=>deleteAnnouncement(a.id);
    });
}
function renderPollAdmin(a) {
    if (!a.poll) return '';
    let totalVotes = Object.keys(a.poll.votes).length;
    return `
        <div class="poll">
            <b>${escapeHtml(a.poll.question)}</b>
            <ul>
            ${a.poll.options.map((opt,i)=>{
                let count = Object.values(a.poll.votes||{}).filter(v=>v===i).length;
                let percent = totalVotes ? Math.round(100*count/totalVotes) : 0;
                return `<li>${escapeHtml(opt)} <span class="poll-bar" style="width:${percent}%;">${count} (${percent}%)</span></li>`;
            }).join('')}
            </ul>
        </div>
    `;
}
function editAnnouncement(id) {
    let announcements = getAnnouncements();
    let ann = announcements.find(a=>a.id===id);
    if (!ann) return;
    document.getElementById('announcement-title').value = ann.title;
    document.getElementById('announcement-message').value = ann.message;
    document.getElementById('announcement-tags').value = (ann.tags || []).join(', ');
    document.getElementById('announcement-category').value = ann.category || "General";
    document.getElementById('poll-question').value = ann.poll ? ann.poll.question : "";
    document.getElementById('poll-options').value = ann.poll ? ann.poll.options.join(', ') : "";
    document.getElementById('fab-modal').style.display = "block";
    document.getElementById('announcement-form').setAttribute('data-editing', id);
}
function deleteAnnouncement(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    let announcements = getAnnouncements().filter(a=>a.id!==id);
    setAnnouncements(announcements);
    loadAdminAnnouncements();
}

// --- Member List & Activity ---
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
        li.innerHTML = `<i class="fa-solid fa-user"></i> ${escapeHtml(member.username)} <span class="role-badge">${escapeHtml(member.role||'member')}</span>`;
        mList.appendChild(li);
    });
}
function loadActivityLog() {
    const logList = document.getElementById('member-activity-list');
    if (!logList) return;
    const members = getMemberList();
    logList.innerHTML = members.map(m =>
        `<li>
            <i class="fa-solid fa-user"></i> ${escapeHtml(m.username)}
            <span class="role-badge">${escapeHtml(m.role||'member')}</span>
            <br><small>Last login: ${m.lastLogin || '-'}, Last post: ${m.lastPost || '-'}, Last comment: ${m.lastComment || '-'}</small>
         </li>`
    ).join('');
}
