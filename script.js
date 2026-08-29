// ===================== Mock data =====================
const doctors = [
  { id: 'doc_001', name: 'Dr. Sarah Sharma', avatar: 'SS', specialization: 'Cardiologist', fee: 900 },
  { id: 'doc_002', name: 'Dr. Ravi Patel', avatar: 'RP', specialization: 'Dermatologist', fee: 700 },
];

const appointments = [
  { id: 'apt_001', doctor: doctors[0], date: 'Aug 28, 2026', time: '4:30 PM', type: 'Video Consultation', status: 'Confirmed', reason: 'Follow-up on blood pressure medication' },
  { id: 'apt_002', doctor: doctors[1], date: 'Aug 15, 2026', time: '11:00 AM', type: 'In-person', status: 'Completed', reason: 'Skin rash evaluation' },
  { id: 'apt_003', doctor: doctors[0], date: 'Jul 30, 2026', time: '9:30 AM', type: 'Video Consultation', status: 'Completed', reason: 'General checkup' },
];

const documents = [
  { id: 'doc_file_001', name: 'Blood_Test_Report_Aug2026.pdf', type: 'Lab Report', uploadDate: 'Aug 20, 2026', status: 'Summarized' },
  { id: 'doc_file_002', name: 'Chest_Xray_July2026.jpg', type: 'Imaging', uploadDate: 'Jul 18, 2026', status: 'Uploaded' },
];

// ===================== Fake "session" (in-memory only) =====================
let currentUser = null; // { name, email, role, avatar }

// ===================== Toasts =====================
function toast(message, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ===================== Router =====================
const routes = ['/', '/login', '/register', '/dashboard'];
// everything else (doctors, appointments, documents, messages, profile) -> coming-soon stub
const comingSoonTitles = {
  '/doctors': ['Doctor search', 'Search, filter, and book verified doctors — coming in the next build step.'],
  '/appointments': ['Appointments', 'Your upcoming and past appointments will live here.'],
  '/documents': ['Medical documents', 'Upload, manage, and get AI summaries of your documents here.'],
  '/messages': ['Messages', 'Real-time chat with your doctors will live here.'],
  '/profile': ['Profile', 'Manage your personal details here.'],
};

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function render() {
  const path = currentPath();
  const protectedPaths = ['/dashboard', '/appointments', '/documents', '/messages', '/profile', '/doctors'];

  if (protectedPaths.includes(path) && !currentUser) {
    window.location.hash = '#/login';
    return;
  }

  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));

  if (path === '/') {
    document.getElementById('view-landing').classList.add('active');
  } else if (path === '/login') {
    document.getElementById('view-login').classList.add('active');
  } else if (path === '/register') {
    document.getElementById('view-register').classList.add('active');
  } else if (path === '/dashboard') {
    document.getElementById('view-dashboard').classList.add('active');
    renderDashboard();
    setActiveNav(path);
  } else if (comingSoonTitles[path]) {
    document.getElementById('view-comingsoon').classList.add('active');
    const [title, note] = comingSoonTitles[path];
    document.getElementById('cs-title').textContent = title;
    document.getElementById('cs-note').textContent = note;
    setActiveNav(path);
  } else {
    // unknown route
    document.getElementById('view-landing').classList.add('active');
  }
  window.scrollTo(0, 0);
}

function setActiveNav(path) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${path}`);
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  render();
  wireForms();
});

// ===================== Dashboard rendering =====================
function renderDashboard() {
  document.getElementById('topbar-avatar').textContent = currentUser.avatar;
  document.getElementById('topbar-name').textContent = currentUser.name.split(' ')[0];

  const upcoming = appointments.find((a) => a.status === 'Confirmed');
  const recent = appointments.slice(0, 3);

  const html = `
    <div class="card card-pad" style="padding:26px">
      <h2 style="font-size:21px">Good morning, ${escapeHtml(currentUser.name.split(' ')[0])} 👋</h2>
      <p class="text-secondary mt-2">Here's what's happening with your healthcare today.</p>
    </div>

    ${upcoming ? `
    <div class="card">
      <div class="appt-card">
        <div class="avatar" style="width:52px;height:52px;font-size:16px">${upcoming.doctor.avatar}</div>
        <div class="meta">
          <div style="font-weight:700;font-size:15px">${escapeHtml(upcoming.doctor.name)}</div>
          <div class="text-secondary text-sm">${escapeHtml(upcoming.doctor.specialization)}</div>
          <div class="text-secondary text-sm mt-2">${upcoming.date} · ${upcoming.time} · ${upcoming.type}</div>
        </div>
        <span class="badge badge-success">Confirmed</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" data-goto="/appointments">Join Consultation</button>
          <button class="btn btn-secondary" data-goto="/appointments">View Details</button>
        </div>
      </div>
    </div>` : ''}

    <div>
      <h3 style="font-size:16px;margin-bottom:12px">Quick actions</h3>
      <div class="quick-grid">
        <button class="card quick-tile" data-goto="/doctors"><div class="icon-tile" style="margin:0">🔍</div><span class="text-sm" style="font-weight:600">Find a Doctor</span></button>
        <button class="card quick-tile" data-goto="/doctors"><div class="icon-tile" style="margin:0">📅</div><span class="text-sm" style="font-weight:600">Book Appointment</span></button>
        <button class="card quick-tile" data-goto="/documents"><div class="icon-tile" style="margin:0">📤</div><span class="text-sm" style="font-weight:600">Upload Document</span></button>
        <button class="card quick-tile" data-goto="/messages"><div class="icon-tile" style="margin:0">💬</div><span class="text-sm" style="font-weight:600">Message Doctor</span></button>
      </div>
    </div>

    <div class="dash-2col">
      <div>
        <div class="flex-between mb-3">
          <h3 style="font-size:16px">Recent appointments</h3>
          <button class="link-sm" data-goto="/appointments">View all</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${recent.map(apptRow).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-pad">
          <div style="font-weight:700;margin-bottom:8px">✨ Need help understanding your medical documents?</div>
          <p class="text-secondary text-sm mb-3">Ask our AI assistant to explain lab results in plain language. Informational only — never replaces your doctor.</p>
          <button class="btn btn-primary btn-block" data-goto="/documents">Ask AI</button>
        </div>
        <div>
          <div class="flex-between mb-3">
            <h3 style="font-size:16px">Health documents</h3>
            <button class="link-sm" data-goto="/documents">View all</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${documents.map(docRow).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const content = document.getElementById('dash-content');
  content.innerHTML = html;
  content.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', () => { window.location.hash = `#${el.dataset.goto}`; });
  });
}

