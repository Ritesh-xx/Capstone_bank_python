/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */

// --- Helper Functions ---

/**
 * Creates a fresh options object for API calls with the latest token.
 * This is the KEY FIX that solves the "Error connecting" issue.
 * @param {string} [method='GET'] - The HTTP method (e.g., 'POST').
 * @param {object} [body=null] - The request body for POST/PUT calls.
 * @returns {object} The options object for a fetch request.
 */
const getAuthOptions = (method = 'GET', body = null) => {
    // ✅ Always get the fresh token from localStorage right before the request
    const token = localStorage.getItem('token');

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    return options;
};

const append = (parent, el) => parent.appendChild(el);
const createNode = element => document.createElement(element);

const showError = (message) => {
    const errorDiv = document.querySelector('.errors');
    const errorContainer = document.querySelector('.errors ul');
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
    errorContainer.innerHTML = '';
    const msg = createNode('li');
    msg.textContent = message;
    append(errorContainer, msg);
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
    }, 5000);
};

// --- Data Loading & Display Functions ---

const loadProfileDetails = () => {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const userName = document.getElementById('user-name');
    if (userDetails) {
        userName.innerText = `${userDetails.firstName} ${userDetails.lastName}`;
    } else {
        userName.innerText = 'Guest';
    }
};

const loadAccounts = () => {
    const url = 'http://127.0.0.1:8000/api/v2/account';
    const accountsTabContent = document.getElementById('account');

    fetch(url, getAuthOptions()) // ✅ Use the helper to get fresh options
        .then(res => {
            if (!res.ok) throw new Error('Failed to load accounts. Your session may have expired.');
            return res.json();
        })
        .then((response) => {
            // The API for listing accounts doesn't wrap the data in a `data` key.
            const accounts = response; 
            if (accounts && accounts.length > 0) {
                let accountList = `
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Account Number</th>
                                <th>Type</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>`;
                accounts.forEach((account) => {
                    accountList += `
                        <tr>
                            <td>${account.account_number}</td>
                            <td>${account.account_type}</td>
                            <td>${parseFloat(account.balance).toFixed(2)}</td>
                            <td><button type="button" class="btn btn-primary" onclick="loadTransactionDetails('${account.account_number}')">View</button></td>
                        </tr>`;
                });
                accountList += `</tbody></table>`;
                accountsTabContent.innerHTML = accountList;
            } else {
                accountsTabContent.innerText = 'No accounts found. Create one to get started!';
            }
        })
        .catch((error) => {
            showError(error.message);
            console.error("Load Accounts Error:", error);
        });
};

const loadTransactions = () => {
    const url = 'http://127.0.0.1:8000/api/v2/transactions';
    const transactionHistoryDiv = document.getElementById('transaction');

    fetch(url, getAuthOptions()) // ✅ Use the helper
        .then(res => {
            if (!res.ok) throw new Error('Failed to load transaction history.');
            return res.json();
        })
        .then(response => {
            transactionHistoryDiv.innerHTML = '';
            const transactions = response.data || response;
            if (transactions && transactions.length > 0) {
                let transactionRows = `
                    <table id="transaction-table" class="stats-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Account Number</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Old Balance</th>
                                <th>New Balance</th>
                            </tr>
                        </thead>
                        <tbody>`;
                transactions.forEach(tx => {
                    const transactionDate = new Date(tx.created_on).toLocaleString('en-GB');
                    transactionRows += `
                        <tr>
                            <td>${transactionDate}</td>
                            <td>${tx.account_number}</td>
                            <td class="${tx.transaction_type.toLowerCase()}">${tx.transaction_type}</td>
                            <td>${parseFloat(tx.amount).toFixed(2)}</td>
                            <td>${parseFloat(tx.old_balance).toFixed(2)}</td>
                            <td>${parseFloat(tx.new_balance).toFixed(2)}</td>
                        </tr>`;
                });
                transactionRows += '</tbody></table>';
                transactionHistoryDiv.innerHTML = transactionRows;
            } else {
                transactionHistoryDiv.innerHTML = '<p>No transaction history found.</p>';
            }
        })
        .catch(err => {
            showError(err.message);
            console.error('Failed to load transactions:', err);
        });
};

/*
const loadTransactionDetails = (accountNumber) => {
    if (!accountNumber) return;
    const url = `http://127.0.0.1:8000/api/v2/accounts/${accountNumber}/transactions`;
    const transactionHistoryDiv = document.getElementById('transaction');
    
    fetch(url, getAuthOptions()) // ✅ Use the helper
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Could not fetch transactions.') });
            return res.json();
        })
        .then(response => {
            // ... (Your existing logic for displaying details is fine)
        })
        .catch(error => {
            showError(error.message);
            console.error('View Transactions Error:', error);
        });
};

*/

