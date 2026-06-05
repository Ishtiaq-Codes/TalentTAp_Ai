"""Seed realistic blog data for TalentTap — run via: python manage.py runscript seed_blog"""
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.blog.models import BlogCategory, BlogTag, BlogPost

User = get_user_model()


def run():
    # Get or create a platform admin author
    admin = User.objects.filter(role='admin').first() or User.objects.filter(is_staff=True).first()

    # ── Categories ──────────────────────────────────────────────────────
    cat_data = [
        ('Hiring Tips', 'hiring-tips', 'Expert advice for recruiters and HR managers to hire smarter.', 'blue'),
        ('Career Advice', 'career-advice', 'Actionable guidance for candidates to advance their careers.', 'green'),
        ('AI in Recruitment', 'ai-recruitment', 'How artificial intelligence is transforming the hiring industry.', 'purple'),
        ('Market Trends', 'market-trends', 'National and international recruitment market insights and salary reports.', 'amber'),
        ('Platform Updates', 'platform-updates', 'New features, improvements, and news from TalentTap.', 'teal'),
        ('Success Stories', 'success-stories', 'Real stories of companies and candidates who found their perfect match.', 'rose'),
    ]

    categories = {}
    for name, slug, desc, color in cat_data:
        cat, _ = BlogCategory.objects.get_or_create(
            slug=slug, defaults={'name': name, 'description': desc, 'color': color}
        )
        categories[slug] = cat
    print(f'✅ {len(categories)} categories seeded.')

    # ── Tags ────────────────────────────────────────────────────────────
    tag_names = [
        'AI Matching', 'Remote Work', 'Pakistan IT Market', 'Software Engineering',
        'Salary Negotiation', 'Interview Tips', 'Talent Acquisition', 'Employer Branding',
        'Full Stack', 'React', 'Django', 'Machine Learning', 'SaaS Recruitment', 'TalentTap',
    ]
    tags = {}
    for name in tag_names:
        from django.utils.text import slugify
        tag, _ = BlogTag.objects.get_or_create(slug=slugify(name), defaults={'name': name})
        tags[name] = tag
    print(f'✅ {len(tags)} tags seeded.')

    # ── Articles ────────────────────────────────────────────────────────
    articles = [
        {
            'title': 'How AI Matching is Reducing Hiring Time by 70% in Pakistani Software Houses',
            'slug': 'ai-matching-reducing-hiring-time-pakistan',
            'excerpt': 'Traditional recruitment in Pakistan\'s IT sector takes 6–8 weeks. Discover how AI-powered talent matching platforms like TalentTap are cutting that to under 2 weeks.',
            'content': '''
<h2>The Hiring Crisis in Pakistan's Tech Sector</h2>
<p>Pakistan's technology industry is growing at an unprecedented rate, with IT exports surpassing $2.6 billion in 2024. But this rapid growth has created a critical challenge: the talent supply chain simply cannot keep pace with demand.</p>
<p>Software houses in Lahore, Karachi, and Islamabad are spending an average of <strong>6–8 weeks</strong> to fill a single technical role. HR managers report spending over 60% of their time manually screening resumes — a process that is both exhausting and deeply inefficient.</p>

<h2>The Traditional Hiring Funnel is Broken</h2>
<p>Here's what a typical hiring process looks like for a Pakistani software house:</p>
<ol>
  <li>Post a job on LinkedIn or Rozee.pk</li>
  <li>Receive 200–500 applications within 48 hours</li>
  <li>Manually screen every resume (3–5 minutes each = 10+ hours)</li>
  <li>Phone-screen 20–30 candidates</li>
  <li>Technical test for 10–15 candidates</li>
  <li>Final interviews for 3–5 candidates</li>
  <li>Offer and negotiation</li>
</ol>
<p>The result? Top talent gets hired by competitors while you're still reviewing resumes from week one.</p>

<h2>How AI Matching Changes Everything</h2>
<p>TalentTap's AI matching engine analyses a candidate's full profile — skills, experience level, project portfolio, availability, and location — and scores them against your job requirements in milliseconds.</p>
<p>Instead of reviewing 500 applications manually, you see a ranked shortlist of the top 10–20 candidates who genuinely match your requirements. The AI considers factors that a keyword search will miss, like whether a candidate's project experience aligns with your tech stack, or whether their career trajectory suggests they're ready for a senior role.</p>

<h2>Real Numbers: Before and After TalentTap</h2>
<p>Based on our internal data:</p>
<ul>
  <li><strong>Time to first interview:</strong> From 2 weeks → 3 days</li>
  <li><strong>Total hiring cycle:</strong> From 7 weeks → 2 weeks</li>
  <li><strong>Resume screening time:</strong> From 10+ hours → 15 minutes</li>
  <li><strong>Quality of hire score:</strong> 89% match accuracy</li>
</ul>

<h2>Getting Started</h2>
<p>If you're a software house in Pakistan looking to reduce your time-to-hire, <a href="/register">create a free TalentTap account</a> today and post your first job in under 5 minutes.</p>
            ''',
            'category': 'ai-recruitment',
            'tags': ['AI Matching', 'Pakistan IT Market', 'Talent Acquisition', 'TalentTap'],
            'seo_title': 'AI Reduces Hiring Time 70% in Pakistan Software Houses | TalentTap',
            'seo_description': 'Discover how AI-powered talent matching cuts hiring time from 8 weeks to 2 weeks in Pakistan\'s IT sector. Real data from TalentTap platform.',
            'seo_keywords': 'AI hiring Pakistan, talent matching Pakistan, software house recruitment, IT recruitment Lahore, hiring time reduction',
            'is_featured': True,
        },
        {
            'title': '10 Red Flags Every Recruiter Must Watch For in a Developer\'s Resume',
            'slug': 'developer-resume-red-flags-recruiters',
            'excerpt': 'Not all "Senior Developer" resumes are equal. Here are 10 warning signs that experienced HR managers look for before scheduling a technical interview.',
            'content': '''
<h2>Why Developer Resumes Are Notoriously Hard to Evaluate</h2>
<p>Hiring a great developer is one of the most high-stakes decisions an HR manager can make. A bad hire costs a Pakistani software house an average of PKR 800,000–1.2 million when you factor in onboarding time, salary paid, and the productivity loss of the team.</p>
<p>The problem? Most HR managers are not developers themselves. Evaluating a technical resume requires knowing what to look for — and what to avoid.</p>

<h2>Red Flag #1: Buzzword Overload Without Context</h2>
<p>A resume that lists every possible technology ("React, Angular, Vue, Node, Python, Django, Spring Boot, AWS, Azure...") without context is a warning sign. Strong developers are specialists first and generalists second. Ask yourself: is there any depth here, or just a laundry list?</p>

<h2>Red Flag #2: Job Hopping Every 6–12 Months</h2>
<p>This is highly contextual. In Pakistan's IT market, some job-hopping is normal due to salary pressures. But if a candidate has changed 5 jobs in 3 years, ask directly: Were these contracts? Layoffs? Or were they let go?</p>

<h2>Red Flag #3: No Portfolio or GitHub Link</h2>
<p>Any developer claiming 5+ years of experience should have something to show. No portfolio, no GitHub, no open-source contributions is a serious concern in 2025.</p>

<h2>Red Flag #4: Vague Project Descriptions</h2>
<p>"Worked on e-commerce platform using React" tells you nothing. Strong candidates describe their specific contribution: "Led the migration of checkout flow from jQuery to React, reducing page load time by 40%."</p>

<h2>Red Flag #5: Skills Listed Don't Match Experience Level</h2>
<p>If someone claims to be a "Senior React Developer" but their experience section only shows 18 months of React work, dig deeper before proceeding.</p>

<h2>Using TalentTap to Filter Automatically</h2>
<p>TalentTap's candidate profiles are structured to surface these signals automatically. Every profile requires candidates to list their skills with proficiency levels and years of experience, link their portfolio, and describe specific contributions on projects — making it much easier to spot genuine talent.</p>
            ''',
            'category': 'hiring-tips',
            'tags': ['Talent Acquisition', 'Interview Tips', 'Software Engineering'],
            'seo_title': '10 Developer Resume Red Flags Recruiters Must Know | TalentTap',
            'seo_description': 'Avoid costly bad hires. Learn the 10 critical red flags in developer resumes that experienced HR managers watch for before scheduling interviews.',
            'seo_keywords': 'developer resume red flags, how to evaluate developer resume, hiring developers Pakistan, software engineer recruitment',
            'is_featured': True,
        },
        {
            'title': 'Average Software Engineer Salaries in Pakistan 2025: Complete City-by-City Guide',
            'slug': 'software-engineer-salaries-pakistan-2025',
            'excerpt': 'Comprehensive salary benchmarks for software engineers in Lahore, Karachi, Islamabad, and other cities. Data collected from 2,000+ TalentTap candidate profiles.',
            'content': '''
<h2>Pakistan Software Engineering Salary Landscape in 2025</h2>
<p>With Pakistan's IT exports growing rapidly and international remote work opportunities exploding, software engineer salaries have shifted significantly in the last 24 months. This guide provides current, data-driven benchmarks across experience levels and cities.</p>

<h2>Methodology</h2>
<p>This data is aggregated from TalentTap candidate profiles and verified offer data shared by company users on our platform. All figures are in Pakistani Rupees (PKR) per month, gross.</p>

<h2>Junior Developer (0–2 Years Experience)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
  <tr><th>City</th><th>Min Salary</th><th>Max Salary</th><th>Average</th></tr>
  <tr><td>Lahore</td><td>PKR 60,000</td><td>PKR 100,000</td><td>PKR 78,000</td></tr>
  <tr><td>Karachi</td><td>PKR 65,000</td><td>PKR 110,000</td><td>PKR 85,000</td></tr>
  <tr><td>Islamabad</td><td>PKR 70,000</td><td>PKR 120,000</td><td>PKR 92,000</td></tr>
  <tr><td>Remote (International)</td><td>$400</td><td>$900</td><td>$620</td></tr>
</table>

<h2>Mid-Level Developer (2–5 Years Experience)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
  <tr><th>City</th><th>Min Salary</th><th>Max Salary</th><th>Average</th></tr>
  <tr><td>Lahore</td><td>PKR 120,000</td><td>PKR 200,000</td><td>PKR 155,000</td></tr>
  <tr><td>Karachi</td><td>PKR 130,000</td><td>PKR 220,000</td><td>PKR 168,000</td></tr>
  <tr><td>Islamabad</td><td>PKR 140,000</td><td>PKR 250,000</td><td>PKR 185,000</td></tr>
  <tr><td>Remote (International)</td><td>$900</td><td>$2,500</td><td>$1,600</td></tr>
</table>

<h2>Senior Developer (5+ Years Experience)</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
  <tr><th>City</th><th>Min Salary</th><th>Max Salary</th><th>Average</th></tr>
  <tr><td>Lahore</td><td>PKR 250,000</td><td>PKR 500,000</td><td>PKR 340,000</td></tr>
  <tr><td>Karachi</td><td>PKR 270,000</td><td>PKR 550,000</td><td>PKR 370,000</td></tr>
  <tr><td>Islamabad</td><td>PKR 300,000</td><td>PKR 600,000</td><td>PKR 420,000</td></tr>
  <tr><td>Remote (International)</td><td>$2,500</td><td>$7,000</td><td>$4,200</td></tr>
</table>

<h2>Hot Skills That Command a Premium in 2025</h2>
<ul>
  <li><strong>AI/ML Engineering</strong> — 35–60% salary premium</li>
  <li><strong>React + Node.js (Full Stack)</strong> — Most in-demand combination</li>
  <li><strong>DevOps / Kubernetes</strong> — Massive shortage, 40% premium</li>
  <li><strong>Django + DRF</strong> — Stable demand, especially for SaaS</li>
  <li><strong>Flutter / Mobile</strong> — Growing demand, 20% premium</li>
</ul>

<h2>Set Competitive Salaries with TalentTap</h2>
<p>When you post a job on TalentTap, you can set salary ranges that will be used to filter and match candidates. <a href="/register">Create a free account</a> to start posting jobs with competitive, market-aligned salaries.</p>
            ''',
            'category': 'market-trends',
            'tags': ['Pakistan IT Market', 'Salary Negotiation', 'Software Engineering', 'Full Stack'],
            'seo_title': 'Software Engineer Salaries Pakistan 2025 — City Guide | TalentTap',
            'seo_description': 'Comprehensive 2025 salary data for software engineers in Lahore, Karachi, and Islamabad. Based on 2,000+ real candidate profiles on TalentTap.',
            'seo_keywords': 'software engineer salary Pakistan 2025, developer salary Lahore, programmer salary Karachi, IT salary Pakistan, React developer salary',
            'is_featured': True,
        },
        {
            'title': 'How to Write a Developer Profile That Recruiters Can\'t Ignore',
            'slug': 'write-developer-profile-recruiters-notice',
            'excerpt': 'Your TalentTap profile is your digital business card. These 8 proven strategies will dramatically increase the number of recruiter views and match requests you receive.',
            'content': '''
<h2>Why Most Developer Profiles Get Ignored</h2>
<p>We analysed thousands of candidate profiles on TalentTap and found a clear pattern: profiles that receive 10x more recruiter views share specific characteristics. Most ignored profiles have the same problems: vague skill listings, no portfolio link, and a weak bio that reads like a job description.</p>

<h2>Strategy 1: Lead With a Compelling Headline</h2>
<p>Instead of "Software Engineer," write "Senior React Developer | 5 Years Building Fintech SPAs | Open to Remote Roles." Pack it with keywords that recruiters actually search for.</p>

<h2>Strategy 2: Be Specific About Your Skills</h2>
<p>Don't just list "JavaScript." Tell us your proficiency level and years of experience. TalentTap's profile builder lets you set skill levels (Beginner → Expert) which directly feeds into the AI matching score.</p>

<h2>Strategy 3: Add Quantifiable Achievements</h2>
<p>Weak: "Worked on an e-commerce platform."<br>
Strong: "Built the product catalog microservice that handled 50,000 daily transactions, reducing checkout errors by 35%."</p>

<h2>Strategy 4: Link Your Portfolio and GitHub</h2>
<p>This is non-negotiable. Recruiters use TalentTap's filter to show only candidates with portfolio links. If you don't have one, spend one weekend deploying a personal project to GitHub Pages or Vercel.</p>

<h2>Strategy 5: Set Your Availability Correctly</h2>
<p>Are you actively looking? Passively open? Recruiters filter by availability status. If you're actively searching, mark yourself as "Actively Looking" — you'll appear in more results.</p>

<h2>Strategy 6: Specify Your Location and Remote Preference</h2>
<p>TalentTap is city-based. Clearly specifying your city (and whether you're open to remote or on-site work) dramatically improves your match quality.</p>

<h2>Strategy 7: Write a Human Bio, Not a Robot One</h2>
<p>Your bio should answer three questions in 3–4 sentences: What do you build? What's your biggest professional achievement? What are you looking for next?</p>

<h2>Strategy 8: Keep Your Profile Updated</h2>
<p>TalentTap's algorithm gives a recency boost to profiles that have been updated within the last 30 days. Log in once a month and update even one field to keep your profile active.</p>

<p><a href="/register">Create your optimised TalentTap profile today</a> and start receiving match requests from top software houses.</p>
            ''',
            'category': 'career-advice',
            'tags': ['Interview Tips', 'TalentTap', 'Software Engineering'],
            'seo_title': 'How to Write a Developer Profile That Gets Recruiter Attention | TalentTap',
            'seo_description': '8 proven strategies to write a developer profile that receives 10x more recruiter views. Real tips from TalentTap\'s candidate data.',
            'seo_keywords': 'developer profile tips, how to get noticed by recruiters, software engineer profile, TalentTap profile, Pakistan developer jobs',
            'is_featured': False,
        },
        {
            'title': 'TalentTap Launches AI-Powered Talent Matching for Pakistan\'s IT Sector',
            'slug': 'talenttap-launches-ai-talent-matching-pakistan',
            'excerpt': 'We are excited to announce the official launch of TalentTap — Pakistan\'s first city-based AI talent marketplace connecting software houses with top digital professionals.',
            'content': '''
<h2>Introducing TalentTap</h2>
<p>Today, we are proud to officially launch <strong>TalentTap</strong> — a city-based AI digital talent marketplace built specifically for Pakistan's booming IT ecosystem.</p>

<h2>The Problem We're Solving</h2>
<p>Pakistan produces over 25,000 IT graduates per year. The country has over 10,000 registered software houses and freelance studios. Yet despite this abundance of talent and demand, the hiring process remains painfully inefficient.</p>
<p>HR managers at software houses waste weeks on manual screening. Talented developers with great skills sit unnoticed behind hundreds of applications. The market needed a smarter solution.</p>

<h2>What TalentTap Does</h2>
<p>TalentTap is a two-sided marketplace:</p>
<ul>
  <li><strong>For Candidates:</strong> Create a rich, searchable profile with your skills, projects, portfolio, and availability. Our AI matches you with companies actively looking for your exact skill set.</li>
  <li><strong>For Companies:</strong> Post jobs, use city- and skill-based search to find candidates, manage applications in a structured pipeline, and communicate directly through our integrated messaging system.</li>
</ul>

<h2>Key Features at Launch</h2>
<ul>
  <li>🤖 <strong>AI Matching Engine</strong> — Ranks candidates by job compatibility score</li>
  <li>📍 <strong>City-Based Search</strong> — Find talent in your specific city</li>
  <li>💬 <strong>Integrated Messaging</strong> — Communicate without leaving the platform</li>
  <li>📊 <strong>Application Pipeline</strong> — Track applications through stages</li>
  <li>🔒 <strong>Enterprise Security</strong> — JWT auth, 2FA, encrypted data</li>
  <li>📱 <strong>Mobile Responsive</strong> — Works perfectly on all devices</li>
</ul>

<h2>Get Started Today — It's Free</h2>
<p>TalentTap is currently free for all candidates. Companies can post up to 3 jobs for free. <a href="/register">Create your account today</a> and experience the future of hiring in Pakistan.</p>
            ''',
            'category': 'platform-updates',
            'tags': ['TalentTap', 'AI Matching', 'Pakistan IT Market', 'SaaS Recruitment'],
            'seo_title': 'TalentTap Launches AI Talent Marketplace for Pakistan IT | Official Announcement',
            'seo_description': 'TalentTap officially launches Pakistan\'s first city-based AI talent marketplace. Free for candidates. Connect with top software houses today.',
            'seo_keywords': 'TalentTap launch, AI talent marketplace Pakistan, recruitment platform Pakistan, hire developers Pakistan, software house HR tool',
            'is_featured': False,
        },
    ]

    now = timezone.now()
    created = 0
    for i, a in enumerate(articles):
        if BlogPost.objects.filter(slug=a['slug']).exists():
            continue
        post = BlogPost.objects.create(
            author=admin,
            category=categories[a['category']],
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
        for tag_name in a['tags']:
            if tag_name in tags:
                post.tags.add(tags[tag_name])
        created += 1

    print(f'✅ {created} seed articles created.')
    print('🎉 Blog seeding complete!')
