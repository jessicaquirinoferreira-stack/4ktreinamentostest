import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyBRL, formatInstallmentBRL } from '../data/seedCourses';
import { db } from '../lib/firebase';
import {
  attachCheckoutUrlToOrder,
  createPendingOrder,
  fetchFunnelOffers,
  fetchPublishedCourses,
  releaseOrderAndEnrollAdmin,
} from '../lib/firestoreService';
import type { Course, FunnelOffer, Order } from '../types';

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const orderNsu = params.get('order_nsu') || '';
  const transactionNsu = params.get('transaction_nsu') || '';
  const slug = params.get('slug') || '';
  const upsellDone = params.get('upsell') === 'done';
  const testPaid = params.get('test_paid') === '1';

  const [checking, setChecking] = useState(true);
  const [paid, setPaid] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [upsellOffer, setUpsellOffer] = useState<FunnelOffer | null>(null);
  const [upsellCourse, setUpsellCourse] = useState<Course | null>(null);
  const [upsellDeclined, setUpsellDeclined] = useState(false);
  const [buyingUpsell, setBuyingUpsell] = useState(false);
  const [message, setMessage] = useState('Verificando confirmação do pagamento junto à InfinitePay...');

  useEffect(() => {
    async function verify() {
      if (!orderNsu) {
        setChecking(false);
        setMessage('Pedido não identificado na URL de retorno.');
        return;
      }

      try {
        let fetchedOrder: Order | null = null;
        if (user) {
          const snap = await getDoc(doc(db, 'orders', orderNsu));
          if (snap.exists()) {
            fetchedOrder = snap.data() as Order;
            setOrder(fetchedOrder);
          }
        }

        if (testPaid && fetchedOrder) {
          setPaid(true);
          setMessage('Matrícula confirmada! Seu acesso já está disponível na Área do Aluno.');
        } else {
          const res = await fetch('/api/checkout/payment-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
          });
          const data = await res.json();

          if (data.paid) {
            setPaid(true);
            setMessage('Pagamento confirmado! Seu acesso ao treinamento já foi liberado.');
            if (isAdmin && fetchedOrder) {
              await releaseOrderAndEnrollAdmin(fetchedOrder).catch(() => {});
            }
          } else if (fetchedOrder && (fetchedOrder.status === 'paid' || fetchedOrder.status === 'released')) {
            setPaid(true);
            setMessage('Pagamento confirmado! Seu treinamento já está liberado na Área do Aluno.');
          } else {
            setMessage('Pagamento recebido e em processamento. Assim que compensado, seu curso aparecerá automaticamente na Área do Aluno.');
          }
        }

        // Load eligible post-purchase Upsell offer if not yet processed
        if (!upsellDone) {
          const [offers, courses] = await Promise.all([
            fetchFunnelOffers(true),
            fetchPublishedCourses(),
          ]);
          const purchasedIds = fetchedOrder?.courseIds || (fetchedOrder ? [fetchedOrder.courseId] : []);
          const primaryId = fetchedOrder?.courseId || '';

          const matched =
            offers.find(
              (o) =>
                o.type === 'upsell' &&
                o.triggerCourseId === primaryId &&
                !o.includedCourseIds.some((cid) => purchasedIds.includes(cid))
            ) ||
            offers.find(
              (o) =>
                o.type === 'upsell' &&
                o.triggerCourseId === 'all' &&
                !o.includedCourseIds.some((cid) => purchasedIds.includes(cid))
            ) ||
            null;

          if (matched) {
            setUpsellOffer(matched);
            setUpsellCourse(courses.find((c) => c.id === matched.includedCourseIds[0]) || null);
          }
        }
      } catch {
        setMessage('Não foi possível consultar o status neste momento. Verifique seus pedidos na Área do Aluno.');
      } finally {
        setChecking(false);
      }
    }
    verify();
  }, [orderNsu, transactionNsu, slug, user, isAdmin, upsellDone, testPaid]);

  async function handleAcceptUpsell() {
    if (!upsellOffer || !user) {
      navigate('/aluno');
      return;
    }
    setBuyingUpsell(true);
    try {
      const upsellOrderId = `ord_up_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const customerName = profile?.name || user.displayName || order?.userName || 'Aluno 4k';
      const customerEmail = user.email || order?.userEmail || '';

      const payloadOrder = {
        id: upsellOrderId,
        userId: user.uid,
        userName: customerName,
        userEmail: customerEmail,
        courseId: upsellOffer.includedCourseIds[0],
        courseIds: upsellOffer.includedCourseIds,
        courseTitle: `Upsell · ${upsellOffer.title}`.slice(0, 220),
        parentOrderId: orderNsu,
        upsellOfferId: upsellOffer.id,
        amountCents: upsellOffer.offerPriceCents,
        status: 'pending' as const,
        paymentProvider: 'infinitepay',
      };

      await createPendingOrder(payloadOrder);

      if (testPaid && isAdmin) {
        await releaseOrderAndEnrollAdmin({ ...payloadOrder, createdAt: null, updatedAt: null });
        toast.success('Upsell adicionado em modo teste!');
        navigate(`/checkout/sucesso?order_nsu=${encodeURIComponent(upsellOrderId)}&upsell=done&test_paid=1`);
        return;
      }

      const res = await fetch('/api/checkout/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: upsellOrderId,
          courseTitle: upsellOffer.title,
          priceCents: upsellOffer.offerPriceCents,
          customerName,
          customerEmail,
          redirectPath: `/checkout/sucesso?order_nsu=${encodeURIComponent(upsellOrderId)}&upsell=done`,
          orderMeta: {
            userId: user.uid,
            userName: customerName,
            userEmail: customerEmail,
            courseIds: upsellOffer.includedCourseIds,
            courseTitle: `Upsell · ${upsellOffer.title}`.slice(0, 220),
            amountCents: upsellOffer.offerPriceCents,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar checkout do upsell.');
      if (data.url) {
        await attachCheckoutUrlToOrder(upsellOrderId, data.url).catch(() => {});
        window.location.assign(data.url);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível gerar a oferta.');
    } finally {
      setBuyingUpsell(false);
    }
  }

  const showUpsellCard = !checking && paid && !upsellDone && !upsellDeclined && upsellOffer;

  return (
    <main className="min-h-[80vh] bg-[#F7F9FC] px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Confirmation Banner */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
          {checking ? (
            <Loader2 className="w-11 h-11 text-[#F5C518] animate-spin shrink-0" />
          ) : (
            <CheckCircle2 className={`w-11 h-11 shrink-0 ${paid ? 'text-emerald-600' : 'text-[#F5C518]'}`} />
          )}

          <div className="flex-1 space-y-1.5">
            <span className="font-mono text-xs font-bold text-emerald-700">
              {checking ? 'SINCRONIZANDO' : paid ? 'COMPRA APROVADA' : 'PEDIDO REGISTRADO'}
            </span>
            <h1 className="font-display text-2xl font-extrabold text-[#0A2540]">
              {checking ? 'Confirmando pagamento...' : paid ? 'Matrícula confirmada!' : 'Retorno do pagamento'}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
            {orderNsu && (
              <p className="font-mono text-xs text-slate-500 pt-1">
                Pedido: {orderNsu} {order ? `· ${order.courseTitle}` : ''}
              </p>
            )}
          </div>
        </section>

        {/* POST-PURCHASE UPSELL OFFER */}
        {showUpsellCard && upsellOffer && (
          <section className="bg-[#0A2540] text-white border-2 border-[#F5C518] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#F5C518]">
                <Sparkles className="w-4 h-4" />
                {upsellOffer.badgeLabel || 'OFERTA ÚNICA PÓS-COMPRA'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {upsellOffer.title}
              </h2>
              {upsellOffer.subtitle && (
                <p className="text-sm text-[#F5C518] font-medium">{upsellOffer.subtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#0F2C59] border border-white/10 rounded-xl p-5">
              {upsellCourse?.coverImageUrl && (
                <div className="md:col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-[#0A2540]">
                  <img
                    src={upsellCourse.coverImageUrl}
                    alt={upsellOffer.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={upsellCourse?.coverImageUrl ? 'md:col-span-8 space-y-3' : 'md:col-span-12 space-y-3'}>
                <p className="text-sm text-slate-200 leading-relaxed">{upsellOffer.description}</p>
                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <span className="font-mono text-sm text-slate-300 line-through tabular-nums">
                    De {formatCurrencyBRL(upsellOffer.originalPriceCents)}
                  </span>
                  <span className="font-mono text-3xl font-extrabold text-[#F5C518] tabular-nums">
                    {formatCurrencyBRL(upsellOffer.offerPriceCents)}
                  </span>
                  <span className="text-xs text-slate-300">
                    ou {formatInstallmentBRL(upsellOffer.offerPriceCents)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                disabled={buyingUpsell}
                onClick={handleAcceptUpsell}
                className="flex-1 min-h-[46px] py-3.5 px-6 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] font-extrabold text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {buyingUpsell ? 'Gerando oferta...' : 'Sim, adicionar este curso com desconto agora'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setUpsellDeclined(true)}
                className="py-3.5 px-5 border border-white/25 hover:bg-white/10 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Não, obrigado. Ir para meu curso
              </button>
            </div>
          </section>
        )}

        {/* PERSONALIZED THANK-YOU & NEXT STEPS */}
        {!showUpsellCard && !checking && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Próximos Passos
              </p>
              <h2 className="font-display text-xl font-bold text-[#0A2540]">
                Como concluir seu treinamento e baixar seu certificado
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F7F9FC] border border-slate-200 rounded-lg space-y-2">
                <BookOpen className="w-5 h-5 text-[#0F2C59]" />
                <h3 className="font-bold text-sm text-[#0A2540]">1. Acesse as aulas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Entre na Área do Aluno e acompanhe os módulos e materiais de apoio no seu ritmo.
                </p>
              </div>
              <div className="p-4 bg-[#F7F9FC] border border-slate-200 rounded-lg space-y-2">
                <ClipboardCheck className="w-5 h-5 text-[#0F2C59]" />
                <h3 className="font-bold text-sm text-[#0A2540]">2. Faça a prova formal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Responda às questões objetivas dentro da plataforma (nota mínima de 70%).
                </p>
              </div>
              <div className="p-4 bg-[#F7F9FC] border border-slate-200 rounded-lg space-y-2">
                <Award className="w-5 h-5 text-[#0F2C59]" />
                <h3 className="font-bold text-sm text-[#0A2540]">3. Emita o PDF</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Baixe imediatamente seu certificado assinado com código verificável em /validar.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/aluno"
                className="min-h-[46px] px-6 py-3.5 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors text-center inline-flex items-center justify-center gap-2"
              >
                Acessar meu curso na Área do Aluno
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="min-h-[46px] px-5 py-3.5 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-sm font-semibold rounded-lg transition-colors text-center inline-flex items-center justify-center"
              >
                Voltar ao catálogo
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export function CheckoutFailurePage() {
  return (
    <main className="min-h-[70vh] bg-[#F7F9FC] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 text-center space-y-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
        <XCircle className="w-12 h-12 text-red-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-[#0A2540]">Pagamento não concluído</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            A transação foi cancelada ou não autorizada pelo emissor. Nenhuma cobrança foi efetivada e você pode tentar novamente quando desejar.
          </p>
        </div>
        <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors"
          >
            Escolher curso novamente
          </Link>
          <Link
            to="/aluno"
            className="px-5 py-3 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-sm font-semibold rounded-lg transition-colors"
          >
            Ir para Área do Aluno
          </Link>
        </div>
      </div>
    </main>
  );
}
