# forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, TodoItem

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    date_of_birth = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    phone_number = forms.CharField(max_length=15, required=False)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "date_of_birth", "phone_number", "password1", "password2")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.date_of_birth = self.cleaned_data["date_of_birth"]
        user.phone_number = self.cleaned_data["phone_number"]
        if commit:
            user.save()
        return user

class TodoItemForm(forms.ModelForm):
    class Meta:
        model = TodoItem
        fields = ['title', 'duration']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'materialize-textarea'}),
            'duration': forms.Select(attrs={'class': 'browser-default'}),
        }