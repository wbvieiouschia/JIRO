// ─────────────────────────── GENRE DATA ───────────────────────────
const GENRE_INFO = {
    'Boys Love Collection':          { emoji:'💙', short:'BL', desc:'Stories that focus on romantic relationships between male characters. Often explores emotional growth, identity, and the journey of love between men.' },
    'Woman Love Woman Collection':   { emoji:'💜', short:'WLW', desc:'Stories centered on romantic relationships between female characters. Can range from sweet and wholesome to deep and dramatic.' },
    'Circle Romance':                { emoji:'🔁', short:'', desc:'A relationship setup where multiple people are romantically connected in a loop (e.g., A likes B, B likes C, C likes A). Usually full of tension and misunderstandings.' },
    'Corruption':                    { emoji:'🖤', short:'', desc:'Focuses on a character becoming morally darker or influenced negatively, often due to love, power, or manipulation. Can involve psychological or emotional themes.' },
    'Dystopian Fantasy':             { emoji:'🌑', short:'', desc:'Set in a broken or controlled world combined with fantasy elements (magic, powers, etc.). Often explores survival, rebellion, or injustice.' },
    'Enemies to Lovers':             { emoji:'⚔️❤️', short:'', desc:'Two characters start off hating each other but gradually develop romantic feelings. Popular for tension, banter, and slow-burn romance.' },
    'Falling In Love Again':         { emoji:'💞', short:'', desc:'Characters who once loved each other reconnect and fall in love again, often after separation, conflict, or time apart.' },
    'Fan Fiction':                   { emoji:'✍️', short:'', desc:'Stories written using existing characters, worlds, or universes from movies, books, or games — with new plots or creative twists.' },
    'Forbidden Love':                { emoji:'🚫❤️', short:'', desc:'Romance between characters who aren\'t supposed to be together due to rules, society, family, or circumstances.' },
    'Lovers to Friends':             { emoji:'💔➡️🤝', short:'', desc:'A couple who were once in a romantic relationship transition into friendship instead. Complex, emotional, and bittersweet.' },
    'Second Chance':                 { emoji:'🔄', short:'', desc:'Characters get another opportunity at love or life, usually after mistakes, breakups, or missed chances.' },
    'Small Town Romance':            { emoji:'🌻', short:'', desc:'Set in a small, close-knit community featuring cozy vibes, familiar faces, and slower-paced relationships.' },
    'University Series':             { emoji:'🎓', short:'', desc:'Stories set in college/university life, focusing on academics, friendships, independence, and romance.' },
    'Unrequited Love':               { emoji:'💔', short:'', desc:'One character is in love with someone who doesn\'t feel the same way. Often emotional and bittersweet.' },
};

// ─────────────────────────── STATE ───────────────────────────
let currentUser = JSON.parse(localStorage.getItem('jiro_active_user')) || null;
let allBooks = JSON.parse(localStorage.getItem('jiro_global_library')) || [
    {
        id:'1', authorId:'m1', authorName:'Jirohanna',
        title:'The Silent Whispers', synopsis:'A tale of echoes in the void of a forgotten city.',
        cover:'', tags:['Mystery','Void'], genre:'Dystopian Fantasy', pov:'3rd',
        visibility:'public', explicit:false, published:true, paid:false,
        status:'ongoing', ratings:[], chapters:[{title:'Prologue', content:'In the beginning, there was silence...', likes:[], sigilsAwarded:true}],
        comments:[], views:0
    }
];
// Migrate old books — ensure published exists
allBooks.forEach(b => {
    if (b.published === undefined) b.published = true;
    if (!b.status) b.status = 'ongoing';
    if (!b.ratings) b.ratings = [];
    if (b.paid === undefined) b.paid = false;
    b.chapters.forEach(ch => { if (!ch.sigilsAwarded) ch.sigilsAwarded = false; if (!ch.likes) ch.likes = []; if (!ch.likes) ch.likes = []; });
});

let allUsers = JSON.parse(localStorage.getItem('jiro_user_registry')) || {};

if (!allUsers['admin@jiro.com']) {
    allUsers['admin@jiro.com'] = {
        email:'admin@jiro.com', pass:'JiroAdmin2024', pseudonym:'Jirohanna', uid:'m1', pfp:'',
        bio:'The architect of JIRO. Developer & Keeper of Magic.', role:'Developer',
        gender:'witch', isAdult:true, birthday:'1990-01-01', question:'book', answer:'magic',
        readListPrivate:false, sigils:0
    };
    localStorage.setItem('jiro_user_registry', JSON.stringify(allUsers));
} else {
    allUsers['admin@jiro.com'].role = 'Developer';
    if (!allUsers['admin@jiro.com'].sigils) allUsers['admin@jiro.com'].sigils = 0;
    localStorage.setItem('jiro_user_registry', JSON.stringify(allUsers));
}

if (!Object.values(allUsers).find(u => u.pseudonym === 'Serenno')) {
    allUsers['serenno@jiro.com'] = {
        email:'serenno@jiro.com', pass:'SerennoJiro', pseudonym:'Serenno', uid:'serenno_uid', pfp:'',
        bio:"Artist & storyteller. Co-creator of JIRO's visual identity.", role:'Artist',
        gender:'witch', isAdult:true, birthday:'1997-03-15', question:'pet', answer:'luna',
        readListPrivate:false, sigils:0
    };
    localStorage.setItem('jiro_user_registry', JSON.stringify(allUsers));
}

// Migrate users — add sigils if missing
Object.values(allUsers).forEach(u => { if (u.sigils === undefined) u.sigils = 0; });

let allReviews = JSON.parse(localStorage.getItem('jiro_reviews')) || [];
let userProgress = JSON.parse(localStorage.getItem('jiro_progress_' + (currentUser?.uid || 'guest'))) || {};
let userBookmarks = JSON.parse(localStorage.getItem('jiro_bookmarks_' + (currentUser?.uid || 'guest'))) || [];
let userFinished = JSON.parse(localStorage.getItem('jiro_finished_' + (currentUser?.uid || 'guest'))) || [];
let userUnlocked = JSON.parse(localStorage.getItem('jiro_unlocked_' + (currentUser?.uid || 'guest'))) || [];
let concerns = JSON.parse(localStorage.getItem('jiro_concerns')) || [];
let siteAcknowledgements = JSON.parse(localStorage.getItem('jiro_acknowledgements')) || {
    developers:[{uid:'m1', name:'Jirohanna', role:'Lead Developer & Architect of JIRO'}],
    artists:[{uid:'m1', name:'Jirohanna', role:'UI Designer · Brand Identity'},{uid:'serenno_uid', name:'Serenno', role:'Illustrator · Visual Artist'}],
    special:[]
};

let currentBookId = null;
let isSignUp = false;
let isRecovering = false;
let featuredPeriod = 'daily';
let featuredCategory = 'likes';
let studioFilter = 'all';
let reviewStarSelected = 0;
let reviewSelectedBookId = null;
let currentConcernReplyId = null;

// ─────────────────────────── SAVE HELPERS ───────────────────────────
function saveGlobalLibrary() { localStorage.setItem('jiro_global_library', JSON.stringify(allBooks)); }
function saveRegistry() { localStorage.setItem('jiro_user_registry', JSON.stringify(allUsers)); }
function saveProgress() { if (currentUser) localStorage.setItem('jiro_progress_' + currentUser.uid, JSON.stringify(userProgress)); }
function saveBookmarks() { if (currentUser) localStorage.setItem('jiro_bookmarks_' + currentUser.uid, JSON.stringify(userBookmarks)); }
function saveFinished() { if (currentUser) localStorage.setItem('jiro_finished_' + currentUser.uid, JSON.stringify(userFinished)); }
function saveUnlocked() { if (currentUser) localStorage.setItem('jiro_unlocked_' + currentUser.uid, JSON.stringify(userUnlocked)); }
function saveConcerns() { localStorage.setItem('jiro_concerns', JSON.stringify(concerns)); }
function saveReviews() { localStorage.setItem('jiro_reviews', JSON.stringify(allReviews)); }
function saveAcknowledgements() { localStorage.setItem('jiro_acknowledgements', JSON.stringify(siteAcknowledgements)); }
function saveUserSigils(user) {
    allUsers[user.email] = user;
    saveRegistry();
    if (currentUser && currentUser.uid === user.uid) {
        currentUser = user;
        localStorage.setItem('jiro_active_user', JSON.stringify(currentUser));
        document.getElementById('nav-sigils').innerText = currentUser.sigils.toFixed(2);
    }
}

// ─────────────────────────── UTILS ───────────────────────────
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2500);
}
function openModal(id) {
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    if (id === 'studioModal') el.classList.add('flex');
    if (id === 'userSettingsModal') populateSettingsModal();
    if (id === 'writeReviewModal') initReviewStars();
}
function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.add('hidden');
    el.classList.remove('flex');
}
function toggleDropdown(e, id) {
    e.stopPropagation();
    document.getElementById(id).classList.toggle('active');
}
function closeAllPopups(e) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('active'));
    const sr = document.getElementById('header-search-results');
    if (sr && (!e || !sr.contains(e.target))) sr.classList.add('hidden');
}
function showAuthError(msg) { const el = document.getElementById('auth-error'); el.innerText = msg; el.classList.remove('hidden'); }
function clearAuthError() { document.getElementById('auth-error').classList.add('hidden'); }

function calcAge(birthday) {
    if (!birthday) return 0;
    const today = new Date(); const bDay = new Date(birthday);
    let age = today.getFullYear() - bDay.getFullYear();
    const m = today.getMonth() - bDay.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) age--;
    return age;
}

