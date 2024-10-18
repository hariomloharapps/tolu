import random
from datetime import timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware
from todoapp.models import CustomUser, TodoItem

class Command(BaseCommand):
    help = 'Generate random todo items for the past 40 days'

    def handle(self, *args, **kwargs):
        # Fetch all users
        users = CustomUser.objects.all()

        # Define 40-day period
        for user in users:
            for day in range(40):
                # Create 1 to 5 random to-do items per day
                for _ in range(random.randint(1, 5)):
                    title = f'Todo {random.randint(1, 1000)}'
                    duration = random.choice([1, 2, 3])  # Random duration: 1 = day, 2 = week, 3 = month
                    print(title)

                    # Calculate random created date within the last 40 days
                    created_date = make_aware(datetime.now() - timedelta(days=day))

                    # Randomly decide if the task is completed or not
                    completed = random.choice([True, False])

                    # Create the todo item
                    TodoItem.objects.create(
                        title=title,
                        duration=duration,
                        completed=completed,
                        user=user,
                        created_date=created_date,
                    )

        self.stdout.write(self.style.SUCCESS('Random todo items generated for the past 40 days.'))