/* eslint-disable */
document.getElementById('updateMeForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = new FormData();

  const name = document.getElementById('newNameInput').value;
  const photo = document.getElementById('userPhoto').files[0];
  console.log('file[0]', photo);
  form.append('name', name);
  form.append('photo', photo);

  const res = await axios({
    method: 'PATCH',
    url: '/app/api/users/updateMe',
    data: form,
  });

  if (res.data.status === 'success') {
    alert('udpate succeed!');
    window.setTimeout(() => {
      location.assign('/app/mypage');
    }, 500);
  }
});
