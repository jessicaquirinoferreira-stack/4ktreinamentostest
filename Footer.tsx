import { Link } from 'react-router-dom';
import { OFFICIAL_LOGO_URL } from '../data/seedCourses';
import type { PublicSettings } from '../types';

export function Footer({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="bg-[#0A2540] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-2 space-y-4">
            <img
              src={OFFICIAL_LOGO_URL}
              alt={settings.companyName || '4k Treinamentos'}
              referrerPolicy="no-referrer"
              className="h-14 w-auto object-contain"
            />
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              {settings.footerNote ||
                'Plataforma brasileira especializada em capacitação online de Segurança do Trabalho (NRs) com emissão de certificado digital assinado.'}
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
              {settings.cnpj && <p>CNPJ: {settings.cnpj}</p>}
              {settings.address && <p className="font-sans">{settings.address}</p>}
              <p className="font-sans">
                {settings.email} {settings.phone ? `· ${settings.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Treinamentos NR</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/cursos/nr-06" className="hover:text-[#F5C518] transition-colors">
                  NR-06 · EPIs
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-10" className="hover:text-[#F5C518] transition-colors">
                  NR-10 · Eletricidade
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-11" className="hover:text-[#F5C518] transition-colors">
                  NR-11 · Cargas
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-12" className="hover:text-[#F5C518] transition-colors">
                  NR-12 · Máquinas
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-18" className="hover:text-[#F5C518] transition-colors">
                  NR-18 · Construção
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-20" className="hover:text-[#F5C518] transition-colors">
                  NR-20 · Inflamáveis
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-23" className="hover:text-[#F5C518] transition-colors">
                  NR-23 · Incêndio
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-33" className="hover:text-[#F5C518] transition-colors">
                  NR-33 · Confinado
                </Link>
              </li>
              <li>
                <Link to="/cursos/nr-35" className="hover:text-[#F5C518] transition-colors">
                  NR-35 · Altura
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Institucional</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/aluno" className="hover:text-[#F5C518] transition-colors">
                  Área do Aluno
                </Link>
              </li>
              <li>
                <Link to="/validar" className="hover:text-[#F5C518] transition-colors">
                  Validar Certificado
                </Link>
              </li>
              <li>
                <Link to="/empresas" className="hover:text-[#F5C518] transition-colors">
                  Treinamento para Empresas
                </Link>
              </li>
              <li>
                <a href="/#documentacao" className="hover:text-[#F5C518] transition-colors">
                  APR e PGR Online
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span>
            © {new Date().getFullYear()} {settings.companyName || '4k Treinamentos'}. Todos os direitos reservados.
          </span>

          {/* Discreet centered Admin link */}
          <Link
            to="/admin"
            className="text-slate-400 hover:text-[#F5C518] transition-colors underline-offset-4 hover:underline"
          >
            Painel Admin
          </Link>

          <span>Pagamentos via InfinitePay · Certificação Digital</span>
        </div>
      </div>
    </footer>
  );
}
