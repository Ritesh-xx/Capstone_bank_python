from django.urls import path
from .views import (
    SignUpView, SignInView,
    AccountListCreateView, AccountDetailView,
    TransactionListCreateView,
    UserProfileView, home, signup_page, signin_page, AccountTransactionListView,
    CreateAccountView, UserAccountsView,deposit, transfer_money, withdraw_money
)

urlpatterns = [

    path('home/', home, name='home'),  # Renders index.html

    # 🔧 Frontend pages
    path('signup/', signup_page, name='signup-page'),  # Renders signup.html
    path('signin/', signin_page, name='signin-page'),  # Renders signin.html

    path('auth/signup', SignUpView.as_view(), name='signup'),
    path('api/v2/auth/signup', SignUpView.as_view(), name='signup'),

    path('auth/signin', SignInView.as_view(), name='signin'),
    path('api/v2/auth/signin', SignInView.as_view(), name='signin'),

    path('api/v2/account', AccountListCreateView.as_view(), name='accounts'),
    path('accounts/<int:pk>', AccountDetailView.as_view(), name='account-detail'),

    path('transactions', TransactionListCreateView.as_view(), name='transactions'),
    # path('api/v2/transactions', TransactionListCreateView.as_view(), name='api-transactions'),
    path('api/v2/accounts/<str:account_number>/transactions', AccountTransactionListView.as_view(), name='account-transactions'),



    path('user/profile', UserProfileView.as_view(), name='user-profile'),
    # path('api/v2/account', CreateAccountView.as_view(), name='create-account'),
    # path('api/v2/account', UserAccountsView.as_view(), name='user-accounts'),

    path('api/v2/transactions/<str:account_number>/credit/', deposit, name='deposit_money'),
    path('api/v2/transactions/<str:account_number>/debit/', withdraw_money, name='withdraw_money'),
    path('api/v2/accounts/<str:from_account_number>/transfer/', transfer_money, name='transfer_money'),

    # ... you might also want to add your other views
    # path('transactions/', TransactionListCreateView.as_view(), name='list_transactions'),


]