function starsHTML(avg, count) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += `<span class="${i <= Math.round(avg) ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    return `<span class="stars-display text-sm">${s}</span><span class="text-[9px] font-black text-slate-400 ml-1">${avg.toFixed(1)} (${count})</span>`;
}

function wordCount(str) {
    return (str || '').trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ─────────────────────────── DARK MODE ───────────────────────────
function toggleDarkMode(e) {
    if (e) e.stopPropagation();
    document.body.classList.toggle('dark-mode');
    document.getElementById('dark-toggle-btn').classList.toggle('on', document.body.classList.contains('dark-mode'));
    localStorage.setItem('jiro_dark', document.body.classList.contains('dark-mode') ? '1' : '0');
}

// ─────────────────────────── HEADER SEARCH ───────────────────────────
function handleHeaderSearch(val) {
    const wrap = document.getElementById('header-search-results');
    if (!val.trim()) { wrap.classList.add('hidden'); return; }
    const q = val.toLowerCase();
    const bookResults = allBooks.filter(b => b.published && b.visibility !== 'private' && b.title.toLowerCase().includes(q)).slice(0, 5);
    const authorResults = Object.values(allUsers).filter(u => u.pseudonym.toLowerCase().includes(q)).slice(0, 3);
    let html = '';
    if (bookResults.length) {
        html += `<div class="px-3 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">Works</div>`;
        html += bookResults.map(b => `<div class="sr-item" onclick="closeSearchAndOpen('${b.id}')">
            <div class="w-8 h-12 bg-slate-100 rounded overflow-hidden shrink-0">
                <img src="${b.cover || 'images/jiropc.png'}" class="w-full h-full object-cover" onerror="this.src='images/jiropc.png'">
            </div>
            <div><p class="text-xs font-black text-slate-800 uppercase">${b.title}</p><p class="text-[9px] text-slate-400 font-bold">${b.authorName}</p></div>
        </div>`).join('');
    }
    if (authorResults.length) {
        html += `<div class="px-3 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">Magicians</div>`;
        html += authorResults.map(u => `<div class="sr-item" onclick="closeSearchAndProfile('${u.uid}')">
            <img src="${u.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.pseudonym)}&size=50`}" class="w-8 h-8 rounded-lg object-cover shrink-0">
            <div><p class="text-xs font-black text-slate-800 uppercase">${u.pseudonym}</p><p class="text-[9px] text-slate-400 font-bold uppercase">${u.role || 'Magician'}</p></div>
        </div>`).join('');
    }
    if (!html) html = `<div class="px-4 py-4 text-xs text-slate-400 font-bold">No results found.</div>`;
    wrap.innerHTML = html;
    wrap.classList.remove('hidden');
}
function closeSearchAndOpen(bookId) { document.getElementById('header-search-results').classList.add('hidden'); document.getElementById('header-search-input').value = ''; openLobby(bookId); }
function closeSearchAndProfile(uid) { document.getElementById('header-search-results').classList.add('hidden'); document.getElementById('header-search-input').value = ''; showPage('user-profile', uid); }

// ─────────────────────────── T&C ───────────────────────────
function agreeTNC() { document.getElementById('auth-tnc').checked = true; closeModal('tncModal'); showToast("You agreed to the Terms & Conditions."); }
function disagreeTNC() { document.getElementById('auth-tnc').checked = false; closeModal('tncModal'); showToast("You must agree to the Terms & Conditions to sign up."); }

// ─────────────────────────── AUTH ───────────────────────────
function toggleCustomQuestion() {
    const q = document.getElementById('auth-question').value;
    const cq = document.getElementById('auth-custom-question');
    cq.classList.toggle('hidden', q !== 'custom');
}

document.getElementById('auth-birthday')?.addEventListener('change', function() {
    const age = calcAge(this.value);
    const hint = document.getElementById('auth-age-hint');
    if (age > 0) {
        hint.innerText = `Age: ${age} ${age >= 18 ? '✓ Adult access unlocked' : '⚠ Under 18 — explicit content will be restricted'}`;
        hint.className = `text-[9px] font-bold mt-1 ${age >= 18 ? 'text-green-600' : 'text-amber-500'}`;
    }
});

function toggleAuthMode() {
    isSignUp = !isSignUp; isRecovering = false; clearAuthError();
    document.getElementById('signup-fields').classList.toggle('hidden', !isSignUp);
    document.getElementById('auth-toggle-btn').innerText = isSignUp ? 'Login Instead' : 'Sign Up Instead';
    document.getElementById('auth-submit-btn').innerText = isSignUp ? 'Create Identity' : 'Enter Portal';
    document.getElementById('auth-title').innerText = isSignUp ? 'Create Identity' : 'JIRO';
    document.getElementById('auth-pass').type = 'password';
    document.getElementById('auth-pass').placeholder = 'Password';
    document.getElementById('forgot-pass-btn').classList.remove('hidden');
    document.getElementById('auth-form').reset();
}

function findUserByEmailOrUsername(val) {
    if (allUsers[val]) return allUsers[val];
    return Object.values(allUsers).find(u => u.pseudonym.toLowerCase() === val.toLowerCase()) || null;
}

function initiateRecovery() {
    const val = document.getElementById('auth-email').value.toLowerCase().trim(); clearAuthError();
    const user = findUserByEmailOrUsername(val);
    if (!user) { showAuthError("Please enter a valid registered email or username first."); return; }
    if (!user.question || !user.answer) { showAuthError("This account has no security question. Contact the Developer."); return; }
    isRecovering = true;
    const qMap = { pet:"First pet's name?", city:"Birth city?", book:"Favorite book?", custom: user.customQuestion || "Security Answer" };
    document.getElementById('auth-title').innerText = "Security Challenge";
    document.getElementById('auth-pass').placeholder = "Answer: " + (qMap[user.question] || "Security Answer");
    document.getElementById('auth-pass').value = "";
    document.getElementById('auth-pass').type = "text";
    document.getElementById('auth-submit-btn').innerText = "Reveal Password";
    document.getElementById('forgot-pass-btn').classList.add('hidden');
}

document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault(); clearAuthError();
    const emailOrUser = document.getElementById('auth-email').value.toLowerCase().trim();
    const input = document.getElementById('auth-pass').value;

    if (isRecovering) {
        const user = findUserByEmailOrUsername(emailOrUser);
        if (!user) { showAuthError("User not found."); return; }
        if (input.toLowerCase() === user.answer.toLowerCase()) {
            closeModal('authModal'); showToast("Your password is: " + user.pass); isRecovering = false;
            document.getElementById('auth-title').innerText = 'JIRO';
            document.getElementById('auth-pass').type = 'password';
            document.getElementById('auth-pass').placeholder = 'Password';
            document.getElementById('auth-submit-btn').innerText = 'Enter Portal';
            document.getElementById('forgot-pass-btn').classList.remove('hidden');
        } else { showAuthError("Incorrect security answer."); }
        return;
    }

    if (isSignUp) {
        const email = emailOrUser;
        const pseudo = document.getElementById('auth-pseudo').value.trim();
        const bio = document.getElementById('auth-bio').value.trim();
        const birthday = document.getElementById('auth-birthday').value;
        const question = document.getElementById('auth-question').value;
        const customQuestion = document.getElementById('auth-custom-question').value.trim();
        const answer = document.getElementById('auth-answer').value.trim();
        const genderEl = document.querySelector('input[name="auth-gender"]:checked');
        const gender = genderEl ? genderEl.value : '';
        const tncAgreed = document.getElementById('auth-tnc').checked;
        const isAdult = birthday ? calcAge(birthday) >= 18 : false;

        if (!pseudo) { showAuthError("Pseudonym is required."); return; }
        if (!birthday) { showAuthError("Date of birth is required."); return; }
        if (!gender) { showAuthError("Please select Witch or Wizard."); return; }
        if (!question || !answer) { showAuthError("Please complete the security challenge."); return; }
        if (question === 'custom' && !customQuestion) { showAuthError("Please type your custom security question."); return; }
        if (!tncAgreed) { showAuthError("You must agree to the Terms & Conditions to sign up."); return; }
        if (!email.includes('@')) { showAuthError("Please enter a valid email address."); return; }
        if (allUsers[email]) { showAuthError("Email already bound to an identity."); return; }
        if (Object.values(allUsers).some(u => u.pseudonym.toLowerCase() === pseudo.toLowerCase())) { showAuthError("This pseudonym is already taken."); return; }

        allUsers[email] = {
            email, pass: input, pseudonym: pseudo, bio, birthday, uid: 'm' + Date.now(), pfp: '',
            role: (email === 'admin@jiro.com') ? 'Developer' : 'Magician',
            gender, isAdult, question, customQuestion: question === 'custom' ? customQuestion : '', answer,
            readListPrivate: false, sigils: 0
        };
        saveRegistry();
        showToast("Identity Manifested. Please log in.");
        toggleAuthMode();
        return;
    }

    const user = findUserByEmailOrUsername(emailOrUser);
    if (user && user.pass === input) {
        if (user.email === 'admin@jiro.com') user.role = 'Developer';
        localStorage.setItem('jiro_active_user', JSON.stringify(user));
        location.reload();
    } else {
        showAuthError("Invalid email/username or password.");
    }
});

function logout() { localStorage.removeItem('jiro_active_user'); location.reload(); }

function confirmDeleteAccount() {
    if (!confirm("Are you sure you want to permanently erase your identity?")) return;
    allBooks.forEach(b => { if (b.authorId === currentUser.uid) b.authorName = '[Erased Magician]'; });
    saveGlobalLibrary();
    delete allUsers[currentUser.email];
    saveRegistry();
    localStorage.removeItem('jiro_active_user');
    location.reload();
}

// ─────────────────────────── SETTINGS ───────────────────────────
function populateSettingsModal() {
    if (!currentUser) return;
    document.getElementById('settings-pfp-preview').src = currentUser.pfp || `https://ui-avatars.com/api/?name=${currentUser.pseudonym}&size=200`;
    document.getElementById('set-pseudo').value = '';
    document.getElementById('set-bio').value = '';
    document.getElementById('set-email').value = '';
    document.getElementById('set-pass').value = '';
    document.getElementById('set-pseudo').placeholder = currentUser.pseudonym;
    document.getElementById('set-bio').placeholder = currentUser.bio || 'Tell the world about your magic...';
    document.getElementById('set-email').placeholder = currentUser.email;
}
function previewSettingsPfp(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { document.getElementById('settings-pfp-preview').src = ev.target.result; };
    reader.readAsDataURL(file);
}
function saveSettings() {
    const fileInput = document.getElementById('set-pfp-file');
    const newPseudo = document.getElementById('set-pseudo').value.trim();
    const newBio = document.getElementById('set-bio').value.trim();
    const newEmail = document.getElementById('set-email').value.trim().toLowerCase();
    const newPass = document.getElementById('set-pass').value;
    if (newEmail && newEmail !== currentUser.email && allUsers[newEmail]) { showToast("This email is already claimed."); return; }
    if (newPseudo && newPseudo !== currentUser.pseudonym) {
        if (Object.values(allUsers).some(u => u.pseudonym.toLowerCase() === newPseudo.toLowerCase() && u.uid !== currentUser.uid)) { showToast("That pseudonym is already taken."); return; }
    }
    const finalize = (imgData) => {
        if (imgData) currentUser.pfp = imgData;
        if (newPseudo) { allBooks.forEach(b => { if (b.authorId === currentUser.uid) b.authorName = newPseudo; }); saveGlobalLibrary(); currentUser.pseudonym = newPseudo; }
        if (newBio) currentUser.bio = newBio;
        if (newPass) currentUser.pass = newPass;
        if (newEmail && newEmail !== currentUser.email) { delete allUsers[currentUser.email]; currentUser.email = newEmail; }
        allUsers[currentUser.email] = currentUser;
        saveRegistry();
        localStorage.setItem('jiro_active_user', JSON.stringify(currentUser));
        showToast("Identity Refined."); closeModal('userSettingsModal'); updateUI();
    };
    if (fileInput.files[0]) { const r = new FileReader(); r.onload = (ev) => finalize(ev.target.result); r.readAsDataURL(fileInput.files[0]); }
    else finalize(null);
}

