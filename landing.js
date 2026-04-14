/**
 * landing.js - Landing Page Logic for Cosmic Mind Hub
 * Handles the authentication flow and modal interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const authModal = document.getElementById('authModal');
    const closeAuthBtn = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtnHeader = document.getElementById('loginHeaderBtn');

    // --- Modal Management ---

    function openAuthModal(mode = 'login') {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        switchTab(mode);
    }

    function closeAuthModalFunc() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function switchTab(mode) {
        authTabs.forEach(tab => {
            if (tab.dataset.tab === mode) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        authForms.forEach(form => {
            if (form.id === `${mode}Form`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    // Event Listeners for Closing
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', closeAuthModalFunc);
    }

    // Close on overlay click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModalFunc();
        }
    });

    // --- Tab Switching ---

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // --- Button Binding ---

    if (loginBtnHeader) {
        loginBtnHeader.addEventListener('click', () => openAuthModal('login'));
    }

    // Global hook for CTAs to open modal
    window.triggerAuth = (mode = 'login') => {
        openAuthModal(mode);
    };

    // Hijack legacy triggers from the landing page HTML
    window.openReportForm = () => openAuthModal('signup');
    window.openForm = (context) => {
        console.log('Opening auth with context:', context);
        openAuthModal('signup');
    };

    // Bind any buttons with specific data attributes
    document.querySelectorAll('[data-auth-trigger]').forEach(btn => {
        btn.addEventListener('click', () => {
            openAuthModal(btn.dataset.authTrigger || 'login');
        });
    });

    // Delegate listener for all "Buy Now" or primary buttons that don't have triggers yet
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-primary, .report-buy-btn');
        if (target) {
            // If it doesn't already have an onclick or a specific data-auth-trigger, trigger auth
            if (!target.hasAttribute('onclick') && !target.dataset.authTrigger) {
                openAuthModal('signup');
            }
        }
    });

    // --- Form Submissions ---

    const handleAuthSuccess = (userData) => {
        console.log('Authentication successful:', userData);
        // Persist session to sessionStorage
        sessionStorage.setItem('cosmic_user', JSON.stringify({
            name: userData.name || 'User',
            email: userData.email,
            isLoggedIn: true
        }));

        // Feedback transition
        const activeForm = document.querySelector('.auth-form.active');
        const submitBtn = activeForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span> Transitioning to Dashboard...';

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginId').value;
            const password = document.getElementById('loginPassword').value;

            // Retrieve from sessionStorage by username
            const storedUser = JSON.parse(sessionStorage.getItem(`user_${username}`));

            if (storedUser && storedUser.password === password) {
                handleAuthSuccess(storedUser);
            } else {
                alert('Invalid username or password.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            // Check if username already exists
            if (sessionStorage.getItem(`user_${username}`)) {
                alert('Username already taken. Please choose another one.');
                return;
            }

            // Store in sessionStorage as a "mock database"
            const newUser = { name, username, email, password };
            sessionStorage.setItem(`user_${username}`, JSON.stringify(newUser));
            
            // Auto-login after signup
            handleAuthSuccess(newUser);
        });
    }
});
