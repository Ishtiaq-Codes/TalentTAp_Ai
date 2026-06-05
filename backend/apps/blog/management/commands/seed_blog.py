# -*- coding: utf-8 -*-
"""Management command to seed blog data."""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from apps.blog.models import BlogCategory, BlogTag, BlogPost

User = get_user_model()

ARTICLES = [
    {
        'title': 'How AI Matching is Reducing Hiring Time by 70% in Pakistani Software Houses',
        'slug': 'ai-matching-reducing-hiring-time-pakistan',
        'excerpt': "Traditional recruitment in Pakistan's IT sector takes 6-8 weeks. Discover how AI-powered talent matching platforms like TalentTap are cutting that to under 2 weeks.",
        'content': """<h2>The Hiring Crisis in Pakistan's Tech Sector</h2>
<p>Pakistan's technology industry is growing at an unprecedented rate, with IT exports surpassing $2.6 billion in 2024. But this rapid growth has created a critical challenge: the talent supply chain simply cannot keep pace with demand.</p>
<p>Software houses in Lahore, Karachi, and Islamabad are spending an average of <strong>6-8 weeks</strong> to fill a single technical role. HR managers report spending over 60% of their time manually screening resumes.</p>
<h2>How AI Matching Changes Everything</h2>
<p>TalentTap's AI matching engine analyses a candidate's full profile - skills, experience level, project portfolio, availability, and location - and scores them against your job requirements in milliseconds.</p>
<p>Instead of reviewing 500 applications manually, you see a ranked shortlist of the top 10-20 candidates who genuinely match your requirements.</p>
<h2>Real Numbers: Before and After TalentTap</h2>
<ul>
  <li><strong>Time to first interview:</strong> From 2 weeks to 3 days</li>
  <li><strong>Total hiring cycle:</strong> From 7 weeks to 2 weeks</li>
  <li><strong>Resume screening time:</strong> From 10+ hours to 15 minutes</li>
  <li><strong>Quality of hire score:</strong> 89% match accuracy</li>
</ul>
<h2>Getting Started</h2>
<p>If you're a software house in Pakistan looking to reduce your time-to-hire, <a href="/register">create a free TalentTap account</a> today and post your first job in under 5 minutes.</p>""",
        'category': 'ai-recruitment',
        'tags': ['AI Matching', 'Pakistan IT Market', 'Talent Acquisition', 'TalentTap'],
        'seo_title': 'AI Reduces Hiring Time 70% in Pakistan Software Houses | TalentTap',
        'seo_description': "Discover how AI-powered talent matching cuts hiring time from 8 weeks to 2 weeks in Pakistan's IT sector. Real data from TalentTap platform.",
        'seo_keywords': 'AI hiring Pakistan, talent matching Pakistan, software house recruitment, IT recruitment Lahore',
        'is_featured': True,
    },
    {
        'title': '10 Red Flags Every Recruiter Must Watch For in a Developer Resume',
        'slug': 'developer-resume-red-flags-recruiters',
        'excerpt': 'Not all Senior Developer resumes are equal. Here are 10 warning signs that experienced HR managers look for before scheduling a technical interview.',
        'content': """<h2>Why Developer Resumes Are Hard to Evaluate</h2>
<p>Hiring a great developer is one of the most high-stakes decisions an HR manager can make. A bad hire costs a Pakistani software house an average of PKR 800,000-1.2 million when you factor in onboarding time, salary paid, and the productivity loss of the team.</p>
<h2>Red Flag #1: Buzzword Overload Without Context</h2>
<p>A resume that lists every possible technology without context is a warning sign. Strong developers are specialists first and generalists second.</p>
<h2>Red Flag #2: Job Hopping Every 6-12 Months</h2>
<p>This is highly contextual. In Pakistan's IT market, some job-hopping is normal due to salary pressures. But 5 jobs in 3 years warrants a direct question.</p>
<h2>Red Flag #3: No Portfolio or GitHub Link</h2>
<p>Any developer claiming 5+ years of experience should have something to show. No portfolio, no GitHub, no open-source contributions is a serious concern in 2025.</p>
<h2>Red Flag #4: Vague Project Descriptions</h2>
<p>Weak: "Worked on e-commerce platform using React." Strong candidates describe their specific contribution and measurable impact.</p>
<h2>Red Flag #5: Skills Don't Match Experience Level</h2>
<p>If someone claims to be a Senior React Developer but their experience section only shows 18 months of React work, dig deeper before proceeding.</p>
<h2>Using TalentTap to Filter Automatically</h2>
<p>TalentTap's candidate profiles are structured to surface these signals automatically - making it much easier to spot genuine talent.</p>""",
        'category': 'hiring-tips',
        'tags': ['Talent Acquisition', 'Interview Tips', 'Software Engineering'],
        'seo_title': '10 Developer Resume Red Flags Recruiters Must Know | TalentTap',
        'seo_description': 'Avoid costly bad hires. Learn the 10 critical red flags in developer resumes that experienced HR managers watch for before scheduling interviews.',
        'seo_keywords': 'developer resume red flags, how to evaluate developer resume, hiring developers Pakistan',
        'is_featured': True,
    },
    {
        'title': 'Average Software Engineer Salaries in Pakistan 2025: Complete City-by-City Guide',
        'slug': 'software-engineer-salaries-pakistan-2025',
        'excerpt': 'Comprehensive salary benchmarks for software engineers in Lahore, Karachi, Islamabad, and other cities. Based on 2,000+ TalentTap candidate profiles.',
        'content': """<h2>Pakistan Software Engineering Salary Landscape in 2025</h2>
<p>With Pakistan's IT exports growing rapidly and international remote work opportunities exploding, software engineer salaries have shifted significantly in the last 24 months.</p>
<h2>Junior Developer (0-2 Years Experience)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
  <tr><th>City</th><th>Min Salary</th><th>Max Salary</th><th>Average</th></tr>
  <tr><td>Lahore</td><td>PKR 60,000</td><td>PKR 100,000</td><td>PKR 78,000</td></tr>
  <tr><td>Karachi</td><td>PKR 65,000</td><td>PKR 110,000</td><td>PKR 85,000</td></tr>
  <tr><td>Islamabad</td><td>PKR 70,000</td><td>PKR 120,000</td><td>PKR 92,000</td></tr>
</table>
<h2>Senior Developer (5+ Years Experience)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
  <tr><th>City</th><th>Min Salary</th><th>Max Salary</th><th>Average</th></tr>
  <tr><td>Lahore</td><td>PKR 250,000</td><td>PKR 500,000</td><td>PKR 340,000</td></tr>
  <tr><td>Karachi</td><td>PKR 270,000</td><td>PKR 550,000</td><td>PKR 370,000</td></tr>
  <tr><td>Islamabad</td><td>PKR 300,000</td><td>PKR 600,000</td><td>PKR 420,000</td></tr>
</table>
<h2>Hot Skills That Command a Premium in 2025</h2>
<ul>
  <li><strong>AI/ML Engineering</strong> - 35-60% salary premium</li>
  <li><strong>React + Node.js (Full Stack)</strong> - Most in-demand combination</li>
  <li><strong>DevOps / Kubernetes</strong> - Massive shortage, 40% premium</li>
  <li><strong>Django + DRF</strong> - Stable demand, especially for SaaS</li>
</ul>
<p><a href="/register">Create a free account</a> to start posting jobs with competitive, market-aligned salaries.</p>""",
        'category': 'market-trends',
        'tags': ['Pakistan IT Market', 'Salary Negotiation', 'Software Engineering', 'Full Stack'],
        'seo_title': 'Software Engineer Salaries Pakistan 2025 City Guide | TalentTap',
        'seo_description': 'Comprehensive 2025 salary data for software engineers in Lahore, Karachi, and Islamabad. Based on 2,000+ real candidate profiles on TalentTap.',
        'seo_keywords': 'software engineer salary Pakistan 2025, developer salary Lahore, programmer salary Karachi, IT salary Pakistan',
        'is_featured': True,
    },
    {
        'title': 'How to Write a Developer Profile That Recruiters Cannot Ignore',
        'slug': 'write-developer-profile-recruiters-notice',
        'excerpt': 'Your TalentTap profile is your digital business card. These 8 proven strategies will dramatically increase the number of recruiter views and match requests you receive.',
        'content': """<h2>Why Most Developer Profiles Get Ignored</h2>
<p>We analysed thousands of candidate profiles on TalentTap and found a clear pattern: profiles that receive 10x more recruiter views share specific characteristics.</p>
<h2>Strategy 1: Lead With a Compelling Headline</h2>
<p>Instead of "Software Engineer," write "Senior React Developer | 5 Years Building Fintech SPAs | Open to Remote Roles."</p>
<h2>Strategy 2: Be Specific About Your Skills</h2>
<p>TalentTap's profile builder lets you set skill levels (Beginner to Expert) which directly feeds into the AI matching score.</p>
<h2>Strategy 3: Add Quantifiable Achievements</h2>
<p>Weak: "Worked on an e-commerce platform." Strong: "Built the product catalog microservice that handled 50,000 daily transactions, reducing checkout errors by 35%."</p>
<h2>Strategy 4: Link Your Portfolio and GitHub</h2>
<p>This is non-negotiable. Recruiters filter for candidates with portfolio links. If you don't have one, deploy a personal project this weekend.</p>
<h2>Strategy 5: Keep Your Profile Updated</h2>
<p>TalentTap's algorithm gives a recency boost to profiles updated within the last 30 days. Log in once a month to stay active.</p>
<p><a href="/register">Create your optimised TalentTap profile today</a> and start receiving match requests from top software houses.</p>""",
        'category': 'career-advice',
        'tags': ['Interview Tips', 'TalentTap', 'Software Engineering'],
        'seo_title': 'How to Write a Developer Profile That Gets Recruiter Attention | TalentTap',
        'seo_description': "8 proven strategies to write a developer profile that receives 10x more recruiter views. Real tips from TalentTap's candidate data.",
        'seo_keywords': 'developer profile tips, how to get noticed by recruiters, TalentTap profile, Pakistan developer jobs',
        'is_featured': False,
    },
    {
        'title': 'TalentTap Launches AI-Powered Talent Matching for Pakistan IT Sector',
        'slug': 'talenttap-launches-ai-talent-matching-pakistan',
        'excerpt': "We are excited to announce the official launch of TalentTap - Pakistan's first city-based AI talent marketplace connecting software houses with top digital professionals.",
        'content': """<h2>Introducing TalentTap</h2>
<p>Today, we are proud to officially launch <strong>TalentTap</strong> - a city-based AI digital talent marketplace built specifically for Pakistan's booming IT ecosystem.</p>
<h2>The Problem We Are Solving</h2>
<p>Pakistan produces over 25,000 IT graduates per year. The country has over 10,000 registered software houses and freelance studios. Yet despite this abundance of talent and demand, the hiring process remains painfully inefficient.</p>
<h2>What TalentTap Does</h2>
<ul>
  <li><strong>For Candidates:</strong> Create a rich, searchable profile. Our AI matches you with companies actively looking for your exact skill set.</li>
  <li><strong>For Companies:</strong> Post jobs, use city and skill-based search, manage applications in a structured pipeline, and communicate through integrated messaging.</li>
</ul>
<h2>Key Features at Launch</h2>
<ul>
  <li>AI Matching Engine - Ranks candidates by job compatibility score</li>
  <li>City-Based Search - Find talent in your specific city</li>
  <li>Integrated Messaging - Communicate without leaving the platform</li>
  <li>Application Pipeline - Track applications through stages</li>
  <li>Enterprise Security - JWT auth, 2FA, encrypted data</li>
</ul>
<h2>Get Started Today - It is Free</h2>
<p>TalentTap is currently free for all candidates. Companies can post up to 3 jobs for free. <a href="/register">Create your account today.</a></p>""",
        'category': 'platform-updates',
        'tags': ['TalentTap', 'AI Matching', 'Pakistan IT Market', 'SaaS Recruitment'],
        'seo_title': 'TalentTap Launches AI Talent Marketplace for Pakistan IT | Official',
        'seo_description': "TalentTap officially launches Pakistan's first city-based AI talent marketplace. Free for candidates. Connect with top software houses today.",
        'seo_keywords': 'TalentTap launch, AI talent marketplace Pakistan, recruitment platform Pakistan, hire developers Pakistan',
        'is_featured': False,
    },
]


