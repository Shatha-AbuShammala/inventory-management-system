from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    path('', views.product_list, name='product_list'),
    path('ajax/table/', views.product_table_ajax, name='product_table_ajax'),
    path('ajax/form/', views.product_form_ajax, name='product_form_create'),
    path('ajax/form/<int:pk>/', views.product_form_ajax, name='product_form_edit'),
    path('ajax/save/', views.product_save_ajax, name='product_save_create'),
    path('ajax/save/<int:pk>/', views.product_save_ajax, name='product_save_edit'),
    path('ajax/delete/<int:pk>/', views.product_delete_ajax, name='product_delete'),

]