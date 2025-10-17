# core/models.py
import random
import string

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# --------------------
# Custom User Manager
# --------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)



# --------------------
# Custom User Model
# --------------------
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()  # your custom manager here

def create(self, validated_data):
    user = User.objects.create_user(
        email=validated_data['email'],
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        password=validated_data['password']
    )
    return user




from django.db import models
from django.conf import settings  # ✅ this is the missing import

class Account(models.Model):
    ACCOUNT_TYPES = (
        ('savings', 'Savings'),
        ('current', 'Current'),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account_type  = models.CharField(max_length=10, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_on = models.DateTimeField(auto_now_add=True)
    account_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, default='active')  # or whatever default you want


    def save(self, *args, **kwargs):
        if not self.account_number:
            # Generate a random 10-digit account number
            self.account_number = ''.join(random.choices(string.digits, k=10))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.owner.email} - {self.account_type }"



class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10)  # debit/credit
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_balance = models.DecimalField(max_digits=12, decimal_places=2)
    new_balance = models.DecimalField(max_digits=12, decimal_places=2)
    created_on = models.DateTimeField(auto_now_add=True)