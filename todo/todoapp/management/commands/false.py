from django.core.management.base import BaseCommand
from todoapp.models import TodoItem

class Command(BaseCommand):
    help = 'Mark all TodoItems as not completed and print their titles'

    def handle(self, *args, **kwargs):
        # Retrieve all TodoItem objects
        todo_items = TodoItem.objects.all()
        
        # Loop through each item and mark it as not completed
        for item in todo_items:
            item.completed = False
            item.save()
            self.stdout.write(self.style.SUCCESS(f"Marked '{item.title}' as not completed"))