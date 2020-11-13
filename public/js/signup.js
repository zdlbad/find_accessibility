/* eslint-disable */
console.log('Hello from signup.js ');
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('signupEmail');
const passwordInput = document.getElementById('signupPassword');
const passwordConfirmInput = document.getElementById('signupPasswordConfirm');

const signup = async (e) => {
  try {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    const res = await axios({
      method: 'POST',
      data: {
        email,
        password,
        passwordConfirm,
      },
      url: '/app/api/auth/signup',
    });

    if (res.data.status === 'success') {
      alert('successfully signup');
      window.setTimeout(() => {
        location.assign('/app/homepage');
      }, 500);
    }
  } catch (err) {
    alert('signup failed');
  }
};

const initPage = () => {
  signupForm.addEventListener('submit', signup);
};

initPage();
