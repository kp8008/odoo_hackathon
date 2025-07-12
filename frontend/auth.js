document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  loginForm?.addEventListener('submit', handleLogin);
  registerForm?.addEventListener('submit', handleRegister);
});

async function handleLogin(e) {
  e.preventDefault();
  const email = e.target.loginEmail.value.trim();
  const password = e.target.loginPassword.value;
  const res = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message || 'Login failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location = 'index.html?login=1';
}

async function handleRegister(e) {
  e.preventDefault();
  const body = {
    name: e.target.registerName.value.trim(),
    email: e.target.registerEmail.value.trim(),
    password: e.target.registerPassword.value,
    location: e.target.registerLocation.value.trim(),
    skillsOffered: e.target.skillsOffered.value.split(',').map(s => s.trim()).filter(Boolean),
    skillsWanted: e.target.skillsWanted.value.split(',').map(s => s.trim()).filter(Boolean),
    availability: e.target.availability.value
  };
  const res = await fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message || 'Register failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location = 'index.html?registered=1';
}
