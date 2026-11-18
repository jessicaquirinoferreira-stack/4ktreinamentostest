import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrencyBRL,
  formatInstallmentBRL,
  getNrFamilyKey,
  OFFICIAL_LOGO_URL,
} from '../data/seedCourses';
import {
  attachCheckoutUrlToOrder,
  createPendingOrder,
  fetchCourseBySlug,
  fetchFunnelOffers,
  fetchPublishedCourses,
  releaseOrderAndEnrollAdmin,
} from '../lib/firestoreService';
import type { Course, FunnelOffer, OrderItemSummary } from '../types';

interface CheckoutPageProps {
  mode?: 'course' | 'combo';
}

export function CheckoutPage({ mode = 'course' }: CheckoutPageProps) {
  const { slug, offerId } = useParams<{ slug?: string; offerId?: string }>();
  const navigate = useNavigate();
  const { user, profile, isAdmin, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [combo, setCombo] = useState<FunnelOffer | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [orderBumps, setOrderBumps] = useState<FunnelOffer[]>([]);
  const [selectedBumpIds, setSelectedBumpIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

  // Inline auth fields when student isn't signed in yet
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerCpf, setBuyerCpf] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<'pix' | 'card' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [missingHandlePrompt, setMissingHandlePrompt] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPublishedCourses(), fetchFunnelOffers(true)])
      .then(async ([coursesList, offers]) => {
        setAllCourses(coursesList);

        if (mode === 'combo' && offerId) {
          const foundCombo = offers.find((o) => o.id === offerId && o.type === 'combo') || null;
          setCombo(foundCombo);
          const matchingBumps = offers.filter(
            (o) =>
              o.type === 'order_bump' &&
              foundCombo &&
              !o.includedCourseIds.every((cid) => foundCombo.includedCourseIds.includes(cid))
          );
          setOrderBumps(matchingBumps);
        } else if (slug) {
          const foundCourse =
            (await fetchCourseBySlug(slug)) ||
            coursesList.find((c) => c.slug === slug || c.id === slug) ||
            null;
          setCourse(foundCourse);

          if (foundCourse) {
            const currentFamily = getNrFamilyKey(foundCourse.id);
            const matchingBumps = offers.filter(
              (o) =>
                o.type === 'order_bump' &&
                (o.triggerCourseId === foundCourse.id ||
                  o.triggerCourseId === currentFamily ||
                  o.triggerCourseId === 'all') &&
                !o.includedCourseIds.some((cid) => getNrFamilyKey(cid) === currentFamily)
            );
            setOrderBumps(matchingBumps);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [mode, slug, offerId]);

  useEffect(() => {
    if (user) {
      setBuyerName((prev) => prev || profile?.name || user.displayName || '');
      setBuyerEmail((prev) => prev || user.email || '');
      setBuyerCpf((prev) => prev || profile?.cpf || '');
    }
  }, [user, profile]);

  const baseCourseIds = useMemo(() => {
    if (mode === 'combo' && combo) return combo.includedCourseIds;
    if (course) return [course.id];
    return [];
  }, [mode, combo, course]);

  const activeSelectedBumps = useMemo(
    () => orderBumps.filter((b) => selectedBumpIds.includes(b.id)),
    [orderBumps, selectedBumpIds]
  );

  const basePriceCents = mode === 'combo' && combo ? combo.offerPriceCents : course?.priceCents || 0;
  const bumpsTotalCents = activeSelectedBumps.reduce((sum, b) => sum + b.offerPriceCents, 0);
  const totalPriceCents = basePriceCents + bumpsTotalCents;

  const allIncludedCourseIds = useMemo(() => {
    const set = new Set<string>(baseCourseIds);
    activeSelectedBumps.forEach((b) => b.includedCourseIds.forEach((cid) => set.add(cid)));
    return Array.from(set);
  }, [baseCourseIds, activeSelectedBumps]);

  const siblingVariants = useMemo(() => {
    if (mode !== 'course' || !course) return [];
    const family = getNrFamilyKey(course.id);
    return allCourses
      .filter((c) => getNrFamilyKey(c.id) === family)
      .sort((a, b) => b.workloadHours - a.workloadHours);
  }, [mode, course, allCourses]);

  const primaryTitle =
    mode === 'combo' && combo
      ? combo.title
      : course
        ? `${course.nrCode} – ${course.title}`
        : '';

  function toggleBump(bumpId: string) {
    setSelectedBumpIds((prev) =>
      prev.includes(bumpId) ? prev.filter((id) => id !== bumpId) : [...prev, bumpId]
    );
  }

  async function ensureAuthenticatedUser() {
    if (user) return user;
    if (!buyerEmail.trim() || !buyerPassword) {
      throw new Error('Informe seu e-mail e senha para liberar seu acesso na Área do Aluno.');
    }
    if (authTab === 'register') {
      if (!buyerName.trim()) {
        throw new Error('Informe seu nome completo como deverá constar no certificado.');
      }
      return await registerWithEmail(buyerName.trim(), buyerEmail.trim(), buyerPassword, buyerCpf.trim());
    }
    return await loginWithEmail(buyerEmail.trim(), buyerPassword);
  }

  async function initiateInfinitePayCheckout(chosenMethod: 'pix' | 'card') {
    if (submitting || (!course && !combo) || allIncludedCourseIds.length === 0) return;

    setPaymentMethod(chosenMethod);
    setLoadingMethod(chosenMethod);
    setSubmitting(true);
    setCheckoutError(null);
    setMissingHandlePrompt(false);

    try {
      let authedUser = user;
      if (!authedUser && buyerEmail.trim() && buyerPassword) {
        try {
          authedUser = await ensureAuthenticatedUser();
        } catch (authErr: any) {
          if (authErr?.code === 'auth/operation-not-allowed') {
            authedUser = null;
          } else {
            throw authErr;
          }
        }
      }

      const customerName =
        buyerName.trim() || profile?.name || authedUser?.displayName || '';
      const customerEmail =
        buyerEmail.trim() || authedUser?.email || '';

      const slugToken = (mode === 'combo' && combo ? combo.id : course!.slug)
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toUpperCase();
      const orderId = `pedido-${slugToken}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const primaryDescription =
        mode === 'combo' && combo
          ? combo.title
          : `${course!.nrCode} - ${course!.workloadHours}h – ${course!.title}`;

      const itemsSummary: OrderItemSummary[] = [
        {
          id: mode === 'combo' && combo ? combo.id : course!.id,
          title: primaryDescription,
          priceCents: Math.round(basePriceCents),
          kind: mode === 'combo' ? 'combo' : 'course',
        },
        ...activeSelectedBumps.map((b) => ({
          id: b.id,
          title: b.title,
          priceCents: Math.round(b.offerPriceCents),
          kind: 'bump' as const,
        })),
      ];

      const combinedTitle =
        activeSelectedBumps.length > 0
          ? `${primaryDescription} + ${activeSelectedBumps.map((b) => b.title).join(', ')}`.slice(0, 220)
          : primaryDescription.slice(0, 220);

      try {
        localStorage.setItem('4k_last_order_nsu', orderId);
        localStorage.setItem(
          `4k_pending_order_${orderId}`,
          JSON.stringify({
            id: orderId,
            courseId: allIncludedCourseIds[0],
            courseIds: allIncludedCourseIds,
            courseTitle: combinedTitle,
            amountCents: Math.round(totalPriceCents),
            paymentMethod: chosenMethod,
            customerName,
            customerEmail,
          })
        );
      } catch {
        // Ignore storage quota errors
      }

      if (authedUser) {
        await createPendingOrder({
          id: orderId,
          userId: authedUser.uid,
          userName: customerName || 'Aluno 4k',
          userEmail: customerEmail,
          courseId: allIncludedCourseIds[0],
          courseIds: allIncludedCourseIds,
          courseTitle: combinedTitle,
          itemsSummary,
          ...(activeSelectedBumps[0] ? { orderBumpId: activeSelectedBumps[0].id } : {}),
          ...(mode === 'combo' && combo ? { comboId: combo.id } : {}),
          amountCents: Math.round(totalPriceCents),
          status: 'pending',
          paymentProvider: 'infinitepay',
        }).catch(() => {});
      }

      const res = await fetch('/api/checkout/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          order_nsu: orderId,
          items: itemsSummary.map((it) => ({
            quantity: 1,
            price: Math.round(it.priceCents),
            description: it.title.slice(0, 120),
          })),
          customerName,
          customerEmail,
          redirectPath: '/obrigado',
          orderMeta: {
            userId: authedUser?.uid || `guest_${orderId}`,
            userName: customerName || 'Aluno 4k',
            userEmail: customerEmail,
            courseIds: allIncludedCourseIds,
            courseTitle: combinedTitle,
            amountCents: Math.round(totalPriceCents),
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        if (data.requiresHandleConfig) {
          setMissingHandlePrompt(true);
          const msg = 'InfiniteTag não configurada no Painel Admin.';
          setCheckoutError(msg);
          toast.warning(msg);
          return;
        }
        throw new Error(
          data.error || 'Não foi possível gerar o link de pagamento na InfinitePay. Tente novamente.'
        );
      }

      if (authedUser) {
        await attachCheckoutUrlToOrder(orderId, data.url).catch(() => {});
      }
      window.location.assign(data.url);
    } catch (err: any) {
      let friendlyMsg = 'Não foi possível iniciar o pagamento. Tente novamente em instantes.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        friendlyMsg = 'E-mail ou senha incorretos. Corrija sua senha ou deixe o campo em branco para prosseguir direto ao pagamento.';
      } else if (err?.code === 'auth/email-already-in-use') {
        friendlyMsg = 'Este e-mail já possui conta. Clique em "Já tenho conta na 4k" ou deixe a senha em branco para ir direto ao pagamento.';
      } else if (err instanceof Error && err.message) {
        friendlyMsg = err.message;
      }
      setCheckoutError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setSubmitting(false);
      setLoadingMethod(null);
    }
  }

  async function handleCompleteCheckout(e: React.FormEvent) {
    e.preventDefault();
    await initiateInfinitePayCheckout(paymentMethod);
  }

  async function handleAdminTestInstantRelease() {
    if (!user || allIncludedCourseIds.length === 0) return;
    setSubmitting(true);
    try {
      const orderId = `ord_test_${Date.now()}`;
      const orderPayload = {
        id: orderId,
        userId: user.uid,
        userName: buyerName || profile?.name || user.displayName || 'Admin Teste',
        userEmail: buyerEmail || user.email || '',
        courseId: allIncludedCourseIds[0],
        courseIds: allIncludedCourseIds,
        courseTitle: primaryTitle,
        amountCents: totalPriceCents,
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
      toast.success('Pedido liberado em modo teste! Redirecionando para oferta pós-compra...');
      navigate(`/checkout/sucesso?order_nsu=${encodeURIComponent(orderId)}&test_paid=1`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no modo teste.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!course && !combo) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">Oferta não encontrada</h1>
        <Link to="/" className="inline-block px-5 py-2.5 bg-[#0A2540] text-white text-sm font-semibold rounded-lg">
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] pb-20">
      {/* Slim Trust Header */}
      <div className="bg-[#0A2540] text-white border-b border-white/10 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={course ? `/cursos/${course.slug}` : '/'}
              className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </Link>
            <img
              src={OFFICIAL_LOGO_URL}
              alt="4k Treinamentos"
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain hidden sm:block bg-white/95 rounded px-1.5 py-0.5"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F5C518] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>CHECKOUT CRIPTOGRAFADO · INFINITEPAY</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <form noValidate onSubmit={handleCompleteCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Account + Order Bump + Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Student Identification */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#0A2540] text-[#F5C518] font-mono text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h1 className="font-display text-lg font-bold text-[#0A2540]">
                    Dados para acesso e emissão do certificado
                  </h1>
                </div>
                {user && (
                  <span className="text-xs font-mono font-semibold text-emerald-700">Conectado</span>
                )}
              </div>

              {user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome completo (para o certificado) *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail de acesso *
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-[#F7F9FC]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => loginWithGoogle().catch((e) => toast.error(e.message))}
                    className="w-full min-h-[42px] py-2.5 px-4 border border-[#0F2C59] hover:bg-[#0A2540]/5 rounded-lg text-sm font-semibold text-[#0A2540] transition-colors cursor-pointer"
                  >
                    Continuar com 1 clique usando conta Google
                  </button>

                  <div className="flex items-center gap-2 p-1 bg-[#F7F9FC] border border-slate-200 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAuthTab('register')}
                      className={`flex-1 py-2 rounded-md cursor-pointer transition-colors ${
                        authTab === 'register' ? 'bg-[#0A2540] text-white' : 'text-slate-600'
                      }`}
                    >
                      Sou novo aluno (criar cadastro)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className={`flex-1 py-2 rounded-md cursor-pointer transition-colors ${
                        authTab === 'login' ? 'bg-[#0A2540] text-white' : 'text-slate-600'
                      }`}
                    >
                      Já tenho conta na 4k
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {authTab === 'register' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nome completo (para o certificado) *
                          </label>
                          <input
                            type="text"
                            required
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Ex: João Paulo da Silva"
                            className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            CPF (opcional)
                          </label>
                          <input
                            type="text"
                            value={buyerCpf}
                            onChange={(e) => setBuyerCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                      <input
                        type="email"
                        required
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Senha da Área do Aluno *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={buyerPassword}
                        onChange={(e) => setBuyerPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* STEP 2: ORDER BUMPS */}
            {orderBumps.length > 0 && (
              <section className="space-y-3">
                {orderBumps.map((bump) => {
                  const checked = selectedBumpIds.includes(bump.id);
                  const bumpCourse = allCourses.find((c) => c.id === bump.includedCourseIds[0]);
                  const savings = Math.max(0, bump.originalPriceCents - bump.offerPriceCents);

                  return (
                    <div
                      key={bump.id}
                      onClick={() => toggleBump(bump.id)}
                      className={`rounded-xl border-2 border-dashed p-5 transition-all cursor-pointer ${
                        checked
                          ? 'border-[#0A2540] bg-[#F5C518]/15'
                          : 'border-[#F5C518] bg-[#F5C518]/10 hover:bg-[#F5C518]/15'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBump(bump.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-5 h-5 accent-[#0A2540] cursor-pointer shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0A2540]">
                              <Sparkles className="w-3.5 h-3.5 text-[#0F2C59]" />
                              {bump.badgeLabel || 'OFERTA EXCLUSIVA DE CHECKOUT'}
                            </span>
                            {savings > 0 && (
                              <span className="text-xs font-mono font-bold text-emerald-700">
                                Economize {formatCurrencyBRL(savings)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {bumpCourse?.coverImageUrl && (
                              <img
                                src={bumpCourse.coverImageUrl}
                                alt={bump.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-12 rounded-md object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <h2 className="font-display font-bold text-[#0A2540] text-sm sm:text-base">
                                SIM! {bump.title}
                              </h2>
                              <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{bump.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                            <span className="text-slate-500 line-through tabular-nums">
                              De {formatCurrencyBRL(bump.originalPriceCents)}
                            </span>
                            <span className="font-extrabold text-[#0A2540] text-sm tabular-nums">
                              Por apenas +{formatCurrencyBRL(bump.offerPriceCents)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* STEP 3: Payment Method & Action */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-md bg-[#0A2540] text-[#F5C518] font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-display text-lg font-bold text-[#0A2540]">
                  Pagamento seguro via InfinitePay
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => initiateInfinitePayCheckout('pix')}
                  className={`p-4 rounded-lg border text-left flex items-start gap-3 cursor-pointer transition-colors disabled:opacity-60 ${
                    paymentMethod === 'pix'
                      ? 'border-[#0A2540] bg-[#F7F9FC] ring-1 ring-[#0A2540]'
                      : 'border-slate-200 hover:border-[#0A2540] hover:bg-[#F7F9FC]'
                  }`}
                >
                  {submitting && loadingMethod === 'pix' ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-spin" />
                  ) : (
                    <QrCode className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="block font-bold text-sm text-[#0A2540]">
                      {submitting && loadingMethod === 'pix' ? 'Gerando Pix na InfinitePay...' : 'Pix Instantâneo'}
                    </span>
                    <span className="block text-xs text-slate-600 mt-0.5">
                      Liberação imediata na Área do Aluno em segundos
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => initiateInfinitePayCheckout('card')}
                  className={`p-4 rounded-lg border text-left flex items-start gap-3 cursor-pointer transition-colors disabled:opacity-60 ${
                    paymentMethod === 'card'
                      ? 'border-[#0A2540] bg-[#F7F9FC] ring-1 ring-[#0A2540]'
                      : 'border-slate-200 hover:border-[#0A2540] hover:bg-[#F7F9FC]'
                  }`}
                >
                  {submitting && loadingMethod === 'card' ? (
                    <Loader2 className="w-5 h-5 text-[#0F2C59] shrink-0 mt-0.5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-[#0F2C59] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="block font-bold text-sm text-[#0A2540]">
                      {submitting && loadingMethod === 'card' ? 'Gerando link Cartão...' : 'Cartão de Crédito'}
                    </span>
                    <span className="block text-xs text-slate-600 mt-0.5">
                      Em até {formatInstallmentBRL(totalPriceCents)}
                    </span>
                  </div>
                </button>
              </div>

              {checkoutError && (
                <div
                  role="alert"
                  className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Não foi possível iniciar o pagamento</p>
                    <p className="leading-relaxed">{checkoutError}</p>
                  </div>
                </div>
              )}

              {missingHandlePrompt && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
                  <p className="font-bold">InfinitePay Handle não configurada</p>
                  <p>
                    O administrador precisa informar a InfiniteTag em Painel Admin → Configurações Gerais antes de gerar links reais.
                  </p>
                  {isAdmin && (
                    <Link to="/admin" className="inline-block font-semibold underline">
                      Ir para Painel Admin
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] py-4 px-6 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] font-extrabold text-base rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {submitting
                  ? 'Gerando ambiente seguro InfinitePay...'
                  : `Pagar ${formatCurrencyBRL(totalPriceCents)} agora (${paymentMethod === 'pix' ? 'Pix' : 'Cartão'})`}
              </button>

              {isAdmin && user && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleAdminTestInstantRelease}
                  className="w-full py-2.5 px-4 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Admin: Simular pagamento aprovado + testar Upsell
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center">
                Ao clicar em Pix, Cartão ou no botão acima, você será direcionado ao checkout oficial criptografado da InfinitePay e retornará para /obrigado após a confirmação.
              </p>
            </section>
          </div>

          {/* RIGHT COLUMN: Order Summary & Trust */}
          <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <h2 className="font-display font-bold text-[#0A2540] text-lg border-b border-slate-100 pb-3">
                Resumo do seu pedido
              </h2>

              <div className="flex items-start gap-3.5">
                {course?.coverImageUrl && (
                  <img
                    src={course.coverImageUrl}
                    alt={primaryTitle}
                    referrerPolicy="no-referrer"
                    className="w-20 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0A2540]">{primaryTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'combo'
                      ? `${allIncludedCourseIds.length} cursos com certificados independentes`
                      : `${course?.workloadHours}h · Certificado digital validado`}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-[#0A2540] tabular-nums shrink-0">
                  {formatCurrencyBRL(basePriceCents)}
                </span>
              </div>

              {mode === 'course' && siblingVariants.length > 1 && course && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-[#0F2C59] uppercase tracking-wider block">
                    Modalidade / Carga Horária
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {siblingVariants.map((variant) => {
                      const active = variant.id === course.id;
                      const label =
                        variant.workloadHours === 40
                          ? `Formação (${variant.workloadHours}h)`
                          : `Reciclagem (${variant.workloadHours}h)`;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => navigate(`/checkout/${variant.slug}`)}
                          className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0A2540] bg-[#0A2540] text-white'
                              : 'border-slate-200 bg-[#F7F9FC] hover:border-[#0A2540] text-[#0A2540]'
                          }`}
                        >
                          <span
                            className={`block text-[11px] font-bold whitespace-nowrap ${
                              active ? 'text-[#F5C518]' : 'text-[#0F2C59]'
                            }`}
                          >
                            {label}
                          </span>
                          <span className="block font-mono text-xs font-extrabold tabular-nums mt-0.5">
                            {formatCurrencyBRL(variant.priceCents)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSelectedBumps.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100 text-sm"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0F2C59] block">Order Bump incluso</span>
                    <span className="font-medium text-[#0A2540]">{b.title}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0A2540] tabular-nums shrink-0">
                    +{formatCurrencyBRL(b.offerPriceCents)}
                  </span>
                </div>
              ))}

              {/* Bonuses Included */}
              {course?.includedBonuses && course.includedBonuses.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-500 block">
                    BÔNUS LIBERADOS NA MATRÍCULA
                  </span>
                  {course.includedBonuses.slice(0, 3).map((bonus, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bonus}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-700">Total hoje</span>
                  <span className="font-mono text-2xl font-extrabold text-[#0A2540] tabular-nums">
                    {formatCurrencyBRL(totalPriceCents)}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 text-right tabular-nums">
                  ou em até {formatInstallmentBRL(totalPriceCents)} no cartão
                </p>
              </div>
            </div>

            <div className="bg-[#0A2540] text-white rounded-xl p-5 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-[#F5C518] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white">Garantia incondicional de 7 dias</p>
                <p className="text-slate-300 leading-relaxed">
                  Compra 100% protegida. Se não ficar satisfeito nos primeiros 7 dias, devolvemos integralmente o seu pagamento.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