class Command(BaseCommand):
    help = 'Seed blog categories, tags, and sample articles'

    def handle(self, *args, **options):
        admin = User.objects.filter(role='admin').first() or User.objects.filter(is_staff=True).first()

        # Categories
        cat_data = [
            ('Hiring Tips', 'hiring-tips', 'Expert advice for recruiters and HR managers to hire smarter.', 'blue'),
            ('Career Advice', 'career-advice', 'Actionable guidance for candidates to advance their careers.', 'green'),
            ('AI in Recruitment', 'ai-recruitment', 'How artificial intelligence is transforming the hiring industry.', 'purple'),
            ('Market Trends', 'market-trends', 'National and international recruitment market insights and salary reports.', 'amber'),
            ('Platform Updates', 'platform-updates', 'New features, improvements, and news from TalentTap.', 'teal'),
            ('Success Stories', 'success-stories', 'Real stories of companies and candidates who found their perfect match.', 'rose'),
        ]
        cats = {}
        for name, slug, desc, color in cat_data:
            cat, _ = BlogCategory.objects.get_or_create(slug=slug, defaults={'name': name, 'description': desc, 'color': color})
            cats[slug] = cat
        self.stdout.write(self.style.SUCCESS(f'  {len(cats)} categories ready'))

        # Tags
        tag_names = ['AI Matching', 'Remote Work', 'Pakistan IT Market', 'Software Engineering',
                     'Salary Negotiation', 'Interview Tips', 'Talent Acquisition', 'Full Stack',
                     'React', 'Django', 'TalentTap', 'SaaS Recruitment']
        tags = {}
        for t in tag_names:
            obj, _ = BlogTag.objects.get_or_create(slug=slugify(t), defaults={'name': t})
            tags[t] = obj
        self.stdout.write(self.style.SUCCESS(f'  {len(tags)} tags ready'))

        # Articles
        now = timezone.now()
        created = 0
        for i, a in enumerate(ARTICLES):
            if BlogPost.objects.filter(slug=a['slug']).exists():
                self.stdout.write(f"  Skipping (exists): {a['slug']}")
                continue
            post = BlogPost.objects.create(
                author=admin,
                category=cats.get(a['category']),
                title=a['title'],
                slug=a['slug'],
                excerpt=a['excerpt'],
                content=a['content'].strip(),
                seo_title=a['seo_title'],
                seo_description=a['seo_description'],
                seo_keywords=a['seo_keywords'],
                status='published',
                is_featured=a.get('is_featured', False),
                published_at=now - timezone.timedelta(days=i * 3),
            )
            for tag_name in a.get('tags', []):
                if tag_name in tags:
                    post.tags.add(tags[tag_name])
            created += 1
            self.stdout.write(f"  Created: {a['title'][:60]}")

        self.stdout.write(self.style.SUCCESS(f'Blog seed complete: {created} articles created.'))
