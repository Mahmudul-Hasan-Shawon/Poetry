import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SmoothScroll from './components/SmoothScroll';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import AuthorsPage from './pages/public/AuthorsPage';
import AuthorPage from './pages/public/AuthorPage';
import QuotePage from './pages/public/QuotePage';
import CollectionPage from './pages/public/CollectionPage';
import CollectionsPage from './pages/public/CollectionsPage';
import SearchPage from './pages/public/SearchPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import WritingsPage from './pages/admin/WritingsPage';
import WritingFormPage from './pages/admin/WritingFormPage';
import AuthorsAdminPage from './pages/admin/AuthorsAdminPage';
import AuthorFormPage from './pages/admin/AuthorFormPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import CollectionsAdminPage from './pages/admin/CollectionsAdminPage';
import CollectionFormPage from './pages/admin/CollectionFormPage';
import ImportExportPage from './pages/admin/ImportExportPage';

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <SmoothScroll>
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/:slug" element={<AuthorPage />} />
        <Route path="/quotes/:slug" element={<QuotePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="writings" element={<WritingsPage />} />
        <Route path="writings/new" element={<WritingFormPage />} />
        <Route path="writings/:id/edit" element={<WritingFormPage />} />
        <Route path="authors" element={<AuthorsAdminPage />} />
        <Route path="authors/new" element={<AuthorFormPage />} />
        <Route path="authors/:id/edit" element={<AuthorFormPage />} />
        <Route path="categories" element={<CategoriesAdminPage />} />
        <Route path="collections" element={<CollectionsAdminPage />} />
        <Route path="collections/new" element={<CollectionFormPage />} />
        <Route path="collections/:id/edit" element={<CollectionFormPage />} />
        <Route path="import-export" element={<ImportExportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SmoothScroll>
  );
}