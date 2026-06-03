import django_filters
from .models import CandidateProfile

class CandidateFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='iexact')
    country = django_filters.CharFilter(field_name='country', lookup_expr='iexact')
    employment_type_preferred = django_filters.CharFilter(field_name='employment_type_preferred', lookup_expr='exact')
    
    class Meta:
        model = CandidateProfile
        fields = ['country', 'city', 'employment_status', 'availability', 'is_open_to_work', 'employment_type_preferred']
