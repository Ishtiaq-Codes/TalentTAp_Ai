import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, getDashboardPath, getRedirectPath } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import OnboardingLayout from '@/components/layout/OnboardingLayout'
import PublicChatbot from '@/components/shared/PublicChatbot'

// Auth
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/public/ResetPasswordPage'))
const AcceptInvitePage = lazy(() => import('@/pages/public/AcceptInvitePage'))

// Public Pages
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'))
const PricingPage = lazy(() => import('@/pages/public/PricingPage'))
const FAQPage = lazy(() => import('@/pages/public/FAQPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/public/TermsPage'))
const TalentProfilePage = lazy(() => import('@/pages/public/TalentProfilePage'))
const BlogListPage = lazy(() => import('@/pages/public/BlogListPage'))
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'))

// Candidate
const CandidateDashboard = lazy(() => import('@/pages/candidate/DashboardPage'))
const CandidateProfile = lazy(() => import('@/pages/candidate/ProfilePage'))
const CandidateJobs = lazy(() => import('@/pages/candidate/JobsPage'))
const CandidateJobDetailPage = lazy(() => import('@/pages/candidate/JobDetailPage'))
const CandidateApplications = lazy(() => import('@/pages/candidate/ApplicationsPage'))
const CandidateMatches = lazy(() => import('@/pages/candidate/MatchesPage'))
const CandidateSettingsPage = lazy(() => import('@/pages/candidate/CandidateSettingsPage'))

// Recruiter
const RecruiterDashboard = lazy(() => import('@/pages/recruiter/DashboardPage'))
const JobsListPage = lazy(() => import('@/pages/recruiter/JobsListPage'))
const CreateJobPage = lazy(() => import('@/pages/recruiter/CreateJobPage'))
const EditJobPage = lazy(() => import('@/pages/recruiter/EditJobPage'))
const JobDetailPage = lazy(() => import('@/pages/recruiter/JobDetailPage'))
const CandidateSearchPage = lazy(() => import('@/pages/recruiter/CandidateSearchPage'))
const CandidateDetailPage = lazy(() => import('@/pages/recruiter/CandidateDetailPage'))
const ShortlistsPage = lazy(() => import('@/pages/recruiter/ShortlistsPage'))

// Company
const CompanyProfilePage = lazy(() => import('@/pages/company/CompanyProfilePage'))
const PublicCompanyProfilePage = lazy(() => import('@/pages/public/PublicCompanyProfilePage'))
const TeamPage = lazy(() => import('@/pages/company/TeamPage'))
const SettingsPage = lazy(() => import('@/pages/company/SettingsPage'))
const CompanyDashboardPage = lazy(() => import('@/pages/company/DashboardPage'))
const TalentPoolsPage = lazy(() => import('@/pages/company/TalentPoolsPage'))

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))

// Onboarding
const CandidateOnboarding = lazy(() => import('@/pages/onboarding/CandidateOnboarding'))
const CompanyOnboarding = lazy(() => import('@/pages/onboarding/CompanyOnboarding'))

// Shared
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage'))

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">🚧</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-muted-foreground">This page is coming soon.</p>
    </div>
  )
}

/**
 * Guard: requires authentication. Redirects to /login if not.
 */
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

/**
 * Guard: redirects logged-in users to dashboard or onboarding. For public pages.
 */
function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to={getRedirectPath(user)} replace />
  return children
}

/**
 * Wrapper for public pages to inject the PublicChatbot
 */
function PublicRouteWrapper({ children }) {
  return (
    <>
      {children}
      <PublicChatbot />
    </>
  )
}

/**
 * Guard: requires authentication AND onboarding. Redirects if not.
 */
function RequireOnboarded({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  
  if (!user.is_onboarded && (user.role === 'candidate' || user.role === 'company_admin')) {
    return <Navigate to={getRedirectPath(user)} replace />
  }
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes — redirect to dashboard if logged in */}
          <Route path="/" element={<RedirectIfAuth><PublicRouteWrapper><LandingPage /></PublicRouteWrapper></RedirectIfAuth>} />
          <Route path="/about" element={<PublicRouteWrapper><AboutPage /></PublicRouteWrapper>} />
          <Route path="/features" element={<PublicRouteWrapper><FeaturesPage /></PublicRouteWrapper>} />
          <Route path="/pricing" element={<PublicRouteWrapper><PricingPage /></PublicRouteWrapper>} />
          <Route path="/faq" element={<PublicRouteWrapper><FAQPage /></PublicRouteWrapper>} />
          <Route path="/contact" element={<PublicRouteWrapper><ContactPage /></PublicRouteWrapper>} />
          <Route path="/privacy" element={<PublicRouteWrapper><PrivacyPage /></PublicRouteWrapper>} />
          <Route path="/terms" element={<PublicRouteWrapper><TermsPage /></PublicRouteWrapper>} />
          <Route path="/blog" element={<PublicRouteWrapper><BlogListPage /></PublicRouteWrapper>} />
          <Route path="/blog/:slug" element={<PublicRouteWrapper><BlogDetailPage /></PublicRouteWrapper>} />
          <Route path="/talent/:id" element={<PublicRouteWrapper><TalentProfilePage /></PublicRouteWrapper>} />
          <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<RedirectIfAuth><ResetPasswordPage /></RedirectIfAuth>} />
          <Route path="/invite/:token" element={<RedirectIfAuth><AcceptInvitePage /></RedirectIfAuth>} />

          {/* Onboarding routes (Requires Auth but NOT Onboarded) */}
          <Route element={<RequireAuth><OnboardingLayout /></RequireAuth>}>
            <Route path="/onboarding/candidate" element={<CandidateOnboarding />} />
            <Route path="/onboarding/company" element={<CompanyOnboarding />} />
          </Route>

          {/* Protected routes with AppShell layout */}
          <Route element={<RequireOnboarded><AppShell /></RequireOnboarded>}>
            {/* Candidate */}
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/jobs" element={<CandidateJobs />} />
            <Route path="/candidate/jobs/:id" element={<CandidateJobDetailPage />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/matches" element={<CandidateMatches />} />
            <Route path="/candidate/messages" element={<MessagesPage />} />
            <Route path="/candidate/settings" element={<CandidateSettingsPage />} />

            {/* Recruiter */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<JobsListPage />} />
            <Route path="/recruiter/jobs/new" element={<CreateJobPage />} />
            <Route path="/recruiter/jobs/:id/edit" element={<EditJobPage />} />
            <Route path="/recruiter/jobs/:id" element={<JobDetailPage />} />
            <Route path="/recruiter/candidates" element={<CandidateSearchPage />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/recruiter/shortlists" element={<ShortlistsPage />} />
            <Route path="/recruiter/messages" element={<MessagesPage />} />

            {/* Company */}
            <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/team" element={<TeamPage />} />
            <Route path="/company/pools" element={<TalentPoolsPage />} />
            <Route path="/company/settings" element={<SettingsPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/companies" element={<ComingSoon title="Manage Companies" />} />
            <Route path="/admin/candidates" element={<ComingSoon title="Manage Candidates" />} />
            <Route path="/admin/jobs" element={<ComingSoon title="Manage Jobs" />} />

            {/* Public details (inside AppShell but accessible to any role) */}
            <Route path="/companies/:id" element={<PublicCompanyProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
