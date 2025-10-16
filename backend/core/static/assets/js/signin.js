/* eslint-disable consistent-return */
/* eslint-disable no-else-return */

//const url = 'https://bankaapp.herokuapp.com/api/v2/auth/signin';

const url = 'http://127.0.0.1:8000/api/v2/auth/signin';

const token = localStorage.getItem('token');
const errorDiv = document.querySelector('.errors');
const errorContainer = document.querySelector('.errors ul');

const signInForm = document.querySelector('.form-card');
const createNode = element => document.createElement(element);
const append = (parent, el) => parent.appendChild(el);

signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorContainer.innerHTML = '';
  errorDiv.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password }),
});

    const response = await res.json();

    errorDiv.style.display = 'block';

    if (res.status === 400) {
      errorDiv.style.color = 'red';
      const li = createNode('li');
      li.innerHTML = response.message || 'Invalid credentials, please try again.';
      append(errorContainer, li);
      setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
      }, 5000);
      return;
    }

    if (res.status === 200) {
      errorDiv.style.color = 'green';
      const li = createNode('li');
      li.innerHTML = `${response.message || 'Login successful'}, Welcome Back!!! <br>`;
      append(errorContainer, li);

      const { data } = response;

      localStorage.setItem('token', data.token);
      localStorage.setItem('userDetails', JSON.stringify(data));
      localStorage.setItem('loggedIn', 'true');

      setTimeout(() => {
        if (data.type === 'client') {
          window.location = './user-dashboard.html';
        } else if (data.isadmin === 'true') {
          window.location = './admin-dashboard.html';
        } else {
          window.location = './staff-dashboard.html';
        }
      }, 3000);
      return;
    }

    errorDiv.style.color = 'red';
    const li = createNode('li');
    li.innerHTML = response.message || 'An error occurred, please try again.';
    append(errorContainer, li);
    setTimeout(() => {
      errorDiv.style.display = 'none';
      errorContainer.innerHTML = '';
    }, 5000);

  } catch (error) {
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
    const msg = createNode('li');
    msg.innerHTML = error.message || 'Error connecting to the server.';
    append(errorContainer, msg);
    setTimeout(() => {
      errorDiv.style.display = 'none';
      errorContainer.innerHTML = '';
    }, 5000);
  }
});