document.addEventListener('DOMContentLoaded', () => {
  // Navigation handling
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.view');
  
  function switchView(targetId, isBackAction = false) {
    if(!isBackAction && appState.currentView !== targetId) {
      appState.viewHistory.push(appState.currentView);
    }
    
    appState.currentView = targetId;

    views.forEach(v => v.classList.remove('active'));
    navLinks.forEach(n => n.classList.remove('active'));
    
    const targetEl = document.getElementById(targetId);
    if(targetEl) targetEl.classList.add('active');
    
    document.querySelectorAll(`.nav-link[data-target="${targetId}"]`).forEach(n => n.classList.add('active'));

    if(targetId === 'view-home') {
      appState.activeFamilyMember = null;
      appState.viewHistory = []; // Reset on home
    }
    
    renderState();
  }

  function goBack() {
    if(appState.viewHistory.length > 0) {
      const prev = appState.viewHistory.pop();
      switchView(prev, true);
    } else {
      switchView('view-home', true);
    }
  }

  // Bind back buttons
  document.addEventListener('click', (e) => {
    if(e.target.closest('.btn-back')) {
      e.preventDefault();
      goBack();
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(e.currentTarget.dataset.target);
    });
  });

  // Modal Handling
  const loginModal = document.getElementById('login-modal');
  const loginTriggers = document.querySelectorAll('.btn-login-trigger, #btn-login-trigger');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  
  // Auth State
  let isLoggedIn = false;
  
  // Force login directly (index.html has it active by default)
  loginModal.classList.add('active');

  loginTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      if(!isLoggedIn) {
        loginModal.classList.add('active');
        loginError.style.display = 'none';
      } else {
        switchView('view-home');
      }
    });
  });

  // Hardcoded UI Login Logic
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if(u.toLowerCase() === 'anand' && p === 'Password@123') {
      // Success
      isLoggedIn = true;
      loginModal.classList.remove('active');
      loginForm.reset();
      
      // Update UI
      document.getElementById('btn-login-trigger').style.display = 'none';
      document.getElementById('user-profile').style.display = 'flex';
      
      const authReqLinks = document.querySelectorAll('.auth-req');
      authReqLinks.forEach(l => l.style.display = 'inline');

      // Change button texts on cards to "Purchase" since user is logged in
      document.querySelectorAll('.btn-login-trigger').forEach(btn => btn.textContent = 'Purchase Plan');

      // Go to subscription plans
      switchView('view-subscription-plans');
    } else {
      loginError.style.display = 'block';
    }
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    isLoggedIn = false;
    document.getElementById('btn-login-trigger').style.display = 'inline-block';
    document.getElementById('user-profile').style.display = 'none';
    
    // Empty the views
    views.forEach(v => v.classList.remove('active'));

    // Just show modal
    loginModal.classList.add('active'); // force login again
  });

  // ========== STATE MANAGEMENT ==========
  const appState = {
    pendingReportType: 'Horoscope',
    isSubscribedToReports: false,
    subscribedReportPlan: 'Plan1',
    reports: 0,
    plans: 0,
    plansList: [],
    family: 1,
    familyList: [{ 
      name: 'Anand', 
      relation: 'Self', 
      added: 'Account Creation',
      services: { Horoscope: false, Numerology: false, Guidance: false, Sessions: false }
    }],
    sessionsUpcoming: 0,
    sessionsPast: 0,
    sessionsList: [],
    recentReports: [],
    reminders: [],
    activeFamilyMember: null,
    viewHistory: [],
    currentView: 'view-home'
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  function renderState() {
    const elReports = document.getElementById('metric-reports');
    if(elReports) elReports.textContent = appState.reports;

    const elFamily = document.getElementById('metric-family');
    if(elFamily) elFamily.textContent = appState.family;
    const elSessionsUp = document.getElementById('metric-sessions-upcoming');
    if(elSessionsUp) elSessionsUp.textContent = appState.sessionsUpcoming;
    const elSessionsPast = document.getElementById('metric-sessions-past');
    if(elSessionsPast) elSessionsPast.textContent = appState.sessionsPast;

    const headingPlans = document.getElementById('card-heading-plans');
    if(headingPlans) {
      const primaryUser = appState.familyList.find(f => f.name === 'Anand');
      if(primaryUser && primaryUser.services.Guidance) {
        headingPlans.textContent = "View My Guidance Plan";
      } else if(appState.isSubscribedToReports) {
        headingPlans.textContent = "Create Guidance Plan";
      } else {
        headingPlans.textContent = "Guidance Plans";
      }
    }

    if(appState.activeFamilyMember === null) {
      // Clear auto-fills if back to home
      const nameInput = document.getElementById('report-user-name');
      if(nameInput && nameInput.classList.contains('auto-filled')) {
         nameInput.value = '';
         nameInput.classList.remove('auto-filled');
      }
    }

    const headingFamily = document.getElementById('card-heading-family');
    if(headingFamily) {
      headingFamily.textContent = appState.family > 0 ? "Manage Family Plans" : "Family Plans";
    }

    const reportsList = document.getElementById('list-recent-reports');
    if(reportsList) {
      if (appState.recentReports.length === 0) {
        reportsList.innerHTML = '<li style="text-align: center; padding: 1rem 0;">No reports yet.</li>';
      } else {
        reportsList.innerHTML = appState.recentReports.map(r => `
          <li class="flex space-between align-center" style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div>
              <strong>${r.title}</strong><br>
              <em style="font-size: 0.8rem;">Generated: ${r.date}</em>
            </div>
            <div class="flex gap-1" style="align-items: center;">
              <a href="${r.pdf}" target="_blank" class="secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; text-decoration: none;">Download</a>
              <button class="secondary nav-link" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById('view-report-result').classList.add('active'); document.getElementById('report-result-title').textContent='${r.title}'; document.getElementById('report-result-date').textContent='${r.date}'; document.getElementById('report-result-download').href='${r.pdf}';">&gt;</button>
            </div>
          </li>
        `).join('');
      }
    }

    const remindersList = document.getElementById('list-upcoming-reminders');
    if(remindersList) {
      if (appState.reminders.length === 0) {
        remindersList.innerHTML = '<li style="text-align: center; padding: 1rem 0;">No upcoming reminders.</li>';
      } else {
        remindersList.innerHTML = appState.reminders.map(r => `
          <li style="margin-bottom: 1rem;">🔔 <strong style="color: white;">${r.title}</strong><br><span style="font-size: 0.8rem;">${r.desc}</span></li>
        `).join('');
      }
    }
    const bookingList = document.getElementById('booking-status-list');
    if(bookingList) {
      if(appState.sessionsList.length === 0) {
        bookingList.innerHTML = '<li style="color:var(--color-text-muted); font-size:0.9rem;">No sessions requested.</li>';
      } else {
        bookingList.innerHTML = appState.sessionsList.map(s => `
          <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div class="flex space-between align-center" style="margin-bottom: 0.5rem;">
              <strong>${s.title}</strong>
              <span class="badge" style="background: ${s.status === 'Upcoming' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(26,176,230,0.1)'}; color: ${s.status === 'Upcoming' ? '#f43f5e' : 'var(--color-primary)'};">${s.status}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--color-text-muted);">Scheduled for ${s.date}</p>
          </li>
        `).join('');
      }
    }
    
    renderFamilyMembers();
  }

  function renderFamilyMembers() {
    const container = document.getElementById('family-members-container');
    if (!container) return;
    
    if (appState.familyList.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-muted);">No family members added yet.</p>';
      return;
    }

    container.innerHTML = appState.familyList.map(member => `
      <div class="card glass-panel flex space-between align-center">
        <div class="family-member-link" data-name="${member.name}" style="cursor: pointer;">
          <strong>${member.name}</strong>
          <p style="font-size: 0.8rem; color: var(--color-text-muted);">Added ${member.added || 'Just now'}</p>
        </div>
        <div class="flex gap-1" style="align-items: center;">
          <button class="btn-family-dashboard-trigger" data-name="${member.name}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View Dashboard</button>
        </div>
      </div>
    `).join('');
    
    container.querySelectorAll('.family-member-link, .btn-family-dashboard-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-name');
        openFamilyMemberDashboard(name);
      });
    });
  }

  function openMetricsList(title, dataArray, renderFn) {
    const listTitle = document.getElementById('metrics-list-title');
    if(listTitle) listTitle.textContent = title;
    
    const container = document.getElementById('metrics-list-container');
    if (container) {
      if (!dataArray || dataArray.length === 0) {
        container.innerHTML = '<li style="text-align:center; padding:2rem; color:var(--color-text-muted);">No items found.</li>';
      } else {
        container.innerHTML = dataArray.map(renderFn).join('');
      }
    }
    
    // Attach dynamic report view handlers
    document.querySelectorAll('.btn-list-view-report').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pdfPath = e.target.getAttribute('data-pdf');
        const pdfModal = document.getElementById('pdf-modal');
        const pdfIframe = document.getElementById('pdf-viewer-iframe');
        if(pdfIframe) pdfIframe.src = pdfPath;
        if(pdfModal) pdfModal.classList.add('active');
      });
    });

    switchView('view-metrics-list');

    // Attach family member links
    document.querySelectorAll('.family-member-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-name');
        openFamilyMemberDashboard(name);
      });
    });

    // Attach family member links and dashboard triggers
    document.querySelectorAll('.family-member-link, .btn-family-dashboard-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-name');
        openFamilyMemberDashboard(name);
      });
    });

    // Attach family member specific service buttons
    document.querySelectorAll('.btn-list-family-service').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-name');
        const type = e.currentTarget.getAttribute('data-type');
        const viewType = e.currentTarget.getAttribute('data-view');
        const isActive = e.currentTarget.getAttribute('data-active') === 'true';
        
        appState.activeFamilyMember = name;
        
        if(isActive) {
          if(viewType === 'pdf') {
            const pdfPath = type === 'Horoscope' ? '/reports/Horoscope_Plan1.pdf' : '/reports/Numerology_Plan1.pdf';
            const pdfModal = document.getElementById('pdf-modal');
            const pdfIframe = document.getElementById('pdf-viewer-iframe');
            if(pdfIframe) pdfIframe.src = pdfPath;
            if(pdfModal) pdfModal.classList.add('active');
          } else if(viewType === 'guidance') {
            switchView('view-active-guidance-plan');
          } else if(viewType === 'sessions') {
            switchView('view-session-booking');
          }
        } else {
          // Gated logic for Guidance Plan
          if(viewType === 'guidance') {
            if(!appState.isSubscribedToReports) {
              // First select a plan
              switchView('view-subscription-plans');
            } else {
              // Already subscribed, but form not filled (isActive is false)
              const gNameInput = document.getElementById('g-name');
              if(gNameInput) gNameInput.value = name;
              switchView('view-guidance-intake-form');
            }
          } else if(viewType === 'pdf') {
             // Go to manual generation hub
             switchView('view-family-member-dashboard');
          }
        }
      });
    });
  }

  function openFamilyMemberDashboard(name) {
    appState.activeFamilyMember = name;
    const nameEl = document.getElementById('family-member-dashboard-name');
    if(nameEl) nameEl.textContent = name;
    switchView('view-family-member-dashboard');
  }

  const metricCards = {
    'card-metric-reports': () => openMetricsList('My Reports', appState.recentReports, r => `
      <li style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong>${r.title}</strong><br>
          <span style="font-size:0.8rem; color:var(--color-text-muted);">Generated: ${r.date}</span>
        </div>
        <div class="flex gap-1" style="flex-wrap: wrap;">
          <button class="secondary btn-list-view-report" data-pdf="${r.pdf}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View Report</button>
          <a href="${r.pdf}" target="_blank" class="secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; text-decoration: none; border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 8px;">Download</a>
          <button class="secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Email</button>
        </div>
      </li>
    `),

    'card-metric-family': () => openMetricsList('Family Profiles', appState.familyList, f => {
      const s = f.services;
      return `
      <li style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="flex space-between align-center" style="margin-bottom: 1.2rem;">
          <div>
            <strong style="font-size: 1.1rem; color: #fff;">${f.name}</strong> (${f.relation})
            <p style="font-size:0.8rem; color:var(--color-text-muted); margin-top: 0.2rem;">Added: ${f.added || 'Just now'}</p>
          </div>
          <button class="secondary btn-family-dashboard-trigger" data-name="${f.name}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Manage Dashboard</button>
        </div>
        
        <div class="flex gap-1" style="flex-wrap: wrap;">
          ${s.Horoscope ? `<button class="btn-list-family-service" data-active="true" data-name="${f.name}" data-view="pdf" data-type="Horoscope" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: rgba(26,176,230,0.1); border: 1px solid var(--color-primary); color: #fff; border-radius: 6px; cursor: pointer;">View Kundali</button>` : ''}
          ${s.Numerology ? `<button class="btn-list-family-service" data-active="true" data-name="${f.name}" data-view="pdf" data-type="Numerology" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: rgba(26,176,230,0.1); border: 1px solid var(--color-primary); color: #fff; border-radius: 6px; cursor: pointer;">View Numerology</button>` : ''}
          <button class="btn-list-family-service" data-active="${s.Guidance}" data-name="${f.name}" data-view="guidance" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: ${s.Guidance ? 'rgba(250,204,21,0.1)' : 'transparent'}; border: 1px solid ${s.Guidance ? '#facc15' : 'rgba(255,255,255,0.2)'}; color: #fff; border-radius: 6px; cursor: pointer;">${s.Guidance ? 'View Guidance Plan' : 'Create Guidance Plan'}</button>
          ${s.Sessions ? `<button class="btn-list-family-service" data-active="true" data-name="${f.name}" data-view="sessions" style="padding: 0.5rem 0.8rem; font-size: 0.8rem; background: rgba(100,255,218,0.1); border: 1px solid var(--color-accent); color: #fff; border-radius: 6px; cursor: pointer;">View Sessions</button>` : ''}
        </div>
      </li>
    `}),
    'card-metric-sessions': () => openMetricsList('My Sessions', appState.sessionsList, s => `
      <li style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <strong style="color: ${s.status === 'Upcoming' ? '#f43f5e' : '#9ca3af'};">${s.status}</strong> - ${s.title}<br>
        <span style="font-size:0.8rem; color:var(--color-text-muted);">Date: ${s.date}</span>
      </li>
    `)
  };

  Object.entries(metricCards).forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', handler);
  });

  // Hook up interactive actions
  function updatePurchaseView() {
    const planContainer = document.getElementById('plan-selection-container');
    const priceNotice = document.getElementById('price-notice');
    const btnBuy = document.getElementById('btn-buy-kundali');
    const nameInput = document.getElementById('report-user-name');

    if(appState.activeFamilyMember) {
      if(nameInput) {
        nameInput.value = appState.activeFamilyMember;
        nameInput.classList.add('auto-filled');
      }
    }

    if (appState.isSubscribedToReports) {
      if(planContainer) planContainer.style.display = 'none';
      if(priceNotice) priceNotice.style.display = 'none';
      if(btnBuy) btnBuy.textContent = `Generate Report (${appState.subscribedReportPlan})`;
    } else {
      if(planContainer) planContainer.style.display = 'block';
      if(priceNotice) priceNotice.style.display = 'block';
      if(btnBuy) btnBuy.textContent = 'Proceed to Payment';
    }
  }

  // Hook up service cards (Home & Family Dashboard)
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
       const type = e.currentTarget.getAttribute('data-report-type');
       if(type) {
         appState.pendingReportType = type;
         updatePurchaseView();
       }
    });
  });

  const cardGuidancePlans = document.getElementById('card-guidance-plans');
  if(cardGuidancePlans) {
    cardGuidancePlans.addEventListener('click', () => {
      const primaryUser = appState.familyList.find(f => f.name === 'Anand');
      appState.activeFamilyMember = 'Anand'; // Default context to Primary User
      
      if(primaryUser && primaryUser.services.Guidance) {
        switchView('view-active-guidance-plan');
      } else if(appState.isSubscribedToReports) {
        switchView('view-guidance-intake-form');
      } else {
        switchView('view-subscription-plans');
      }
    });
  }

  const otpModal = document.getElementById('otp-modal');
  const otpInput = document.getElementById('otp-input');
  const otpError = document.getElementById('otp-error');
  const reportUserNameInput = document.getElementById('report-user-name');

  function validateReportForm() {
    if(!reportUserNameInput || !reportUserNameInput.value.trim()) {
      alert("Please enter a Name for the report.");
      return false;
    }
    return true;
  }

  function processReportPurchase() {
    const planVal = appState.isSubscribedToReports ? appState.subscribedReportPlan : (document.getElementById('k-plan-2').checked ? 'Plan2' : 'Plan1');
    const userName = reportUserNameInput.value.trim();
    
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const timestampStr = `${todayStr} ${timeStr}`;
    
    if (!appState.isSubscribedToReports) {
      appState.isSubscribedToReports = true;
      appState.subscribedReportPlan = planVal;
      appState.reminders.unshift({ title: 'Report Subscription Active', desc: `You are subscribed to Analytics ${planVal}.` });
    }

    // Activate service for the family member
    const memberName = appState.activeFamilyMember || userName;
    if(memberName) {
       const member = appState.familyList.find(m => m.name.toLowerCase() === memberName.toLowerCase());
       if(member && member.services) {
         member.services[appState.pendingReportType] = true;
       }
    }

    const rTitle = `${appState.pendingReportType} - ${userName}`;
    const rPdf = `/reports/${appState.pendingReportType}_${planVal}.pdf`;
    
    appState.reports++;
    appState.recentReports.unshift({ title: rTitle, date: timestampStr, pdf: rPdf });
    renderState();

    const rTitleEl = document.getElementById('report-result-title');
    if (rTitleEl) rTitleEl.textContent = rTitle;
    
    const rDateEl = document.getElementById('report-result-date');
    if (rDateEl) rDateEl.textContent = timestampStr;
    
    const rDownEl = document.getElementById('report-result-download');
    if (rDownEl) rDownEl.href = rPdf;

    if(otpModal) otpModal.classList.remove('active');
    if(otpInput) otpInput.value = '';
    if(otpError) otpError.style.display = 'none';

    switchView('view-report-result');
  }

  const btnBuyKundali = document.getElementById('btn-buy-kundali');
  if(btnBuyKundali) {
    btnBuyKundali.addEventListener('click', () => {
      if(!validateReportForm()) return;
      if (!appState.isSubscribedToReports) {
        if(otpModal) otpModal.classList.add('active');
      } else {
        processReportPurchase();
      }
    });
  }

  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', () => {
      if (otpInput.value === '123456') {
        processReportPurchase();
      } else {
        otpError.style.display = 'block';
      }
    });
  }

  const btnCancelOtp = document.getElementById('btn-cancel-otp');
  if (btnCancelOtp) {
    btnCancelOtp.addEventListener('click', () => {
      if(otpModal) otpModal.classList.remove('active');
      if(otpInput) otpInput.value = '';
      if(otpError) otpError.style.display = 'none';
    });
  }

  // PDF Viewer Modal Logic
  const btnViewReport = document.getElementById('btn-view-report');
  const pdfModal = document.getElementById('pdf-modal');
  const btnClosePdf = document.getElementById('btn-close-pdf');
  const pdfIframe = document.getElementById('pdf-viewer-iframe');
  
  if (btnViewReport) {
    btnViewReport.addEventListener('click', () => {
      const pdfPath = document.getElementById('report-result-download').href;
      if(pdfIframe) pdfIframe.src = pdfPath;
      if(pdfModal) pdfModal.classList.add('active');
    });
  }
  
  if (btnClosePdf) {
    btnClosePdf.addEventListener('click', () => {
      if(pdfModal) pdfModal.classList.remove('active');
      if(pdfIframe) pdfIframe.src = '';
    });
  }

  const btnChoosePlans = [
    document.getElementById('btn-choose-plan-1'),
    document.getElementById('btn-choose-plan-2')
  ];
  btnChoosePlans.forEach((btn, idx) => {
    if(btn) {
      btn.addEventListener('click', () => {
        const planName = idx === 0 ? "Plan 1" : "Plan 2";
        appState.plans++;
        appState.isSubscribedToReports = true;
        appState.subscribedReportPlan = idx === 0 ? "Plan1" : "Plan2";
        
        appState.plansList.push({ title: planName, date: todayStr });
        appState.reminders.unshift({ title: 'Plan Activated', desc: `Your new ${planName} guidance plan is active.` });

        renderState();
        switchView('view-home');
      });
    }
  });

  const guidanceIntakeForm = document.getElementById('guidance-intake-form');
  if(guidanceIntakeForm) {
    guidanceIntakeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Activate Guidance for set member
      if(appState.activeFamilyMember) {
        const member = appState.familyList.find(m => m.name === appState.activeFamilyMember);
        if(member && member.services) {
          member.services.Guidance = true;
          appState.reminders.unshift({ title: 'Guidance Plan Created', desc: `Personalized roadmap for ${member.name} is ready.` });
        }
      }

      renderState();
      switchView('view-active-guidance-plan');
    });
  }

  const btnAddFamily = document.getElementById('btn-add-family');
  const addFamilyModal = document.getElementById('add-family-modal');
  const newFamilyName = document.getElementById('new-family-name');
  const newFamilyRelation = document.getElementById('new-family-relation');
  const addFamilyError = document.getElementById('add-family-error');
  
  if(btnAddFamily) {
    btnAddFamily.addEventListener('click', () => {
      if(addFamilyModal) addFamilyModal.classList.add('active');
    });
  }

  const btnConfirmFamily = document.getElementById('btn-confirm-family');
  if(btnConfirmFamily) {
    btnConfirmFamily.addEventListener('click', () => {
      const newName = newFamilyName.value.trim();
      if(!newName) {
        addFamilyError.style.display = 'block';
        return;
      }
      addFamilyError.style.display = 'none';
      const relation = newFamilyRelation.value || 'Other';
      
      appState.family++;
      appState.familyList.push({ 
        name: newName, 
        relation: relation, 
        added: 'Just now',
        services: { Horoscope: false, Numerology: false, Guidance: false, Sessions: false }
      });
      renderState();
      
      addFamilyModal.classList.remove('active');
      if(newFamilyName) newFamilyName.value = '';
      if(newFamilyRelation) newFamilyRelation.value = 'Spouse';
    });
  }

  const btnCancelFamily = document.getElementById('btn-cancel-family');
  if(btnCancelFamily) {
    btnCancelFamily.addEventListener('click', () => {
      addFamilyModal.classList.remove('active');
      if(newFamilyName) newFamilyName.value = '';
      if(newFamilyRelation) newFamilyRelation.value = 'Spouse';
      if(addFamilyError) addFamilyError.style.display = 'none';
    });
  }

  const btnBookSession = document.getElementById('btn-book-session');
  if(btnBookSession) {
    btnBookSession.addEventListener('click', () => {
      appState.sessionsUpcoming++;
      appState.sessionsList.push({ title: '1-on-1 Transformation', status: 'Upcoming', date: todayStr });
      appState.reminders.unshift({ title: 'Session Requested', desc: 'Your transformation session is under review.' });
      renderState();
      switchView('view-home');
    });
  }

  // Initial render
  renderState();
});
