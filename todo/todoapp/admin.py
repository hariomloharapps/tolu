

from django.contrib import admin
from .models import *

admin.site.register(TodoItem)
admin.site.register(CustomUser)

admin.site.register(DefaultTodo)