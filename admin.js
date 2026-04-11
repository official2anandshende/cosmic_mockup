document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Navigation handling
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  const viewTitle = document.getElementById('view-title');
  
  function switchView(targetId) {
    views.forEach(v => v.classList.remove('active'));
    navLinks.forEach(n => n.classList.remove('active'));
    
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.add('active');
      const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        // Update topbar title based on link text
        viewTitle.textContent = activeLink.textContent.trim();
      }
    }
    
    // Refresh icons in case new content was added (though views are static here)
    if (window.lucide) window.lucide.createIcons();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      switchView(target);
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

    // Mock Login Logic
    if(u === 'admin' && p === 'Password@123') {
      loginOverlay.style.display = 'none';
      adminUi.style.display = 'grid';
      loginForm.reset();
      initCharts(); // Init charts after login to ensure container is visible
    } else {
      loginError.style.display = 'block';
      loginError.textContent = "Invalid credentials. Use admin / Password@123";
    }
  });

  logoutBtn.addEventListener('click', () => {
    loginOverlay.style.display = 'flex';
    adminUi.style.display = 'none';
    loginError.style.display = 'none';
  });

  // Chart initialization
  function initCharts() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Check if chart already exists to avoid canvas reuse error
    if (window.myRevenueChart) {
      window.myRevenueChart.destroy();
    }

    window.myRevenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue (INR)',
          data: [12000, 19000, 15000, 25000, 22000, 30000, 45000],
          borderColor: '#1ab0e6',
          backgroundColor: 'rgba(26, 176, 230, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8892b0' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#8892b0' }
          }
        }
      }
    });
  }

  // Pre-login check (auto-login for dev if needed, currently disabled)
  // switchView('view-dashboard');
});
