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

    # # Stock Movement (Stage 7)
    # path('stock/', views.stock_movement_page, name='stock_movement_page'),
    # path('stock/ajax/form/', views.stock_form_ajax, name='stock_form_ajax'),
    # path('stock/ajax/save/', views.stock_save_ajax, name='stock_save_ajax'),
    # path('stock/ajax/history/', views.stock_history_ajax, name='stock_history_ajax'),
]