import random
import string

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Account, Transaction
import uuid
from django.contrib.auth.models import update_last_login

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # tell SimpleJWT to use email instead of username

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        self.fields['password'] = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Delegate authentication to super with email and password
            data = super().validate({
                'email': email,
                'password': password,
            })

            user = User.objects.get(email=email)

            return {
                'status': 200,
                'message': 'Login successful',
                'data': {
                    'token': data.get('access'),
                    'refresh_token': data.get('refresh'),
                    'email': user.email,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'type': 'client',
                    'isadmin': str(user.is_staff).lower(),
                }
            }

        raise serializers.ValidationError('Email and password are required.')



class UserSerializer(serializers.ModelSerializer):
    # map camelCase keys to snake_case model fields
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')

    class Meta:
        model = User
        fields = ['firstName', 'lastName', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}



    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.get('email')
        password = validated_data.get('password')

        # Generate unique username automatically
        username = str(uuid.uuid4())[:30]  # e.g. random uuid string

        user = User.objects.create_user(

            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        return user

# class AccountSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Account
#         fields = '__all__'

# class TransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Transaction
#         fields = '__all__'


from rest_framework import serializers
from .models import Account, Transaction


# In serializers.py


class AccountSerializer(serializers.ModelSerializer):
    # This custom field is for input only and is correct.
    openingBalance = serializers.DecimalField(
        max_digits=15, decimal_places=2, write_only=True, required=True, min_value=0
    )

    class Meta:
        model = Account
        # Use the Django model field 'owner', not the database column 'owner_id'.
        fields = ['id', 'owner', 'account_type', 'balance', 'created_on', 'openingBalance', 'account_number']
        
        # ✅ THE FIX: 'owner' is made read-only. This tells the serializer
        # to ignore 'owner' from the request body, preventing the conflict.
        read_only_fields = ['id', 'owner', 'balance', 'created_on', 'account_number']

    def create(self, validated_data):
        # Pop the custom 'openingBalance' field before creating the model instance.
        opening_balance = validated_data.pop('openingBalance', None)
        
        # The 'owner' is already in validated_data because the view's 
        # perform_create method adds it securely. We don't need to get it again.

        # Create the account, setting the balance from our custom field.
        account = Account.objects.create(
            balance=opening_balance,
            **validated_data  # This now works because 'owner' is only passed once inside here.
        )
        return account

class TransactionSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(source='account.account_number', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'account', 'account_number', 'amount', 'transaction_type', 'cashier',
                  'old_balance', 'new_balance', 'created_on']
        read_only_fields = ['cashier', 'old_balance', 'new_balance', 'created_on', 'account_number']

class DepositWithdrawSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class TransferSerializer(serializers.Serializer):
    to_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)