// Simple client-side auth for demo purposes only.
// Stores a single user in localStorage and a session flag when logged in.

(function(){
  const qs = id => document.getElementById(id);

  const registerForm = qs('register-form');
  const loginForm = qs('login-form');
  const registerView = qs('register-view');
  const loginView = qs('login-view');
  const authContainer = qs('auth');
  const app = qs('app');
  const userGreeting = qs('user-greeting');
  const logoutBtn = qs('logout-btn');
  const showLogin = qs('show-login');
  const showRegister = qs('show-register');
  const loginRemember = qs('login-remember');
  const tasksContainer = qs('tasks-container');
  const userPointsEl = qs('user-points');

  // Helpers
  function saveUser(user){
    localStorage.setItem('fb_monetizer_user', JSON.stringify(user));
  }
  function getUser(){
    const raw = localStorage.getItem('fb_monetizer_user');
    return raw ? JSON.parse(raw) : null;
  }
  function setSession(email){
    localStorage.setItem('fb_monetizer_session', email);
  }
  function clearSession(){
    localStorage.removeItem('fb_monetizer_session');
  }
  function getSession(){
    return localStorage.getItem('fb_monetizer_session');
  }

  // UI toggles
  function showAppFor(user){
    authContainer.hidden = true;
    app.hidden = false;
    userGreeting.textContent = `Hello, ${user.name}`;
  }
  function showAuth(view){
    authContainer.hidden = false;
    app.hidden = true;
    registerView.hidden = view !== 'register';
    loginView.hidden = view !== 'login';
  }

  // On load: if session exists, log in
  window.addEventListener('DOMContentLoaded', ()=>{
    const sessionEmail = getSession();
    const user = getUser();
    if(sessionEmail && user && user.email === sessionEmail){
      showAppFor(user);
      initTasksFor(user.email);
    } else {
      showAuth('register'); // default show register first as requested
    }
  });

  // Register
  registerForm && registerForm.addEventListener('submit', e =>{
    e.preventDefault();
    const name = qs('reg-name').value.trim();
    const email = qs('reg-email').value.trim().toLowerCase();
    const password = qs('reg-password').value;
    if(!name || !email || !password){
      alert('Please fill all fields');
      return;
    }

    const existing = getUser();
    if(existing && existing.email === email){
      alert('An account with that email already exists. Please login.');
      showAuth('login');
      return;
    }

    const user = { name, email, password };
    saveUser(user);
    // automatically set session and show app
    setSession(email);
    showAppFor(user);
    initTasksFor(email);
  });

  // Login
  loginForm && loginForm.addEventListener('submit', e =>{
    e.preventDefault();
    const email = qs('login-email').value.trim().toLowerCase();
    const password = qs('login-password').value;
    const user = getUser();
    if(!user || user.email !== email || user.password !== password){
      alert('Invalid credentials.');
      return;
    }
    // remember checkbox
    if(loginRemember && loginRemember.checked){
      setSession(email);
    } else {
      // set session for this tab only (still use localStorage here for simplicity)
      setSession(email);
    }
    showAppFor(user);
    initTasksFor(user.email);
  });

  // Logout
  logoutBtn && logoutBtn.addEventListener('click', ()=>{
    clearSession();
    // show register view after logout
    showAuth('login');
  });

  // --- Tasks and points ---
  const DEFAULT_TASKS = [
    { id: 't1', title: 'Share a post', desc: 'Share one of our recommended posts to your timeline.', points: 10 },
    { id: 't2', title: 'Invite a friend', desc: 'Invite a friend to try the platform.', points: 15 },
    { id: 't3', title: 'Complete profile', desc: 'Fill out your profile details for better recommendations.', points: 5 },
    { id: 't4', title: 'Publish content', desc: 'Publish your first post using our scheduler.', points: 12 }
  ];

  function tasksKey(email){ return `fb_tasks_${email}`; }
  function pointsKey(email){ return `fb_points_${email}`; }

  function initTasksFor(email){
    // load or initialize tasks and points for this user
    let tasks = JSON.parse(localStorage.getItem(tasksKey(email)) || 'null');
    if(!tasks){
      tasks = DEFAULT_TASKS.map(t=> ({ ...t, completed: false }));
      localStorage.setItem(tasksKey(email), JSON.stringify(tasks));
    }
    let points = parseInt(localStorage.getItem(pointsKey(email)) || '0', 10);
    userPointsEl && (userPointsEl.textContent = points);
    renderTasks(tasks, email);
  }

  function renderTasks(tasks, email){
    if(!tasksContainer) return;
    tasksContainer.innerHTML = '';
    tasks.forEach(task =>{
      const card = document.createElement('div');
      card.className = 'task-card';
      const title = document.createElement('h4'); title.textContent = task.title;
      const desc = document.createElement('p'); desc.textContent = task.desc;
      const btn = document.createElement('button');
      btn.textContent = task.completed ? 'Completed' : `Earn ${task.points} pts`;
      btn.disabled = task.completed;
      btn.addEventListener('click', ()=>{
        completeTask(task.id, email);
      });
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(btn);
      tasksContainer.appendChild(card);
    });
  }

  function completeTask(taskId, email){
    const raw = localStorage.getItem(tasksKey(email));
    if(!raw) return;
    const tasks = JSON.parse(raw);
    const idx = tasks.findIndex(t=>t.id===taskId);
    if(idx === -1) return;
    if(tasks[idx].completed) return;
    tasks[idx].completed = true;
    localStorage.setItem(tasksKey(email), JSON.stringify(tasks));
    // add points
    const prev = parseInt(localStorage.getItem(pointsKey(email)) || '0', 10);
    const updated = prev + (tasks[idx].points || 0);
    localStorage.setItem(pointsKey(email), String(updated));
    if(userPointsEl) userPointsEl.textContent = updated;
    // re-render
    renderTasks(tasks, email);
  }

  // Toggle views links
  showLogin && showLogin.addEventListener('click', e =>{
    e.preventDefault();
    showAuth('login');
  });
  showRegister && showRegister.addEventListener('click', e =>{
    e.preventDefault();
    showAuth('register');
  });

})();