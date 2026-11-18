import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Layers,
  Search,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { CertificateSpecimen } from '../components/CertificateSpecimen';
import { CourseCard } from '../components/CourseCard';
import { SafetyDocsSection } from '../components/SafetyDocsSection';
import { useAuth } from '../context/AuthContext';
import {
  CORPORATE_TEAM_URL,
  formatCurrencyBRL,
  formatInstallmentBRL,
  HERO_IMAGE_URL,
  INSTRUCTOR_PORTRAIT_URL,
} from '../data/seedCourses';
import { fetchFunnelOffers, fetchTestimonials, submitCorporateQuote } from '../lib/firestoreService';
import type { Course, FunnelOffer, PublicSettings, Testimonial } from '../types';

interface HomePageProps {
  courses: Course[];
  settings: PublicSettings;
  loadingCourses: boolean;
}

type CategoryFilter = 'all' | 'altura' | 'industria' | 'incendio_obra';

const FILTER_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todas as NRs' },
  { id: 'altura', label: 'Altura & Confinado' },
  { id: 'industria', label: 'Elétrica, Cargas & Máquinas' },
  { id: 'incendio_obra', label: 'Incêndio, Obra & EPI' },
];

const STEPS = [
  {
    num: '01',
    title: 'Escolha a Norma',
    desc: 'Selecione a NR exigida pela função ou obra e finalize a matrícula em segundos por Pix ou cartão via InfinitePay.',
  },
  {
    num: '02',
    title: 'Estude no seu ritmo',
    desc: 'Acesse módulos teóricos, apostilas em PDF e videoaulas diretamente na Área do Aluno em computador ou celular.',
  },
  {
    num: '03',
    title: 'Prova formal objetiva',
    desc: 'Responda às questões técnicas da norma e comprove aproveitamento igual ou superior a 70%.',
  },
  {
    num: '04',
    title: 'Certificado em PDF',
    desc: 'Emita instantaneamente o documento assinado pelo engenheiro instrutor com código público de validação.',
  },
];

const COMPLIANCE_ROWS = [
  {
    norm: 'NR-01 · GRO / PGR',
    requirement: 'Capacitação em Segurança e Saúde no Trabalho em modalidade EAD',
    evidence: 'Registro de horas, conteúdo programático e avaliação formal arquivada',
  },
  {
    norm: 'NR-35 · Trabalho em Altura',
    requirement: 'Reciclagem bienal (24 meses) para atividades acima de 2,00 m',
    evidence: 'Análise de Risco (AR), ZLQ, Fator de Queda e noções de resgate',
  },
  {
    norm: 'NR-33 · Espaços Confinados',
    requirement: 'Reciclagem anual (12 meses) para Trabalhador Autorizado e Vigia',
    evidence: 'Monitoramento atmosférico (O2, LEL, CO, H2S), PET e plano de salvamento',
  },
  {
    norm: 'NR-10 Básico · Eletricidade',
    requirement: 'Capacitação básica de 40h (Anexo III) para intervenção em instalações elétricas',
    evidence: 'Medidas de controle, desenergização em 6 etapas, riscos elétricos e resgate',
  },
  {
    norm: 'NR-20 & NR-23 · Inflamáveis e Incêndio',
    requirement: 'Controle de atmosferas inflamáveis e prevenção/combate a princípios de incêndio',
    evidence: 'Classificação de fogos (A/B/C/D/K), extintores, ponto de fulgor e plano de emergência',
  },
  {
    norm: 'eSocial · Tabela 28 / S-2240',
    requirement: 'Comprovação documental de treinamentos obrigatórios em auditorias',
    evidence: 'Código único de validação em /validar + assinatura técnica CREA/MTE',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Precisávamos regularizar a integração de 18 montadores para acesso a uma planta industrial em Cubatão. A equipe fez NR-35 e NR-18 no mesmo fim de semana e apresentamos os certificados com código de validação na portaria sem nenhuma ressalva.',
    author: 'Marcelo Vasconcelos',
    role: 'Técnico de Segurança do Trabalho',
    company: 'Construtora Vale Verde',
  },
  {
    quote:
      'O conteúdo da NR-33 e da NR-12 é direto ao ponto, sem enrolação. A prova formal realmente cobra leitura das medidas de segurança e o PDF gerado já traz registro profissional completo do instrutor.',
    author: 'Fernanda Albuquerque',
    role: 'Supervisora de Manutenção Industrial',
    company: 'Metalúrgica São Bento',
  },
  {
    quote:
      'Como autônomo em manutenção predial e energia solar, perdia dias de serviço para renovar NR-35 presencial. Pela 4k Treinamentos consegui estudar à noite, passar na prova e enviar o certificado ao cliente no mesmo dia.',
    author: 'Rogério Teixeira',
    role: 'Instalador Fotovoltaico',
    company: 'RT Energia Solar',
  },
];

