from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Account, Transaction
from django.contrib.auth import get_user_model
from .forms import CustomUserCreationForm, CustomUserChangeForm

# Get the custom User model
User = get_user_model()

# 1. Unregister the original User admin if it's already registered
# This is necessary before registering our custom one.
if admin.site.is_registered(User):
    admin.site.unregister(User)

# 2. Define a custom admin class for the User model
# core/admin.py

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        # ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


# 3. Define a custom admin class for the Account model
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Defines the admin interface for the Account model."""
    list_display = ('account_number', 'owner', 'account_type', 'balance', 'status', 'created_on')
    list_filter = ('status', 'account_type')
    search_fields = ('account_number', 'owner__email', 'owner__first_name')
    ordering = ('-created_on',)

# 4. Define a custom admin class for the Transaction model
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Defines the admin interface for the Transaction model."""
    list_display = ('id', 'account', 'transaction_type', 'amount', 'new_balance', 'created_on')
    list_filter = ('transaction_type', 'created_on')
    search_fields = ('account__account_number',)
    ordering = ('-created_on',)