// In your user.js file

const loadTransactionDetails = (accountNumber) => {
    // Check if an account number was provided
    if (!accountNumber) {
        console.error("No account number provided to loadTransactionDetails");
        return;
    }

    const transactionHistoryDiv = document.getElementById('transaction');
    const url = `http://127.0.0.1:8000/api/v2/accounts/${accountNumber}/transactions`;

    // Show a loading message
    transactionHistoryDiv.innerHTML = `<p>Loading transactions for ${accountNumber}...</p>`;

    fetch(url, getAuthOptions()) // Assumes you have the getAuthOptions() helper
        .then(res => {
            if (!res.ok) {
                // If the server returns an error, parse it and throw it
                return res.json().then(err => { throw new Error(err.error || 'Could not fetch transactions.') });
            }
            return res.json();
        })
        .then(response => {
            const transactions = response.data; // The data is wrapped in a 'data' key

            // ✅ THE FIX IS HERE: This block builds the new HTML table
            if (transactions && transactions.length > 0) {
                // Start building the HTML string for the new table
                let htmlList = `
                    <h2 class="feature">Transaction History for Account ${accountNumber}</h2>
                    <table id="transaction-table" class="stats-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Old Balance</th>
                                <th>New Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                // Loop through the new transaction data and create a table row for each one
                transactions.forEach((transaction) => {
                    const date = new Date(transaction.created_on);
                    // Using 'en-IN' for India Standard Time display
                    const formattedDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

                    htmlList += `
                        <tr>
                            <td>${formattedDate}</td>
                            <td class="${transaction.transaction_type.toLowerCase()}">${transaction.transaction_type}</td>
                            <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                            <td>${parseFloat(transaction.old_balance).toFixed(2)}</td>
                            <td>${parseFloat(transaction.new_balance).toFixed(2)}</td>
                        </tr>
                    `;
                });

                htmlList += '</tbody></table>';

                // 🎨 Replace the content of the transaction div with the new table
                transactionHistoryDiv.innerHTML = htmlList;

            } else {
                // If there are no transactions, show a message
                transactionHistoryDiv.innerHTML = `<p>No transactions found for account ${accountNumber}.</p>`;
            }
        })
        .catch((error) => {
            console.error('View Transactions Error:', error);
            // Display the error in the UI
            transactionHistoryDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
};

// --- Modal and Form Submission Logic ---

function openModal(modalId) {
    if (['depositModal', 'withdrawModal', 'transferModal'].includes(modalId)) {
        loadAccountsForModals();
    }
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

window.onclick = function (event) {
    ['depositModal', 'withdrawModal', 'transferModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
};



function submitDeposit(event) {
    event.preventDefault();
    const amount = document.getElementById('depositAmount').value;
    const accountNumber = document.getElementById('depositAccountSelect').value;

    if (!accountNumber) return alert('Please select an account.');

    const url = `http://127.0.0.1:8000/api/v2/transactions/${accountNumber}/credit/`;
    const body = { amount: parseFloat(amount) };

    fetch(url, getAuthOptions('POST', body)) // ✅ Use helper for POST
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Deposit failed') });
            return res.json();
        })
        .then(data => {
            alert('Deposit successful!');
            closeModal('depositModal');
            loadAccounts();
            loadTransactions();
        })
        .catch(error => {
            alert(error.message);
            console.error('Deposit Error:', error);
        });
}

function submitWithdraw(event) {
    event.preventDefault();
    const amount = document.getElementById('withdrawAmount').value;
    const accountNumber = document.getElementById('withdrawAccountSelect').value;

    if (!accountNumber) return alert('Please select an account.');

    const url = `http://127.0.0.1:8000/api/v2/transactions/${accountNumber}/debit/`;
    const body = { amount: parseFloat(amount) };

    fetch(url, getAuthOptions('POST', body)) // ✅ Use helper for POST
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Withdrawal failed') });
            return res.json();
        })
        .then(data => {
            alert('Withdrawal successful!');
            closeModal('withdrawModal');
            loadAccounts();
            loadTransactions();
        })
        .catch(error => {
            alert(error.message);
            console.error('Withdrawal Error:', error);
        });
}

