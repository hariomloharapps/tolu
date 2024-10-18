# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import TodoItem
from .forms import CustomUserCreationForm, TodoItemForm

def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'user/signup.html', {'form': form})

def user_login(request):
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
    return render(request, 'user/login.html')


    
    
    
    
    # views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import TodoItem
from .forms import CustomUserCreationForm, TodoItemForm
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from .models import TodoItem

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from .models import TodoItem

def home(request):
    if request.user.is_authenticated:
        todos = TodoItem.objects.filter(user=request.user, completed=False, duration = 1).order_by('-created_date')
        return render(request, 'todo_app.html', {'todos': todos})
    else:
        return redirect('login') 

@require_POST
def complete_todo(request, todo_id):
    todo = get_object_or_404(TodoItem, id=todo_id, user=request.user)
    
    todo.completed = True
    todo.save()
    return JsonResponse({'success': True})
    
    
@require_POST
def add_todo(request):
    title = request.POST.get('title')
    duration = request.POST.get('duration')
    description = request.POST.get('description')

    if title and duration:
        todo = TodoItem.objects.create(
            user=request.user,
            title=title,
            duration=int(duration),
            description = description
        )
        return JsonResponse({'success': True, 'id': todo.id})
    return JsonResponse({'success': False})
    
    
    
    
    
    
    
    
# views.py
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from .models import TodoItem

def get_month_todos(request):
    user = request.user
    one_month_ago = timezone.now() - timedelta(days=30)
    todos = TodoItem.objects.filter(
        user=user,
        created_date__gte=one_month_ago,
        duration = 3,
        completed=False
    ).order_by('-created_date')
    
    print(todos)
    
    data = [{
        'id': todo.id,
        'title': todo.title,
        'completed': todo.completed,
        'created_date': todo.created_date.strftime('%Y-%m-%d %H:%M:%S')
    } for todo in todos]
    
    return JsonResponse(data, safe=False)

def get_week_todos(request):
    user = request.user
    one_week_ago = timezone.now() - timedelta(days=7)
    todos = TodoItem.objects.filter(
        user=user,
        created_date__gte=one_week_ago,
        duration = 2,
        completed=False
        
    ).order_by('-created_date')
    
    data = [{
        'id': todo.id,
        'title': todo.title,
        'completed': todo.completed,
        'created_date': todo.created_date.strftime('%Y-%m-%d %H:%M:%S')
    } for todo in todos]
    print(data)
    print("4hhb ")
    
    return JsonResponse(data, safe=False)
    
    
    
    
# views.py
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required


@login_required
@require_http_methods(["GET"])
def get_todo_details(request, todo_id):
    todo = get_object_or_404(TodoItem, id=todo_id, user=request.user)
    return JsonResponse({
        'id': todo.id,
        'title': todo.title,
        'description': todo.description,
        'completed': todo.completed,
        'created_at': todo.created_date.isoformat(),
        'due_date': todo.duration if todo.duration else None,
    })

# ... (keep other views like todo_list and toggle_todo) ...

# views.py

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import TodoItem



@require_POST
def delete_todo(request, todo_id):
    todo = get_object_or_404(TodoItem, id=todo_id, user=request.user)
    todo.delete()
    return JsonResponse({'success': True})

















from django.http import JsonResponse
from django.utils import timezone
from .models import *

def get_analytics(request):
    end_date = timezone.now().date()
    start_date_30 = end_date - timezone.timedelta(days=30)
    start_date_7 = end_date - timezone.timedelta(days=2)

    analytics_30 = TodoAnalytics.objects.filter(date__gte=start_date_30, date__lte=end_date , user=request.user).order_by('date')
    analytics_7 = analytics_30.filter(date__gte=start_date_7)

    data_30 = [{
        'date': analytic.date.strftime('%Y-%m-%d'),
        'created': analytic.todos_created,
        'completed': analytic.todos_completed
    } for analytic in analytics_30]

    data_7 = [{
        'date': analytic.date.strftime('%Y-%m-%d'),
        'created': analytic.todos_created,
        'completed': analytic.todos_completed
    } for analytic in analytics_7]
    
    print(data_7)
    
    
    print(f"this is month .... {data_30}")

    return JsonResponse({
        'last_30_days': data_30,
        'last_7_days': data_7
    })








