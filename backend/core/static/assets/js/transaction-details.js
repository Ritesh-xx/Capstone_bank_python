/* eslint-disable no-undef */

const transactionContainer = document.getElementById('transaction');


// const loadTransactionDetails = (accountNumber) => {
//   if (!accountNumber) {
//     transactionContainer.innerText = 'No account number provided.';
//     transactionContainer.style.color = 'red';
//     return;
//   }
//
//   const url = `http://localhost:8000/api/v2/accounts/${accountNumber}/transactions`;
//
//   fetch(url, options)
//     .then(res => res.json())
//     .then((response) => {
//       if (response.status === 200 && response.data.length) {
//         let htmlList = `
//           <table id="transaction-table" class="stats-table">
//             <thead>
//               <tr>
//                 <th>Date & Time</th>
//                 <th>Account Number</th>  <!-- New column header -->
//                 <th>Type</th>
//                 <th>Amount</th>
//                 <th>Old Balance</th>
//                 <th>New Balance</th>
//               </tr>
//             </thead>
//             <tbody>
//         `;
//
//         response.data.forEach((transaction) => {
//           const date = new Date(transaction.createdOn);
//           const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
//
//           htmlList += `
//             <tr>
//               <td>${formattedDate}</td>
//               <td>${transaction.accountNumber}</td>  <!-- Display account number -->
//               <td>${transaction.type}</td>
//               <td>${transaction.amount}</td>
//               <td>${transaction.oldBalance}</td>
//               <td>${transaction.newBalance}</td>
//             </tr>
//           `;
//         });
//
//         htmlList += '</tbody></table>';
//         transactionContainer.innerHTML = htmlList;
//       } else if (response.status === 404) {
//         transactionContainer.innerText = 'No transactions found';
//         transactionContainer.style.color = 'purple';
//       } else {
//         transactionContainer.innerText = 'Failed to load transactions';
//         transactionContainer.style.color = 'red';
//       }
//     })
//     .catch((error) => {
//       errorDiv.style.display = 'block';
//       const msg = createNode('li');
//       msg.textContent = error.message || 'Error in connecting, please check your internet connection and try again';
//       append(errorContainer, msg);
//       setTimeout(() => {
//         errorDiv.style.display = 'none';
//         errorContainer.innerHTML = '';
//       }, 5000);
//     });
// };
