import { attachCheckoutUrlToOrder, createPendingOrder } from './firestoreService';
import type { Course, UserProfile } from '../types';

const LAST_INFINITEPAY_ORDER_KEY = '4k_last_infinitepay_order';

export interface StoredInfinitePayReceipt {
  order_nsu: string;
  courseId?: string;
  courseTitle: string;
  priceCents: number;
  createdAt: string;
}

export interface InfinitePayCheckoutItem {
  description: string;
  price: number; // sempre inteiro em centavos (ex: R$ 119,00 = 11900)
  quantity: number;
}

export interface CreateInfinitePayLinkInput {
  orderId?: string;
  items: InfinitePayCheckoutItem[];
  customerName?: string;
  customerEmail?: string;
  redirectPath?: string;
  orderMeta?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    courseIds?: string[];
    courseTitle?: string;
    amountCents?: number;
  };
}

/**
 * Gera um order_nsu único compatível com InfinitePay e com as regras de ID do Firestore.
 */
export function generateOrderNsu(courseSlugOrCode: string): string {
  const cleanTag = courseSlugOrCode
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  return `pedido-${cleanTag || 'CURSO'}-${Date.now()}-${randomSuffix}`;
}

export function saveLastInfinitePayOrder(receipt: StoredInfinitePayReceipt) {
  try {
    localStorage.setItem(LAST_INFINITEPAY_ORDER_KEY, JSON.stringify(receipt));
  } catch {
    // ignore storage quota errors
  }
}

export function readLastInfinitePayOrder(): StoredInfinitePayReceipt | null {
  try {
    const raw = localStorage.getItem(LAST_INFINITEPAY_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredInfinitePayReceipt;
  } catch {
    return null;
  }
}

/**
 * Chama apenas o nosso backend (/api/checkout/create-link) — nenhuma API Key trafega no navegador.
 */
export async function createInfinitePayPaymentLink(
  input: CreateInfinitePayLinkInput
): Promise<{ url: string; order_nsu: string }> {
  const normalizedItems = input.items.map((item) => ({
    description: item.description.trim().slice(0, 120),
    price: Math.round(Number(item.price)),
    quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
  }));

  if (normalizedItems.length === 0 || normalizedItems.some((it) => !Number.isFinite(it.price) || it.price <= 0)) {
    throw new Error('Valor do curso inválido para gerar o checkout.');
  }

  const res = await fetch('/api/checkout/create-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: input.orderId,
      items: normalizedItems,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      redirectPath: input.redirectPath || '/obrigado',
      orderMeta: input.orderMeta,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    order_nsu?: string;
    error?: string;
  };

  if (!res.ok || !data.url) {
    throw new Error(
      data.error || 'Não foi possível iniciar o pagamento pela InfinitePay. Tente novamente em instantes.'
    );
  }

  return {
    url: data.url,
    order_nsu: data.order_nsu || input.orderId || '',
  };
}

/**
 * Inicia a compra direta de um curso:
 * 1) Captura nome do curso, preço em centavos e quantidade 1
 * 2) Gera order_nsu único
 * 3) Registra pedido pendente no Firestore caso o aluno esteja autenticado
 * 4) Solicita o link ao backend e redireciona imediatamente para a InfinitePay
 */
export async function startDirectCourseCheckout(
  course: Course,
  auth?: {
    user?: { uid: string; displayName?: string | null; email?: string | null } | null;
    profile?: UserProfile | null;
  }
): Promise<void> {
  const courseDescription = `${course.nrCode} – ${course.title}`.slice(0, 120);
  const priceCents = Math.round(Number(course.priceCents));
  const orderId = generateOrderNsu(course.nrCode || course.slug);

  const user = auth?.user;
  const profile = auth?.profile;
  const customerName = profile?.name || user?.displayName || undefined;
  const customerEmail = user?.email || undefined;

  if (user?.uid) {
    await createPendingOrder({
      id: orderId,
      userId: user.uid,
      userName: customerName || 'Aluno 4k',
      userEmail: customerEmail || '',
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
    }).catch(() => {
      // Não bloqueia o pagamento caso haja atraso ou indisponibilidade temporária do Firestore
    });
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
    customerName,
    customerEmail,
    redirectPath: '/obrigado',
    orderMeta: user?.uid
      ? {
          userId: user.uid,
          userName: customerName,
          userEmail: customerEmail,
          courseIds: [course.id],
          courseTitle: courseDescription,
          amountCents: priceCents,
        }
      : undefined,
  });

  if (user?.uid) {
    await attachCheckoutUrlToOrder(orderId, url).catch(() => {});
  }

  window.location.href = url;
}
