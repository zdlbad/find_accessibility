/*  eslint-disable */

document.getElementById('forgotPassword').addEventListener('submit', async function (e) {
  e.preventDefault();
  try {
    const email = document.getElementById('userEmail').value;
    const res = await axios({
      method: 'POST',
      url: '/app/api/auth/forgotpassword',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      alert('Email sent to your email, plese use link to reset password');
      window.setTimeout(() => {
        location.assign('/app');
      }, 500);
    } else {
      alert('Your email is incorrect, please check again');
    }
  } catch (err) {
    alert('Your email is incorrect, please check again');
  }
});
