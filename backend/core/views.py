from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, AccountSerializer, TransactionSerializer,DepositWithdrawSerializer, TransferSerializer
from .serializers import CustomTokenObtainPairSerializer
from .models import Account, Transaction
from django.contrib.auth import get_user_model
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import render
from rest_framework.views import APIView

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
# Signup view
class SignUpView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# Signin view — JWT token obtain
class SignInView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

# Account creation & listing
class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Show only accounts owned by logged in user
        return Account.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Account detail (retrieve/update/delete)
class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(owner=self.request.user)

# Transactions (list & create)
class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter transactions by accounts owned by user
        user_accounts = Account.objects.filter(owner=self.request.user)
        return Transaction.objects.filter(account__in=user_accounts)

    def perform_create(self, serializer):
        serializer.save()

# User profile view
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AccountTransactionListView(APIView):
    permission_classes = [IsAuthenticated]  # Good practice to add permissions

    def get(self, request, account_number):
        # ✅ STEP 1: Securely get the account.
        # This will ONLY find the account if the account_number matches AND
        # the owner is the person making the request.
        # If it's not found, it automatically returns a 404 Not Found error.
        account = get_object_or_404(Account, account_number=account_number, owner=request.user)

        # ✅ STEP 2: Now that we have the secure account, get its transactions.
        transactions = Transaction.objects.filter(account=account).order_by('-created_on')

        # ✅ STEP 3: Serialize and return the data.
        serializer = TransactionSerializer(transactions, many=True)
        return Response({'status': 200, 'data': serializer.data})
    

def home(request):
    return render(request, 'index.html')

def signup_page(request):
    return render(request, 'signup.html')

def signin_page(request):
    return render(request, 'signin.html')

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

class CreateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AccountSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            account = serializer.save()
            return Response({
                'status': 201,
                'message': 'Account created successfully',
                'data': AccountSerializer(account).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 400,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Account
from .serializers import AccountSerializer

class UserAccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        accounts = Account.objects.filter(owner=user)
        serializer = AccountSerializer(accounts, many=True)
        return Response({
            'status': 200,
            'data': serializer.data
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request, account_number):
    serializer = DepositWithdrawSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    amount = serializer.validated_data['amount']

    # Check if account exists and belongs to the user
    account = get_object_or_404(Account, account_number=account_number)

    # Optional: Verify user owns the account, if desired for security
    if account.owner != request.user:
        return Response({'message': 'Unauthorized to deposit into this account'}, status=status.HTTP_403_FORBIDDEN)

    old_balance = account.balance
    account.balance += amount
    account.save()

    txn = Transaction.objects.create(
        account=account,
        amount=amount,
        transaction_type='credit',
        cashier_id=1,  # static cashier ID as per requirement
        old_balance=old_balance,
        new_balance=account.balance,
    )

    txn_ser = TransactionSerializer(txn)
    return Response({
        'message': 'Deposit successful',
        'transaction': txn_ser.data,
        'new_balance': account.balance
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_money(request, account_number):
    serializer = DepositWithdrawSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    amount = serializer.validated_data['amount']

    account = get_object_or_404(Account, account_number=account_number)

    if account.balance < amount:
        return Response({'message': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)

    old_balance = account.balance
    account.balance -= amount
    account.save()

    txn = Transaction.objects.create(
        account=account,
        amount=amount,
        transaction_type='debit',
        cashier_id=1,  # static
        old_balance=old_balance,
        new_balance=account.balance
    )

    txn_ser = TransactionSerializer(txn)
    return Response({
        'message': 'Withdrawal successful',
        'transaction': txn_ser.data,
        'new_balance': account.balance
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_money(request, from_account_number):
    serializer = TransferSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    to_account_number = serializer.validated_data['to_account']
    amount = serializer.validated_data['amount']

    from_account = get_object_or_404(Account, account_number=from_account_number)
    to_account = get_object_or_404(Account, account_number=to_account_number)

    if from_account.balance < amount:
        return Response({'message': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)

    # Debit from sender
    old_from = from_account.balance
    from_account.balance -= amount
    from_account.save()
    txn1 = Transaction.objects.create(
        account=from_account,
        amount=amount,
        transaction_type='debit',
        cashier_id=1,
        old_balance=old_from,
        new_balance=from_account.balance
    )

    # Credit to receiver
    old_to = to_account.balance
    to_account.balance += amount
    to_account.save()
    txn2 = Transaction.objects.create(
        account=to_account,
        amount=amount,
        transaction_type='credit',
        cashier=request.user,
        old_balance=old_to,
        new_balance=to_account.balance
    )

    txn1_ser = TransactionSerializer(txn1)
    txn2_ser = TransactionSerializer(txn2)
    return Response({
        'message': 'Transfer successful',
        'from_transaction': txn1_ser.data,
        'to_transaction': txn2_ser.data,
    }, status=status.HTTP_200_OK)

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Find all accounts belonging to the currently logged-in user.
        user_accounts = Account.objects.filter(owner=self.request.user)
        
        # 2. Filter transactions to only include those from the user's accounts.
        # 3. Order them by the 'created_on' field in descending order (newest first).
        return Transaction.objects.filter(account__in=user_accounts).order_by('-created_on')

    def perform_create(self, serializer):
        # This part remains the same
        serializer.save()

# views.py

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_money(request, account_number):
    serializer = DepositWithdrawSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    amount = serializer.validated_data['amount']
    account = get_object_or_404(Account, account_number=account_number, owner=request.user)

    # Check for sufficient funds
    if account.balance < amount:
        return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)

    old_balance = account.balance
    account.balance -= amount
    account.save()

    transaction = Transaction.objects.create(
        account=account,
        amount=amount,
        transaction_type='debit',
        cashier=request.user, # Or a static cashier if required
        old_balance=old_balance,
        new_balance=account.balance
    )

    transaction_serializer = TransactionSerializer(transaction)
    return Response({
        'status': 200,
        'message': 'Withdrawal successful',
        'data': transaction_serializer.data
    }, status=status.HTTP_200_OK)


# views.py

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_money(request, from_account_number):
    serializer = TransferSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    to_account_number = serializer.validated_data['to_account']
    amount = serializer.validated_data['amount']

    # Ensure the sender isn't transferring to their own account
    if from_account_number == to_account_number:
        return Response({'error': 'Cannot transfer to the same account.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get the sender's account and verify ownership
    from_account = get_object_or_404(Account, account_number=from_account_number, owner=request.user)
    
    # Get the recipient's account
    to_account = get_object_or_404(Account, account_number=to_account_number)

    # Check for sufficient funds
    if from_account.balance < amount:
        return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)

    # --- Perform the transfer and create transaction records ---
    
    # 1. Debit from sender's account
    old_balance_from = from_account.balance
    from_account.balance -= amount
    from_account.save()
    Transaction.objects.create(
        account=from_account,
        amount=amount,
        transaction_type='debit',
        cashier=request.user,
        old_balance=old_balance_from,
        new_balance=from_account.balance
    )

    # 2. Credit to recipient's account
    old_balance_to = to_account.balance
    to_account.balance += amount
    to_account.save()
    Transaction.objects.create(
        account=to_account,
        amount=amount,
        transaction_type='credit',
        cashier=request.user,
        old_balance=old_balance_to,
        new_balance=to_account.balance
    )

    return Response({
        'status': 200,
        'message': 'Transfer successful',
    }, status=status.HTTP_200_OK)