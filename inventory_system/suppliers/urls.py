from django.urls import path
from . import views

app_name = 'suppliers'

urlpatterns = [
    path('', views.supplier_list, name='supplier_list'),
    path('ajax/table/', views.supplier_table_ajax, name='supplier_table_ajax'),
    path('ajax/form/', views.supplier_form_ajax, name='supplier_form_create'),
    path('ajax/form/<int:pk>/', views.supplier_form_ajax, name='supplier_form_edit'),
    path('ajax/save/', views.supplier_save_ajax, name='supplier_save_create'),
    path('ajax/save/<int:pk>/', views.supplier_save_ajax, name='supplier_save_edit'),
    path('ajax/delete/<int:pk>/', views.supplier_delete_ajax, name='supplier_delete'),
]