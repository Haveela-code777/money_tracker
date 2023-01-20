from rest_framework import serializers
from .models import *

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        exclude = ['password',]

class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

class FriendLoanSerializer(serializers.ModelSerializer):
    friend = AccountSerializer()
    class Meta:
        model = FriendLoan
        fields = "__all__"

class FriendLoanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendLoan
        fields = "__all__"

class TransactionSerializer(serializers.ModelSerializer):
    friends_transactions = FriendLoanSerializer(many=True)
    created_by = AccountSerializer()

    class Meta:
        model = Transaction
        fields = "__all__"