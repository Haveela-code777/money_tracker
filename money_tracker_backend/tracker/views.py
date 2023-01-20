
from .models import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password
from rest_framework.authtoken.models import Token
from datetime import datetime,timezone
from .serializers import *
from django.db.models import Sum
from django.db import transaction
# import ast
from rest_framework import status

# Create your views here.
class LoginAPIView(APIView):

    """
    User Login Api View

    API to authenticate User

        Authentication Required : NO

        Data :{
            "email" : "email id",
            "password" : "password"
        }

    """    
    def post(self, request, *args, **kwargs):
        mutable = request.POST._mutable
        request.POST._mutable = True
        data = request.data
        err_data = {}
        try:
            acc = Account.objects.filter(email=data["email"],is_superuser=False)
            if acc:
                acc = acc[0]
                token, created = Token.objects.get_or_create(user=acc)
                if check_password(data["password"],acc.password) == False:
                    err_data["errorType"] = "Invalid Credentials"
                    err_data["errorMessage"] = "Incorrect Password"
                    return Response(data=err_data,status=status.HTTP_400_BAD_REQUEST)
                req_time = datetime.now(timezone.utc)
                acc.last_login = req_time
                acc.save()    
                return Response({
                    'token': token.key,
                    'user_id': acc.pk,
                    'username' : acc.username,
                    'email': acc.email,
                    'is_active':acc.is_active},status=status.HTTP_200_OK)
            else:
                err_data["errorType"] = "Invalid Credentials"
                err_data["errorMessage"] = "Account Doesn't Exist"
                return Response(data=err_data,status=status.HTTP_400_BAD_REQUEST)                       
        except Exception as e:
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionsModelViewSet(viewsets.ModelViewSet):

    """
    Transactions ViewSet

    API to Create, List, Update and Delete Transactions

        Authentication Required : YES

        POST Data :
        {
            "name" : "Transaction Name",
            "category" : "Category Name",
            "total_amount" : 1000,
            "split_owe" : true
        }

        PUT Data : {
            "loan_id" : 1,
            "is_paid": true
        }

    """

    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        instances = Transaction.objects.all()
        try:
            if "category" in self.request.GET:
                instances = instances.filter(category=self.request.GET["category"])
            if "date" in self.request.GET:
                instances = instances.filter(created_at=self.request.GET["date"])
            # print(FriendLoanSerializer(instances[0].friends_transactions.all(), many=True).data)
            return Response(data=self.serializer_class(instances,many=True).data,status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            mutable = request.POST._mutable
            request.POST._mutable = True
            data = request.data
            data["total_amount"] = int(data["total_amount"])
            transaction_instance = Transaction.objects.create(name=data["name"],category=data["category"],created_by=request.user,total_amount=data["total_amount"])
            
            amount_per_fr = data["total_amount"]
            if data["split_owe"]:
                acc_instances = Account.objects.filter(is_active=True,is_superuser=False).exclude(id=request.user.id)
                amount_per_fr = data["total_amount"]/ (acc_instances.count()+1)

                for fr in acc_instances:
                    fr_data = {}
                    fr_data["friend"] = fr.id
                    fr_data["transaction"] = transaction_instance.id
                    fr_data["amount"] = int(amount_per_fr)
                    
                    fr_serializer = FriendLoanCreateSerializer(data=fr_data)
                    if fr_serializer.is_valid():
                        fr_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        print(str(fr_serializer.errors),data)
                        return Response({"message":str(fr_serializer.errors)},status=status.HTTP_400_BAD_REQUEST)
            
            transaction_instance.balance = data["total_amount"] - amount_per_fr
            transaction_instance.save()
            return Response(data = TransactionSerializer(transaction_instance).data,status=status.HTTP_201_CREATED)
        except Exception as e:
            transaction.set_rollback(True)
            print(e,data)
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        try:
            mutable = request.POST._mutable
            request.POST._mutable = True
            data = request.data
            if "loan_id" in data:
                loan = FriendLoan.objects.filter(id=data["loan_id"])
                if loan.count():
                    loan = loan.first()
                    transaction = loan.transaction
                    user_ = self.request.user
                    if user_== loan.transaction.created_by:
                        loan.is_paid = data["is_paid"]
                        if transaction and data["is_paid"]:
                            transaction.balance -= loan.amount
                        elif loan.transaction and not data["is_paid"]:
                            transaction.balance += loan.amount
                        if transaction.balance==0:
                            transaction.is_completed = True
                        elif transaction.balance and transaction.is_completed:
                            transaction.is_completed = False
                        transaction.save()
                        loan.save()
                        return Response({"message":"Successfully Updated"},status=status.HTTP_202_ACCEPTED)
                    else:
                        return Response({"message":"Update Access is only for {}".format(transaction.created_by.username)},status=status.HTTP_400_BAD_REQUEST)
                return Response({"message":"No data found"},status=status.HTTP_404_NOT_FOUND)    
            return Response({"message":"Data Mismatch"},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self,request,*args,**kwargs):
        try:
            user_ = self.request.user
            self.object = self.get_object()
            if self.object:
                try:             
                    if self.object.created_by == user_:
                        self.object.delete()
                        return Response({"message":"Successfully Deleted"},status=status.HTTP_204_NO_CONTENT) 
                    else:
                        return Response({"message":"Delete Access is only for the Creator"},status=status.HTTP_400_BAD_REQUEST)
                except:
                    return Response({"message":"No Data Found"},status=status.HTTP_404_NOT_FOUND)        
            return Response({"message":"Please provide the id argument"},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDataAPIView(APIView):

    """
    User Data APIView

        Authentication Required : YES

    """

    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user_ = self.request.user
        try:
            instances = Transaction.objects.filter(created_by=user_)

            amount_spent = instances.aggregate(amount_spent=Sum('total_amount')).get('amount_spent')
            budget_remaining = instances.filter(friends_transactions__is_paid=True).aggregate(budget_remaining=Sum('friends_transactions__amount')).get('budget_remaining')
            # print(instances.aggregate(budget_remaining=Sum('friends_transactions__amount')))
            # friends_transactions.filter(is_paid=True)
            if amount_spent is None:
                amount_spent = 0
            if budget_remaining is None:
                budget_remaining = 0
            who_owes_you_list = list()
            for ins in instances:
                who_owes_you = ins.friends_transactions.filter(is_paid=False).values_list('friend__username',flat=True)
                if who_owes_you:
                    who_owes_you_list= who_owes_you_list + list(who_owes_you)
            if who_owes_you_list:
                who_owes_you_list = list(set(who_owes_you_list))
            
            who_you_owe_list = list()
            loans = FriendLoan.objects.filter(friend=user_).values_list('transaction__created_by__username',flat=True)
            if loans:
                who_you_owe_list= who_you_owe_list + list(loans)
            if who_you_owe_list:
                who_you_owe_list = list(set(who_you_owe_list))

            return Response(data={"total_amount_spent":amount_spent,"budget_remaining":budget_remaining,"who_owes_you":who_owes_you_list,"who_you_owe":who_you_owe_list},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)