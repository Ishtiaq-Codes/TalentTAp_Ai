import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'

// Auth
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
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

// Candidate
const CandidateDashboard = lazy(() => import('@/pages/candidate/DashboardPage'))
const CandidateProfile = lazy(() => import('@/pages/candidate/ProfilePage'))
const CandidateJobs = lazy(() => import('@/pages/candidate/JobsPage'))
const CandidateApplications = lazy(() => import('@/pages/candidate/ApplicationsPage'))
const CandidateMatches = lazy(() => import('@/pages/candidate/MatchesPage'))

// Recruiter
const RecruiterDashboard = lazy(() => import('@/pages/recruiter/DashboardPage'))
const JobsListPage = lazy(() => import('@/pages/recruiter/JobsListPage'))
const CreateJobPage = lazy(() => import('@/pages/recruiter/CreateJobPage'))
const JobDetailPage = lazy(() => import('@/pages/recruiter/JobDetailPage'))
const CandidateSearchPage = lazy(() => import('@/pages/recruiter/CandidateSearchPage'))
const CandidateDetailPage = lazy(() => import('@/pages/recruiter/CandidateDetailPage'))
const ShortlistsPage = lazy(() => import('@/pages/recruiter/ShortlistsPage'))

// Company
const CompanyProfilePage = lazy(() => import('@/pages/company/CompanyProfilePage'))
const TeamPage = lazy(() => import('@/pages/company/TeamPage'))
const SettingsPage = lazy(() => import('@/pages/company/SettingsPage'))

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))

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
 * Guard: redirects logged-in users to dashboard. For public pages.
 */
function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes — redirect to dashboard if logged in */}
          <Route path="/" element={<RedirectIfAuth><LandingPage /></RedirectIfAuth>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/talent/:id" element={<TalentProfilePage />} />
          <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/invite/:token" element={<RedirectIfAuth><AcceptInvitePage /></RedirectIfAuth>} />

          {/* Protected routes with AppShell layout */}
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            {/* Candidate */}
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/jobs" element={<CandidateJobs />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/matches" element={<CandidateMatches />} />
            <Route path="/candidate/messages" element={<MessagesPage />} />

            {/* Recruiter */}
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<JobsListPage />} />
            <Route path="/recruiter/jobs/new" element={<CreateJobPage />} />
            <Route path="/recruiter/jobs/:id" element={<JobDetailPage />} />
            <Route path="/recruiter/candidates" element={<CandidateSearchPage />} />
            <Route path="/recruiter/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/recruiter/shortlists" element={<ShortlistsPage />} />
            <Route path="/recruiter/messages" element={<MessagesPage />} />

            {/* Company */}
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/team" element={<TeamPage />} />
            <Route path="/company/settings" element={<SettingsPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/companies" element={<ComingSoon title="Manage Companies" />} />
            <Route path="/admin/candidates" element={<ComingSoon title="Manage Candidates" />} />
            <Route path="/admin/jobs" element={<ComingSoon title="Manage Jobs" />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