export function HomePage({ courses, settings, loadingCourses }: HomePageProps) {
  const { user, profile } = useAuth();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [combos, setCombos] = useState<FunnelOffer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchFunnelOffers(true).then((offers) => {
      setCombos(offers.filter((o) => o.type === 'combo'));
    });
    fetchTestimonials(undefined, true).then((items) => {
      setTestimonials(items.slice(0, 3));
    });
    if (window.location.hash === '#documentacao') {
      setTimeout(() => {
        document.getElementById('documentacao')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  // Corporate quote form state
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [employeeCount, setEmployeeCount] = useState('15');
  const [selectedNrs, setSelectedNrs] = useState<string[]>(['NR-35']);
  const [notes, setNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const nr = c.nrCode.toUpperCase();
      const matchesTab =
        filter === 'all' ||
        (filter === 'altura' && (nr.includes('35') || nr.includes('33'))) ||
        (filter === 'industria' && (nr.includes('10') || nr.includes('11') || nr.includes('12'))) ||
        (filter === 'incendio_obra' &&
          (nr.includes('20') || nr.includes('23') || nr.includes('18') || nr.includes('06')));

      const q = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.nrCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [courses, filter, searchTerm]);

  const featuredSpotlight = useMemo(() => {
    return (
      courses.find((c) => c.id === 'nr-35-40h') ||
      courses.find((c) => c.nrCode.includes('35')) ||
      courses[0] ||
      null
    );
  }, [courses]);

  function toggleNr(nrCode: string) {
    setSelectedNrs((prev) =>
      prev.includes(nrCode) ? prev.filter((item) => item !== nrCode) : [...prev, nrCode]
    );
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast.error('Preencha os campos obrigatórios da empresa e contato.');
      return;
    }
    if (selectedNrs.length === 0) {
      toast.error('Selecione ao menos uma NR de interesse.');
      return;
    }
    setSubmittingQuote(true);
    try {
      const id = `quote_${Date.now()}`;
      await submitCorporateQuote({
        id,
        companyName: companyName.trim(),
        ...(cnpj.trim() ? { cnpj: cnpj.trim() } : {}),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        coursesInterest: selectedNrs,
        employeeCount: Math.max(1, Number(employeeCount) || 1),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        status: 'new',
      });
      setQuoteSuccess(true);
      toast.success('Solicitação de orçamento enviada. Nossa equipe entrará em contato.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setSubmittingQuote(false);
    }
  }

  return (
    <main className="bg-[#F7F9FC] text-[#0A2540]">
      {/* 1. HERO CORPORATIVO DE ALTA CONVERSÃO */}
      <section className="bg-navy-grid text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 lg:pt-14 lg:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Copy & Quick NR Access */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-between gap-7"
            >
              <div className="space-y-4">
                <p className="text-xs font-mono font-semibold text-[#F5C518] tracking-wider uppercase">
                  Engenharia & Segurança do Trabalho · Portaria MTP 672/2021
                </p>

                <h1
                  className="font-display font-extrabold tracking-tight text-white leading-[1.06]"
                  style={{ fontSize: 'clamp(2.2rem, 4.1vw, 3.65rem)', textWrap: 'balance' }}
                >
                  {settings.heroTitle}
                </h1>

                <p className="text-base sm:text-lg text-slate-200/95 leading-relaxed max-w-2xl">
                  {settings.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href="#cursos"
                    className="btn-sheen inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 active:scale-[0.98] text-[#0A2540] font-extrabold text-sm rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 shadow-[0_12px_28px_-8px_rgba(245,197,24,0.55)]"
                  >
                    Ver Cursos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    to="/validar"
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-white/[0.04] backdrop-blur-sm border border-white/25 hover:border-white hover:bg-white/[0.12] hover:-translate-y-0.5 text-white font-semibold text-sm rounded-lg transition-all duration-200 whitespace-nowrap shrink-0"
                  >
                    <FileCheck2 className="w-4 h-4 text-[#F5C518]" />
                    Validar Certificado
                  </Link>
                </div>
              </div>

              {/* Direct NR Quick-Access Strip */}
              <div className="pt-5 border-t border-white/15 space-y-3">
                <p className="text-xs font-medium text-slate-300">
                  Acesso direto aos treinamentos NR disponíveis (incluindo Formação 40h e Reciclagem):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {courses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/cursos/${c.slug}`}
                      className="group p-2.5 bg-[#0F2C59]/85 backdrop-blur-sm hover:bg-[#153B75] border border-white/10 hover:border-[#F5C518]/80 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#F5C518]">{c.nrCode}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#F5C518] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5 truncate">{c.title}</p>
                      <p className="font-mono text-xs font-bold text-white mt-1 tabular-nums">
                        {formatCurrencyBRL(c.priceCents)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Documentary Photography & Technical Authority */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col gap-4"
            >
              <div className="group relative flex-1 min-h-[280px] rounded-2xl overflow-hidden border border-white/15 bg-[#0F2C59] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.55)]">
                <img
                  src={HERO_IMAGE_URL}
                  alt="Engenheira de segurança do trabalho realizando inspeção técnica em obra com uniforme 4k Treinamentos"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071B30]/92 via-[#0A2540]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-100">
                  <span className="font-medium">Conteúdo teórico conforme NR-01</span>
                  <span className="font-mono text-[#F5C518] font-bold">100% Online</span>
                </div>
              </div>

              {/* Technical Responsibility Card */}
              <div className="bg-white/[0.06] backdrop-blur-md border border-white/15 hover:border-[#F5C518]/45 rounded-2xl p-4 flex items-center gap-4 transition-colors duration-200">
                <img
                  src={INSTRUCTOR_PORTRAIT_URL}
                  alt={settings.defaultInstructorName || 'Eng. Carlos Eduardo Mendes'}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-white/25 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-mono font-semibold text-[#F5C518] uppercase tracking-wider">
                    Responsável Técnico
                  </p>
                  <p className="font-display font-bold text-sm text-white truncate">
                    {settings.defaultInstructorName || 'Eng. Carlos Eduardo Mendes'}
                  </p>
                  <p className="font-mono text-xs text-slate-300 truncate">
                    {settings.defaultInstructorRegistry || 'CREA-SP 5069821470 · MTE 0041289'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 4-Column Authority & Operations Strip */}
        <div className="bg-[#081F37]/90 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
              <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#F5C518]/50 transition-colors">
                <FileCheck2 className="w-4 h-4 text-[#F5C518]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Base Legal NR-01 (item 1.7)</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conteúdo teórico estruturado em conformidade com as normas do MTE.
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
              <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#F5C518]/50 transition-colors">
                <Award className="w-4 h-4 text-[#F5C518]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Assinatura de Engenheiro</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Certificados emitidos com registro CREA/MTE ativo e validação pública.
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
              <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#F5C518]/50 transition-colors">
                <ClipboardCheck className="w-4 h-4 text-[#F5C518]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Avaliação Formal Obrigatória</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Prova objetiva com nota mínima de 70% registrada no histórico do aluno.
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-200">
              <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#F5C518]/50 transition-colors">
                <ShieldCheck className="w-4 h-4 text-[#F5C518]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Liberação via InfinitePay</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Pagamento por Pix ou cartão com matrícula automática após confirmação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO OFICIAL DE CURSOS & COMBOS */}
      <section id="cursos" className="py-14 lg:py-20 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <p className="text-xs font-mono font-bold text-[#0F2C59] tracking-wider uppercase">
                Catálogo Oficial de Cursos NR
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
                Capacitação técnica por Norma Regulamentadora
              </h2>
            </div>

            {/* Search & Clean Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative group">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#0A2540] transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar NR ou tema..."
                  className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0A2540] w-full sm:w-60 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-[#0A2540] transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0A2540] rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/75 border border-slate-200/80 rounded-xl overflow-x-auto">
                {FILTER_TABS.map((t) => {
                  const active = filter === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFilter(t.id)}
                      className={`relative px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active ? 'text-white' : 'text-slate-700 hover:text-[#0A2540]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="catalogFilterPill"
                          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                          className="absolute inset-0 bg-[#0A2540] rounded-lg shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Featured Spotlight (NR-35) */}
          {!loadingCourses && filter === 'all' && !searchTerm && featuredSpotlight && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white border border-slate-200/90 hover:border-[#0A2540]/30 rounded-2xl overflow-hidden shadow-[0_14px_40px_-16px_rgba(10,37,64,0.12)] hover:shadow-[0_24px_54px_-16px_rgba(10,37,64,0.18)] transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-5 relative min-h-[250px] bg-[#0A2540] overflow-hidden">
                <img
                  src={featuredSpotlight.coverImageUrl}
                  alt={featuredSpotlight.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071B30]/92 via-[#0A2540]/20 to-transparent" />
                <div className="absolute bottom-4 left-5 text-xs font-mono text-[#F5C518] font-bold">
                  MAIS PROCURADO · {featuredSpotlight.nrCode}
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono">
                    <span className="font-bold text-[#0A2540]">{featuredSpotlight.nrCode}</span>
                    <span>·</span>
                    <span className="tabular-nums">{featuredSpotlight.workloadHours}h carga horária</span>
                    <span>·</span>
                    <span className="tabular-nums">Validade {featuredSpotlight.certificateValidityMonths} meses</span>
                  </div>

                  <h3 className="font-display text-2xl font-extrabold text-[#0A2540]">
                    {featuredSpotlight.nrCode} – {featuredSpotlight.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {featuredSpotlight.shortDescription}
                  </p>

                  {featuredSpotlight.learningOutcomes && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {featuredSpotlight.learningOutcomes.slice(0, 4).map((out, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Matrícula imediata</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-extrabold text-[#0A2540] tabular-nums">
                        {formatCurrencyBRL(featuredSpotlight.priceCents)}
                      </span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        ou {formatInstallmentBRL(featuredSpotlight.priceCents)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to={`/cursos/${featuredSpotlight.slug}`}
                      className="inline-flex items-center justify-center min-h-[44px] px-4 py-3 border border-slate-300 hover:border-[#0A2540] hover:bg-slate-50 text-[#0A2540] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Ver programa
                    </Link>
                    <Link
                      to={`/cursos/${featuredSpotlight.slug}`}
                      className="btn-sheen inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 active:scale-[0.98] text-[#0A2540] text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap shadow-[0_8px_20px_-6px_rgba(245,197,24,0.6)]"
                    >
                      Matricular-se agora
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Course Cards Grid */}
          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[420px] bg-white border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
              <p className="font-display font-bold text-[#0A2540]">Nenhum curso encontrado para este filtro</p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="text-sm font-semibold text-[#0F2C59] underline cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <CourseCard key={course.id} course={course} index={idx} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Promotional Combos & Packages */}
          {combos.length > 0 && (
            <div className="pt-10 border-t border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-mono font-bold text-[#0F2C59] tracking-wider uppercase">
                    Pacotes e Combos Promocionais
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight mt-1">
                    Regularize mais de uma NR com desconto direto
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-600">
                  Certificados individuais por norma inclusos
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {combos.map((combo) => {
                  const included = courses.filter((c) => combo.includedCourseIds.includes(c.id));
                  const savings = Math.max(0, combo.originalPriceCents - combo.offerPriceCents);

                  return (
                    <div
                      key={combo.id}
                      className="bg-navy-grid text-white border border-white/15 hover:border-[#F5C518]/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-[0_16px_40px_-16px_rgba(10,37,64,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 text-xs font-mono">
                          <span className="text-[#F5C518] font-bold inline-flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {combo.badgeLabel || `${combo.includedCourseIds.length} CURSOS NO PACOTE`}
                          </span>
                          {savings > 0 && (
                            <span className="text-emerald-300 font-bold tabular-nums">
                              Economize {formatCurrencyBRL(savings)}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                            {combo.title}
                          </h4>
                          {combo.subtitle && (
                            <p className="text-xs sm:text-sm text-[#F5C518] mt-1 font-medium">{combo.subtitle}</p>
                          )}
                          <p className="text-sm text-slate-300 leading-relaxed mt-2">{combo.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {(included.length > 0
                            ? included.map((c) => `${c.nrCode} – ${c.title} (${c.workloadHours}h)`)
                            : combo.includedCourseIds.map((id) => id.toUpperCase())
                          ).map((label, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-baseline gap-2.5">
                            {combo.originalPriceCents > combo.offerPriceCents && (
                              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                                {formatCurrencyBRL(combo.originalPriceCents)}
                              </span>
                            )}
                            <span className="font-mono text-2xl font-extrabold text-white tabular-nums">
                              {formatCurrencyBRL(combo.offerPriceCents)}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                            ou em até {formatInstallmentBRL(combo.offerPriceCents)}
                          </span>
                        </div>

                        <Link
                          to={`/checkout/combo/${combo.id}`}
                          className="btn-sheen inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 text-[#0A2540] text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 shadow-[0_8px_20px_-6px_rgba(245,197,24,0.6)]"
                        >
                          Aproveitar pacote
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. SERVIÇOS DE DOCUMENTAÇÃO TÉCNICA (APR E PGR) */}
      <SafetyDocsSection
        userId={user?.uid}
        defaultName={profile?.name || user?.displayName || ''}
        defaultEmail={user?.email || ''}
      />

      {/* 4. INTERACTIVE CERTIFICATE SPECIMEN (FRONT + BACK) */}
      <CertificateSpecimen courses={courses} settings={settings} />

      {/* 4. COMO FUNCIONA EM 4 ETAPAS */}
      <section id="como-funciona" className="py-16 lg:py-20 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <p className="text-xs font-mono font-bold text-[#0F2C59] tracking-wider uppercase">
              Fluxo de Certificação
            </p>
            <h2 className="font-display text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Processo objetivo em 4 etapas verificáveis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.34, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-white border border-slate-200/90 hover:border-[#0A2540]/30 rounded-2xl p-6 space-y-3 shadow-[0_6px_24px_-8px_rgba(10,37,64,0.06)] hover:shadow-[0_20px_40px_-16px_rgba(10,37,64,0.16)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="w-9 h-9 rounded-lg bg-[#0A2540] group-hover:bg-[#F5C518] text-[#F5C518] group-hover:text-[#0A2540] font-mono text-sm font-extrabold flex items-center justify-center transition-colors duration-200">
                    {step.num}
                  </span>
                  <span className="text-xs font-mono text-slate-400">ETAPA</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#0A2540]">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROVA SOCIAL, MÉTRICAS & CONFORMIDADE NORMATIVA */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Authority Numbers Strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-grid text-white rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_-16px_rgba(10,37,64,0.38)] border border-white/10"
          >
            <div className="flex items-center gap-4">
              <Award className="w-9 h-9 text-[#F5C518] shrink-0" />
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums">+12.400</p>
                <p className="text-xs text-slate-300">Profissionais certificados em todo o Brasil</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-white/15 md:pl-6">
              <ShieldCheck className="w-9 h-9 text-[#F5C518] shrink-0" />
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums">98,6%</p>
                <p className="text-xs text-slate-300">Aprovação documental em portarias e auditorias</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-white/15 md:pl-6">
              <Star className="w-9 h-9 text-[#F5C518] fill-[#F5C518] shrink-0" />
              <div>
                <p className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums">4,9 / 5,0</p>
                <p className="text-xs text-slate-300">Avaliação média dos alunos e técnicos de segurança</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs font-mono font-bold text-[#0F2C59] tracking-wider uppercase">
                Rigor Normativo e eSocial
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
                Alinhado às exigências de auditoria e SESMT
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cada curso respeita integralmente a carga horária mínima, periodicidade de reciclagem e comprovação de avaliação formal exigidas pelo Ministério do Trabalho.
              </p>
            </div>

            <div className="lg:col-span-8 bg-[#F7F9FC] border border-slate-200 rounded-2xl overflow-x-auto shadow-[0_8px_28px_-12px_rgba(10,37,64,0.08)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0A2540] text-white text-xs uppercase font-mono">
                  <tr>
                    <th className="py-3.5 px-4">Norma / Base</th>
                    <th className="py-3.5 px-4">Exigência Legal</th>
                    <th className="py-3.5 px-4">Evidência Emitida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COMPLIANCE_ROWS.map((row) => (
                    <tr key={row.norm} className="bg-white hover:bg-[#F7F9FC] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#0A2540] whitespace-nowrap">
                        {row.norm}
                      </td>
                      <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-700">{row.requirement}</td>
                      <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real Field Testimonials */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <h3 className="font-display text-2xl font-extrabold text-[#0A2540]">
                Quem aplica em obra e indústria aprova
              </h3>
              <span className="text-xs font-mono text-slate-500">Relatos verificados de profissionais e empresas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(testimonials.length > 0
                ? testimonials.map((t) => ({
                    quote: t.quote,
                    author: t.authorName,
                    role: t.authorRole,
                    company: t.company,
                    rating: t.rating,
                  }))
                : TESTIMONIALS.map((t) => ({ ...t, rating: 5 }))
              ).map((item, idx) => (
                <motion.blockquote
                  key={item.author}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#F7F9FC] border border-slate-200/90 hover:border-[#0A2540]/25 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:shadow-[0_16px_36px_-14px_rgba(10,37,64,0.12)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#F5C518]">
                      {Array.from({ length: Math.min(5, Math.max(1, item.rating || 5)) }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">“{item.quote}”</p>
                  </div>
                  <footer className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-bold text-[#0A2540]">{item.author}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.role} · <span className="font-semibold text-[#0F2C59]">{item.company}</span>
                    </p>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. ATENDIMENTO CORPORATIVO & SESMT */}
      <section id="empresas" className="py-16 lg:py-22 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs font-mono font-bold text-[#0F2C59] tracking-wider uppercase">
                  Atendimento Corporativo e SESMT
                </p>
                <h2 className="font-display text-3xl font-extrabold text-[#0A2540] tracking-tight">
                  Treinamento em lote para equipes e terceirizados
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Regularize frentes de trabalho completas com pacotes por volume, acompanhamento centralizado de aprovações e emissão de documentação em lote.
                </p>
              </div>

              <div className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10] bg-[#0A2540] shadow-[0_14px_34px_-14px_rgba(10,37,64,0.22)]">
                <img
                  src={CORPORATE_TEAM_URL}
                  alt="Equipe industrial uniformizada com a marca 4k Treinamentos"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071B30]/90 via-transparent to-transparent" />
                <p className="absolute bottom-3.5 left-4 right-4 text-xs text-white font-medium">
                  Capacitação padronizada para indústrias, construtoras e prestadores de serviço
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_14px_40px_-16px_rgba(10,37,64,0.08)]">
              {quoteSuccess ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <ShieldCheck className="w-12 h-12 text-emerald-600" />
                  <h3 className="font-display text-xl font-bold text-[#0A2540]">
                    Solicitação registrada com sucesso
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md">
                    Nossa equipe recebeu os dados da <strong>{companyName}</strong> e enviará a proposta comercial para {contactEmail}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteSuccess(false);
                      setCompanyName('');
                      setNotes('');
                    }}
                    className="px-4 py-2 text-sm font-semibold text-[#0A2540] border border-[#0F2C59] rounded-lg hover:bg-[#0A2540]/5 cursor-pointer"
                  >
                    Enviar nova solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-lg font-bold text-[#0A2540]">
                      Solicitar orçamento empresarial
                    </h3>
                    <Link to="/empresas" className="text-xs font-semibold text-[#0F2C59] hover:text-[#0A2540] underline">
                      Ver detalhes B2B
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Razão social ou nome fantasia"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ (opcional)</label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail corporativo *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="sesmt@empresa.com.br"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Qtd. de colaboradores *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">NRs desejadas *</label>
                    <div className="flex flex-wrap gap-2">
                      {['NR-06', 'NR-10', 'NR-11', 'NR-12', 'NR-18', 'NR-20', 'NR-23', 'NR-33', 'NR-35'].map((nr) => {
                        const active = selectedNrs.includes(nr);
                        return (
                          <button
                            key={nr}
                            type="button"
                            onClick={() => toggleNr(nr)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#0A2540] text-white border-[#0A2540]'
                                : 'bg-white text-[#0A2540] border-slate-300 hover:border-[#0A2540]'
                            }`}
                          >
                            {nr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Observações (opcional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Prazo da obra, necessidade de NR-01 / OS, faturamento por boleto/NF..."
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {submittingQuote ? 'Enviando...' : 'Solicitar proposta para equipe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA & CONTACT */}
      <section id="contato" className="py-16 bg-navy-grid text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inicie sua capacitação agora ou fale com nosso suporte técnico
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              Atendimento direto: {settings.email} {settings.phone ? `· ${settings.phone}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="#cursos"
              className="btn-sheen inline-flex items-center justify-center min-h-[46px] px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 text-[#0A2540] font-extrabold text-sm rounded-lg transition-all duration-200 whitespace-nowrap shadow-[0_10px_24px_-8px_rgba(245,197,24,0.6)]"
            >
              Escolher curso agora
            </a>
            <Link
              to="/aluno"
              className="inline-flex items-center justify-center min-h-[46px] px-5 py-3 bg-white/[0.04] border border-white/25 hover:border-white hover:bg-white/[0.12] text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              Acessar Área do Aluno
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