// ─────────────────────────── ADMIN / DEV ───────────────────────────
function adminDeleteUser(email) {
    if (!confirm("DEVELOPER: Permanently erase this user and all their manuscripts?")) return;
    const targetUid = allUsers[email]?.uid;
    if (targetUid) { allBooks = allBooks.filter(b => b.authorId !== targetUid); saveGlobalLibrary(); }
    delete allUsers[email];
    saveRegistry();
    showToast("Identity Erased.");
    renderDevPanel(); // Stay on dev panel — feature #1
}

function adminDeleteManuscript(bookId) {
    if (!confirm("DEVELOPER: Permanently delete this manuscript?")) return;
    const idx = allBooks.findIndex(b => b.id === bookId);
    if (idx !== -1) { allBooks.splice(idx, 1); saveGlobalLibrary(); }
    closeModal('bookLobbyModal');
    showToast("Manuscript Erased by Developer.");
    renderHome();
}

function renderDevPanel() {
    if (!currentUser || currentUser.role !== 'Developer') return;
    const q = (document.getElementById('dev-user-search')?.value || '').toLowerCase();
    const container = document.getElementById('dev-users-list');
    const users = Object.values(allUsers).filter(u => u.pseudonym.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (!users.length) { container.innerHTML = `<p class="text-center py-10 text-slate-300 font-bold uppercase text-xs">No users found.</p>`; return; }

    const roleOptions = ['Magician','Developer','Artist'].map(r => `<option value="${r}">`).join('');
    container.innerHTML = `<datalist id="role-list">${roleOptions}</datalist>` + users.map(u => {
        const userBooks = allBooks.filter(b => b.authorId === u.uid);
        return `
        <div class="dev-user-row flex-wrap gap-2">
            <img src="${u.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.pseudonym)}&size=60`}" class="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shrink-0">
            <div class="flex-1 min-w-0">
                <p class="font-black text-slate-900 text-xs uppercase truncate">${u.pseudonym} <span class="text-[8px] text-slate-400 normal-case font-bold">(${u.email})</span></p>
                <p class="text-[9px] text-slate-400 font-bold uppercase">${u.role} · ${userBooks.length} Manuscripts · ⚡${(u.sigils||0).toFixed(2)} Sigils</p>
            </div>
            <div class="flex gap-2 flex-wrap items-center shrink-0">
                <select onchange="setUserRole('${u.email}', this.value)" class="text-[9px] font-black uppercase border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer bg-white">
                    <option value="Magician" ${u.role==='Magician'?'selected':''}>Magician</option>
                    <option value="Developer" ${u.role==='Developer'?'selected':''}>Developer</option>
                    <option value="Artist" ${u.role==='Artist'?'selected':''}>Artist</option>
                </select>
                <button onclick="showPage('user-profile','${u.uid}')" class="text-[9px] font-black uppercase text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition">View</button>
                ${u.email !== 'admin@jiro.com' ? `
                <button onclick="devDeleteUserWorks('${u.email}')" class="text-[9px] font-black uppercase text-orange-500 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition">Del Works</button>
                <button onclick="adminDeleteUser('${u.email}')" class="text-[9px] font-black uppercase text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition">Del User</button>` : ''}
            </div>
        </div>
        ${userBooks.length ? `<div class="ml-16 mb-3 flex flex-wrap gap-2">${userBooks.map(b=>`
            <span class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[9px] font-black text-slate-600">
                ${b.published ? '🟢' : '⚫'} ${b.title}
                <button onclick="adminDeleteManuscript('${b.id}'); renderDevPanel();" class="text-red-400 hover:text-red-600 ml-1" title="Delete"><i class="fas fa-times"></i></button>
            </span>`).join('')}</div>` : ''}`;
    }).join('');
}

function setUserRole(email, role) {
    if (!allUsers[email]) return;
    allUsers[email].role = role;
    saveRegistry();
    if (currentUser && currentUser.email === email) {
        currentUser.role = role;
        localStorage.setItem('jiro_active_user', JSON.stringify(currentUser));
    }
    showToast(`Role updated to ${role}.`);
    renderDevPanel();
}

function devDeleteUserWorks(email) {
    if (!confirm("Delete all manuscripts by this user?")) return;
    const uid = allUsers[email]?.uid;
    if (uid) { allBooks = allBooks.filter(b => b.authorId !== uid); saveGlobalLibrary(); }
    showToast("User's works deleted."); renderDevPanel();
}

// ─────────────────────────── ACKNOWLEDGEMENTS ───────────────────────────
function renderAcknowledgementManager() {
    const container = document.getElementById('ack-sections');
    if (!container) return;
    const sectionLabels = { developers:'Developers', artists:'Artists', special:'Special Thanks' };
    container.innerHTML = Object.entries(sectionLabels).map(([key, label]) => `
    <div class="mb-8">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4">${label}</h3>
        <div class="space-y-2" id="ack-${key}-list">
        ${(siteAcknowledgements[key] || []).map((item, i) => `
            <div class="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
                <div class="flex-1">
                    <p class="text-xs font-black text-slate-900 uppercase">${item.name}</p>
                    <p class="text-[9px] text-slate-400 font-bold">${item.role}${item.uid ? ` · uid:${item.uid}` : ''}</p>
                </div>
                <button onclick="removeAcknowledgement('${key}',${i})" class="text-red-300 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>
            </div>`).join('') || `<p class="text-[9px] text-slate-300 font-bold uppercase">No entries yet.</p>`}
        </div>
    </div>`).join('');
}

function addAcknowledgement() {
    const name = document.getElementById('ack-new-name').value.trim();
    const role = document.getElementById('ack-new-role').value.trim();
    const section = document.getElementById('ack-new-section').value;
    const uid = document.getElementById('ack-new-uid').value.trim();
    if (!name || !role) { showToast("Name and role are required."); return; }
    if (!siteAcknowledgements[section]) siteAcknowledgements[section] = [];
    siteAcknowledgements[section].push({ name, role, uid: uid || null });
    saveAcknowledgements();
    document.getElementById('ack-new-name').value = '';
    document.getElementById('ack-new-role').value = '';
    document.getElementById('ack-new-uid').value = '';
    showToast("Credit added."); renderAcknowledgementManager();
}

function removeAcknowledgement(section, idx) {
    siteAcknowledgements[section].splice(idx, 1);
    saveAcknowledgements();
    renderAcknowledgementManager();
}

// ─────────────────────────── SIGILS ───────────────────────────
function awardSigils(authorUid, amount) {
    const author = Object.values(allUsers).find(u => u.uid === authorUid);
    if (!author) return;
    author.sigils = (author.sigils || 0) + amount;
    saveUserSigils(author);
}

function processPublishSigils(book) {
    book.chapters.forEach((ch, i) => {
        if (!ch.sigilsAwarded && wordCount(ch.content) >= 1000) {
            ch.sigilsAwarded = true;
            awardSigils(book.authorId, 0.5);
        }
    });
    saveGlobalLibrary();
}

function unlockPaidChapter(bookId, chIdx) {
    if (!currentUser) return openModal('authModal');
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;
    const cost = 5;
    if ((currentUser.sigils || 0) < cost) {
        showToast(`⚡ Not enough Sigils. You need ${cost} but have ${(currentUser.sigils||0).toFixed(2)}.`);
        return;
    }
    if (!confirm(`Unlock this chapter for ${cost} Sigils?`)) return;
    // Deduct from reader
    currentUser.sigils = (currentUser.sigils || 0) - cost;
    allUsers[currentUser.email] = currentUser;
    // Give 75% to author, 25% to dev
    const authorEarn = cost * 0.75;
    const devEarn = cost * 0.25;
    awardSigils(book.authorId, authorEarn);
    awardSigils('m1', devEarn);
    saveUserSigils(currentUser);
    // Record unlock
    const key = `${bookId}:${chIdx}`;
    if (!userUnlocked.includes(key)) userUnlocked.push(key);
    saveUnlocked();
    showToast(`Chapter unlocked! ⚡ -${cost} Sigils`);
    renderReader(bookId);
}

function isChapterUnlocked(bookId, chIdx) {
    if (chIdx === 0) return true;
    if (!currentUser) return false;
    const book = allBooks.find(b => b.id === bookId);
    if (!book || !book.paid) return true;
    if (currentUser.uid === book.authorId || currentUser.role === 'Developer') return true;
    return userUnlocked.includes(`${bookId}:${chIdx}`);
}

// ─────────────────────────── CONCERNS ───────────────────────────
function submitContactForm() {
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    if (!subject || !message) { showToast("Please fill in all fields."); return; }
    concerns.push({
        id: 'cn_' + Date.now(),
        from: currentUser ? currentUser.pseudonym : 'Anonymous',
        fromUid: currentUser ? currentUser.uid : null,
        email: currentUser ? currentUser.email : '',
        subject, message,
        timestamp: Date.now(),
        read: false, solved: false, replies: []
    });
    saveConcerns();
    document.getElementById('contact-subject').value = '';
    document.getElementById('contact-message').value = '';
    showToast("Message sent to the Developer. Thank you!");
    closeModal('infoModal');
    updateConcernBadge();
}

function updateConcernBadge() {
    const badge = document.getElementById('concern-badge');
    if (!badge) return;
    const unread = concerns.filter(c => !c.read).length;
    if (unread > 0) { badge.innerText = unread; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
}

function renderConcerns() {
    const container = document.getElementById('concerns-list');
    if (!concerns.length) { container.innerHTML = `<p class="text-center py-10 text-slate-300 font-bold uppercase text-xs">No concerns yet.</p>`; return; }
    container.innerHTML = [...concerns].reverse().map(c => `
    <div class="concern-item ${c.solved ? 'solved' : !c.read ? 'unread' : ''}">
        <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <div>
                <p class="font-black text-slate-900 text-xs uppercase">${c.subject}</p>
                <p class="text-[9px] text-slate-400 font-bold">From: ${c.from} (${c.email || 'anon'}) · ${new Date(c.timestamp).toLocaleString()}</p>
            </div>
            <div class="flex gap-2 flex-wrap">
                ${!c.solved ? `<button onclick="markConcernSolved('${c.id}')" class="text-[9px] font-black uppercase text-green-600 border border-green-200 rounded-lg px-3 py-1 hover:bg-green-50 transition">Mark Solved</button>` : `<span class="text-[9px] font-black uppercase text-green-500">✓ Solved</span>`}
                <button onclick="openConcernReply('${c.id}')" class="text-[9px] font-black uppercase text-blue-500 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition">Reply</button>
                <button onclick="deleteConcern('${c.id}')" class="text-[9px] font-black uppercase text-red-300 border border-red-100 rounded-lg px-3 py-1 hover:bg-red-50 transition">Delete</button>
            </div>
        </div>
        <p class="text-sm text-slate-600 mb-3">${c.message}</p>
        ${c.replies && c.replies.length ? `<div class="mt-3 space-y-2 bg-slate-50 rounded-xl p-3">
            ${c.replies.map(r => `<div><p class="text-[9px] font-black text-amber-500 uppercase">Developer · ${new Date(r.timestamp).toLocaleDateString()}</p><p class="text-sm text-slate-600">${r.text}</p></div>`).join('<hr class="border-slate-200 my-2">')}
        </div>` : ''}
    </div>`).join('');
    concerns.forEach(c => c.read = true);
    saveConcerns(); updateConcernBadge();
}

function renderMyConcerns() {
    if (!currentUser) return;
    const container = document.getElementById('my-concerns-list');
    const mine = concerns.filter(c => c.fromUid === currentUser.uid || c.email === currentUser.email);
    if (!mine.length) { container.innerHTML = `<p class="text-center py-10 text-slate-300 font-bold uppercase text-xs">You haven't sent any concerns yet.</p>`; return; }
    container.innerHTML = [...mine].reverse().map(c => `
    <div class="concern-item ${c.solved ? 'solved' : ''}">
        <div class="flex justify-between items-start mb-2">
            <div>
                <p class="font-black text-slate-900 text-xs uppercase">${c.subject}</p>
                <p class="text-[9px] text-slate-400 font-bold">${new Date(c.timestamp).toLocaleString()}</p>
            </div>
            <span class="text-[9px] font-black uppercase px-2 py-1 rounded-lg ${c.solved ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600 border border-amber-200'}">${c.solved ? '✓ Solved' : '⏳ Pending'}</span>
        </div>
        <p class="text-sm text-slate-600 mb-2">${c.message}</p>
        ${c.replies && c.replies.length ? `<div class="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p class="text-[9px] font-black text-amber-600 uppercase mb-2">Developer Reply:</p>
            ${c.replies.map(r => `<p class="text-sm text-slate-700">${r.text}</p>`).join('<hr class="border-amber-100 my-2">')}
        </div>` : ''}
    </div>`).join('');
}

function markConcernSolved(id) {
    const c = concerns.find(x => x.id === id);
    if (c) { c.solved = true; c.read = true; }
    saveConcerns(); renderConcerns();
}
function deleteConcern(id) { concerns = concerns.filter(c => c.id !== id); saveConcerns(); renderConcerns(); updateConcernBadge(); }
function clearAllConcerns() { if (!confirm("Clear all concerns?")) return; concerns = []; saveConcerns(); renderConcerns(); updateConcernBadge(); }

function openConcernReply(id) {
    const c = concerns.find(x => x.id === id);
    if (!c) return;
    document.getElementById('concern-reply-id').value = id;
    document.getElementById('concern-reply-subject').innerText = c.subject;
    document.getElementById('concern-reply-text').value = '';
    openModal('concernReplyModal');
}
function sendConcernReply() {
    const id = document.getElementById('concern-reply-id').value;
    const text = document.getElementById('concern-reply-text').value.trim();
    if (!text) { showToast("Please type a reply."); return; }
    const c = concerns.find(x => x.id === id);
    if (!c) return;
    if (!c.replies) c.replies = [];
    c.replies.push({ from: 'Developer', text, timestamp: Date.now() });
    saveConcerns(); closeModal('concernReplyModal');
    showToast("Reply sent."); renderConcerns();
}

// ─────────────────────────── FOOTER INFO ───────────────────────────
function buildAckHTML(section) {
    const items = siteAcknowledgements[section] || [];
    if (!items.length) return '<p class="text-sm text-slate-400">No entries yet.</p>';
    const colorMap = { developers:'amber', artists:'purple', special:'blue' };
    const c = colorMap[section] || 'slate';
    return items.map(item => `
    <div class="flex items-center gap-4 p-4 bg-${c}-50 rounded-2xl border border-${c}-100 mt-2 ${item.uid ? 'cursor-pointer hover:bg-'+c+'-100 transition' : ''}" ${item.uid ? `onclick="closeModal('infoModal'); showPage('user-profile','${item.uid}')"` : ''}>
        <i class="fas fa-${section==='developers'?'crown':section==='artists'?'palette':'star'} text-${c}-500 text-2xl"></i>
        <div><p class="font-black text-slate-900 uppercase text-sm">${item.name}</p><p class="text-[10px] text-slate-500 font-bold uppercase">${item.role}</p></div>
    </div>`).join('');
}

const infoContent = {
    about: { title:'About Us', body:`<p>JIRO is a magical writing platform where storytellers — called <strong>Magicians</strong> — bring their worlds to life. Founded and developed by <strong>Jirohanna</strong>, JIRO was built out of a love for fiction, creativity, and community.</p><p>Our mission is to give every writer a beautiful, distraction-free space to publish their manuscripts and connect with readers who care.</p>`, form:false },
    tos: { title:'Terms of Services', body:`<p>By using JIRO, you agree to our Terms of Service. Key points:</p><p>1. Respect all community members.<br>2. Explicit content (18+) requires age verification via birthday.<br>3. You retain ownership of your manuscripts.<br>4. JIRO Sigils have no real-world monetary value.<br>5. Accounts may be terminated for violations.</p>`, form:false },
    'content-policy': { title:'Content Policy', body:`<p>Prohibited content includes:<br>• Sexual content involving minors<br>• Targeted harassment or hate speech<br>• Content glorifying real-world violence<br>• Plagiarism or copyright infringement</p><p>Explicit (18+) content must be flagged in settings and is only visible to verified adults.</p>`, form:false },
    privacy: { title:'Privacy Policy', body:`<p>All data is stored locally in your browser via localStorage. We do not use tracking, analytics, or advertising. You can delete your account at any time.</p>`, form:false },
    'report-abuse': { title:'Report Abuse', body:`<p>If you've witnessed a Content Policy violation, report it below. The developer will review all reports promptly.</p>`, form:true },
    'tech-support': { title:'Technical Support', body:`<p>Experiencing a bug? Describe what happened and the developer will look into it.</p>`, form:true },
    feedback: { title:'Feedback', body:`<p>We'd love to hear from you! Feature suggestions, compliments, or any thoughts — your feedback helps JIRO grow.</p>`, form:true },
    developers: { title:'Developers', body: null, ack: 'developers', form:false },
    artists: { title:'Artists', body: null, ack: 'artists', form:false },
    special: { title:'Special Thanks', body: null, ack: 'special', form:false },
};

function openInfoModal(key) {
    const data = infoContent[key]; if (!data) return;
    document.getElementById('info-modal-title').innerText = data.title;
    if (data.ack) {
        document.getElementById('info-modal-body').innerHTML = buildAckHTML(data.ack);
    } else {
        document.getElementById('info-modal-body').innerHTML = data.body || '';
    }
    const formEl = document.getElementById('info-modal-form');
    if (data.form) {
        formEl.classList.remove('hidden');
        document.getElementById('contact-subject').value = '';
        document.getElementById('contact-message').value = '';
        document.getElementById('contact-subject').placeholder = `${data.title}: `;
    } else { formEl.classList.add('hidden'); }
    openModal('infoModal');
}

// ─────────────────────────── RATINGS ───────────────────────────
function getBookRating(book) {
    const ratings = book.ratings || [];
    if (!ratings.length) return { avg:0, count:0 };
    const avg = ratings.reduce((s,r) => s + r.stars, 0) / ratings.length;
    return { avg, count: ratings.length };
}

function renderRateStars(bookId) {
    const container = document.getElementById('rate-stars'); if (!container) return;
    const book = allBooks.find(b => b.id === bookId); if (!book) return;
    const myRating = currentUser ? (book.ratings || []).find(r => r.uid === currentUser.uid) : null;
    const { avg, count } = getBookRating(book);
    const currentStars = myRating ? myRating.stars : 0;
    container.innerHTML = [1,2,3,4,5].map(i => `<button class="star-btn ${i <= currentStars ? 'star-filled' : 'star-empty'}" onclick="rateBook('${bookId}',${i})">${i <= currentStars ? '★' : '☆'}</button>`).join('');
    const cp = document.getElementById('rate-current');
    if (cp) cp.innerText = myRating ? `Your rating: ${currentStars}/5 · Avg: ${avg.toFixed(1)} (${count} ratings)` : `Average: ${count > 0 ? avg.toFixed(1) + ' (' + count + ')' : 'No ratings yet'}`;
}

function rateBook(bookId, stars) {
    if (!currentUser) return openModal('authModal');
    const book = allBooks.find(b => b.id === bookId); if (!book) return;
    if (!book.ratings) book.ratings = [];
    const idx = book.ratings.findIndex(r => r.uid === currentUser.uid);
    if (idx === -1) book.ratings.push({ uid: currentUser.uid, stars });
    else book.ratings[idx].stars = stars;
    saveGlobalLibrary();
    renderRateStars(bookId);
    showToast(`Rated ${stars} stars!`);
}

// ─────────────────────────── REVIEWS ───────────────────────────
function initReviewStars() {
    reviewStarSelected = 0; reviewSelectedBookId = null;
    const container = document.getElementById('review-stars');
    if (!container) return;
    container.innerHTML = [1,2,3,4,5].map(i => `<button class="star-btn star-empty" onclick="selectReviewStar(${i})">${'☆'}</button>`).join('');
    const rb = document.getElementById('review-book-search'); if (rb) rb.value = '';
    const rp = document.getElementById('review-selected-book'); if (rp) rp.classList.add('hidden');
    const rr = document.getElementById('review-book-results'); if (rr) rr.classList.add('hidden');
    const rt = document.getElementById('review-text'); if (rt) rt.value = '';
}

function selectReviewStar(n) {
    reviewStarSelected = n;
    const container = document.getElementById('review-stars');
    container.innerHTML = [1,2,3,4,5].map(i => `<button class="star-btn ${i <= n ? 'star-filled' : 'star-empty'}" onclick="selectReviewStar(${i})">${i <= n ? '★' : '☆'}</button>`).join('');
}

function reviewSearchBooks(val) {
    const container = document.getElementById('review-book-results'); if (!container) return;
    if (!val.trim()) { container.classList.add('hidden'); return; }
    const q = val.toLowerCase();
    const results = allBooks.filter(b => b.published && b.title.toLowerCase().includes(q)).slice(0, 6);
    if (!results.length) { container.classList.add('hidden'); return; }
    container.innerHTML = results.map(b => `<div class="sr-item" onclick="selectReviewBook('${b.id}','${b.title.replace(/'/g,"\\'")}')">
        <div class="w-6 h-9 bg-slate-100 rounded overflow-hidden shrink-0"><img src="${b.cover || 'images/jiropc.png'}" class="w-full h-full object-cover" onerror="this.src='images/jiropc.png'"></div>
        <div><p class="text-xs font-black text-slate-800 uppercase">${b.title}</p><p class="text-[9px] text-slate-400">${b.authorName}</p></div>
    </div>`).join('');
    container.classList.remove('hidden');
}

function selectReviewBook(id, title) {
    reviewSelectedBookId = id;
    document.getElementById('review-book-search').value = title;
    document.getElementById('review-book-results').classList.add('hidden');
    const sp = document.getElementById('review-selected-book');
    sp.innerText = '📖 ' + title; sp.classList.remove('hidden');
}

function submitReview() {
    if (!currentUser) { closeModal('writeReviewModal'); openModal('authModal'); return; }
    if (!reviewSelectedBookId) { showToast("Please select a manuscript."); return; }
    const text = document.getElementById('review-text').value.trim();
    if (!text) { showToast("Please write a review."); return; }
    const book = allBooks.find(b => b.id === reviewSelectedBookId);
    if (!book) return;
    allReviews.push({
        id: 'rv_' + Date.now(),
        bookId: reviewSelectedBookId, bookTitle: book.title, bookCover: book.cover,
        authorId: currentUser.uid, authorName: currentUser.pseudonym, authorPfp: currentUser.pfp,
        text, stars: reviewStarSelected, timestamp: Date.now()
    });
    saveReviews();
    closeModal('writeReviewModal');
    showToast("Review published!"); renderReviews();
}

function renderReviews() {
    const container = document.getElementById('reviews-list'); if (!container) return;
    const q = (document.getElementById('review-search')?.value || '').toLowerCase();
    const filtered = allReviews.filter(r => r.bookTitle.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q));
    if (!filtered.length) { container.innerHTML = `<p class="text-center py-16 text-slate-300 font-bold uppercase text-xs">No reviews yet. Be the first!</p>`; return; }
    container.innerHTML = [...filtered].reverse().map(r => `
    <div class="review-card">
        <div class="flex items-start gap-4 mb-3">
            <div class="w-12 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                <img src="${r.bookCover || 'images/jiropc.png'}" class="w-full h-full object-cover" onerror="this.src='images/jiropc.png'">
            </div>
            <div class="flex-1">
                <button onclick="openLobby('${r.bookId}')" class="text-sm font-black text-slate-900 uppercase hover:text-amber-500 transition">${r.bookTitle}</button>
                <div class="flex items-center gap-2 mt-1">${r.stars ? starsHTML(r.stars, 1).replace(/\(1\)/,'') : '<span class="text-[9px] text-slate-300 font-bold">No rating</span>'}</div>
                <div class="flex items-center gap-2 mt-1">
                    <img src="${r.authorPfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName)}&size=30`}" class="w-5 h-5 rounded-lg object-cover">
                    <button onclick="showPage('user-profile','${r.authorId}')" class="text-[9px] font-black text-amber-500 uppercase hover:underline">${r.authorName}</button>
                    <span class="text-[8px] text-slate-300 font-bold">· ${new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
            ${currentUser && (currentUser.uid === r.authorId || currentUser.role === 'Developer') ? `<button onclick="deleteReview('${r.id}')" class="text-red-300 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>` : ''}
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">${r.text}</p>
    </div>`).join('');
}

function deleteReview(id) {
    allReviews = allReviews.filter(r => r.id !== id);
    saveReviews(); renderReviews();
}

// ─────────────────────────── SOCIAL ───────────────────────────
function toggleLike(bookId, chIdx) {
    if (!currentUser) return openModal('authModal');
    const book = allBooks.find(b => b.id === bookId); const chapter = book.chapters[chIdx];
    if (!chapter.likes) chapter.likes = [];
    const idx = chapter.likes.indexOf(currentUser.uid);
    if (idx === -1) chapter.likes.push(currentUser.uid); else chapter.likes.splice(idx, 1);
    saveGlobalLibrary(); renderReader(bookId);
}

function toggleCommentLike(bookId, commentId) {
    if (!currentUser) return openModal('authModal');
    const book = allBooks.find(b => b.id === bookId);
    const comment = book.comments.find(c => c.id === commentId); if (!comment) return;
    if (!comment.likes) comment.likes = [];
    const idx = comment.likes.indexOf(currentUser.uid);
    if (idx === -1) comment.likes.push(currentUser.uid); else comment.likes.splice(idx, 1);
    saveGlobalLibrary(); renderComments(bookId);
}

function postComment(parentId = null) {
    if (!currentUser) return openModal('authModal');
    const inputId = parentId ? `reply-input-${parentId}` : 'main-comment-input';
    const input = document.getElementById(inputId); if (!input) return;
    const text = input.value.trim(); if (!text) return;
    const book = allBooks.find(b => b.id === currentBookId);
    if (!book.comments) book.comments = [];
    book.comments.push({ id:'c_'+Date.now(), authorId:currentUser.uid, authorName:currentUser.pseudonym, authorPfp:currentUser.pfp, text, parentId, timestamp:Date.now(), likes:[] });
    saveGlobalLibrary(); input.value = ''; renderComments(currentBookId);
}

function renderComments(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    const comments = book.comments || [];
    const container = document.getElementById('comments-list');
    container.innerHTML = comments.filter(c => !c.parentId).map(c => {
        const replies = comments.filter(r => r.parentId === c.id);
        const cLikes = (c.likes || []).length;
        const cLiked = currentUser && (c.likes || []).includes(currentUser.uid);
        return `<div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div class="flex items-start gap-4 mb-4">
                <img src="${c.authorPfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}`}" class="w-10 h-10 rounded-xl object-cover">
                <div class="flex-1">
                    <h4 class="text-xs font-black uppercase text-slate-900 tracking-tight">${c.authorName}</h4>
                    <p class="text-[9px] text-slate-400 uppercase font-black tracking-widest">${new Date(c.timestamp).toLocaleDateString()}</p>
                </div>
                ${currentUser && (currentUser.uid === c.authorId || currentUser.role === 'Developer') ? `<button onclick="deleteComment('${bookId}','${c.id}')" class="text-[8px] font-black uppercase text-red-300 hover:text-red-500 transition">Delete</button>` : ''}
            </div>
            <p class="text-sm text-slate-600 mb-4 whitespace-pre-wrap">${c.text}</p>
            <div class="flex items-center gap-4">
                <button onclick="toggleCommentLike('${bookId}','${c.id}')" class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${cLiked?'text-red-500':'text-slate-400'} hover:text-red-500 transition"><i class="${cLiked?'fas':'far'} fa-heart"></i> <span>${cLikes}</span></button>
                <button onclick="toggleReplyBox('${c.id}')" class="text-[9px] font-black uppercase text-amber-500 tracking-widest hover:underline">Reply</button>
            </div>
            <div id="reply-box-${c.id}" class="hidden mt-6">
                <textarea id="reply-input-${c.id}" placeholder="Respond to this echo..." class="w-full p-4 bg-slate-50 border rounded-xl text-sm outline-none mb-2 h-24 focus:ring-2 ring-amber-400 transition"></textarea>
                <button onclick="postComment('${c.id}')" class="bg-jiro text-white px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest">Send Reply</button>
            </div>
            <div class="comment-thread mt-6 space-y-4">
                ${replies.map(r => { const rL=(r.likes||[]).length; const rLiked=currentUser&&(r.likes||[]).includes(currentUser.uid); return `
                <div class="bg-slate-50/50 p-4 rounded-2xl">
                    <div class="flex items-center gap-3 mb-2">
                        <img src="${r.authorPfp||`https://ui-avatars.com/api/?name=${encodeURIComponent(r.authorName)}`}" class="w-6 h-6 rounded-lg object-cover">
                        <h5 class="text-[10px] font-black text-slate-900 uppercase">${r.authorName}</h5>
                        ${currentUser&&(currentUser.uid===r.authorId||currentUser.role==='Developer')?`<button onclick="deleteComment('${bookId}','${r.id}')" class="ml-auto text-[8px] font-black uppercase text-red-300 hover:text-red-500 transition">Delete</button>`:''}
                    </div>
                    <p class="text-xs text-slate-500 mb-2">${r.text}</p>
                    <button onclick="toggleCommentLike('${bookId}','${r.id}')" class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${rLiked?'text-red-500':'text-slate-400'} hover:text-red-500 transition"><i class="${rLiked?'fas':'far'} fa-heart"></i> <span>${rL}</span></button>
                </div>`; }).join('')}
            </div>
        </div>`;
    }).join('') || `<p class="text-center text-slate-300 uppercase text-[9px] font-black py-8">No echoes yet. Be the first.</p>`;
}

function deleteComment(bookId, commentId) {
    const book = allBooks.find(b => b.id === bookId); if (!book) return;
    book.comments = book.comments.filter(c => c.id !== commentId && c.parentId !== commentId);
    saveGlobalLibrary(); renderComments(bookId);
}
function toggleReplyBox(id) { const box = document.getElementById(`reply-box-${id}`); if (box) box.classList.toggle('hidden'); }

// ─────────────────────────── BOOK CARD ───────────────────────────
function renderBookCard(book) {
    const totalLikes = book.chapters.reduce((s,ch) => s+(ch.likes||[]).length, 0);
    const { avg, count } = getBookRating(book);
    const coverSrc = book.cover || 'images/jiropc.png';
    return `<div class="book-card group" onclick="openLobby('${book.id}')">
        <div class="book-cover-aspect rounded-2xl shadow-lg overflow-hidden mb-3 relative bg-slate-100 border border-slate-100">
            <img src="${coverSrc}" class="w-full h-full object-cover" onerror="this.src='images/jiropc.png'">
            ${totalLikes>0?`<div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 text-[8px] font-black text-red-500 flex items-center gap-1"><i class="fas fa-heart"></i> ${totalLikes}</div>`:''}
            ${book.explicit?`<div class="absolute top-2 left-2 explicit-badge">18+</div>`:''}
            ${book.paid?`<div class="absolute bottom-2 right-2 bg-amber-400/90 text-slate-900 rounded-lg px-2 py-0.5 text-[8px] font-black uppercase">⚡ Paid</div>`:''}
        </div>
        <h3 class="font-black text-slate-900 truncate text-[11px] px-1 uppercase tracking-tight">${book.title}</h3>
        <p class="text-[8px] text-slate-400 uppercase font-black tracking-widest px-1 mt-0.5">${book.authorName}</p>
        ${book.genre?`<p class="text-[7px] text-amber-600 font-black uppercase tracking-widest px-1 mt-0.5">${book.genre}</p>`:''}
        ${count>0?`<div class="flex items-center gap-1 px-1 mt-0.5"><span class="star-filled text-[10px]">★</span><span class="text-[8px] font-black text-slate-400">${avg.toFixed(1)}</span></div>`:''}
        <span class="px-1 mt-0.5 inline-block status-badge status-${book.status||'ongoing'} text-[7px]">${book.status||'ongoing'}</span>
    </div>`;
}

function getBookTotalLikes(book) { return book.chapters.reduce((s,ch) => s+(ch.likes||[]).length, 0); }

// ─────────────────────────── GENRE PAGE ───────────────────────────
function handleGenreSelect(genre) {
    const sel = document.getElementById('genre-filter');
    if (!genre) { renderHome(); return; }
    showPage('genre', genre);
    sel.value = '';
}

function renderGenrePage(genre) {
    const info = GENRE_INFO[genre] || { emoji:'📖', desc:'', short:'' };
    const banner = document.getElementById('genre-banner');
    if (banner) {
        banner.innerHTML = `
        <span class="genre-banner-emoji">${info.emoji}</span>
        <h1 class="genre-banner-title">${genre}${info.short?' ('+info.short+')':''}</h1>
        <p class="genre-banner-desc">${info.desc}</p>`;
    }
    const books = allBooks.filter(b => b.genre === genre && b.published && b.visibility !== 'private' && !(b.explicit && !(currentUser && currentUser.isAdult)));
    const grid = document.getElementById('genre-books-grid');
    if (grid) grid.innerHTML = books.map(b => renderBookCard(b)).join('') || `<p class="col-span-full py-16 text-center text-slate-300 font-bold uppercase text-xs">No manuscripts in this genre yet.</p>`;
}

// ─────────────────────────── FEATURED MAGICIANS ───────────────────────────
function switchFeaturedTab(period, btn) {
    featuredPeriod = period;
    document.querySelectorAll('#featured-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderFeaturedMagicians();
}
function switchFeaturedCategory(cat, btn) {
    featuredCategory = cat;
    document.querySelectorAll('.ftabs-cat').forEach(b => {
        b.classList.remove('active','text-amber-600','border-amber-200','bg-amber-50');
        b.classList.add('text-slate-400','border-slate-100','bg-white');
    });
    btn.classList.add('active','text-amber-600','border-amber-200','bg-amber-50');
    btn.classList.remove('text-slate-400','border-slate-100','bg-white');
    renderFeaturedMagicians();
}
function renderFeaturedMagicians() {
    const container = document.getElementById('featured-magicians-list'); if (!container) return;
    let scored = Object.values(allUsers).map(u => {
        const books = allBooks.filter(b => b.authorId === u.uid && b.published && b.visibility !== 'private');
        let score = 0;
        if (featuredCategory === 'likes') score = books.reduce((s,b) => s+getBookTotalLikes(b), 0);
        else if (featuredCategory === 'chapters') score = books.reduce((s,b) => s+b.chapters.length, 0);
        else if (featuredCategory === 'views') score = books.reduce((s,b) => s+(b.views||0), 0);
        return { u, score };
    }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, 3);

    if (!scored.length) { container.innerHTML = `<p class="col-span-3 text-center text-slate-300 font-bold uppercase text-xs py-6">No data yet. Publish manuscripts to appear here!</p>`; return; }
    const rankClass = ['gold','silver','bronze'];
    const rankLabel = i => ['1ST','2ND','3RD'][i] || `${i+1}TH`;
    const metaLabel = () => featuredCategory === 'likes' ? 'likes' : featuredCategory === 'chapters' ? 'chapters' : 'views';
    container.innerHTML = scored.map(({u, score}, i) => `
    <div class="featured-card" onclick="showPage('user-profile','${u.uid}')">
        <span class="featured-rank ${rankClass[i]||''}">${rankLabel(i)}</span>
        <img src="${u.pfp||`https://ui-avatars.com/api/?name=${encodeURIComponent(u.pseudonym)}&size=80`}" class="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shrink-0">
        <div class="flex-1 min-w-0">
            <p class="font-black text-slate-900 uppercase text-xs truncate">${u.pseudonym}</p>
            <p class="text-[9px] text-amber-500 font-black uppercase">${score} ${metaLabel()}</p>
        </div>
    </div>`).join('');
}

// ─────────────────────────── HOME ───────────────────────────
function renderHome() {
    const sortedProgress = Object.entries(userProgress).sort((a,b) => b[1].lastAccessed - a[1].lastAccessed);
    const continueSection = document.getElementById('continue-reading-section');
    let visibleBooks = allBooks.filter(b => {
        if (!b.published) return false;
        if (b.visibility === 'private' && !(currentUser && b.authorId === currentUser.uid)) return false;
        if (b.explicit && !(currentUser && currentUser.isAdult)) return false;
        return true;
    });

    renderFeaturedMagicians();

    if (currentUser && sortedProgress.length > 0) {
        continueSection.classList.remove('hidden');
        document.getElementById('continue-reading-list').innerHTML = sortedProgress.slice(0, 2).map(([id]) => {
            const b = visibleBooks.find(x => x.id === id) || allBooks.find(x => x.id === id);
            if (!b) return '';
            return `<div onclick="openLobby('${b.id}')" class="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex gap-6 hover:shadow-xl transition cursor-pointer group">
                <div class="w-24 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                    <img src="${b.cover||'images/jiropc.png'}" class="w-full h-full object-cover" onerror="this.src='images/jiropc.png'">
                </div>
                <div class="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <h3 class="font-black text-slate-900 uppercase text-xs tracking-tight truncate">${b.title}</h3>
                        <p class="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">${b.authorName}</p>
                        <p class="text-[10px] text-slate-400 mt-2 line-clamp-2">${b.synopsis||'Continue your journey...'}</p>
                    </div>
                    <div class="flex items-center justify-between text-slate-300">
                        <span class="text-[8px] font-black uppercase tracking-widest">Chapter ${(userProgress[id].lastChapter||0)+1}</span>
                        <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </div>
            </div>`;
        }).join('');
    } else { continueSection.classList.add('hidden'); }

    const topPicks = [...visibleBooks].sort((a,b) => getBookTotalLikes(b)-getBookTotalLikes(a)).slice(0,5);
    document.getElementById('top-picks-library').innerHTML = topPicks.map(b => renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-xs font-black">No manuscripts yet.</p>`;

    const suggestedSection = document.getElementById('suggested-section');
    if (currentUser) {
        const interactedIds = new Set([...userBookmarks, ...Object.keys(userProgress)]);
        const tagFreq = {};
        allBooks.filter(b => interactedIds.has(b.id)).forEach(b => (b.tags||[]).forEach(t => { tagFreq[t]=(tagFreq[t]||0)+1; }));
        const topTags = Object.entries(tagFreq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);
        if (topTags.length > 0) {
            const suggested = visibleBooks.filter(b => !interactedIds.has(b.id) && (b.tags||[]).some(t=>topTags.includes(t))).slice(0,5);
            if (suggested.length > 0) { suggestedSection.classList.remove('hidden'); document.getElementById('suggested-library').innerHTML = suggested.map(b=>renderBookCard(b)).join(''); }
            else suggestedSection.classList.add('hidden');
        } else suggestedSection.classList.add('hidden');
    } else suggestedSection.classList.add('hidden');

    document.getElementById('public-library').innerHTML = visibleBooks.map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-xs font-black">The archive is empty.</p>`;
}

// ─────────────────────────── USER PROFILE ───────────────────────────
function renderUserProfile(authorId) {
    const author = Object.values(allUsers).find(u=>u.uid===authorId) || {pseudonym:"Unknown Author",uid:authorId,pfp:'',bio:'',role:'Magician'};
    const created = allBooks.filter(b=>b.authorId===authorId);
    let totalLikes=0, totalViews=0;
    created.forEach(b => { totalViews+=(b.views||0); b.chapters.forEach(ch => { if(ch.likes) totalLikes+=ch.likes.length; }); });

    document.getElementById('view-profile-pfp').src = author.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.pseudonym)}&size=300`;
    document.getElementById('view-profile-name').innerText = author.pseudonym;
    document.getElementById('view-profile-bio').innerText = author.bio||'';
    document.getElementById('view-profile-count').innerText = created.filter(b=>b.published).length;
    document.getElementById('view-profile-likes').innerText = totalLikes;
    document.getElementById('view-profile-views').innerText = totalViews;
    document.getElementById('view-profile-sigils').innerText = (author.sigils||0).toFixed(2);

    document.getElementById('profile-dev-badge').classList.toggle('hidden', author.role!=='Developer');
    document.getElementById('profile-artist-badge').classList.toggle('hidden', author.role!=='Artist');

    const gb = document.getElementById('profile-gender-badge');
    if (author.gender) {
        gb.classList.remove('hidden');
        if (author.gender==='witch') { gb.innerText='🧙‍♀️ Witch'; gb.className='px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700'; }
        else { gb.innerText='🧙 Wizard'; gb.className='px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-700'; }
    } else gb.classList.add('hidden');

    const actionArea = document.getElementById('profile-actions-area');
    if (currentUser) {
        if (currentUser.uid===authorId) actionArea.innerHTML = `<button onclick="openModal('userSettingsModal')" class="bg-amber-400 text-slate-900 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-300 transition"><i class="fas fa-pen mr-2"></i>Edit Identity</button>`;
        else if (currentUser.role==='Developer') actionArea.innerHTML = `<button onclick="adminDeleteUser('${author.email}')" class="bg-red-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-800 transition"><i class="fas fa-skull-crossbones mr-2"></i>Erase Identity</button>`;
        else actionArea.innerHTML='';
    } else actionArea.innerHTML='';

    const visibleCreated = created.filter(b => {
        if (!b.published) return currentUser && currentUser.uid === authorId;
        if (b.visibility==='private' && !(currentUser&&currentUser.uid===authorId)) return false;
        if (b.explicit && !(currentUser&&currentUser.isAdult)) return false;
        return true;
    });
    document.getElementById('view-profile-created').innerHTML = visibleCreated.map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-[9px] font-bold">No manifestations yet.</p>`;

    const readingSect = document.getElementById('view-profile-reading-section');
    if (currentUser && authorId===currentUser.uid) {
        readingSect.classList.remove('hidden');
        document.getElementById('view-profile-reading').innerHTML = allBooks.filter(b=>Object.keys(userProgress).includes(b.id)).map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-[9px] font-bold">No journeys started.</p>`;
    } else readingSect.classList.add('hidden');
}

// ─────────────────────────── READ LIST ───────────────────────────
function showReadList(uid) {
    const owner = Object.values(allUsers).find(u=>u.uid===uid);
    const isOwner = currentUser && currentUser.uid===uid;
    const isPrivate = owner ? owner.readListPrivate : false;
    document.getElementById('readlist-title').innerText = isOwner ? 'My Read List' : `${owner?.pseudonym||'User'}'s Read List`;
    document.getElementById('readlist-subtitle').innerText = isPrivate ? '🔒 Private' : '🌐 Public';
    const privacyArea = document.getElementById('readlist-privacy-area');
    if (isOwner) {
        privacyArea.innerHTML = `<button onclick="toggleReadListPrivacy()" class="privacy-pill ${isPrivate?'private-on':''}"><i class="fas fa-${isPrivate?'lock':'globe'} text-[8px]"></i> ${isPrivate?'Private':'Public'}</button>`;
    } else privacyArea.innerHTML='';
    const grid = document.getElementById('readlist-grid');
    if (isPrivate && !isOwner) { grid.innerHTML=`<p class="col-span-full py-16 text-center text-slate-300 uppercase text-xs font-black"><i class="fas fa-lock text-2xl block mb-3"></i>This read list is private.</p>`; return; }
    const savedBooks = allBooks.filter(b => { const bk=JSON.parse(localStorage.getItem('jiro_bookmarks_'+uid)||'[]'); return bk.includes(b.id)&&b.visibility!=='private'; });
    grid.innerHTML = savedBooks.map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-16 text-center text-slate-300 uppercase text-xs font-black">No books saved yet.</p>`;
}
function toggleReadListPrivacy() {
    if (!currentUser) return;
    currentUser.readListPrivate = !currentUser.readListPrivate;
    allUsers[currentUser.email] = currentUser;
    saveRegistry(); localStorage.setItem('jiro_active_user', JSON.stringify(currentUser));
    showReadList(currentUser.uid);
}

// ─────────────────────────── NAVIGATION ───────────────────────────
function showPage(id, extra) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + id);
    if (!target) return;
    target.classList.add('active');
    if (id==='home') renderHome();
    if (id==='user-profile') renderUserProfile(extra||(currentUser&&currentUser.uid));
    if (id==='studio') { if (!currentUser) { openModal('authModal'); return; } renderStudio(); }
    if (id==='library') { if (!currentUser) { openModal('authModal'); return; } renderLibrary(); }
    if (id==='readlist') { if (!currentUser && !extra) { openModal('authModal'); return; } showReadList(extra||currentUser?.uid); }
    if (id==='devpanel') { if (!currentUser||currentUser.role!=='Developer') { showPage('home'); return; } renderDevPanel(); }
    if (id==='concerns') { if (!currentUser||currentUser.role!=='Developer') { showPage('home'); return; } renderConcerns(); }
    if (id==='my-concerns') { if (!currentUser) { openModal('authModal'); return; } renderMyConcerns(); }
    if (id==='dev-ack') { if (!currentUser||currentUser.role!=='Developer') { showPage('home'); return; } renderAcknowledgementManager(); }
    if (id==='genre') { renderGenrePage(extra); }
    if (id==='reviews') renderReviews();
    window.scrollTo(0,0);
}

