/* eslint-disable */
console.log('Hello from login.js ');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');

const login = async (e) => {
  try {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    const res = await axios({
      method: 'POST',
      data: {
        email,
        password,
      },
      url: '/app/api/auth/login',
    });

    if (res.data.status === 'success') {
      alert('successfully login');
      window.setTimeout(() => {
        location.assign('/app/homepage');
      }, 500);
    }
  } catch (err) {
    alert('login failed');
  }
};

const initPage = () => {
  loginForm.addEventListener('submit', login);
};

initPage();
