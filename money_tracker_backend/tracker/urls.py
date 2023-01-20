from django.urls import path, include
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register('transactions', TransactionsModelViewSet,basename='transactions')

urlpatterns = [
	path('',include(router.urls)),
	path('login/',LoginAPIView.as_view(),name="login_api"),
	path('user_data/',UserDataAPIView.as_view())
]
