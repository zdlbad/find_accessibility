/* eslint-disable */
document.getElementById('updatePasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  try {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
    const res = await axios({
      method: 'PATCH',
      url: '/api/auth/updatepassword',
      data: {
        oldPassword,
        newPassword,
        newPasswordConfirm,
      },
    });

    if (res.data.status === 'success') {
      alert('udpate succeed!');
      window.setTimeout(() => {
        location.assign('/mypage');
      }, 500);
    } else {
      alert('failed to update password!');
    }
  } catch (err) {
    alert('failed to update password!');
  }
});