from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import UserRanking

class UserRankingView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        # Update rankings before fetching
        UserRanking.update_rankings()

        # Fetch ranking for the requesting user
        try:
            user_ranking = UserRanking.objects.get(user=request.user)
            response_data = {
                'username': request.user.username,
                'ranking_7d': user_ranking.ranking_7d,
                'ranking_today': user_ranking.ranking_today,
                'ranking_30d': user_ranking.ranking_30d,
            }
            return JsonResponse(response_data)
        except UserRanking.DoesNotExist:
            return JsonResponse({'error': 'Ranking not found for this user'}, status=404)

# views.py
from django.http import JsonResponse
from django.db.models import Count
from django.utils import timezone
from .models import TodoItem, Analytics
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

import logging
import sqlite3
from django.http import JsonResponse, HttpResponseServerError
from django.utils import timezone
from django.contrib.auth.mixins import LoginRequiredMixin

import logging
import sqlite3
from django.http import JsonResponse, HttpResponseServerError
from django.utils import timezone
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View

import logging
from django.http import JsonResponse, HttpResponseServerError

logger = logging.getLogger(__name__)

class test(LoginRequiredMixin, View):
    def get(self, request):
        try:
            user = request.user
            end_date = timezone.now().date()
            start_date_30 = end_date - timezone.timedelta(days=30)
            start_date_7 = end_date - timezone.timedelta(days=7)

            self.update_analytics(user, start_date_30, end_date)

            data_30_days = Analytics.objects.filter(
                user=user,
                date__gte=start_date_30,
                date__lte=end_date
            ).values('date', 'total_todos', 'completed_todos')

            

            return JsonResponse({
                'last_30_days': list(data_30_days),
              
            })
        except Exception as e:
            logger.error(f"Error in test view: {str(e)}")
            return HttpResponseServerError("An error occurred while processing your request.")

    def update_analytics(self, user, start_date, end_date):
        date_range = [start_date + timezone.timedelta(days=x) for x in range((end_date - start_date).days + 1)]
        
        for date in date_range:
            total_todos = TodoItem.objects.filter(user=user, created_date__date=date).count()
            completed_todos = TodoItem.objects.filter(user=user, created_date__date=date, completed=True).count()
            
            Analytics.objects.update_or_create(
                user=user,
                date=date,
                defaults={
                    'total_todos': total_todos,
                    'completed_todos': completed_todos
                }
            )
            
            
            
            
            
            
            
            
            # views.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import DefaultTodo

# @require_http_methods(["GET"])
def get_default_todos(request):
    if request.user.is_authenticated:
        default_todos = DefaultTodo.objects.filter(
            user=request.user,
            is_active=True,
            is_deleted=False
        ).values('id', 'title', 'description', 'recurrence')
        
        return JsonResponse(list(default_todos), safe=False)
    else:
        pass









from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
#from .models import DefaultTodo

@require_http_methods(["DELETE"])
def delete_default_todo(request, todo_id):
    todo = get_object_or_404(DefaultTodo, id=todo_id)
    todo.delete()
    return JsonResponse({}, status=204)
    
    
    
    
    
    
    
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views import View
from allauth.socialaccount.models import SocialAccount
from .models import CustomUser

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views import View
from allauth.socialaccount.models import SocialAccount
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

class LoginView(View):
    
    template_name = 'login.html'

    def get(self, request):
        logger.debug("Entering LoginView GET method")
        try:
            from allauth.socialaccount.providers.google.provider import GoogleProvider
            logger.debug(f"Google provider: {GoogleProvider.id}")
        except Exception as e:
            logger.error(f"Error with Google provider: {str(e)}")
        return render(request, self.template_name)

    def post(self, request):
        
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')  # Replace 'home' with your desired redirect URL
        else:
            messages.error(request, 'Invalid email or password')
            return render(request, self.template_name)

