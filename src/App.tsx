import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { DEFAULT_PUBLIC_SETTINGS } from './data/seedCourses';
import { fetchPublicSettings, fetchPublishedCourses } from './lib/firestoreService';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutFailurePage, CheckoutSuccessPage } from './pages/CheckoutResultPage';
import { CorporatePage } from './pages/CorporatePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { HomePage } from './pages/HomePage';
import { StudentAreaPage } from './pages/StudentAreaPage';
import { ValidateCertificatePage } from './pages/ValidateCertificatePage';
import type { Course, PublicSettings } from './types';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [settings, setSettings] = useState<PublicSettings>({ ...DEFAULT_PUBLIC_SETTINGS, updatedAt: null });

  useEffect(() => {
    Promise.all([fetchPublishedCourses(), fetchPublicSettings()])
      .then(([loadedCourses, loadedSettings]) => {
        setCourses(loadedCourses);
        setSettings(loadedSettings);
      })
      .finally(() => setLoadingCourses(false));
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#0A2540]">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<HomePage courses={courses} settings={settings} loadingCourses={loadingCourses} />}
          />
          <Route path="/cursos/:slug" element={<CourseDetailPage />} />
          <Route path="/checkout/sucesso" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/falha" element={<CheckoutFailurePage />} />
          <Route path="/checkout/combo/:offerId" element={<CheckoutPage mode="combo" />} />
          <Route path="/checkout/:slug" element={<CheckoutPage mode="course" />} />
          <Route path="/aluno" element={<StudentAreaPage />} />
          <Route path="/validar" element={<ValidateCertificatePage />} />
          <Route path="/empresas" element={<CorporatePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer settings={settings} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
