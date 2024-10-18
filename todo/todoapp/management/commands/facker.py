import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from todoapp.models import TodoItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Generate fake data for testing'

    def handle(self, *args, **kwargs):
        fake = Faker()

        for _ in range(100):
            username = fake.user_name()
            password = fake.password()
            user = User.objects.create_user(username=username, password=password)
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.id} with password: {password}'))

            # Create a random number of tasks for each user
            num_tasks = random.randint(1, 10)
            tasks = []
            for _ in range(num_tasks):
                title = fake.sentence(nb_words=6)
                task = TodoItem(
                    title=title,
                    user=user,
                    duration=random.choice([1, 2, 3])
                )
                tasks.append(task)

            TodoItem.objects.bulk_create(tasks)

            # Mark random number of tasks as completed
            completed_tasks = random.sample(tasks, random.randint(2, min(10, len(tasks))))
            for task in completed_tasks:
                task.completed = True
                task.save()

        self.stdout.write(self.style.SUCCESS('Fake data generation complete!'))