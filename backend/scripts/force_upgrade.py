import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.companies.models import Company
from apps.subscriptions.models import CompanySubscription, SubscriptionPlan

def force_upgrade():
    print("Finding your company...")
    company = Company.objects.first()
    if not company:
        print("No companies found in the database!")
        return
        
    print(f"Found Company: {company.name}")
    
    # Get or create subscription
    sub, created = CompanySubscription.objects.get_or_create(company=company)
    
    # Force Pro plan
    plan = SubscriptionPlan.objects.filter(name__icontains='Pro').first()
    if not plan:
        print("Pro plan not found in database. Creating a mock Pro plan...")
        plan = SubscriptionPlan.objects.create(
            name='Pro',
            price_monthly=49.00,
            features={'features': 'all'}
        )
        
    sub.plan = plan
    sub.status = 'active'
    sub.save()
    
    print("SUCCESS! Your company has been forcefully upgraded to the Pro tier.")
    print("Refresh your dashboard page and all Pro features will be unlocked!")

if __name__ == '__main__':
    force_upgrade()
