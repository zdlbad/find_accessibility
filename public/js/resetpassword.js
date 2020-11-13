/* eslint-disable */

document.getElementById('resetPasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const password = document.getElementById('newPassword').value;
  const passwordConfirm = document.getElementById('newPasswordConfirm').value;
  const url = document.getElementById('authUrl').dataset.authurl;
  console.log(password, passwordConfirm, url);

  const res = await axios({
    url,
    method: 'PATCH',
    data: {
      password,
      passwordConfirm,
    },
  });

  if (res.data.status === 'success') {
    alert('Successufully reset password!');
    window.setTimeout(() => {
      location.assign('/app/mypage');
    }, 500);
  }
});
