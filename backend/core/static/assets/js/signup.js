/* eslint-disable no-useless-escape */
/* eslint-disable consistent-return */

const url = 'http://127.0.0.1:8000/api/v2/auth/signup';

const errorDiv = document.querySelector('.errors');
const errorContainer = document.querySelector('.errors ul');
const token = localStorage.getItem('token');  // safer to use getItem

const firstnameRegex = /^[a-zA-Z]{3,25}$/;
const lastnameRegex = /^[a-zA-Z]{3,25}$/;
const emailRegex = /^[a-z0-9._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.)+[a-z]{2,16}$/;
const passwordRegex = /^[a-zA-Z0-9]{8,}$/;

const firstNameError = document.querySelector('#firstName-error');
const lastNameError = document.querySelector('#lastName-error');
const emailError = document.querySelector('#email-error');
const passwordError = document.querySelector('#password-error');

const signUp = (firstname, lastname, email, password) => {
  let valid = true;

  firstNameError.innerHTML = '';
  lastNameError.innerHTML = '';
  emailError.innerHTML = '';
  passwordError.innerHTML = '';

  if (!firstnameRegex.test(firstname)) {
    firstNameError.innerHTML = 'First name should be 3-25 alphabetic characters.';
    valid = false;
  }
  if (!lastnameRegex.test(lastname)) {
    lastNameError.innerHTML = 'Last name should be 3-25 alphabetic characters.';
    valid = false;
  }
  if (!emailRegex.test(email)) {
    emailError.innerHTML = 'Email should be of the form name@domain.com.';
    valid = false;
  }
  if (!passwordRegex.test(password)) {
    passwordError.innerHTML = 'Password should be alphanumeric with at least 8 characters.';
    valid = false;
  }

  return valid;
};

const signUpForm = document.querySelector('.form-card');
const createNode = el => document.createElement(el);
const append = (parent, el) => parent.appendChild(el);

signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  // Validate inputs
  if (!signUp(firstName, lastName, email, password)) {
    return; // stop if invalid
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
    });

    const data = await res.json();

    // Clear previous errors/messages
    errorContainer.innerHTML = '';
    errorDiv.style.display = 'block';

    if (res.status === 201) {
      errorDiv.style.color = 'green';
      const li = createNode('li');
      li.innerHTML = data.message || 'Account created successfully! Welcome!!!';
      append(errorContainer, li);

      // Store tokens/details
      localStorage.setItem('token', data.token);
      localStorage.setItem('userDetails', JSON.stringify(data));
      localStorage.setItem('loggedIn', 'true');

      setTimeout(() => {
        window.location = './signin.html';
      }, 3000);

    } else if (res.status === 409) {
      errorDiv.style.color = 'red';
      const li = createNode('li');
      li.innerHTML = data.message || 'Email already exists. Please specify a new email.';
      append(errorContainer, li);

      setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
      }, 5000);

    } else {
      // Handle other errors
      errorDiv.style.color = 'red';
      const li = createNode('li');
      li.innerHTML = data.message || 'An error occurred. Please try again.';
      append(errorContainer, li);

      setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
      }, 5000);
    }

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
