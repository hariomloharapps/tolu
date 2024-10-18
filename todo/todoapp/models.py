from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models
from allauth.account.signals import user_signed_up
from django.dispatch import receiver

class CustomUser(AbstractUser):
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.username

@receiver(user_signed_up)
def populate_profile(sociallogin, user, **kwargs):
    if sociallogin.account.provider == 'google':
        user_data = user.socialaccount_set.filter(provider='google')[0].extra_data
        user.email = user_data['email']
        user.first_name = user_data.get('given_name', '')
        user.last_name = user_data.get('family_name', '')
        user.save()
        
        
class TodoItem(models.Model):
    DURATION_CHOICES = [
        (1, 'A day'),
        (2, 'A week'),
        (3, 'A month'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    duration = models.IntegerField(choices=DURATION_CHOICES, default=1)
    completed = models.BooleanField(default=False, db_index=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    
    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=['user', 'completed', 'created_date']),
        ]




from django.db import models
from django.utils import timezone

class TodoAnalytics(models.Model):
    date = models.DateField(unique=True)
    todos_created = models.IntegerField(default=0)
    todos_completed = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Analytics for {self.date}: Created: {self.todos_created}, Completed: {self.todos_completed}"

    @classmethod
    def update_analytics(cls, date=None):
        if date is None:
            date = timezone.now().date()
        
        analytics, created = cls.objects.get_or_create(date=date)
        
        # Count todos created today
        analytics.todos_created = TodoItem.objects.filter(created_date__date=date).count()
        
        # Count todos completed today
        analytics.todos_completed = TodoItem.objects.filter(completed=True, created_date__date=date).count()
        
        analytics.save()
        
        
        
        
from django.db import models
from django.utils import timezone
from django.db.models import Count, Q

class UserRanking(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    ranking_7d = models.IntegerField(default=0)
    ranking_today = models.IntegerField(default=0)
    ranking_30d = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Ranking for {self.user.username}"

    @classmethod
    def update_rankings(cls):
        today = timezone.now().date()
        seven_days_ago = today - timezone.timedelta(days=7)
        thirty_days_ago = today - timezone.timedelta(days=30)

        # Calculate todos for each period
        todos = TodoItem.objects.values('user').annotate(
            todos_7d=Count('id', filter=Q(created_date__gte=seven_days_ago)),
            todos_today=Count('id', filter=Q(created_date__date=today)),
            todos_30d=Count('id', filter=Q(created_date__gte=thirty_days_ago))
        ).order_by('-todos_7d', '-todos_30d', '-todos_today')

        # Assign rankings
        for period in ['7d', 'today', '30d']:
            ranking = 1
            prev_count = None
            for i, todo in enumerate(todos):
                if prev_count is None or todo[f'todos_{period}'] < prev_count:
                    ranking = i + 1
                prev_count = todo[f'todos_{period}']
                
                UserRanking.objects.update_or_create(
                    user_id=todo['user'],
                    defaults={f'ranking_{period}': ranking}
                )
                
                
                
                
                
                
# models.py
from django.db import models
from django.utils import timezone
from django.conf import settings

class Analytics(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    total_todos = models.IntegerField(default=0)
    completed_todos = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
        unique_together = ('user', 'date')

    def __str__(self):
        return f"Analytics for {self.user.username} on {self.date}"



from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class DefaultTodo(models.Model):
    RECURRENCE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]

    DAY_OF_WEEK_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='default_todos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    recurrence = models.CharField(max_length=10, choices=RECURRENCE_CHOICES)
    day_of_week = models.IntegerField(choices=DAY_OF_WEEK_CHOICES, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_created = models.DateField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.get_recurrence_display()}"

    def soft_delete(self):
        self.is_deleted = True
        self.is_active = False
        self.save()

    def create_todo_item(self, date):
        from .models import TodoItem  # Import here to avoid circular import
        
        TodoItem.objects.create(
            user=self.user,
            title=self.title,
            description=self.description,
            duration=1,  # Assuming default duration is 1 day
            created_date=date
        )
        self.last_created = date
        self.save()

    @classmethod
    def create_todos_for_week(cls, start_date):
        end_date = start_date + timezone.timedelta(days=6)
        current_date = start_date
        while current_date <= end_date:
            day_of_week = current_date.weekday()

            default_todos = cls.objects.filter(
                is_active=True,
                is_deleted=False
            ).filter(
                models.Q(recurrence='daily') |
                (models.Q(recurrence='weekly') & models.Q(day_of_week=day_of_week))
            )

            for default_todo in default_todos:
                if default_todo.last_created is None or default_todo.last_created < current_date:
                    default_todo.create_todo_item(current_date)

            current_date += timezone.timedelta(days=1)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'recurrence', 'day_of_week', 'is_active', 'is_deleted']),
        ]