function submitTransfer(event) {
    event.preventDefault();
    const fromAccountNumber = document.getElementById('transferFromAccountSelect').value;
    const toAccountNumber = document.getElementById('transferAccount').value;
    const amount = document.getElementById('transferAmount').value;

    if (!fromAccountNumber) return alert('Please select an account to transfer from.');

    const url = `http://127.0.0.1:8000/api/v2/accounts/${fromAccountNumber}/transfer/`;
    const body = { to_account: toAccountNumber, amount: parseFloat(amount) };

    fetch(url, getAuthOptions('POST', body)) // ✅ Use helper for POST
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Transfer failed') });
            return res.json();
        })
        .then(data => {
            alert('Transfer successful!');
            closeModal('transferModal');
            loadAccounts();
            loadTransactions();
        })
        .catch(error => {
            alert(error.message);
            console.error('Transfer Error:', error);
        });
}

function loadAccountsForModals() {
    const url = 'http://127.0.0.1:8000/api/v2/account';
    fetch(url, getAuthOptions()) // ✅ Use the helper
        .then(res => {
            if (!res.ok) throw new Error('Could not load accounts for modal.');
            return res.json();
        })
        .then(accounts => {
            populateAccountSelect('depositAccountSelect', accounts);
            populateAccountSelect('withdrawAccountSelect', accounts);
            populateAccountSelect('transferFromAccountSelect', accounts);
        })
        .catch(error => {
            console.error('Error fetching accounts for modals:', error);
        });
}

function populateAccountSelect(selectElementId, accounts) {
    // ... (This function is fine as is)
}

function logout() {
    localStorage.clear();
    alert('You have been successfully logged out.');
    window.location.href = '/home/';
}


// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    // First, check if the user is even logged in.
    if (!localStorage.getItem('token')) {
        alert('You must be logged in to view this page.');
        window.location.href = '/home/'; // Redirect if no token
        return; // Stop the rest of the script from running
    }
    
    // If logged in, load all the necessary data.
    loadProfileDetails();
    loadAccounts();
    loadTransactions();
});


















/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */

