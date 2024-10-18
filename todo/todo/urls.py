from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    # ...
    path('accounts/', include('allauth.urls')),

    path('admin/', admin.site.urls),
    path('', include('todoapp.urls')),
]

