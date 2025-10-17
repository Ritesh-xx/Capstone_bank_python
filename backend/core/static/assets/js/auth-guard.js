// assets/js/auth-guard.js

(function() {
    // Immediately run this code to protect pages

    // Get the authentication token from local storage
    const token = localStorage.getItem('token');
    
    // Get the current page's path (e.g., "/signin/", "/user-dashboard.html")
    const currentPage = window.location.pathname;

    // Define which pages are public and don't require a login
    // IMPORTANT: Make sure these paths match your actual URLs from urls.py
    const publicPages = [
        '/',                // Homepage
        '/index.html',      // Homepage alias
        '/signin/',         // Sign-in page
        '/signup/',
        '/static/signin.html',    
        '/static/signup.html'         
    ];

    // Check if the current page is a protected page
    const isProtectedPage = !publicPages.includes(currentPage);

    // --- Main Logic ---

    // 1. If the user is on a protected page BUT is NOT logged in...
    if (isProtectedPage && !token) {
        // ...redirect them to the sign-in page.
        alert('You must be logged in to view this page.');
        window.location.href = '/static/signin.html'; 
    }

    // 2. (Optional but recommended) If the user IS logged in BUT tries to visit sign-in/sign-up...
    if ((currentPage === '/signin/' || currentPage === '/signup/') && token) {
        // ...redirect them to their dashboard.
        // Make sure this URL is correct for your project structure
        window.location.href = '/static/user-dashboard.html';
    }

})();