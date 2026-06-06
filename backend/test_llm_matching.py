import time
from apps.candidates.models import CandidateProfile
from apps.matching.models import MatchScore
from apps.matching.services import run_matching_for_candidate

p = CandidateProfile.objects.order_by('-created_at').first()
MatchScore.objects.filter(candidate=p).delete()

t0 = time.time()
matches = run_matching_for_candidate(p)
t1 = time.time()

print('Time taken:', t1-t0)
print('Matches count:', len(matches))
if matches:
    print('Top Match Score:', matches[0].overall_score)
    print('Justification:', matches[0].breakdown.get('justification'))