// ─────────────────────────── LOBBY ───────────────────────────
function openLobby(id) {
    const b = allBooks.find(x=>x.id===id); if (!b) return;
    if (b.explicit && !(currentUser && currentUser.isAdult)) { showToast("⚠️ This content is restricted to verified adults (18+)."); return; }

    const author = Object.values(allUsers).find(u=>u.uid===b.authorId)||{pseudonym:b.authorName,pfp:''};
    document.getElementById('lobby-cover').src = b.cover||'images/jiropc.png';
    document.getElementById('lobby-title').innerText = b.title;
    document.getElementById('lobby-synopsis').innerText = b.synopsis||"No synopsis.";
    document.getElementById('lobby-views').innerText = `${b.views||0} views · ${getBookTotalLikes(b)} likes`;
    document.getElementById('lobby-author-pfp').src = author.pfp||`https://ui-avatars.com/api/?name=${encodeURIComponent(author.pseudonym)}`;
    document.getElementById('lobby-author-btn').innerText = author.pseudonym;
    document.getElementById('lobby-author-btn').onclick = () => { closeModal('bookLobbyModal'); showPage('user-profile', b.authorId); };

    const { avg, count } = getBookRating(b);
    document.getElementById('lobby-rating-display').innerHTML = count > 0 ? starsHTML(avg, count) : `<span class="text-[9px] text-slate-300 font-bold uppercase">No ratings yet</span>`;

    let metaHtml = '';
    if (b.genre) metaHtml += `<span class="genre-badge">${b.genre}</span>`;
    if (b.pov) metaHtml += `<span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">${b.pov} POV</span>`;
    if (b.explicit) metaHtml += `<span class="explicit-badge">18+</span>`;
    if (b.paid) metaHtml += `<span class="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-[9px] font-black uppercase">⚡ Paid</span>`;
    const statusColors = {ongoing:'text-green-700 bg-green-50 border-green-200', completed:'text-blue-700 bg-blue-50 border-blue-200', hiatus:'text-amber-700 bg-amber-50 border-amber-200'};
    metaHtml += `<span class="border px-3 py-1 rounded-lg text-[9px] font-black uppercase ${statusColors[b.status||'ongoing']||''}">${b.status||'ongoing'}</span>`;
    document.getElementById('lobby-meta-badges').innerHTML = metaHtml;

    document.getElementById('lobby-tags').innerHTML = (b.tags||[]).map(t=>`<span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">${t}</span>`).join('');

    const bmBtn = document.getElementById('lobby-bookmark-btn');
    bmBtn.innerHTML = userBookmarks.includes(id) ? `<i class="fas fa-bookmark text-amber-500"></i> Saved` : `<i class="far fa-bookmark"></i> Save`;
    bmBtn.onclick = () => {
        if (!currentUser) { openModal('authModal'); return; }
        const idx = userBookmarks.indexOf(id);
        if (idx===-1) userBookmarks.push(id); else userBookmarks.splice(idx,1);
        saveBookmarks(); openLobby(id);
    };

    const finBtn = document.getElementById('lobby-finished-btn');
    const isFinished = userFinished.includes(id);
    finBtn.innerHTML = isFinished ? `<i class="fas fa-check-circle text-green-500"></i> Finished` : `<i class="far fa-check-circle"></i> Mark Done`;
    finBtn.onclick = () => {
        if (!currentUser) { openModal('authModal'); return; }
        const idx = userFinished.indexOf(id);
        if (idx===-1) userFinished.push(id); else userFinished.splice(idx,1);
        saveFinished(); openLobby(id);
    };

    document.getElementById('lobby-read-btn').onclick = () => { closeModal('bookLobbyModal'); startReading(id); };

    const devActions = document.getElementById('lobby-dev-actions');
    if (currentUser && currentUser.role==='Developer') {
        devActions.classList.remove('hidden');
        document.getElementById('lobby-dev-delete-btn').onclick = () => adminDeleteManuscript(id);
    } else devActions.classList.add('hidden');

    openModal('bookLobbyModal');
}

