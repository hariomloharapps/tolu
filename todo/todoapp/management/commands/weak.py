from django.core.management.base import BaseCommand
from django.utils import timezone
from todoapp.models import DefaultTodo  # Replace 'your_app' with your actual app name

class Command(BaseCommand):
    help = 'Creates todos for the upcoming week based on DefaultTodo entries'

    def handle(self, *args, **options):
        today = timezone.now().date()
        next_monday = today + timezone.timedelta(days=(7 - today.weekday()))
        
        DefaultTodo.create_todos_for_week(next_monday)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created todos for the week starting {next_monday}'))