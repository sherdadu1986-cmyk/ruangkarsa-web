// Karsa Multimedia - Shared Auth Script for Public Pages & Admin Login Modal

const DEFAULT_SUPABASE_URL = 'https://kolgqqvurvbjbtuufnai.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_U0idj52nArjoczbEFXcXAw_gvfyGuzg';

let SUPABASE_URL = localStorage.getItem('KARSA_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
let SUPABASE_KEY = localStorage.getItem('KARSA_SUPABASE_KEY') || DEFAULT_SUPABASE_KEY;

let karsaSupabase = null;

// Initialize Supabase Auth Client
function getKarsaSupabase() {
    if (!karsaSupabase && window.supabase) {
        try {
            karsaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } catch (err) {
            console.error('Karsa Supabase Auth Client init error:', err);
        }
    }
    return karsaSupabase;
}

// Check session & Handle Admin Login Button Click
async function handleAdminLoginBtnClick(e) {
    if (e) e.preventDefault();

    // Check if already logged in via localStorage
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        window.location.href = 'admin-rental.html';
        return;
    }

    const client = getKarsaSupabase();
    if (client) {
        try {
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin-rental.html';
                return;
            }
        } catch (err) {
            console.log('Session check error:', err);
        }
    }
    openLoginModal();
}

// Open Login Modal
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Reset fields & error alert
    const errAlert = document.getElementById('login-error-alert');
    if (errAlert) errAlert.classList.add('hidden');
    const emailInput = document.getElementById('login-email');
    if (emailInput) emailInput.focus();
}

// Close Login Modal
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Submit Admin Login Form
async function submitAdminLogin(e) {
    if (e) e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-submit-login');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showLoginError('Email dan password wajib diisi.');
        return;
    }

    // Demo Admin Credentials Verification
    const DEMO_EMAIL = 'adminwoy@karsamultimedia.com';
    const DEMO_PASSWORD = 'adminwoyhaha';

    // Set Loading UI State
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses Login...
        `;
    }

    try {
        // 1. Direct Demo Account Verification
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin-rental.html';
            return;
        }

        // 2. Supabase Auth Verification Fallback
        const client = getKarsaSupabase();
        if (client) {
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (!error && data && data.session) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin-rental.html';
                return;
            }
        }

        // If credentials do not match
        showLoginError('Email atau Password Admin Salah!');
    } catch (err) {
        console.error('Login process error:', err);
        showLoginError('Email atau Password Admin Salah!');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login ke Admin Panel';
        }
    }
}

// Display error alert inside modal
function showLoginError(message) {
    const errAlert = document.getElementById('login-error-alert');
    const errText = document.getElementById('login-error-text');
    if (errAlert && errText) {
        errText.innerText = message;
        errAlert.classList.remove('hidden');
    } else {
        alert(message);
    }
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});