// ─────────────────────────── READER ───────────────────────────
function startReading(id) {
    if (!currentUser) return openModal('authModal');
    const b = allBooks.find(x=>x.id===id);
    if (!b||!b.chapters||b.chapters.length===0) { showToast("This manuscript has no chapters yet."); return; }
    currentBookId = id;
    if (!userProgress[id]) userProgress[id] = { lastChapter:0, lastAccessed:Date.now() };
    userProgress[id].lastAccessed = Date.now();
    b.views = (b.views||0)+1;
    saveGlobalLibrary(); saveProgress();
    renderReader(id); showPage('reader');
}

function renderReader(id) {
    const b = allBooks.find(x=>x.id===id); if (!b||!b.chapters.length) return;
    const currentChIdx = userProgress[id].lastChapter;
    const ch = b.chapters[currentChIdx];
    document.getElementById('reader-title-label').innerText = b.title;

    const totalLikes = (ch.likes||[]).length;
    const isLiked = currentUser&&ch.likes&&ch.likes.includes(currentUser.uid);
    document.getElementById('reader-like-btn').innerHTML = `<i class="${isLiked?'fas':'far'} fa-heart ${isLiked?'text-red-500':''} mr-1"></i> <span>${totalLikes}</span>`;
    document.getElementById('reader-like-btn').onclick = () => toggleLike(id, currentChIdx);

    const devBtn = document.getElementById('reader-dev-delete-btn');
    devBtn.innerHTML = (currentUser&&currentUser.role==='Developer') ? `<button onclick="adminDeleteManuscript('${id}')" class="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition"><i class="fas fa-skull-crossbones mr-1"></i> Delete</button>` : '';

    // Check if chapter is locked
    const locked = !isChapterUnlocked(id, currentChIdx);
    const povLabel = b.pov ? `<span class="text-[9px] text-slate-400 font-black uppercase">${b.pov} POV</span>` : '';

    if (locked) {
        document.getElementById('reader-content').innerHTML = `
        <div class="text-center mb-16">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Chapter ${currentChIdx+1} of ${b.chapters.length}</p>
            <h1 class="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none mt-2">${ch.title||'Untitled Chapter'}</h1>
        </div>
        <div class="paid-chapter-lock">
            <div class="text-5xl mb-4">⚡</div>
            <p class="text-xl font-black uppercase mb-2">Paid Chapter</p>
            <p class="text-sm text-white/60 mb-6">This chapter costs <strong class="text-amber-400">5 JIRO Sigils</strong> to unlock.<br>Your balance: <strong class="text-amber-400">${(currentUser?.sigils||0).toFixed(2)} Sigils</strong></p>
            <button onclick="unlockPaidChapter('${id}',${currentChIdx})" class="bg-amber-400 text-slate-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-300 transition">Unlock for 5 Sigils</button>
        </div>
        <div class="mt-10 pt-10 border-t flex justify-between items-center">
            <button onclick="changeChapter(-1)" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition" ${currentChIdx===0?'disabled style="opacity:0"':''}><i class="fas fa-chevron-left mr-2"></i> Previous</button>
            <button onclick="changeChapter(1)" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition" ${currentChIdx===b.chapters.length-1?'disabled style="opacity:0"':''}>Next <i class="fas fa-chevron-right ml-2"></i></button>
        </div>`;
    } else {
        document.getElementById('reader-content').innerHTML = `
        <div class="text-center mb-20">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Chapter ${currentChIdx+1} of ${b.chapters.length}</p>
            ${povLabel}
            <h1 class="text-5xl font-black uppercase tracking-tight text-slate-900 leading-none mt-2">${ch.title||'Untitled Chapter'}</h1>
        </div>
        <div class="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">${ch.content||''}</div>
        <div class="mt-20 pt-10 border-t flex justify-between items-center">
            <button onclick="changeChapter(-1)" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition" ${currentChIdx===0?'disabled style="opacity:0"':''}><i class="fas fa-chevron-left mr-2"></i> Previous</button>
            <button onclick="changeChapter(1)" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition" ${currentChIdx===b.chapters.length-1?'disabled style="opacity:0"':''}>Next <i class="fas fa-chevron-right ml-2"></i></button>
        </div>`;
    }

    renderRateStars(id);
    renderComments(id);
}

