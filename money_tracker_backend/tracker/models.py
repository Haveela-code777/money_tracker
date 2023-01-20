from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)

class UserManager(BaseUserManager):

    def create_user(self, username, email, password=None):
        if username is None:
            raise TypeError('Users should have a username')
        if email is None:
            raise TypeError('Users should have a Email')
        if password is None:
            raise TypeError('Password should not be none')

        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password=None):
        if username is None:
            raise TypeError('Users should have a username')
        if email is None:
            raise TypeError('Users should have a Email')
        if password is None:
            raise TypeError('Password should not be none')

        user = self.create_user(username, email, password)
        user.is_superuser = True
        user.is_admin=True
        user.is_staff = True
        user.save()
        return user

class Account(AbstractBaseUser):
    username = models.CharField(max_length=255, db_index=True)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    date_joined = models.DateTimeField(verbose_name="date joined",auto_now_add=True,null=True,blank=True)
    last_login = models.DateTimeField(verbose_name="last login",auto_now_add=True,null=True,blank=True)
    last_seen = models.DateTimeField(verbose_name="last seen",null=True,blank=True)
    is_admin = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_update = models.DateTimeField(null=True,blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        if not self.last_seen:
            self.last_seen = self.last_login
            self.save()
        return self.email

    def has_perm(self,perm,obj=None):
        return self.is_admin

    def has_module_perms(self,app_label):
        return True
    
    class Meta:
        ordering = ['-is_active','-last_login']

class Transaction(models.Model):
    name = models.CharField(max_length=500, null=True, blank=True,unique=True)
    category = models.CharField(max_length=200, null=True, blank=True)
    total_amount = models.IntegerField(null=True,blank=True)
    balance = models.IntegerField(null=True,blank=True)
    created_by = models.ForeignKey(Account, on_delete=models.CASCADE,related_name="transactions")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)        

    class Meta:
        ordering = ['-updated_at']

class FriendLoan(models.Model):
    transaction = models.ForeignKey(
        Transaction,
        blank=True,
        null=True,
        related_name="friends_transactions",
        on_delete=models.CASCADE
    )
    friend = models.ForeignKey(Account,null=True,on_delete=models.SET_NULL,related_name="payment_owe")
    amount = models.IntegerField()
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)        

    class Meta:
        ordering = ['-updated_at']