def google_login(request):
    if request.user.is_authenticated:
        return redirect('home')  # Replace 'home' with your desired redirect URL

    if 'socialaccount_sociallogin' in request.session:
        social_login = request.session['socialaccount_sociallogin']
        email = social_login['email']
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Create a new user if they don't exist
            user = CustomUser.objects.create_user(
                username=email,
                email=email,
                password=None  # Set password to None for social accounts
            )
            
            # You can add more user details here if needed
            user.first_name = social_login.get('first_name', '')
            user.last_name = social_login.get('last_name', '')
            user.save()

        login(request, user)
        del request.session['socialaccount_sociallogin']
        return redirect('home')  # Replace 'home' with your desired redirect URL

    return redirect('account_login')  # This is the allauth view for handling the OAuth flow
    
    
    
    
    
    
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from allauth.account.utils import get_next_redirect_url

class LogoutView(LoginRequiredMixin, View):
    def get(self, request):
        logout(request)
        next_url = get_next_redirect_url(request)
        if next_url:
            return redirect(next_url)
        return redirect('login')  # Redirect to login page after logout
        
        
        
        
        
        
        
    #    from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from allauth.socialaccount.models import SocialLogin
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
CustomUser = get_user_model()

# views.py

import random
from django.core.mail import send_mail
from django.views import View
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# views.py
# views.py

import random
from django.core.mail import send_mail
from django.views import View
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

from django.views import View
from django.shortcuts import render, redirect
from django.http import JsonResponse
#from django.contrib.auth.models import User
from django.contrib.auth import login
from django.views import View
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model, login
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

CustomUser = get_user_model()

from django.views import View
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import get_user_model, login
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction

CustomUser = get_user_model()

class SignupView(View):
    template_name = 'signup.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'status': 'error', 'message': 'Invalid email address'})

        # Validate password (you can add more complex validation if needed)
        if len(password) < 8:
            return JsonResponse({'status': 'error', 'message': 'Password must be at least 8 characters long'})

        try:
            with transaction.atomic():
                # Check if email already exists
                if CustomUser.objects.filter(email=email).exists():
                    return JsonResponse({'status': 'error', 'message': 'Email already exists'})
                
                user = CustomUser.objects.create_user(username=email, email=email, password=password)
                if user is not None:
                    login(request, user)
                    return redirect('home')  # Replace 'home' with your desired redirect URL
                return JsonResponse({'status': 'success', 'message': 'User created and logged in successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'An error occurred: {str(e)}'})


def google_signup(request):
    if request.user.is_authenticated:
        return redirect('home')  # Replace 'home' with your desired redirect URL
    if 'socialaccount_sociallogin' in request.session:
        social_login = request.session['socialaccount_sociallogin']
        email = social_login['email']
        
        try:
            user = CustomUser.objects.get(email=email)
            messages.info(request, 'User already exists. Logging in.')
        except CustomUser.DoesNotExist:
            # Create a new user
            user = CustomUser.objects.create_user(
                username=email,
                email=email,
                password=None  # Set password to None for social accounts
            )
            
            # Add more user details
            user.first_name = social_login.get('first_name', '')
            user.last_name = social_login.get('last_name', '')
            user.save()
            messages.success(request, 'New user created via Google signup')
        
        login(request, user)
        del request.session['socialaccount_sociallogin']
        return redirect('home')  # Replace 'home' with your desired redirect URL
    return redirect('account_signup')  # This is the allauth view for handling the OAuth flow
    
    
    
    
    
from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from allauth.socialaccount.models import SocialLogin
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
import logging
import random
import string

logger = logging.getLogger(__name__)
CustomUser = get_user_model()

def landingpage(request):
    return render(request, 'landingpage.html')



def termsandconditons(request):
    return render(request, 'docs/termsandconditons.html')