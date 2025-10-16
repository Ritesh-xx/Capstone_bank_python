/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const userDetails = JSON.parse(localStorage.getItem('userDetails'));
const token = localStorage.getItem('token');
const errorDiv = document.querySelector('.errors');
const errorContainer = document.querySelector('.errors ul');
const createNode = element => document.createElement(element);
const append = (parent, el) => parent.appendChild(el);
const userName = document.getElementById('user-name');
const role = document.getElementById('role');
const accountsContainer = document.getElementById('all-accounts');
const deleteAccountBtn = document.getElementById('confirm');
const accountNumber = sessionStorage.getItem('account');

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: token,
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

const showSuccess = (message) => {
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'green';
    errorContainer.innerHTML = '';
    const msg = createNode('li');
    msg.textContent = message;
    append(errorContainer, msg);
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorContainer.innerHTML = '';
    }, 3000);
};

const loadAdminProfile = () => {
    if (userDetails && userDetails.type === 'staff') {
        userName.innerText = `${userDetails.firstName} ${userDetails.lastName}`;
        role.innerText = userDetails.isadmin === 'true' ? 'Admin' : 'Cashier';
    }
};

const loadAllAccounts = () => {
    const url = 'http://localhost:8000/api/v2/accounts'; // or production url

    fetch(url, options)
        .then(res => res.json())
        .then((response) => {
            if (response.status === 200) {
                let htmlList = `
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Account Owner</th>
                                <th>Account Number</th>
                                <th>Status</th>
                                <th>View Account</th>
                                <th>Activate/Deactivate</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                response.data.forEach((account) => {
                    htmlList += `
                        <tr>
                            <td>${account.ownerFirstName} ${account.ownerLastName}</td>
                            <td>${account.accountNumber}</td>
                            <td>${account.status}</td>
                            <td><button type="button" class="btn btn-primary" onclick="viewAccount(${account.accountNumber})">View</button></td>
                            <td><button type="button" class="btn btn-warning" onclick="updateAccountStatus(${account.accountNumber}, '${account.status}')">Change Status</button></td>
                            <td><button class="btn btn-danger delete-account" onclick="triggerDeleteModal(${account.accountNumber})">Delete</button></td>
                        </tr>
                    `;
                });

                htmlList += '</tbody></table>';

                accountsContainer.innerHTML = htmlList;
            } else {
                showError(response.message || 'Failed to load accounts');
            }
        })
        .catch((error) => {
            showError(error.message || 'Error in connecting, please check your internet connection and try again');
        });
};

const viewAccount = (accountNumber) => {
    sessionStorage.setItem('account', accountNumber);
    window.location.href = './view-account-details.html';
};

const updateAccountStatus = (accountNumber, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'dormant' : 'active';
    const url = `https://bankaapp.herokuapp.com/api/v2/accounts/${accountNumber}`;
    const option = {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    };

    fetch(url, option)
        .then(res => res.json())
        .then((response) => {
            if (response.status === 200) {
                showSuccess(response.message);
                setTimeout(() => {
                    if (userDetails.isadmin === 'true') {
                        window.location.href = './admin-dashboard.html';
                    } else {
                        window.location.href = './staff-dashboard.html';
                    }
                }, 3000);
            } else {
                showError(response.message || 'Failed to update account status');
            }
        })
        .catch((error) => {
            showError(error.message || 'Error in connecting, please check your internet connection and try again');
        });
};

deleteAccountBtn.addEventListener('click', async () => {
    if (!accountNumber) {
        showError('No account selected to delete.');
        return;
    }

    const url = `https://bankaapp.herokuapp.com/api/v2/accounts/${accountNumber}`;
    const option = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    };

    try {
        const res = await fetch(url, option);
        const response = await res.json();

        if (response.status === 200) {
            showSuccess(response.message);
            setTimeout(() => {
                if (userDetails.isadmin === 'true') {
                    window.location.href = './admin-dashboard.html';
                } else {
                    window.location.href = './staff-dashboard.html';
                }
            }, 3000);
        } else {
            showError(response.message || 'Failed to delete account');
            setTimeout(() => {
                if (userDetails.isadmin === 'true') {
                    window.location.href = './admin-dashboard.html';
                } else {
                    window.location.href = './staff-dashboard.html';
                }
            }, 3000);
        }
    } catch (error) {
        showError(error.message || 'Error in connecting, please check your internet connection and try again');
    }
});
