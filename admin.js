document.addEventListener('DOMContentLoaded', () => {
  // Navigation handling
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  
  function switchView(targetId) {
    views.forEach(v => v.classList.remove('active'));
    navLinks.forEach(n => n.classList.remove('active'));
    
    document.getElementById(targetId).classList.add('active');
    document.querySelectorAll(`.nav-link[data-target="${targetId}"]`).forEach(n => n.classList.add('active'));
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(e.target.dataset.target);
    });
  });

  // Admin Auth Handling
  const loginOverlay = document.getElementById('admin-login-overlay');
  const adminUi = document.getElementById('admin-ui');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('admin-error');
  const logoutBtn = document.getElementById('admin-logout');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;

    if(u === 'admin' && p === 'Password@123') {
      // Success
      loginOverlay.style.display = 'none';
      adminUi.style.display = 'flex';
      loginForm.reset();
    } else {
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    loginOverlay.style.display = 'flex';
    adminUi.style.display = 'none';
    loginError.style.display = 'none';
  });
});
