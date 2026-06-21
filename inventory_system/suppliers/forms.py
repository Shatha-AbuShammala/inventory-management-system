from django import forms
from .models import Supplier

class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = ['name', 'contact_person', 'phone', 'email', 'status']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. PackPro Supplies Co.'}),
            'contact_person': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. James Carter'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. +1 202-555-0101'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'e.g. james@packpro.com'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
        }