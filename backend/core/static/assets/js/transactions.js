/* eslint-disable no-undef */
/* eslint-disable consistent-return */

const transactionTypeRegex = /^(debit|credit)$/i;
const amountRegex = /^\d+(\.\d{1,2})?$/; // allows decimals up to 2 places
const accountNumberRegex = /^[0-9]+$/;

const transactionTypeError = document.querySelector('#transaction-type-error');
const amountError = document.querySelector('#amount-error');
const accountNumberError = document.querySelector('#account-number-error');

const create = (type, accountNumber, amount) => {
  let isValid = true;

  if (!transactionTypeRegex.test(type)) {
    transactionTypeError.innerHTML = 'Enter a valid transaction type (debit or credit)';
    isValid = false;
  }
  if (!amountRegex.test(amount)) {
    amountError.innerHTML = 'Amount is required and must be a valid number';
    isValid = false;
  }
  if (!accountNumberRegex.test(accountNumber)) {
    accountNumberError.innerHTML = 'Enter a valid account number (digits only)';
    isValid = false;
  }
  return isValid;
};

const createTransaction = document.querySelector('.form-card');
if (createTransaction) {
  createTransaction.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value.trim();
    const type = document.getElementById('type').value.trim();
    const accountNumber = document.getElementById('account-number').value.trim();

    transactionTypeError.innerHTML = '';
    amountError.innerHTML = '';
    accountNumberError.innerHTML = '';

    if (!create(type, accountNumber, amount)) {
      return false;
    }

    const url = `http://127.0.0.1:8000/api/v2/transactions/${accountNumber}/${type}`;

    const options = {
      method: 'POST',
      body: JSON.stringify({ amount, type, accountNumber }),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // assuming backend expects Bearer token
      }),
    };

    fetch(url, options)
      .then(res => res.json())
      .then((response) => {
        if (response.status >= 400) {
          errorDiv.style.display = 'block';
          const li = createNode('li');
          li.innerHTML = `${response.message}<br>`;
          append(errorContainer, li);
          return setTimeout(() => {
            errorDiv.style.display = 'none';
            errorContainer.innerHTML = '';
          }, 5000);
        }

        if (response.status === 200) {
          errorDiv.style.display = 'block';
          errorDiv.style.color = 'green';
          const li = createNode('li');
          li.innerHTML = `${response.message} <br>`;
          append(errorContainer, li);
          setTimeout(() => {
            window.location = './staff-dashboard.html';
          }, 3000);
        }
      })
      .catch((error) => {
        errorDiv.style.display = 'block';
        errorDiv.style.color = 'red';
        const msg = createNode('li');
        msg.innerHTML = error.message || 'Error in connecting, Please check your internet connection and try again';
        append(errorContainer, msg);
        setTimeout(() => {
          errorDiv.style.display = 'none';
          errorContainer.innerHTML = '';
        }, 5000);
      });
  });
}
