// Global state
let state = {
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  expiresAt: localStorage.getItem('expiresAt'),
  expiresIn: parseInt(localStorage.getItem('expiresIn')) || 0,
  totalExpiration: parseInt(localStorage.getItem('totalExpiration')) || 30,
  timerInterval: null
};

const API_BASE = 'http://localhost:3000/api/auth';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== PAGE INIT ===');
  console.log('Page URL:', window.location.href);
  console.log('Page pathname:', window.location.pathname);
  console.log('Document title:', document.title);
  
  // Check localStorage
  console.log('=== LOCALSTORAGE CHECK ===');
  console.log('localStorage token:', localStorage.getItem('token')?.substring(0, 20) + '...' || 'NOT SET');
  console.log('localStorage user:', localStorage.getItem('user') || 'NOT SET');
  console.log('localStorage expiresIn:', localStorage.getItem('expiresIn') || 'NOT SET');
  
  // Re-load state from localStorage
  state.token = localStorage.getItem('token');
  state.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  state.expiresAt = localStorage.getItem('expiresAt');
  state.expiresIn = parseInt(localStorage.getItem('expiresIn')) || 0;
  state.totalExpiration = parseInt(localStorage.getItem('totalExpiration')) || 30;
  
  console.log('=== STATE AFTER RELOAD ===');
  console.log('state.token:', state.token?.substring(0, 20) + '...' || 'NULL');
  console.log('state.user:', state.user);
  console.log('state.expiresIn:', state.expiresIn);
  
  const path = window.location.pathname;
  
  // Detect page based on multiple indicators
  const isLoginPage = path === '/' || path === '/index.html' || document.title.includes('Login') || document.getElementById('loginForm');
  const isHome = path === '/home.html' || document.title.includes('Home') || document.getElementById('homeAlert');
  const isDashboard = path === '/dashboard.html' || document.title.includes('Dashboard') || document.getElementById('dashboardAlert');
  const isProfile = path === '/profile.html' || document.title.includes('Profile') || document.getElementById('profileContent');
  
  console.log('=== PAGE DETECTION ===');
  console.log('Path:', path);
  console.log('Is login page:', isLoginPage);
  console.log('Is home:', isHome);
  console.log('Is dashboard:', isDashboard);
  console.log('Is profile:', isProfile);
  
  if (isLoginPage) {
    console.log('>>> INITIALIZING LOGIN PAGE');
    // If already logged in, redirect to dashboard
    if (state.token) {
      console.log('User already logged in, redirecting to dashboard');
      window.location.href = '/dashboard.html';
    } else {
      initLoginPage();
    }
  } else if (isHome) {
    console.log('>>> INITIALIZING HOME PAGE');
    if (state.token) {
      console.log('Token found, initializing home');
      initHome();
    } else {
      console.log('No token found, redirecting to login');
      window.location.href = '/';
    }
  } else if (isDashboard) {
    console.log('>>> INITIALIZING DASHBOARD PAGE');
    if (state.token) {
      console.log('Token found, initializing dashboard');
      initDashboard();
    } else {
      console.log('No token found, redirecting to login');
      window.location.href = '/';
    }
  } else if (isProfile) {
    console.log('>>> INITIALIZING PROFILE PAGE');
    if (state.token) {
      console.log('Token found, initializing profile');
      initProfile();
    } else {
      console.log('No token found, redirecting to login');
      window.location.href = '/';
    }
  } else {
    console.log('>>> UNKNOWN PAGE TYPE');
    if (state.token && document.getElementById('dashboardAlert')) {
      console.log('Has token and dashboard elements found, initializing dashboard');
      initDashboard();
    } else if (!state.token && document.getElementById('loginForm')) {
      console.log('No token and login form found, initializing login');
      initLoginPage();
    } else {
      console.log('Defaulting to login page');
      initLoginPage();
    }
  }
});

// ===== LOGIN PAGE =====
function initLoginPage() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const showRegisterBtn = document.getElementById('showRegister');
  const showRegisterId = document.getElementById('showRegisterId');
  const showLoginBtn = document.getElementById('showLogin');

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms();
    });
  }
  if (showRegisterId) {
    showRegisterId.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms();
    });
  }
  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms();
    });
  }

  // If already logged in, redirect to dashboard
  if (state.token) {
    window.location.href = '/dashboard.html';
  }
}

