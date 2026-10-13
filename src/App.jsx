import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import { GetStartedPage } from './pages/WelcomePages'
import SearchPage from './pages/SearchPage'
import ProviderProfilePage from './pages/ProviderProfilePage'
import RequestServicePage from './pages/RequestServicePage'
import MyRequestsPage from './pages/MyRequestsPage'
import ProviderDashboardPage from './pages/ProviderDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProviderOnboardingPage from './pages/ProviderOnboardingPage'
import {
  AccountPage, AdminAuditPage, AdminCategoriesPage, AdminProvidersPage, AdminReportsPage, AdminUsersPage,
  CategoryPage, HelpPage, LegalPage, LoginPage, NewRequestPage, NotFoundPage, NotificationsPage, ProviderRequestsPage, AdminSettingsPage, ResetPasswordPage,
  ProviderServicesPage, RequestDetailPage, ReviewsPage, SignupPage, AdminHomeLinks,
} from './pages/AdditionalPages'

function AdminGuard() {
  const { user } = useApp()
  return user.isLoggedIn && user.role === 'admin' ? <Outlet /> : <Navigate to="/admin/login" replace />
}

function ProviderGuard() {
  const { user } = useApp()
  return user.isLoggedIn && user.role === 'provider' ? <Outlet /> : <Navigate to="/login" replace />
}

function EntryPage() {
  return localStorage.getItem('heladeeg-onboarding-complete') === 'true' ? <HomePage /> : <GetStartedPage />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/welcome" element={<GetStartedPage />} />
        <Route path="/app" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<LoginPage admin />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/provider/:id" element={<ProviderProfilePage />} />
        <Route path="/request/:id" element={<RequestServicePage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/requests" element={<MyRequestsPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        <Route path="/provider-onboarding" element={<ProviderOnboardingPage />} />
        <Route path="/provider" element={<Navigate to="/provider-dashboard" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/providers/:id/reviews" element={<ReviewsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route element={<ProviderGuard />}>
          <Route path="/provider/requests" element={<ProviderRequestsPage />} />
          <Route path="/provider/services" element={<ProviderServicesPage />} />
        </Route>
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<><AdminDashboardPage /><AdminHomeLinks /></>} />
          <Route path="/admin/providers" element={<AdminProvidersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
