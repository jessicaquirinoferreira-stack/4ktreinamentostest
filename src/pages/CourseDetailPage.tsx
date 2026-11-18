import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMotionValueEvent, useScroll } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileCheck2,
  Gift,
  Loader2,
  Lock,
  MinusCircle,
  QrCode,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrencyBRL,
  formatInstallmentBRL,
  getNrFamilyKey,
  INSTRUCTOR_PORTRAIT_URL,
} from '../data/seedCourses';
import {
  attachCheckoutUrlToOrder,
  createPendingOrder,
  fetchCourseBySlug,
  fetchCourseModules,
  fetchFunnelOffers,
  fetchPublishedCourses,
  fetchTestimonials,
  releaseOrderAndEnrollAdmin,
} from '../lib/firestoreService';
import {
  createInfinitePayPaymentLink,
  generateOrderNsu,
  saveLastInfinitePayOrder,
} from '../lib/infinitepayClient';
import type { Course, CourseModule, FunnelOffer, Testimonial } from '../types';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile, isAdmin, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const { scrollY } = useScroll();

  const [course, setCourse] = useState<Course | null>(null);
  const [siblingVariants, setSiblingVariants] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [combos, setCombos] = useState<FunnelOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingTest, setBuyingTest] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [openModuleIdx, setOpenModuleIdx] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Student Account & Payment Method state for Course Detail checkout
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerCpf, setBuyerCpf] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

  useEffect(() => {
    if (user) {
      setBuyerName((prev) => prev || profile?.name || user.displayName || '');
      setBuyerEmail((prev) => prev || user.email || '');
      setBuyerCpf((prev) => prev || profile?.cpf || '');
    }
  }, [user, profile]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShowStickyCta(latest > 520);
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchCourseBySlug(slug), fetchPublishedCourses()])
      .then(async ([found, publishedList]) => {
        setCourse(found);
        if (found) {
          const familyKey = getNrFamilyKey(found.id);
          const siblings = publishedList
            .filter((c) => getNrFamilyKey(c.id) === familyKey)
            .sort((a, b) => b.workloadHours - a.workloadHours);
          setSiblingVariants(siblings);

          const [mods, tests, offers] = await Promise.all([
            fetchCourseModules(found.id),
            fetchTestimonials(found.id, true),
            fetchFunnelOffers(true),
          ]);
          setModules(mods);
          setTestimonials(tests);
          setCombos(
            offers.filter(
              (o) =>
                o.type === 'combo' &&
                (o.includedCourseIds.includes(found.id) ||
                  o.triggerCourseId === found.id ||
                  o.includedCourseIds.some((cid) => getNrFamilyKey(cid) === familyKey))
            )
          );
        } else {
          setSiblingVariants([]);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAdminTestEnroll() {
    if (!course || !user) return;
    setBuyingTest(true);
    try {
      const orderId = `ord_test_${Date.now()}`;
      const orderPayload = {
        id: orderId,
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Admin Teste',
        userEmail: user.email || '',
        courseId: course.id,
        courseIds: [course.id],
        courseTitle: `${course.nrCode} - ${course.title}`,
        amountCents: course.priceCents,
        status: 'pending' as const,
        paymentProvider: 'infinitepay',
        createdAt: null,
        updatedAt: null,
      };
      await createPendingOrder({
        id: orderPayload.id,
        userId: orderPayload.userId,
        userName: orderPayload.userName,
        userEmail: orderPayload.userEmail,
        courseId: orderPayload.courseId,
        courseIds: orderPayload.courseIds,
        courseTitle: orderPayload.courseTitle,
        amountCents: orderPayload.amountCents,
        status: 'pending',
        paymentProvider: 'infinitepay',
      });
      await releaseOrderAndEnrollAdmin(orderPayload);
      toast.success('Matrícula de teste liberada! Redirecionando para Área do Aluno...');
      navigate('/aluno');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao liberar matrícula de teste.');
    } finally {
      setBuyingTest(false);
    }
  }

  async function tryAuthenticateIfProvided() {
    if (user) return user;
    if (!buyerEmail.trim() || !buyerPassword) {
      return null;
    }
    try {
      if (authTab === 'register') {
        return await registerWithEmail(
          buyerName.trim() || 'Aluno 4k',
          buyerEmail.trim(),
          buyerPassword,
          buyerCpf.trim()
        );
      }
      return await loginWithEmail(buyerEmail.trim(), buyerPassword);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        return null;
      }
      throw err;
    }
  }

  function scrollToCheckout() {
    const el = document.getElementById('curso-checkout-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = el.querySelector('input');
      if (input) input.focus();
    }
  }

  async function handlePayAndCheckout(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (!course || startingCheckout) return;
    setStartingCheckout(true);
    try {
      const authedUser = await tryAuthenticateIfProvided();
      const customerName =
        buyerName.trim() || profile?.name || authedUser?.displayName || 'Aluno 4k';
      const customerEmail = buyerEmail.trim() || authedUser?.email || '';

      const courseDescription = `${course.nrCode} – ${course.title}`.slice(0, 120);
      const priceCents = Math.round(Number(course.priceCents));
      const orderId = generateOrderNsu(course.nrCode || course.slug);

      if (authedUser?.uid) {
        await createPendingOrder({
          id: orderId,
          userId: authedUser.uid,
          userName: customerName,
          userEmail: customerEmail,
          courseId: course.id,
          courseIds: [course.id],
          courseTitle: courseDescription,
          itemsSummary: [
            {
              id: course.id,
              title: courseDescription,
              priceCents,
              kind: 'course',
            },
          ],
          amountCents: priceCents,
          status: 'pending',
          paymentProvider: 'infinitepay',
        }).catch(() => {});
      }

      saveLastInfinitePayOrder({
        order_nsu: orderId,
        courseId: course.id,
        courseTitle: courseDescription,
        priceCents,
        createdAt: new Date().toISOString(),
      });

      const { url } = await createInfinitePayPaymentLink({
        orderId,
        items: [
          {
            description: courseDescription,
            price: priceCents,
            quantity: 1,
          },
        ],
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        redirectPath: '/obrigado',
        orderMeta: authedUser?.uid
          ? {
              userId: authedUser.uid,
              userName: customerName,
              userEmail: customerEmail,
              courseIds: [course.id],
              courseTitle: courseDescription,
              amountCents: priceCents,
            }
          : undefined,
      });

      if (authedUser?.uid) {
        await attachCheckoutUrlToOrder(orderId, url).catch(() => {});
      }

      const newWin = window.open(url, '_blank');
      if (!newWin) {
        window.location.href = url;
      } else {
        toast.success('Checkout da InfinitePay aberto em uma nova aba!');
        setStartingCheckout(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar o pagamento pela InfinitePay. Tente novamente.'
      );
      setStartingCheckout(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-80 bg-slate-200 rounded-xl animate-pulse mb-8" />
        <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">Curso não encontrado</h1>
        <p className="text-sm text-slate-600">O treinamento solicitado não está disponível ou foi movido.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white text-sm font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos cursos
        </Link>
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const originalCents =
    course.originalPriceCents && course.originalPriceCents > course.priceCents
      ? course.originalPriceCents
      : Math.round(course.priceCents * 1.45);
  const discountPercent = Math.round(((originalCents - course.priceCents) / originalCents) * 100);
  const guaranteeDays = course.guaranteeDays ?? 7;

  return (
    <main className="bg-[#F7F9FC] text-[#0A2540] pb-24">
      {/* 1. HIGH-CONVERSION SALES HERO */}
      <section className="bg-navy-grid text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao catálogo de NRs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#F5C518] font-bold">
                <span>{course.nrCode}</span>
                <span aria-hidden="true">·</span>
                <span>{course.promoTag || 'Certificado válido em todo o Brasil'}</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                {course.salesHeadline || `${course.nrCode} – ${course.title}`}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                {course.salesSubheadline || course.shortDescription}
              </p>

              {/* Social proof & specs bar */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-200 pt-1">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#F5C518] tabular-nums">
                  <Star className="w-4 h-4 fill-[#F5C518] text-[#F5C518]" />
                  {(course.ratingAverage || 4.9).toFixed(1)} ({course.ratingCount || 240} avaliações)
                </span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Users className="w-4 h-4 text-slate-300" />
                  +{(course.enrolledCount || 1200).toLocaleString('pt-BR')} profissionais formados
                </span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-4 h-4 text-slate-300" />
                  {course.workloadHours}h carga horária
                </span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>Validade {course.certificateValidityMonths} meses</span>
              </div>

              {/* Instructor Authority Block */}
              <div className="pt-5 flex flex-wrap items-center gap-4 border-t border-white/15">
                <img
                  src={INSTRUCTOR_PORTRAIT_URL}
                  alt={course.instructorName || 'Eng. Carlos Eduardo Mendes'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-white/20"
                />
                <div className="text-xs text-slate-200">
                  <span className="block text-slate-400">Responsável Técnico e Instrutor</span>
                  <strong className="text-sm text-white block">
                    {course.instructorName || 'Eng. Carlos Eduardo Mendes'}
                  </strong>
                  <span className="font-mono text-[#F5C518]">
                    {course.instructorRegistry || 'CREA-SP 5069821470 · MTE 0041289'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Purchase Card */}
            <div className="lg:col-span-5 bg-white text-[#0A2540] rounded-xl border border-slate-200 overflow-hidden shadow-xl">
              {course.coverImageUrl && (
                <div className="relative aspect-[16/9] bg-[#0A2540] overflow-hidden">
                  <img
                    src={course.coverImageUrl}
                    alt={`${course.nrCode} – ${course.title}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-[#0A2540]/15 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="font-mono font-bold text-[#F5C518]">
                      {course.nrCode} · {course.workloadHours}h Oficiais
                    </span>
                    <span className="font-mono text-emerald-300 font-semibold">
                      Certificado Digital PDF
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                {siblingVariants.length > 1 && (
                  <div className="space-y-2 pb-4 border-b border-slate-100">
                    <span className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider block">
                      Escolha a carga horária / modalidade
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {siblingVariants.map((variant) => {
                        const isSelected = variant.id === course.id;
                        const is40h = variant.workloadHours === 40;
                        const variantLabel = is40h
                          ? `Formação · ${variant.workloadHours}h`
                          : `Reciclagem · ${variant.workloadHours}h`;
                        return (
                          <Link
                            key={variant.id}
                            to={`/cursos/${variant.slug}`}
                            aria-current={isSelected ? 'page' : undefined}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              isSelected
                                ? 'border-[#0A2540] bg-[#0A2540] text-white'
                                : 'border-slate-200 bg-[#F7F9FC] hover:border-[#0A2540] text-[#0A2540]'
                            }`}
                          >
                            <span
                              className={`block text-xs font-bold whitespace-nowrap ${
                                isSelected ? 'text-[#F5C518]' : 'text-[#0F2C59]'
                              }`}
                            >
                              {variantLabel}
                            </span>
                            <span className="block font-mono text-sm font-extrabold tabular-nums mt-0.5">
                              {formatCurrencyBRL(variant.priceCents)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="line-through font-mono tabular-nums">
                      De {formatCurrencyBRL(originalCents)}
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      Economia de {discountPercent}% hoje
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#0A2540] tabular-nums">
                      {formatCurrencyBRL(course.priceCents)}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">à vista no Pix</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono tabular-nums">
                    ou em até {formatInstallmentBRL(course.priceCents)} no cartão
                  </p>
                </div>

                <form onSubmit={handlePayAndCheckout} id="curso-checkout-form" className="space-y-4">
                  {/* Student account / login info */}
                  <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-xs font-mono font-bold text-[#0A2540] uppercase">
                        Área do Aluno & Certificado
                      </span>
                      {user ? (
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold">Conectado</span>
                      ) : (
                        <div className="flex gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setAuthTab('register')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              authTab === 'register' ? 'bg-[#0A2540] text-white font-bold' : 'text-slate-600'
                            }`}
                          >
                            Cadastro
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthTab('login')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              authTab === 'login' ? 'bg-[#0A2540] text-white font-bold' : 'text-slate-600'
                            }`}
                          >
                            Entrar
                          </button>
                        </div>
                      )}
                    </div>

                    {user ? (
                      <div className="space-y-1 text-xs text-slate-700">
                        <p><strong>Aluno:</strong> {profile?.name || user.displayName || buyerName || 'Aluno'}</p>
                        <p className="text-slate-500"><strong>E-mail:</strong> {user.email}</p>
                        <p className="text-[11px] text-emerald-700 font-medium">O curso será liberado automaticamente na sua Área do Aluno.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 gap-2">
                          {authTab === 'register' && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nome completo *</label>
                              <input
                                type="text"
                                required
                                value={buyerName}
                                onChange={(e) => setBuyerName(e.target.value)}
                                placeholder="Nome para o certificado"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">E-mail de acesso *</label>
                            <input
                              type="email"
                              required
                              value={buyerEmail}
                              onChange={(e) => setBuyerEmail(e.target.value)}
                              placeholder="seu@email.com"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Senha (criar ou acessar)</label>
                            <input
                              type="password"
                              minLength={6}
                              value={buyerPassword}
                              onChange={(e) => setBuyerPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment method selection: Pix or Card */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Forma de pagamento (InfinitePay)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                          paymentMethod === 'pix'
                            ? 'border-[#0A2540] bg-[#0A2540] text-white'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <QrCode className={`w-4 h-4 shrink-0 ${paymentMethod === 'pix' ? 'text-[#F5C518]' : 'text-emerald-600'}`} />
                        <div>
                          <span className="block text-xs font-bold">Pix</span>
                          <span className={`block text-[10px] ${paymentMethod === 'pix' ? 'text-slate-300' : 'text-slate-500'}`}>Liberação imediata</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-[#0A2540] bg-[#0A2540] text-white'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 shrink-0 ${paymentMethod === 'card' ? 'text-[#F5C518]' : 'text-[#0F2C59]'}`} />
                        <div>
                          <span className="block text-xs font-bold">Cartão</span>
                          <span className={`block text-[10px] ${paymentMethod === 'card' ? 'text-slate-300' : 'text-slate-500'}`}>Até 12x</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={startingCheckout}
                    className="btn-sheen w-full min-h-[48px] py-3.5 px-5 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 text-[#0A2540] font-extrabold text-sm sm:text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_10px_24px_-8px_rgba(245,197,24,0.55)] cursor-pointer"
                  >
                    {startingCheckout ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Abrindo checkout InfinitePay...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pagar {formatCurrencyBRL(course.priceCents)} ({paymentMethod === 'pix' ? 'Pix' : 'Cartão'})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {isAdmin && user && (
                    <button
                      type="button"
                      disabled={buyingTest}
                      onClick={handleAdminTestEnroll}
                      className="w-full py-2 px-4 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {buyingTest ? 'Liberando...' : 'Admin: Liberar matrícula em modo teste'}
                    </button>
                  )}
                </form>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Liberação imediata na Área do Aluno após Pix ou cartão</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {modules.length} módulos · {totalLessons} aulas + apostila de apoio
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Prova formal (nota mínima {course.passingScore}%) e certificado válido no Brasil
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Garantia incondicional de {guaranteeDays} dias · InfinitePay seguro</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMBO UPGRADE BANNER */}
      {combos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {combos.slice(0, 1).map((combo) => (
            <div
              key={combo.id}
              className="bg-[#0F2C59] text-white border border-white/15 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <span className="font-mono text-xs font-bold text-[#F5C518]">
                  {combo.badgeLabel || 'PACOTE PROMOCIONAL COM DESCONTO'}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {combo.title}
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">{combo.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-mono text-slate-300 line-through block tabular-nums">
                    {formatCurrencyBRL(combo.originalPriceCents)}
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-[#F5C518] tabular-nums">
                    {formatCurrencyBRL(combo.offerPriceCents)}
                  </span>
                </div>
                <Link
                  to={`/checkout/combo/${combo.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] font-extrabold text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  Comprar pacote com desconto
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 2. MAIN SALES FUNNEL SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* About + Learning Outcomes + Bonuses */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Visão Geral do Treinamento
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
                Por que fazer a {course.nrCode} na 4k Treinamentos
              </h2>
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {course.fullDescription}
              </p>
            </div>

            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
                <h3 className="font-display text-xl font-bold text-[#0A2540]">
                  O que você vai dominar neste treinamento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What's Included + Free Bonuses */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Gift className="w-5 h-5 text-[#0F2C59] shrink-0" />
              <h3 className="font-display text-lg font-bold text-[#0A2540]">
                Tudo o que está incluso na sua matrícula
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A2540] shrink-0 mt-0.5" />
                <span>
                  Curso completo {course.nrCode} ({course.workloadHours}h normativas) liberado 24h por dia
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A2540] shrink-0 mt-0.5" />
                <span>Prova formal objetiva com correção instantânea e novas tentativas inclusas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A2540] shrink-0 mt-0.5" />
                <span>
                  Certificado digital em PDF com assinatura do Engenheiro e código em /validar
                </span>
              </li>
              {(course.includedBonuses || []).map((bonus, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-[#0F2C59] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#0A2540]">Bônus:</strong> {bonus}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={startingCheckout}
                onClick={scrollToCheckout}
                className="w-full min-h-[44px] py-3 px-4 bg-[#F5C518] hover:bg-[#E0B20F] disabled:opacity-60 text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Garantir acesso + bônus agora
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Curriculum Accordion */}
        <section className="space-y-5 max-w-4xl">
          <div className="space-y-1.5">
            <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
              Grade Curricular Oficial
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
              Conteúdo programático completo
            </h2>
            <p className="text-sm text-slate-600">
              {modules.length} módulos estruturados · {totalLessons} aulas · Carga horária total de{' '}
              {course.workloadHours} horas
            </p>
          </div>

          <div className="space-y-3">
            {modules.map((mod, mIdx) => {
              const isOpen = openModuleIdx === mIdx;
              return (
                <div key={mod.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenModuleIdx(isOpen ? null : mIdx)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                  >
                    <div>
                      <h3 className="font-display font-bold text-[#0A2540]">{mod.title}</h3>
                      {mod.description && <p className="text-xs text-slate-500 mt-1">{mod.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {mod.lessons.length} {mod.lessons.length === 1 ? 'aula' : 'aulas'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 pb-3">
                      {mod.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="py-3 flex items-center justify-between gap-4 text-sm text-slate-700"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-[#0F2C59] shrink-0" />
                            <span>{lesson.title}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-500 shrink-0 tabular-nums">
                            {lesson.durationMinutes} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Para quem é / Para quem NÃO é */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A2540]">Para quem este curso é ideal</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{course.targetAudience}</p>
            <ul className="space-y-2.5 text-sm text-slate-700 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Profissionais que precisam comprovar capacitação para admissão ou entrada em obra</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Equipes que buscam reciclagem periódica rápida sem perder dias de produção</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Técnicos de Segurança e empresas que exigem código público verificável</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A2540]">Para quem NÃO é indicado</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Prezamos pela transparência técnica na Segurança do Trabalho:
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700 pt-2">
              {(
                course.notForAudience || [
                  'Quem procura comprar certificado sem realizar estudo nem avaliação de aproveitamento',
                  'Pessoas que não exercem nem pretendem atuar em atividades cobertas pela norma',
                ]
              ).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <MinusCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it Works (Estudar -> Prova -> Certificado) */}
        <section className="bg-navy-grid text-white rounded-2xl p-6 sm:p-10 space-y-6 shadow-[0_20px_50px_-16px_rgba(10,37,64,0.35)]">
          <div className="max-w-2xl space-y-1.5">
            <p className="text-xs font-mono font-bold text-[#F5C518] tracking-wider uppercase">
              Passo a Passo Simples
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
              Do checkout ao certificado em PDF no mesmo dia
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: '01',
                t: 'Matrícula segura',
                d: 'Pague via Pix ou cartão na InfinitePay e receba acesso imediato.',
              },
              {
                n: '02',
                t: 'Estude no seu ritmo',
                d: 'Acesse os módulos teóricos pelo celular ou computador a qualquer hora.',
              },
              {
                n: '03',
                t: 'Prova formal online',
                d: `Responda às questões objetivas e atinja nota mínima de ${course.passingScore}%.`,
              },
              {
                n: '04',
                t: 'Certificado liberado',
                d: 'Baixe o PDF assinado pelo engenheiro e valide em /validar.',
              },
            ].map((s) => (
              <div key={s.n} className="bg-[#0F2C59] border border-white/10 rounded-lg p-5 space-y-2">
                <span className="font-mono text-sm font-bold text-[#F5C518]">{s.n}</span>
                <h3 className="font-display font-bold text-white">{s.t}</h3>
                <p className="text-xs text-slate-200 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantee Block */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <ShieldCheck className="w-11 h-11 text-emerald-600 shrink-0" />
            <div className="space-y-1.5">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0A2540]">
                Garantia incondicional de {guaranteeDays} dias
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Experimente a plataforma, acesse as aulas e avalie a didática sem risco. Se dentro de {guaranteeDays}{' '}
                dias você sentir que o treinamento não atende ao que precisa, devolvemos 100% do investimento sem
                burocracia.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={startingCheckout}
            onClick={scrollToCheckout}
            className="inline-flex items-center justify-center min-h-[46px] px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] disabled:opacity-60 text-[#0A2540] font-extrabold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Matricular sem risco
          </button>
        </section>

        {/* Verified Testimonials */}
        {testimonials.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Depoimentos Verificados
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
                Quem concluiu o treinamento recomenda
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <blockquote
                  key={t.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-0.5 text-[#F5C518]">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-[#F5C518]" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">“{t.quote}”</p>
                  </div>
                  <footer className="border-t border-slate-100 pt-4">
                    <p className="text-sm font-bold text-[#0A2540]">{t.authorName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t.authorRole} · <span className="font-semibold text-[#0F2C59]">{t.company}</span>
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {course.faq && course.faq.length > 0 && (
          <section className="space-y-4 max-w-4xl">
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Tire suas dúvidas
              </p>
              <h2 className="font-display text-2xl font-extrabold text-[#0A2540]">
                Perguntas frequentes sobre {course.nrCode}
              </h2>
            </div>
            <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl">
              {course.faq.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="p-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="font-semibold text-sm sm:text-base text-[#0A2540]">{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 3. STICKY CONVERSION BAR */}
      {showStickyCta && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0A2540]/95 backdrop-blur-md border-t border-white/15 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-mono text-[#F5C518] truncate font-bold">
                {course.nrCode} · {course.workloadHours}h · Certificado PDF
              </p>
              <p className="text-sm font-bold text-white truncate">{course.title}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:block text-right">
                <span className="font-mono text-lg font-extrabold text-white tabular-nums block leading-none">
                  {formatCurrencyBRL(course.priceCents)}
                </span>
                <span className="text-[11px] text-slate-300">
                  ou {formatInstallmentBRL(course.priceCents)}
                </span>
              </div>
              <button
                type="button"
                disabled={startingCheckout}
                onClick={scrollToCheckout}
                className="inline-flex items-center justify-center min-h-[42px] px-4 sm:px-5 py-2 bg-[#F5C518] hover:bg-[#E0B20F] disabled:opacity-60 text-[#0A2540] text-xs sm:text-sm font-extrabold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Matricular agora
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