function apptRow(a) {
  const statusClass = a.status === 'Confirmed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-error' : 'badge-neutral';
  return `
    <div class="appt-row">
      <div class="avatar avatar-sm">${a.doctor.avatar}</div>
      <div class="meta">
        <div style="font-weight:600;font-size:14px">${escapeHtml(a.doctor.name)}</div>
        <div class="text-secondary text-xs">${a.date} · ${a.time}</div>
      </div>
      <span class="badge ${statusClass}">${a.status}</span>
    </div>`;
}

function docRow(d) {
  return `
    <div class="doc-row">
      <div class="doc-icon">📄</div>
      <div class="meta" style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(d.name)}</div>
        <div class="text-secondary text-xs">${d.type} · ${d.uploadDate}</div>
      </div>
      <span class="badge ${d.status === 'Summarized' ? 'badge-primary' : 'badge-neutral'}">${d.status}</span>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===================== Forms =====================
function wireForms() {
  // ---- Login ----
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    let ok = true;

    if (!/^\S+@\S+\.\S+$/.test(email.value)) {
      setError(email, 'login-email-error', 'Enter a valid email address.'); ok = false;
    } else setError(email, 'login-email-error', '');

    if (!password.value) {
      setError(password, 'login-password-error', 'Password is required.'); ok = false;
    } else setError(password, 'login-password-error', '');

    if (!ok) return;

    currentUser = { name: 'Abhay Sharma', email: email.value, role: 'patient', avatar: 'AS' };
    toast('Welcome back!', 'success');
    window.location.hash = '#/dashboard';
  });

  document.getElementById('google-login').addEventListener('click', () => {
    toast('Google sign-in is not configured in this demo.', 'info');
  });

  // ---- Register: role toggle ----
  let selectedRole = 'patient';
  document.querySelectorAll('.role-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      document.querySelectorAll('.role-tile').forEach((t) => t.classList.remove('active'));
      tile.classList.add('active');
      selectedRole = tile.dataset.role;
    });
  });

  // ---- Register: password strength ----
  const regPassword = document.getElementById('reg-password');
  const strengthWrap = document.getElementById('strength-meter');
  const strengthBars = strengthWrap.querySelectorAll('.strength-bars span');
  const strengthLabel = strengthWrap.querySelector('.strength-label');
  const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const STRENGTH_COLORS = ['var(--red)', 'var(--red)', 'var(--amber)', 'var(--primary)', 'var(--green)'];

  regPassword.addEventListener('input', () => {
    const pw = regPassword.value;
    if (!pw) { strengthWrap.style.display = 'none'; return; }
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    strengthWrap.style.display = 'block';
    strengthBars.forEach((bar, i) => {
      bar.style.background = i < score ? STRENGTH_COLORS[score] : 'var(--border-soft)';
    });
    strengthLabel.textContent = STRENGTH_LABELS[score];
    strengthLabel.style.color = STRENGTH_COLORS[score];
  });

  // ---- Register: submit ----
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name');
    const email = document.getElementById('reg-email');
    const phone = document.getElementById('reg-phone');
    const password = document.getElementById('reg-password');
    const confirm = document.getElementById('reg-confirm');
    let ok = true;

    if (!name.value.trim()) { setError(name, 'reg-name-error', 'Full name is required.'); ok = false; }
    else setError(name, 'reg-name-error', '');

    if (!/^\S+@\S+\.\S+$/.test(email.value)) { setError(email, 'reg-email-error', 'Enter a valid email address.'); ok = false; }
    else setError(email, 'reg-email-error', '');

    if (!/^[\d+\s-]{7,15}$/.test(phone.value)) { setError(phone, 'reg-phone-error', 'Enter a valid phone number.'); ok = false; }
    else setError(phone, 'reg-phone-error', '');

    if (password.value.length < 8) { setError(password, 'reg-password-error', 'Password must be at least 8 characters.'); ok = false; }
    else setError(password, 'reg-password-error', '');

    if (confirm.value !== password.value) { setError(confirm, 'reg-confirm-error', 'Passwords do not match.'); ok = false; }
    else setError(confirm, 'reg-confirm-error', '');

    if (!ok) return;

    currentUser = {
      name: name.value.trim(),
      email: email.value,
      role: selectedRole,
      avatar: name.value.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    };
    toast('Account created — welcome to MediCare AI!', 'success');
    window.location.hash = '#/dashboard';
  });

  // ---- Logout ----
  ['logout-btn', 'logout-btn-2'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      currentUser = null;
      window.location.hash = '#/';
    });
  });
}

function setError(inputEl, errorId, message) {
  document.getElementById(errorId).textContent = message;
  inputEl.classList.toggle('has-error', Boolean(message));
}