function changeChapter(dir) {
    const prog = userProgress[currentBookId];
    const b = allBooks.find(x=>x.id===currentBookId);
    const next = prog.lastChapter + dir;
    if (next>=0 && next<b.chapters.length) { prog.lastChapter=next; saveProgress(); renderReader(currentBookId); window.scrollTo(0,0); }
}

// ─────────────────────────── STUDIO ───────────────────────────
function filterStudio(filter, btn) {
    studioFilter = filter;
    document.querySelectorAll('.ftabs-studio').forEach(b => { b.classList.remove('bg-slate-900','text-white'); b.classList.add('bg-white','text-slate-400'); });
    btn.classList.add('bg-slate-900','text-white'); btn.classList.remove('bg-white','text-slate-400');
    renderStudio();
}

function renderStudio() {
    const myBooks = allBooks.filter(b => {
        if (b.authorId !== currentUser.uid) return false;
        if (studioFilter === 'draft') return !b.published;
        if (studioFilter === 'published') return b.published;
        return true;
    });
    document.getElementById('my-studio-list').innerHTML = myBooks.map(b => {
        const coverSrc = b.cover || 'images/jiropc.png';
        return `
        <div class="studio-book-card" onclick="openStudio('${b.id}')">
            <img src="${coverSrc}" class="studio-book-cover" onerror="this.src='images/jiropc.png'">
            <div class="studio-book-overlay">
                <div class="flex gap-1 mb-2 flex-wrap">
                    <span class="${b.published?'published-badge':'draft-badge'}">${b.published?'Published':'Draft'}</span>
                    ${b.explicit?'<span class="explicit-badge">18+</span>':''}
                    ${b.paid?'<span class="bg-amber-400/90 text-slate-900 rounded text-[7px] font-black px-1.5 py-0.5 uppercase">⚡ Paid</span>':''}
                </div>
                <h4 class="font-black text-white text-xs uppercase tracking-tight leading-tight line-clamp-2">${b.title}</h4>
                <p class="text-[8px] text-white/50 font-black uppercase mt-1">${b.chapters.length} ch · ${b.views||0} views</p>
                <div class="flex gap-2 mt-2">
                    <button onclick="event.stopPropagation(); togglePublish('${b.id}')" class="${b.published?'bg-red-500 hover:bg-red-600':'bg-green-500 hover:bg-green-600'} text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg transition">
                        ${b.published?'Unpublish':'Publish'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('') || `<p class="col-span-full text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No manuscripts. Add one!</p>`;
}

function togglePublish(bookId) {
    const b = allBooks.find(x=>x.id===bookId); if (!b) return;
    b.published = !b.published;
    if (b.published) { processPublishSigils(b); showToast(`"${b.title}" is now published! 🌐`); }
    else showToast(`"${b.title}" moved back to drafts.`);
    saveGlobalLibrary(); renderStudio();
}

function createNewDraft() {
    const title = document.getElementById('new-draft-title').value.trim();
    if (!title) { showToast("Please enter a title."); return; }
    const id = 'b_' + Date.now();
    allBooks.push({
        id, authorId:currentUser.uid, authorName:currentUser.pseudonym,
        title, synopsis:'', cover:'', tags:[], genre:'', pov:'',
        visibility:'public', explicit:false, published:false, paid:false,
        status:'ongoing', ratings:[], chapters:[], comments:[], views:0
    });
    saveGlobalLibrary(); closeModal('newDraftModal');
    document.getElementById('new-draft-title').value = '';
    openStudio(id);
}

function openStudio(id) {
    const b = allBooks.find(x=>x.id===id); if (!b) return;
    currentBookId = id;
    document.getElementById('studio-title-input').value = b.title;
    document.getElementById('studio-synopsis-input').value = b.synopsis;
    document.getElementById('studio-tags-input').value = (b.tags||[]).join(', ');
    document.getElementById('studio-visibility').value = b.visibility||'public';
    document.getElementById('studio-genre').value = b.genre||'';
    document.getElementById('studio-pov').value = b.pov||'';
    document.getElementById('studio-status').value = b.status||'ongoing';
    document.getElementById('studio-explicit').checked = b.explicit||false;
    document.getElementById('studio-paid').checked = b.paid||false;
    document.getElementById('studio-title-display').innerText = b.title;
    document.getElementById('studio-publish-btn').innerText = b.published ? 'Unpublish' : 'Publish';
    document.getElementById('studio-publish-btn').className = b.published
        ? 'bg-amber-400 text-slate-900 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition'
        : 'bg-green-500 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition';
    const p = document.getElementById('studio-cover-preview');
    const h = document.getElementById('studio-cover-placeholder');
    if (b.cover) { p.src=b.cover; p.classList.remove('hidden'); h.classList.add('hidden'); }
    else { p.classList.add('hidden'); h.classList.remove('hidden'); }
    renderChapterList(); openModal('studioModal');
}

function publishManuscript() {
    const b = allBooks.find(x=>x.id===currentBookId); if (!b) return;
    saveStudioChanges();
    b.published = !b.published;
    if (b.published) { processPublishSigils(b); showToast(`Published! 🌐 Sigils awarded for qualifying chapters.`); }
    else showToast("Moved to drafts.");
    saveGlobalLibrary();
    document.getElementById('studio-publish-btn').innerText = b.published ? 'Unpublish' : 'Publish';
    document.getElementById('studio-publish-btn').className = b.published
        ? 'bg-amber-400 text-slate-900 px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition'
        : 'bg-green-500 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition';
}

function renderChapterList() {
    const b = allBooks.find(x=>x.id===currentBookId);
    document.getElementById('chapter-list').innerHTML = b.chapters.map((ch,i) => `
    <div class="bg-white border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
        <div class="flex items-center gap-2">
            <span class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Chapter ${i+1}</span>
            ${b.paid && i>0 ? '<span class="text-[8px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">⚡ Paid</span>' : '<span class="text-[8px] font-black uppercase text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5">Free</span>'}
            ${ch.sigilsAwarded ? '<span class="text-[8px] font-black uppercase text-amber-500">⚡ +0.50 Sigils earned</span>' : ''}
        </div>
        <input type="text" value="${ch.title}" oninput="updateChapter(${i},'title',this.value)" class="font-black uppercase text-xs outline-none border-b pb-2 focus:border-amber-400 transition bg-transparent" placeholder="Chapter Title">
        <textarea oninput="updateChapter(${i},'content',this.value)" class="w-full h-48 bg-slate-50 p-4 rounded-xl text-sm outline-none focus:ring-2 ring-amber-400 transition resize-none" placeholder="Write your magic here...">${ch.content}</textarea>
        <div class="flex justify-between items-center flex-wrap gap-2">
            <span class="text-[8px] font-black uppercase text-slate-300">${(ch.likes||[]).length} Likes · ${wordCount(ch.content)} words</span>
            <div class="flex gap-3 items-center">
                <button onclick="saveChapter(${i})" id="save-ch-btn-${i}" class="chapter-save-btn"><i class="fas fa-save mr-1"></i> Save Chapter</button>
                <button onclick="deleteChapter(${i})" class="text-red-400 text-[10px] font-black uppercase hover:text-red-600 transition">Remove</button>
            </div>
        </div>
    </div>`).join('') || `<div class="text-center py-16 text-slate-300"><i class="fas fa-feather-alt text-4xl mb-4 block"></i><p class="font-black uppercase text-xs">No chapters yet. Add one to begin.</p></div>`;
}

function saveChapter(idx) {
    saveGlobalLibrary();
    const btn = document.getElementById(`save-ch-btn-${idx}`);
    if (btn) { btn.classList.add('saved'); btn.innerHTML='<i class="fas fa-check mr-1"></i> Saved!'; setTimeout(()=>{btn.classList.remove('saved');btn.innerHTML='<i class="fas fa-save mr-1"></i> Save Chapter';},1800); }
    showToast(`Chapter ${idx+1} saved.`);
}
function updateChapter(idx,key,val) { allBooks.find(x=>x.id===currentBookId).chapters[idx][key]=val; }
function deleteChapter(idx) { if (!confirm("Remove this chapter?")) return; allBooks.find(x=>x.id===currentBookId).chapters.splice(idx,1); saveGlobalLibrary(); renderChapterList(); }
function addNewChapter() { allBooks.find(x=>x.id===currentBookId).chapters.push({title:'',content:'',likes:[],sigilsAwarded:false}); saveGlobalLibrary(); renderChapterList(); }

function handleStudioCoverUpload(e) {
    const fr=new FileReader();
    fr.onload=()=>{ const p=document.getElementById('studio-cover-preview'); p.src=fr.result; p.classList.remove('hidden'); document.getElementById('studio-cover-placeholder').classList.add('hidden'); };
    fr.readAsDataURL(e.target.files[0]);
}

function saveStudioChanges() {
    const b = allBooks.find(x=>x.id===currentBookId); if (!b) return;
    b.title = document.getElementById('studio-title-input').value;
    b.synopsis = document.getElementById('studio-synopsis-input').value;
    b.tags = document.getElementById('studio-tags-input').value.split(',').map(t=>t.trim()).filter(t=>t);
    b.visibility = document.getElementById('studio-visibility').value;
    b.genre = document.getElementById('studio-genre').value;
    b.pov = document.getElementById('studio-pov').value;
    b.status = document.getElementById('studio-status').value;
    b.explicit = document.getElementById('studio-explicit').checked;
    b.paid = document.getElementById('studio-paid').checked;
    const p = document.getElementById('studio-cover-preview');
    b.cover = p.classList.contains('hidden') ? '' : p.src;
    document.getElementById('studio-title-display').innerText = b.title;
    saveGlobalLibrary(); showToast("Draft Saved.");
}

function deleteManuscript() {
    if (!confirm("Are you sure you want to erase this manuscript forever?")) return;
    const idx = allBooks.findIndex(b=>b.id===currentBookId);
    if (idx!==-1) { allBooks.splice(idx,1); saveGlobalLibrary(); }
    closeStudio(); showToast("Manuscript Erased.");
}

function closeStudio() { currentBookId=null; closeModal('studioModal'); renderStudio(); }

// ─────────────────────────── LIBRARY ───────────────────────────
function renderLibrary() {
    const saved = allBooks.filter(b=>userBookmarks.includes(b.id));
    document.getElementById('saved-library').innerHTML = saved.map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-xs font-black">Empty shelves.</p>`;
    const finished = allBooks.filter(b=>userFinished.includes(b.id));
    document.getElementById('finished-library').innerHTML = finished.map(b=>renderBookCard(b)).join('') || `<p class="col-span-full py-10 text-center text-slate-300 uppercase text-xs font-black">No finished reads yet.</p>`;
}

// ─────────────────────────── UI UPDATE ───────────────────────────
function updateUI() {
    if (currentUser) {
        const fresh = allUsers[currentUser.email];
        if (fresh) { currentUser = fresh; localStorage.setItem('jiro_active_user', JSON.stringify(currentUser)); }
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('logged-in-ui').classList.remove('hidden');
        document.getElementById('nav-username').innerText = currentUser.pseudonym;
        document.getElementById('nav-pfp').src = currentUser.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.pseudonym)}&size=100`;
        document.getElementById('nav-role-label').innerText = currentUser.gender==='witch'?'🧙‍♀️ Witch':currentUser.gender==='wizard'?'🧙 Wizard':'Magician';
        document.getElementById('nav-sigils').innerText = (currentUser.sigils||0).toFixed(2);
        const devWrap = document.getElementById('dev-panel-btn-wrap');
        devWrap.classList.toggle('hidden', currentUser.role !== 'Developer');
        updateConcernBadge();
    } else {
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('logged-in-ui').classList.add('hidden');
    }
    showPage('home');
}

window.onload = function() {
    if (localStorage.getItem('jiro_dark')==='1') { document.body.classList.add('dark-mode'); document.getElementById('dark-toggle-btn').classList.add('on'); }
    updateUI();
};
