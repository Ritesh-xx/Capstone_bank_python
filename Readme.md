# Domlur Bank - Core Banking Application

Banka is a lightweight core banking application that provides users with essential banking functionalities. It features a secure backend built with Django and a dynamic frontend using vanilla JavaScript. Users can sign up, manage multiple accounts, and perform transactions like deposits, withdrawals, and transfers.

-----

## \#\# Features ✨

  * **User Authentication**: Secure user registration and login system using JWT (JSON Web Tokens).
  * **Account Management**: Users can create new savings or current accounts and view a list of all their accounts with current balances.
  * **Transaction History**: View a complete history of all transactions for the logged-in user, with the ability to filter transactions for a specific account.
  * **Core Banking Operations**:
      * **Deposit**: Credit funds into any of the user's accounts.
      * **Withdraw**: Debit funds from any of the user's accounts, with validation for sufficient balance.
      * **Transfer**: Transfer money between any two accounts in the system (inter-user or intra-user).
  * **Protected Routes**: The frontend is secured with an authentication guard, preventing unauthenticated users from accessing protected pages like the dashboard.
  * **Session Management**: A fully functional logout feature that securely clears user session data.

-----

## \#\# Tech Stack 💻

  * **Backend**:
      * Python
      * Django & Django REST Framework
      * Simple JWT (for token-based authentication)
  * **Frontend**:
      * HTML5
      * CSS3
      * Vanilla JavaScript (ES6+)
  * **Database**:
      * SQLite3 (Default, easily configurable for PostgreSQL, etc.)

-----

## \#\# Setup and Installation 🚀

Follow these steps to get the project running on your local machine.

### Prerequisites

  * Python 3.8+
  * `pip` (Python package installer)
  * A code editor (like VS Code)

### 1\. Clone the Repository

```bash
git clone <your-repository-url>
cd banka-project
```

### 2\. Backend Setup (Django)

First, set up a virtual environment to manage dependencies.

```bash
# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Next, install the required packages and set up the database.

```bash
# Install all dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# (Optional) Create a superuser to access the Django admin panel
python manage.py createsuperuser

# Start the backend development server
python manage.py runserver
```

The backend API will now be running at `http://127.0.0.1:8000`.

### 3\. Frontend Access

The frontend consists of static HTML, CSS, and JavaScript files. Since Django is configured to serve these files, you can access the application by navigating to the following URLs in your browser:

  * **Homepage**: `http://127.0.0.1:8000/`
  * **Sign In**: `http://127.0.0.1:8000/signin/`
  * **Sign Up**: `http://127.0.0.1:8000/signup/`

-----

## \#\# API Endpoints 🌐

The application exposes the following API endpoints under the `/api/v2/` prefix.

| Method | Endpoint                                                 | Description                                |
| :----- | :------------------------------------------------------- | :----------------------------------------- |
| `POST` | `/auth/signup`                                           | Register a new user.                       |
| `POST` | `/auth/signin`                                           | Log in and receive a JWT token.            |
| `POST` | `/accounts`                                              | Create a new bank account.                 |
| `GET`  | `/account`                                               | Get all accounts for the logged-in user.   |
| `GET`  | `/transactions`                                          | Get all transactions for the logged-in user. |
| `GET`  | `/accounts/<account_number>/transactions`                | Get all transactions for a specific account. |
| `POST` | `/transactions/<account_number>/credit/`                 | Deposit money into an account.             |
| `POST` | `/transactions/<account_number>/debit/`                  | Withdraw money from an account.            |
| `POST` | `/accounts/<from_account_number>/transfer/`              | Transfer money between two accounts.       |