import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_LOGO_URL } from '../data/seedCourses';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12);
  });

  function handleSectionNav(sectionId: string) {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleGoHome() {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-[0_4px_20px_-8px_rgba(10,37,64,0.12)]'
          : 'bg-white border-slate-200/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo */}
        <Link
          to="/"
          onClick={handleGoHome}
          className="shrink-0 flex items-center"
          aria-label="4k Treinamentos"
        >
          <img
            src={OFFICIAL_LOGO_URL}
            alt="4k Treinamentos"
            referrerPolicy="no-referrer"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Zone 2: Clean Single-Line Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={handleGoHome}
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('cursos')}
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cursos
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('documentacao')}
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            APR & PGR
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('como-funciona')}
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Como Funciona
          </button>
          <Link
            to="/empresas"
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0"
          >
            Empresas
          </Link>
          <Link
            to="/aluno"
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0"
          >
            {user ? 'Área do Aluno' : 'Área do Aluno'}
          </Link>
          <button
            type="button"
            onClick={() => handleSectionNav('contato')}
            className="hover:text-[#0A2540] transition-colors underline-offset-8 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contato
          </button>
        </nav>

        {/* Zone 3: Primary Safety Yellow CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSectionNav('cursos')}
            className="px-5 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] active:scale-[0.98] text-[#0A2540] text-sm font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            Ver Cursos
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#0A2540] hover:bg-slate-100 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1.5 shadow-lg">
          <button
            type="button"
            onClick={handleGoHome}
            className="block w-full text-left px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('cursos')}
            className="block w-full text-left px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Cursos
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('documentacao')}
            className="block w-full text-left px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            APR & PGR Online
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav('como-funciona')}
            className="block w-full text-left px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Como Funciona
          </button>
          <Link
            to="/empresas"
            onClick={() => setMobileOpen(false)}
            className="flex items-center px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Empresas
          </Link>
          <Link
            to="/validar"
            onClick={() => setMobileOpen(false)}
            className="flex items-center px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Validar Certificado
          </Link>
          <button
            type="button"
            onClick={() => handleSectionNav('contato')}
            className="block w-full text-left px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#0A2540] rounded-lg hover:bg-slate-50"
          >
            Contato
          </button>
          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/aluno"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-3 border border-[#0F2C59] text-[#0A2540] text-sm font-semibold rounded-lg"
            >
              Área do Aluno
            </Link>
            <button
              type="button"
              onClick={() => handleSectionNav('cursos')}
              className="w-full px-4 py-3 bg-[#F5C518] text-[#0A2540] text-sm font-bold rounded-lg"
            >
              Ver Cursos
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