/*

const userDetails = JSON.parse(localStorage.getItem('userDetails'));
const token = localStorage.getItem('token');

const errorDiv = document.querySelector('.errors');
const errorContainer = document.querySelector('.errors ul');
const userName = document.getElementById('user-name');
const accountsTabContent = document.getElementById('account');
// ADDED: Selector for the transaction history container from your original HTML script
const transactionHistoryDiv = document.getElementById('transaction');

const append = (parent, el) => parent.appendChild(el);
const createNode = element => document.createElement(element);

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
};

const showError = (message) => {
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'red';
    errorContainer.innerHTML = '';
    const msg = createNode('li');
    msg.textContent = message;
    append(errorContainer, msg);
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
    }, 5000);
};

const loadProfileDetails = () => {
    if (userDetails) {
        userName.innerText = `${userDetails.firstName} ${userDetails.lastName}`;
    } else {
        userName.innerText = 'Guest';
    }
};

const loadAccounts = () => {
    const url = 'http://127.0.0.1:8000/api/v2/account';

    fetch(url, options)
        .then(res => res.json())
        .then((response) => {
            if (response.status === 200 && response.data.length) {
                let accountList = `
          <table class="stats-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
        `;

                response.data.forEach((account) => {
                    // NOTE: The onclick here is fine, as it calls a function now defined globally in this script
                    accountList += `
            <tr>
              <td>${account.account_number}</td>
              <td>${account.account_type}</td>
              <td>${parseFloat(account.balance).toFixed(2)}</td>
              <td><button type="button" class="btn btn-primary" onclick="loadTransactionDetails('${account.account_number}')">View</button></td>
            </tr>
          `;
                });
                accountList += `</tbody></table>`;
                accountsTabContent.innerHTML = accountList;
            } else {
                accountsTabContent.innerText = 'No accounts found.';
            }
        })
        .catch((error) => {
            showError('Error connecting. Check your internet connection and console.');
            console.error("Load Accounts Error:", error);
        });
};

// ADDED: The entire function to load and display transaction history
// user.js

const loadTransactions = () => {
    if (!token) return;

    // This URL points to the view we just updated
    const url = 'http://127.0.0.1:8000/api/v2/transactions';

    fetch(url, options)
        .then(res => {
            // Correctly check if the HTTP response is successful
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message || 'Failed to fetch transactions'); });
            }
            return res.json();
        })
        .then(response => {
            transactionHistoryDiv.innerHTML = ''; // Clear previous history
            
            // The JSON from Django will have a 'data' key if you wrap it, 
            // but your ListCreateAPIView sends an array directly. Let's handle both.
            const transactions = response.data || response;

            if (transactions && transactions.length > 0) {
                let transactionRows = `
                <table id="transaction-table" class="stats-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Account Number</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Old Balance</th>
                            <th>New Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                `;
                transactions.forEach(tx => {
                    const transactionDate = new Date(tx.created_on).toLocaleString('en-GB');
                    transactionRows += `
                    <tr>
                        <td>${transactionDate}</td>
                        <td>${tx.account_number}</td>
                        <td class="${tx.transaction_type.toLowerCase()}">${tx.transaction_type}</td>
                        <td>${parseFloat(tx.amount).toFixed(2)}</td>
                        <td>${parseFloat(tx.old_balance).toFixed(2)}</td>
                        <td>${parseFloat(tx.new_balance).toFixed(2)}</td>
                    </tr>
                    `;
                });
                transactionRows += '</tbody></table>';
                transactionHistoryDiv.innerHTML = transactionRows;
            } else {
                transactionHistoryDiv.innerHTML = '<p>No transaction history found.</p>';
            }
        })
        .catch(err => {
            console.error('Failed to load transactions:', err);
            transactionHistoryDiv.innerHTML = `<p style="color: red;">Could not load transaction history.</p>`;
        });
};

// This function was in your original script. I've kept it as a placeholder.
// ADD THIS CORRECTED FUNCTION to user.js

const loadTransactionDetails = (accountNumber) => {
  if (!accountNumber) {
    transactionHistoryDiv.innerText = 'No account number provided.';
    transactionHistoryDiv.style.color = 'red';
    return;
  }



  const url = `http://127.0.0.1:8000/api/v2/accounts/${accountNumber}/transactions`;

  fetch(url, options)
    .then(res => {
      // Step 1: Check if the HTTP response is successful
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Could not fetch transactions.'); });
      }
      return res.json();
    })
    .then(response => {
      // Step 2: This block only runs on a successful response
      if (response.data && response.data.length > 0) {
        let htmlList = `
          <h2 class="feature">Transaction History for Account ${accountNumber}</h2>
          <table id="transaction-table" class="stats-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Old Balance</th>
                <th>New Balance</th>
              </tr>
            </thead>
            <tbody>
        `;

        response.data.forEach((transaction) => {
          const date = new Date(transaction.createdOn || transaction.created_on);
          const formattedDate = date.toLocaleString('en-GB');

          htmlList += `
            <tr>
              <td>${formattedDate}</td>
              <td>${transaction.type || transaction.transaction_type}</td>
              <td>${parseFloat(transaction.amount).toFixed(2)}</td>
              <td>${parseFloat(transaction.oldBalance || transaction.old_balance).toFixed(2)}</td>
              <td>${parseFloat(transaction.newBalance || transaction.new_balance).toFixed(2)}</td>
            </tr>
          `;
        });

        htmlList += '</tbody></table>';
        transactionHistoryDiv.innerHTML = htmlList;
      } else {
        transactionHistoryDiv.innerHTML = `<p>No transactions found for account ${accountNumber}.</p>`;
      }
    })
    .catch((error) => {
      // Step 3: This catches any errors and displays them
      console.error('View Transactions Error:', error);
      showError(error.message);
    });
};




function openModal(modalId) {
    if (modalId === 'depositModal' || modalId === 'withdrawModal' || modalId === 'transferModal') {
        loadAccountsForModals();
    }
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

window.onclick = function (event) {
    ['depositModal', 'withdrawModal', 'transferModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
};

function submitDeposit(event) {
    event.preventDefault();
    const amount = document.getElementById('depositAmount').value;
    const accountNumber = document.getElementById('depositAccountSelect').value;

    if (!accountNumber) {
        alert('Please select an account.');
        return;
    }

    const url = `http://127.0.0.1:8000/api/v2/transactions/${accountNumber}/credit/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({amount: parseFloat(amount)}),
    })
        // Step 1: Check if the HTTP response itself is successful (e.g., status 200)
        .then(res => {
            // The 'res.ok' property is true for HTTP statuses in the 200-299 range.
            if (!res.ok) {
                // If not okay, we read the JSON to get the error message from the server.
                return res.json().then(errorData => {
                    // Throw an error to be caught by the .catch() block.
                    throw new Error(errorData.error || 'An unknown error occurred.');
                });
            }
            // If it's okay, we pass the JSON data to the next .then() block.
            return res.json();
        })
        // Step 2: This block now only runs for successful responses.
        .then(successData => {
            console.log('Deposit Response:', successData); // You can check the successful data here
            alert('Deposit successful!');
            closeModal('depositModal');
            loadAccounts();  // Refresh accounts to update balances
            loadTransactions(); // Refresh transactions
        })
        // Step 3: This block will catch any network errors or the error we threw above.
        .catch((error) => {
            console.error('Deposit Error:', error);
            alert(error.message); // Display the specific error message
        });
}


// user.js

// REPLACE the old submitWithdraw function with this
function submitWithdraw(event) {
    event.preventDefault();
    const amount = document.getElementById('withdrawAmount').value;
    const accountNumber = document.getElementById('withdrawAccountSelect').value;

    if (!accountNumber) {
        alert('Please select an account.');
        return;
    }

    const url = `http://127.0.0.1:8000/api/v2/transactions/${accountNumber}/debit/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
        if (ok) {
            alert('Withdrawal successful!');
            closeModal('withdrawModal');
            document.getElementById('withdrawForm').reset();
            loadAccounts();  // Refresh account list
            loadTransactions(); // Refresh transaction history
        } else {
            // Display the specific error from the server (e.g., "Insufficient funds")
            throw new Error(data.error || 'Withdrawal failed.');
        }
    })
    .catch(error => {
        console.error('Withdrawal Error:', error);
        alert(error.message);
    });
}

// user.js

// REPLACE the old submitTransfer function with this
function submitTransfer(event) {
    event.preventDefault();
    const fromAccountNumber = document.getElementById('transferFromAccountSelect').value;
    const toAccountNumber = document.getElementById('transferAccount').value;
    const amount = document.getElementById('transferAmount').value;

    if (!fromAccountNumber) {
        alert('Please select an account to transfer from.');
        return;
    }

    const url = `http://127.0.0.1:8000/api/v2/accounts/${fromAccountNumber}/transfer/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            to_account: toAccountNumber,
            amount: parseFloat(amount)
        }),
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
        if (ok) {
            alert('Transfer successful!');
            closeModal('transferModal');
            document.getElementById('transferForm').reset();
            loadAccounts();      // Refresh account list with new balances
            loadTransactions();  // Refresh transaction history
        } else {
            // Display the specific error from the server (e.g., "Insufficient funds")
            throw new Error(data.error || 'Transfer failed.');
        }
    })
    .catch(error => {
        console.error('Transfer Error:', error);
        alert(error.message);
    });
}

function populateAccountSelect(selectElementId, accounts) {
    const select = document.getElementById(selectElementId);
    select.innerHTML = ''; // Clear existing options
    if (!accounts || accounts.length === 0) {
        select.innerHTML = '<option value="">No accounts found</option>';
        select.disabled = true;
        return;
    }
    
    select.disabled = false;
    select.innerHTML = '<option value="" disabled selected>-- Select an Account --</option>';
    
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.account_number;
        option.textContent = `${account.account_type} - ${account.account_number} (Balance: ${parseFloat(account.balance).toFixed(2)})`;
        select.appendChild(option);
    });
}

function loadAccountsForDeposit() {
    if (!token) {
        showError('User not authenticated. Please login.');
        return;
    }
    const url = 'http://127.0.0.1:8000/api/v2/account';
    fetch(url, options)
        .then(res => res.json())
        .then((response) => {
            if (response.status === 200 && response.data) {
                populateDepositAccountSelect(response.data);
            } else {
                populateDepositAccountSelect([]);
            }
        })
        .catch((error) => {
            populateDepositAccountSelect([]);
            showError('Error fetching accounts for deposit.');
            console.error('Fetch Error:', error);
        });
}

// MODIFIED function to fetch accounts and populate dropdowns
// user.js

// UPDATE this function to populate the new transfer dropdown
function loadAccountsForModals() {
    if (!token) return;
    const url = 'http://127.0.0.1:8000/api/v2/account';
    
    fetch(url, options)
        .then(res => res.json())
        .then(response => {
            if (response.status === 200 && response.data) {
                populateAccountSelect('depositAccountSelect', response.data);
                populateAccountSelect('withdrawAccountSelect', response.data);
                // Add this line
                populateAccountSelect('transferFromAccountSelect', response.data); 
            } else {
                populateAccountSelect('depositAccountSelect', []);
                populateAccountSelect('withdrawAccountSelect', []);
                 // Add this line
                populateAccountSelect('transferFromAccountSelect', []);
            }
        })
        .catch(error => {
            console.error('Error fetching accounts for modals:', error);
        });
}



// Initial calls to load the page content
loadProfileDetails();
loadAccounts();
loadTransactions(); // ADDED: Call to load transactions when the page loads

// user.js

function logout() {
    // Clear the stored token and user details
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('loggedIn');

    // Redirect to the sign-in page
    alert('You have been successfully logged out.');
    window.location.href = '/home/'; // Or change to '/' if you prefer the home page
}

*/