function toggleForms() {
  const register = document.getElementById('registerContainer');
  const login = document.getElementById('loginContainer');
  if (register && login) {
    register.classList.toggle('hidden');
    login.classList.toggle('hidden');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('registerEmail')?.value;
  const password = document.getElementById('registerPassword')?.value;
  const firstName = document.getElementById('firstName')?.value;
  const lastName = document.getElementById('lastName')?.value;

  console.log('Register attempt:', { email, firstName, lastName });

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    const data = await response.json();
    console.log('Register response:', data);
    const alertDiv = document.getElementById('registerAlert');

    if (response.ok) {
      showAlert('registerAlert', 'Registration successful! Please login.', 'success');
      setTimeout(() => toggleForms(), 1500);
    } else {
      showAlert('registerAlert', data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Register error:', error);
    showAlert('registerAlert', 'Connection error: ' + error.message, 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;

  console.log('Login attempt:', { email });

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (response.ok) {
      console.log('Login successful, saving to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('expiresAt', data.expiresAt);
      localStorage.setItem('expiresIn', data.expiresIn);
      localStorage.setItem('totalExpiration', data.expiresIn);

      console.log('localStorage after save:');
      console.log('  token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('  user:', localStorage.getItem('user'));
      console.log('  expiresIn:', localStorage.getItem('expiresIn'));

      // Update state
      state.token = data.token;
      state.user = data.user;
      state.expiresAt = data.expiresAt;
      state.expiresIn = data.expiresIn;
      state.totalExpiration = data.expiresIn;

      console.log('State after update:', { token: state.token?.substring(0, 20) + '...', user: state.user });

      showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
      
      console.log('About to redirect to /dashboard.html');
      setTimeout(() => {
        console.log('Redirecting now...');
        window.location.href = '/index.html';
      }, 1000);
    } else {
      showAlert('loginAlert', data.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('loginAlert', 'Connection error: ' + error.message, 'error');
  }
}

// ===== DASHBOARD PAGE =====
function initDashboard() {
  console.log('Initializing dashboard with user:', state.user);
  displayDashboard();
  startTokenTimer();

  const logoutBtn = document.getElementById('logoutBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const copyTokenBtn = document.getElementById('copyTokenBtn');
  const verifyTokenBtn = document.getElementById('verifyTokenBtn');

  console.log('Logout button found:', !!logoutBtn);
  console.log('Refresh button found:', !!refreshBtn);
  console.log('Copy token button found:', !!copyTokenBtn);
  console.log('Verify token button found:', !!verifyTokenBtn);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshToken);
  }
  if (copyTokenBtn) {
    copyTokenBtn.addEventListener('click', copyTokenToClipboard);
  }
  if (verifyTokenBtn) {
    verifyTokenBtn.addEventListener('click', verifyTokenAction);
  }
  
  // Manual token verification
  const verifyManualTokenBtn = document.getElementById('verifyManualTokenBtn');
  if (verifyManualTokenBtn) {
    verifyManualTokenBtn.addEventListener('click', verifyManualToken);
  }
}

function displayDashboard() {
  if (state.user) {
    console.log('Displaying dashboard for user:', state.user);
    
    // Display welcome greeting
    const welcomeGreeting = document.getElementById('welcomeGreeting');
    if (welcomeGreeting) {
      const firstName = state.user.firstName || 'User';
      const lastName = state.user.lastName || '';
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      
      // Get greeting based on time of day
      const hour = new Date().getHours();
      let timeGreeting = 'Welcome';
      if (hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour < 18) {
        timeGreeting = 'Good Afternoon';
      } else {
        timeGreeting = 'Good Evening';
      }
      
      welcomeGreeting.innerHTML = `${timeGreeting}, ${fullName}! 🎉`;
    }
    
    // Display user info
    const userEmailDisplay = document.getElementById('userEmail');
    const userIdDisplay = document.getElementById('userId');
    
    if (userEmailDisplay) {
      userEmailDisplay.textContent = state.user.email;
    }
    if (userIdDisplay) {
      userIdDisplay.textContent = state.user.id;
    }
  }
  displayTokenInfo();
}

function displayTokenInfo() {
  const tokenDisplayInput = document.getElementById('tokenDisplay');
  if (tokenDisplayInput && state.token) {
    tokenDisplayInput.value = state.token;
    // Add click handler to copy
    tokenDisplayInput.addEventListener('click', () => {
      tokenDisplayInput.select();
      document.execCommand('copy');
      showAlert('dashboardAlert', '✓ Token copied to clipboard!', 'success');
    });
  }
}

function startTokenTimer() {
  console.log('Starting token timer. Expires at:', state.expiresAt, 'Expires in:', state.expiresIn, 'seconds');
  updateTimerDisplay();
  
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
  }

  state.timerInterval = setInterval(() => {
    if (state.expiresAt) {
      const expiresAt = new Date(state.expiresAt);
      const now = new Date();
      const secondsLeft = Math.floor((expiresAt - now) / 1000);

      if (secondsLeft <= 0) {
        console.log('Token expired!');
        clearInterval(state.timerInterval);
        showAlert('dashboardAlert', 'Your token has expired. Please login again.', 'warning');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        state.expiresIn = secondsLeft;
        updateTimerDisplay();
      }
    }
  }, 500); // Update every 500ms for smooth countdown
}

function updateTimerDisplay() {
  const timerValue = document.getElementById('timerValue');
  const progressFill = document.getElementById('progressFill');
  
  if (timerValue) {
    timerValue.textContent = String(state.expiresIn).padStart(2, '0') + 's';
    
    // Change color based on time remaining
    timerValue.classList.remove('warning', 'danger');
    const percentage = (state.expiresIn / state.totalExpiration) * 100;
    
    if (percentage <= 10) {
      timerValue.classList.add('danger');
      if (progressFill) progressFill.classList.add('danger');
      if (progressFill) progressFill.classList.remove('warning');
    } else if (percentage <= 30) {
      timerValue.classList.add('warning');
      if (progressFill) progressFill.classList.add('warning');
      if (progressFill) progressFill.classList.remove('danger');
    } else {
      if (progressFill) progressFill.classList.remove('danger', 'warning');
    }
  }

  if (progressFill) {
    const percentage = (state.expiresIn / state.totalExpiration) * 100;
    progressFill.style.width = percentage + '%';
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  logout();
}

function logout() {
  clearInterval(state.timerInterval);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('totalExpiration');
  window.location.href = '/';
}

async function refreshToken() {
  // This would typically call a refresh endpoint, for now we just show a notification
  showAlert('dashboardAlert', 'Token refresh not yet implemented. Create a new token by logging in again.', 'warning');
}

// Copy token to clipboard
async function copyTokenToClipboard() {
  if (!state.token) {
    showAlert('dashboardAlert', 'No token available to copy', 'error');
    return;
  }

  try {
    const tokenInput = document.getElementById('tokenDisplay');
    if (tokenInput) {
      tokenInput.select();
      document.execCommand('copy');
      showAlert('dashboardAlert', '✓ Full token copied to clipboard! (64 characters)', 'success');
      console.log('Copied full token to clipboard');
    }
  } catch (error) {
    console.error('Failed to copy token:', error);
    showAlert('dashboardAlert', 'Failed to copy token: ' + error.message, 'error');
  }
}

// Verify token with API
async function verifyTokenAction() {
  if (!state.token) {
    showAlert('dashboardAlert', 'No token available to verify', 'error');
    return;
  }

  try {
    console.log('Verifying token...');
    const response = await fetch(`${API_BASE}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Verification response:', data);

    const verificationDiv = document.getElementById('verificationResult');
    if (verificationDiv) {
      verificationDiv.classList.remove('hidden');

      if (response.ok) {
        verificationDiv.innerHTML = `
          <div class="alert alert-success">
            <strong>✓ Token Verified Successfully!</strong>
            <div style="margin-top: 10px; font-size: 13px;">
              <div><strong>User:</strong> ${data.user.email}</div>
              <div><strong>Expires In:</strong> ${data.expiresIn} seconds</div>
              <div><strong>Expires At:</strong> ${new Date(data.expiresAt).toLocaleString()}</div>
            </div>
          </div>
        `;
        showAlert('dashboardAlert', 'Token is valid and active! Redirecting to home...', 'success');
        setTimeout(() => {
          window.location.href = '/home.html';
        }, 2000);
      } else {
        verificationDiv.innerHTML = `
          <div class="alert alert-error">
            <strong>✗ Token Verification Failed</strong>
            <div style="margin-top: 10px;">
              ${data.error || 'Token is invalid or expired'}
            </div>
          </div>
        `;
        showAlert('dashboardAlert', data.error || 'Token verification failed', 'error');
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    showAlert('dashboardAlert', 'Connection error: ' + error.message, 'error');
  }
}

// Verify manually pasted token
async function verifyManualToken() {
  const tokenInput = document.getElementById('manualTokenInput');
  const token = tokenInput?.value?.trim();

  if (!token) {
    showAlert('dashboardAlert', 'Please paste a token to verify', 'error');
    return;
  }

  try {
    console.log('Verifying manual token...');
    const response = await fetch(`${API_BASE}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Manual verification response:', data);

    const resultDiv = document.getElementById('manualVerificationResult');
    if (resultDiv) {
      resultDiv.classList.remove('hidden');

      if (response.ok) {
        resultDiv.innerHTML = `
          <div class="alert alert-success">
            <strong>✓ Token is Valid!</strong>
            <div style="margin-top: 10px; font-size: 13px;">
              <div><strong>User:</strong> ${data.user.email}</div>
              <div><strong>User ID:</strong> ${data.user.id}</div>
              <div><strong>Expires In:</strong> ${data.expiresIn} seconds</div>
              <div><strong>Expires At:</strong> ${new Date(data.expiresAt).toLocaleString()}</div>
            </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div class="alert alert-error">
            <strong>✗ Invalid or Expired Token</strong>
            <div style="margin-top: 10px;">
              ${data.error || 'Token verification failed'}
            </div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Manual verification error:', error);
    const resultDiv = document.getElementById('manualVerificationResult');
    if (resultDiv) {
      resultDiv.classList.remove('hidden');
      resultDiv.innerHTML = `
        <div class="alert alert-error">
          <strong>✗ Verification Error</strong>
          <div style="margin-top: 10px;">
            ${error.message}
          </div>
        </div>
      `;
    }
  }
}

// ===== HOME PAGE =====
function initHome() {
  setupNavigation('home');
  displayHomeInfo();
  setupHomeButtons();
}

function displayHomeInfo() {
  if (state.user) {
    const homeGreeting = document.getElementById('homeGreeting');
    if (homeGreeting) {
      const firstName = state.user.firstName || 'User';
      const lastName = state.user.lastName || '';
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      const hour = new Date().getHours();
      let timeGreeting = 'Welcome';
      if (hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour < 18) {
        timeGreeting = 'Good Afternoon';
      } else {
        timeGreeting = 'Good Evening';
      }
      homeGreeting.innerHTML = `${timeGreeting}, ${fullName}! 🎉`;
    }
    const homeEmail = document.getElementById('homeEmail');
    const homeUserId = document.getElementById('homeUserId');
    if (homeEmail) homeEmail.textContent = state.user.email;
    if (homeUserId) homeUserId.textContent = state.user.id;
  }
}

function setupHomeButtons() {
  const dashboardBtn = document.getElementById('goToDashboardBtn');
  const profileBtn = document.getElementById('goToProfileBtn');
  const logoutBtn = document.getElementById('homeLogoutBtn');
  if (dashboardBtn) dashboardBtn.addEventListener('click', () => window.location.href = '/dashboard.html');
  if (profileBtn) profileBtn.addEventListener('click', () => window.location.href = '/profile.html');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// ===== PROFILE PAGE =====
function initProfile() {
  setupNavigation('profile');
  displayProfileInfo();

  const logoutBtn = document.getElementById('profileLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function displayProfileInfo() {
  if (state.user) {
    const profileContent = document.getElementById('profileContent');
    if (profileContent) {
      profileContent.innerHTML = `
        <div class="user-info">
          <div class="user-info-item">
            <span class="user-label">ID</span>
            <span class="user-value">${state.user.id}</span>
          </div>
          <div class="user-info-item">
            <span class="user-label">First Name</span>
            <span class="user-value">${state.user.firstName}</span>
          </div>
          <div class="user-info-item">
            <span class="user-label">Last Name</span>
            <span class="user-value">${state.user.lastName}</span>
          </div>
          <div class="user-info-item">
            <span class="user-label">Email</span>
            <span class="user-value">${state.user.email}</span>
          </div>
        </div>
      `;
    }
  }
}

// ===== UTILITIES =====
function setupNavigation(currentPage) {
  const navHome = document.getElementById('navHome');
  const navDashboard = document.getElementById('navDashboard');
  const navProfile = document.getElementById('navProfile');

  if (navHome) navHome.classList.remove('active');
  if (navDashboard) navDashboard.classList.remove('active');
  if (navProfile) navProfile.classList.remove('active');

  if (currentPage === 'home' && navHome) {
    navHome.classList.add('active');
  } else if (currentPage === 'dashboard' && navDashboard) {
    navDashboard.classList.add('active');
  } else if (currentPage === 'profile' && navProfile) {
    navProfile.classList.add('active');
  }
}

function showAlert(elementId, message, type) {
  const alertDiv = document.getElementById(elementId);
  if (alertDiv) {
    alertDiv.innerHTML = `
      <div class="alert alert-${type}">
        ${message}
      </div>
    `;
    alertDiv.classList.remove('hidden');
  }
}
