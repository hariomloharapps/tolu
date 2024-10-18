# urls.py
from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views
 
from django.views.generic import TemplateView
from django.urls import path




from django.urls import path
from .views import LoginView, LogoutView


from django.urls import path
from .views import LoginView, google_login


urlpatterns = [
#    path('', views.todo_list, name='todo_list'),
#    path('login/', views.user_login, name='login'),
    path('signup/', views.SignupView.as_view(), name='signup'),

  #  path('complete-todo/<int:todo_id>/', views.complete_todo, name='complete_todo'),


    path('', views.home, name='home'),
    path('complete-todo/<int:todo_id>/', views.complete_todo, name='complete_todo'),
    path('add-todo/', views.add_todo, name='add_todo'),

    # ... your existing URL patterns ...
    path('get_month_todos/', views.get_month_todos, name='get_month_todos'),
    path('get_week_todos/', views.get_week_todos, name='get_week_todos'),

    path('api/todos/<int:todo_id>/', views.get_todo_details, name='get_todo_details'),


    path('delete-todo/<int:todo_id>/', views.delete_todo, name='delete_todo'),
    
    path('get_analytics/', views.get_analytics),
    
    
    path('get_rank/', views.UserRankingView.as_view()),
    
    path('t/', views.test.as_view()),
    
    
    
    
 



    
    
    
    path('api/default-todos/', views.get_default_todos, name='get_default_todos'),
    
    
    
  
    path('api/default-todos/<int:todo_id>/', views.delete_default_todo, name='delete_default_todo'),



    path('login/', LoginView.as_view(), name='login'),
    path('google/login/callback/', google_login, name='google_login_callback'),
    # ... other URL patterns ...

    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    
    
    
    
    
    
    path('start/', views.landingpage),
    
    
    
    path('docs/termsandconditons/', views.termsandconditons, name='terms'),
]