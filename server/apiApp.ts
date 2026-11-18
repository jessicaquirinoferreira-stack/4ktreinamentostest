import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getNrCertificateSpec } from '../src/data/certificateCatalog';

dotenv.config();

const BLOB_FALLBACK_DIR = path.resolve('/tmp/4k-blobs');
if (!fs.existsSync(BLOB_FALLBACK_DIR)) {
  fs.mkdirSync(BLOB_FALLBACK_DIR, { recursive: true });
}

const ADMIN_EMAIL = 'admin@x.com';
const ADMIN_PASS = 'admin4321';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '4k-treinamentos-session-secret-2026';

const DEFAULT_INFINITEPAY_HANDLE = 'ilza-ribeiro';
const DEFAULT_INFINITEPAY_API_KEY = 'inchk_mYev_fqX0L9JtJ8isWGIvBeguIAzgIzGYgrCDqvT8VQ';

let runtimeInfinitePayHandle = (process.env.INFINITEPAY_HANDLE || DEFAULT_INFINITEPAY_HANDLE).trim().replace(/^@/, '');

function getInfinitePayHandle(handleOverride?: string): string {
  return (handleOverride || runtimeInfinitePayHandle || process.env.INFINITEPAY_HANDLE || DEFAULT_INFINITEPAY_HANDLE)
    .trim()
    .replace(/^@/, '');
}

function getInfinitePayApiKey(): string {
  return (process.env.INFINITEPAY_API_KEY || DEFAULT_INFINITEPAY_API_KEY).trim();
}
const ORDERS_META_FILE = '/tmp/4k-orders-meta.json';
const VERIFIED_GRANTS_FILE = '/tmp/4k-verified-grants.json';

interface PendingOrderMeta {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseIds: string[];
  courseTitle?: string;
  amountCents?: number;
  createdAt: string;
}

interface VerifiedGrant {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseIds: string[];
  courseTitle?: string;
  confirmedAt: string;
}

function readJsonMap<T>(filePath: string): Map<string, T> {
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, T>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    // ignore corrupt preview cache
  }
  return new Map<string, T>();
}

function writeJsonMap<T>(filePath: string, map: Map<string, T>) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(Object.fromEntries(map.entries()), null, 2));
  } catch {
    // ignore disk errors
  }
}

const pendingOrderMetaMap = readJsonMap<PendingOrderMeta>(ORDERS_META_FILE);
const verifiedGrantsMap = readJsonMap<VerifiedGrant>(VERIFIED_GRANTS_FILE);

const confirmedPayments = new Map<
  string,
  {
    order_nsu: string;
    transaction_nsu: string;
    invoice_slug: string;
    paid_amount: number;
    capture_method?: string;
    receipt_url?: string;
    confirmedAt: string;
  }
>();

let adminDb: any = null;
async function initFirebaseAdminIfConfigured() {
  if (adminDb) return adminDb;
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) return null;
  try {
    const { cert, getApps, initializeApp } = await import('firebase-admin/app');
    const apps = getApps();
    const adminApp = apps.length
      ? apps[0]
      : initializeApp({
          credential: cert(JSON.parse(serviceAccountRaw)),
        });
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const fbConfig = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      : {};
    const { getFirestore } = await import('firebase-admin/firestore');
    adminDb = fbConfig.firestoreDatabaseId
      ? getFirestore(adminApp, fbConfig.firestoreDatabaseId)
      : getFirestore(adminApp);
    return adminDb;
  } catch (err) {
    console.warn('Firebase Admin não inicializado no servidor:', err);
    return null;
  }
}

function signAdminCookie(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminCookie(token?: string): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp < Date.now()) return null;
    return decoded.email || null;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
    }
  });
  return out;
}

async function storeToBlobOrLocal(
  filename: string,
  buffer: Buffer,
  contentType: string,
  originUrl: string
): Promise<{ url: string; storageProvider: 'vercel-blob' | 'local-preview' }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      token,
      addRandomSuffix: true,
    });
    return { url: blob.url, storageProvider: 'vercel-blob' };
  }

  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const fullPath = path.join(BLOB_FALLBACK_DIR, safeName);
  fs.writeFileSync(fullPath, buffer);
  return {
    url: `${originUrl}/api/blob/local/${encodeURIComponent(safeName)}`,
    storageProvider: 'local-preview',
  };
}

function getAppOrigin(req: express.Request): string {
  const forwardedHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  if (forwardedHost) {
    return `${forwardedProto || req.protocol || 'https'}://${forwardedHost}`;
  }

  const reqOrigin = typeof req.headers.origin === 'string' ? req.headers.origin.trim() : '';
  if (reqOrigin && /^https?:\/\//i.test(reqOrigin)) {
    return reqOrigin.replace(/\/$/, '');
  }

  const hostHeader = req.get('host');
  if (hostHeader && !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(hostHeader)) {
    return `${forwardedProto || req.protocol || 'https'}://${hostHeader}`;
  }

  if (process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')) {
    return process.env.APP_URL.replace(/\/$/, '');
  }

  return `${forwardedProto || req.protocol || 'http'}://${hostHeader || 'localhost:3000'}`;
}

function findLogoBytes(): Buffer | null {
  const candidates = [
    path.resolve(process.cwd(), 'dist/images/logo_4k_treinamentos.png'),
    path.resolve(process.cwd(), 'public/images/logo_4k_treinamentos.png'),
    path.resolve(process.cwd(), 'src/assets/images/logo_4k_treinamentos.png'),
  ];
  const hit = candidates.find((c) => fs.existsSync(c));
  if (!hit) return null;
  try {
    return fs.readFileSync(hit);
  } catch {
    return null;
  }
}

export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/blob/local/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename);
    const target = path.join(BLOB_FALLBACK_DIR, safeName);
    if (!fs.existsSync(target)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    return res.sendFile(target);
  });

  app.get('/api/blob/status', (_req, res) => {
    res.json({
      vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      infinitePayHandleConfigured: Boolean(runtimeInfinitePayHandle || process.env.INFINITEPAY_HANDLE),
      infinitePayHandlePreview: runtimeInfinitePayHandle || process.env.INFINITEPAY_HANDLE || null,
    });
  });

  app.post('/api/blob/upload', async (req, res) => {
    try {
      const { filename, contentType, base64Data, folder } = req.body as {
        filename?: string;
        contentType?: string;
        base64Data?: string;
        folder?: string;
      };

      if (!filename || !base64Data) {
        return res.status(400).json({ error: 'filename e base64Data são obrigatórios.' });
      }

      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(cleanBase64, 'base64');
      const targetKey = `${folder || 'uploads'}/${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const origin = getAppOrigin(req);

      const stored = await storeToBlobOrLocal(
        targetKey,
        buffer,
        contentType || 'application/octet-stream',
        origin
      );
      return res.json(stored);
    } catch (error) {
      console.error('Erro no upload Vercel Blob:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Falha ao enviar arquivo para o Blob.',
      });
    }
  });

  // Admin auth routes (admin@x.com / admin4321)
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();
    if (cleanEmail === ADMIN_EMAIL && cleanPass === ADMIN_PASS) {
      const token = signAdminCookie(ADMIN_EMAIL);
      const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';
      res.cookie('4k_admin_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isHttps,
        path: '/',
        maxAge: 1000 * 60 * 60 * 12,
      });
      return res.json({ authenticated: true, email: ADMIN_EMAIL });
    }
    return res.status(401).json({ error: 'Credenciais administrativas inválidas.' });
  });

  app.get('/api/admin/session', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const email = verifyAdminCookie(cookies['4k_admin_session']);
    res.json({ authenticated: Boolean(email), email });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.clearCookie('4k_admin_session', { path: '/' });
    res.json({ ok: true });
  });

  app.post('/api/settings/integrations', (req, res) => {
    const { infinitePayHandle } = req.body as { infinitePayHandle?: string };
    if (typeof infinitePayHandle === 'string') {
      runtimeInfinitePayHandle = infinitePayHandle.trim().replace(/^@/, '');
    }
    res.json({ ok: true, infinitePayHandle: runtimeInfinitePayHandle });
  });

  // InfinitePay Checkout Integrado — Create Payment Link
  app.post('/api/checkout/create-link', async (req, res) => {
    try {
      const {
        orderId,
        order_nsu,
        courseTitle,
        priceCents,
        items,
        handleOverride,
        customerName,
        customerEmail,
        redirectPath,
        orderMeta,
      } = req.body as {
        orderId?: string;
        order_nsu?: string;
        courseTitle?: string;
        priceCents?: number;
        items?: { description: string; price: number; quantity: number }[];
        handleOverride?: string;
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
      };

      const resolvedOrderId = (orderId || order_nsu || `pedido-${Date.now()}`).trim();

      const normalizedItems =
        Array.isArray(items) && items.length > 0
          ? items
              .map((it) => ({
                quantity: Math.max(1, Math.round(Number(it.quantity) || 1)),
                price: Math.round(Number(it.price)),
                description: String(it.description || 'Curso NR').slice(0, 120),
              }))
              .filter((it) => Number.isFinite(it.price) && it.price > 0)
          : courseTitle && typeof priceCents === 'number' && priceCents > 0
            ? [
                {
                  quantity: 1,
                  price: Math.round(priceCents),
                  description: courseTitle.slice(0, 120),
                },
              ]
            : [];

      if (!resolvedOrderId || normalizedItems.length === 0) {
        return res.status(400).json({ error: 'Dados do pedido ou itens inválidos para gerar o pagamento.' });
      }

      if (orderMeta?.userId && Array.isArray(orderMeta.courseIds) && orderMeta.courseIds.length > 0) {
        pendingOrderMetaMap.set(resolvedOrderId, {
          orderId: resolvedOrderId,
          userId: orderMeta.userId,
          userName: orderMeta.userName || customerName,
          userEmail: orderMeta.userEmail || customerEmail,
          courseIds: orderMeta.courseIds,
          courseTitle: orderMeta.courseTitle || courseTitle,
          amountCents: orderMeta.amountCents ?? priceCents,
          createdAt: new Date().toISOString(),
        });
        writeJsonMap(ORDERS_META_FILE, pendingOrderMetaMap);
      }

      const handle = getInfinitePayHandle(handleOverride);
      const apiKey = getInfinitePayApiKey();

      const origin = getAppOrigin(req);
      const finalRedirect = redirectPath
        ? `${origin}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`
        : `${origin}/obrigado`;

      const cleanCustomerName = (customerName || '').trim();
      const cleanCustomerEmail = (customerEmail || '').trim();
      const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCustomerEmail);

      const payload = {
        handle,
        order_nsu: resolvedOrderId,
        redirect_url: finalRedirect,
        items: normalizedItems,
        webhook_url: `${origin}/api/webhooks/infinitepay`,
        ...(cleanCustomerName || hasValidEmail
          ? {
              customer: {
                ...(cleanCustomerName ? { name: cleanCustomerName } : {}),
                ...(hasValidEmail ? { email: cleanCustomerEmail } : {}),
              },
            }
          : {}),
      };

      const ipRes = await fetch('https://api.checkout.infinitepay.io/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = (await ipRes.json().catch(() => ({}))) as {
        url?: string;
        message?: string;
        error?: string;
      };

      if (!ipRes.ok || !data.url) {
        console.error('Erro retornado pela InfinitePay:', ipRes.status, data);
        return res.status(502).json({
          error:
            data.message ||
            data.error ||
            'Não foi possível gerar o link de pagamento na InfinitePay. Tente novamente em instantes.',
          details: data,
        });
      }

      return res.json({ url: data.url, order_nsu: resolvedOrderId });
    } catch (error) {
      console.error('Erro InfinitePay create-link:', error);
      return res.status(500).json({ error: 'Falha ao conectar com InfinitePay Checkout Integrado.' });
    }
  });

  function recordLocalVerifiedGrant(orderNsu: string) {
    const meta = pendingOrderMetaMap.get(orderNsu);
    if (!meta) return;
    verifiedGrantsMap.set(orderNsu, {
      orderId: orderNsu,
      userId: meta.userId,
      userName: meta.userName,
      userEmail: meta.userEmail,
      courseIds: meta.courseIds,
      courseTitle: meta.courseTitle,
      confirmedAt: new Date().toISOString(),
    });
    writeJsonMap(VERIFIED_GRANTS_FILE, verifiedGrantsMap);
  }

  async function releaseOrderViaFirebaseAdmin(
    orderNsu: string,
    transactionNsu?: string,
    invoiceSlug?: string
  ) {
    recordLocalVerifiedGrant(orderNsu);
    const db = await initFirebaseAdminIfConfigured();
    if (!db) return;
    const orderRef = db.collection('orders').doc(orderNsu);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return;

    const orderData = orderSnap.data();
    await orderRef.update({
      status: 'released',
      ...(transactionNsu ? { transactionNsu } : {}),
      ...(invoiceSlug ? { invoiceSlug } : {}),
      updatedAt: new Date(),
    });

    const targetCourseIds: string[] =
      Array.isArray(orderData.courseIds) && orderData.courseIds.length > 0
        ? orderData.courseIds
        : [orderData.courseId];

    for (const cId of targetCourseIds) {
      const enrollmentId = `${orderData.userId}_${cId}`;
      const enrollRef = db.collection('enrollments').doc(enrollmentId);
      const enrollSnap = await enrollRef.get();
      if (!enrollSnap.exists) {
        await enrollRef.set({
          id: enrollmentId,
          userId: orderData.userId,
          userName: orderData.userName,
          userEmail: orderData.userEmail,
          courseId: cId,
          courseTitle: targetCourseIds.length === 1 ? orderData.courseTitle : cId.toUpperCase(),
          orderId: orderNsu,
          completedLessonIds: [],
          progressPercent: 0,
          examAttempts: 0,
          examPassed: false,
          bestScore: 0,
          enrolledAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  app.get('/api/student/verified-access', (req, res) => {
    const userId = String(req.query.userId || '').trim();
    if (!userId) {
      return res.json({ grants: [] });
    }
    const grants = Array.from(verifiedGrantsMap.values()).filter((g) => g.userId === userId);
    return res.json({ grants });
  });

  app.post('/api/webhooks/infinitepay', async (req, res) => {
    try {
      const body = req.body as {
        invoice_slug?: string;
        amount?: number;
        paid_amount?: number;
        installments?: number;
        capture_method?: string;
        transaction_nsu?: string;
        order_nsu?: string;
        receipt_url?: string;
      };

      if (!body.order_nsu) {
        return res.status(400).json({ error: 'order_nsu ausente no webhook.' });
      }

      confirmedPayments.set(body.order_nsu, {
        order_nsu: body.order_nsu,
        transaction_nsu: body.transaction_nsu || '',
        invoice_slug: body.invoice_slug || '',
        paid_amount: body.paid_amount || body.amount || 0,
        capture_method: body.capture_method,
        receipt_url: body.receipt_url,
        confirmedAt: new Date().toISOString(),
      });

      await releaseOrderViaFirebaseAdmin(body.order_nsu, body.transaction_nsu, body.invoice_slug);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro no webhook InfinitePay:', error);
      return res.status(500).json({ error: 'Erro interno ao processar webhook.' });
    }
  });

  app.post('/api/checkout/payment-check', async (req, res) => {
    try {
      const { order_nsu, transaction_nsu, slug, handleOverride } = req.body as {
        order_nsu?: string;
        transaction_nsu?: string;
        slug?: string;
        handleOverride?: string;
      };

      if (!order_nsu) {
        return res.status(400).json({ error: 'order_nsu é obrigatório.' });
      }

      const cached = confirmedPayments.get(order_nsu);
      if (cached) {
        await releaseOrderViaFirebaseAdmin(order_nsu, cached.transaction_nsu, cached.invoice_slug);
        return res.json({
          paid: true,
          source: 'webhook',
          ...cached,
        });
      }

      const handle = getInfinitePayHandle(handleOverride);
      if (handle && transaction_nsu && slug) {
        const checkRes = await fetch('https://api.checkout.infinitepay.io/invoices/public/checkout/payment_check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle,
            order_nsu,
            transaction_nsu,
            slug,
          }),
        });
        const checkData = (await checkRes.json().catch(() => ({}))) as {
          success?: boolean;
          paid?: boolean;
          amount?: number;
          paid_amount?: number;
          capture_method?: string;
        };

        if (checkRes.ok && checkData.paid) {
          confirmedPayments.set(order_nsu, {
            order_nsu,
            transaction_nsu,
            invoice_slug: slug,
            paid_amount: checkData.paid_amount || checkData.amount || 0,
            capture_method: checkData.capture_method,
            confirmedAt: new Date().toISOString(),
          });
          await releaseOrderViaFirebaseAdmin(order_nsu, transaction_nsu, slug);
          return res.json({ paid: true, source: 'payment_check', ...checkData });
        }
        return res.json({ paid: false, ...checkData });
      }

      return res.json({ paid: false, message: 'Aguardando confirmação do pagamento.' });
    } catch (error) {
      console.error('Erro payment_check InfinitePay:', error);
      return res.status(500).json({ error: 'Falha ao consultar status do pagamento.' });
    }
  });

  app.post('/api/certificates/generate', async (req, res) => {
    try {
      const {
        validationCode,
        studentName,
        studentCpf,
        courseTitle,
        nrCode,
        workloadHours,
        validityMonths,
        score,
        issuedDateStr,
        instructorName,
        instructorRole,
        instructorRegistry,
        companyName,
        cnpj,
        companyPhone,
        companyAddress,
        syllabusItems,
      } = req.body as {
        validationCode: string;
        studentName: string;
        studentCpf?: string;
        courseTitle: string;
        nrCode: string;
        workloadHours: number;
        validityMonths: number;
        score: number;
        issuedDateStr?: string;
        instructorName: string;
        instructorRole?: string;
        instructorRegistry?: string;
        templateHeader?: string;
        templateBody?: string;
        companyName?: string;
        cnpj?: string;
        companyPhone?: string;
        companyAddress?: string;
        syllabusItems?: string[];
      };

      if (!validationCode || !studentName || !courseTitle) {
        return res.status(400).json({ error: 'Dados do certificado incompletos.' });
      }

      // Preserve Portuguese Latin-1 accents (WinAnsi) while stripping emojis/unsupported chars
      const safeText = (txt: string) =>
        (txt || '')
          .replace(/[^\x20-\x7E\xA0-\xFF•–—]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      const parsedHours = Number(workloadHours) || undefined;
      const spec = getNrCertificateSpec(nrCode || courseTitle, courseTitle, parsedHours);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait matching reference
      const { width, height } = page.getSize();

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const accent = rgb(spec.accentRgb[0], spec.accentRgb[1], spec.accentRgb[2]);
      const tintBg = rgb(spec.tintRgb[0], spec.tintRgb[1], spec.tintRgb[2]);
      const darkText = rgb(0.11, 0.14, 0.18);
      const mutedText = rgb(0.38, 0.43, 0.49);

      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

      const companyUpper = safeText((companyName || '4K TREINAMENTOS').toUpperCase());
      const companyCnpj = safeText(cnpj || '48.912.340/0001-72');
      const phoneStr = safeText(companyPhone || '(11) 4002-8922');
      const addrStr = safeText(companyAddress || 'Av. Paulista, 1439 · Bela Vista, São Paulo - SP');
      const studentUpper = safeText(studentName.toUpperCase());
      const cpfClean = safeText(studentCpf || '');

      const drawCentered = (
        txt: string,
        y: number,
        size: number,
        font = fontRegular,
        color = darkText
      ) => {
        const clean = safeText(txt);
        const w = font.widthOfTextAtSize(clean, size);
        page.drawText(clean, {
          x: Math.max(36, (width - w) / 2),
          y,
          size,
          font,
          color,
        });
      };

      const wrapLines = (txt: string, maxW: number, size: number, font = fontRegular): string[] => {
        const words = safeText(txt).split(' ').filter(Boolean);
        const out: string[] = [];
        let cur = '';
        for (const w of words) {
          const cand = cur ? `${cur} ${w}` : w;
          if (font.widthOfTextAtSize(cand, size) <= maxW) {
            cur = cand;
          } else {
            if (cur) out.push(cur);
            cur = w;
          }
        }
        if (cur) out.push(cur);
        return out;
      };

      // Top Brand Header (4K TREINAMENTOS + official emblem)
      let cursorY = height - 48;
      const logoBytes = findLogoBytes();
      if (logoBytes) {
        try {
          const logoImage = await pdfDoc.embedPng(logoBytes);
          const logoH = 26;
          const logoW = (logoImage.width / logoImage.height) * logoH;
          const compW = fontBold.widthOfTextAtSize(companyUpper, 15);
          const totalW = logoW + 10 + compW;
          const startX = (width - totalW) / 2;
          page.drawImage(logoImage, {
            x: startX,
            y: cursorY - 7,
            width: logoW,
            height: logoH,
          });
          page.drawText(companyUpper, {
            x: startX + logoW + 10,
            y: cursorY,
            size: 15,
            font: fontBold,
            color: accent,
          });
        } catch {
          drawCentered(companyUpper, cursorY, 15, fontBold, accent);
        }
      } else {
        drawCentered(companyUpper, cursorY, 15, fontBold, accent);
      }

      // Framed Tinted Certificate Banner Box (exact reference style)
      const boxMargin = 54;
      const boxW = width - boxMargin * 2;
      const boxH = 82;
      const boxY = height - 166;
      page.drawRectangle({
        x: boxMargin,
        y: boxY,
        width: boxW,
        height: boxH,
        color: tintBg,
        borderColor: accent,
        borderWidth: 2.2,
      });

      drawCentered('CERTIFICADO', boxY + 46, 25, fontBold, accent);
      const bannerSub = spec.bannerSubtitle || `${spec.nrLabel} | ${spec.officialTitle}`;
      const subFontSize =
        fontBold.widthOfTextAtSize(safeText(bannerSub), 10.5) > boxW - 24
          ? fontBold.widthOfTextAtSize(safeText(bannerSub), 8.5) > boxW - 24
            ? 7.8
            : 8.5
          : 10.5;
      drawCentered(bannerSub, boxY + 20, subFontSize, fontBold, darkText);

      // Student Identification Block
      cursorY = boxY - 34;
      const nameSize = fontBold.widthOfTextAtSize(studentUpper, 17) > width - 108 ? 14 : 17;
      drawCentered(studentUpper, cursorY, nameSize, fontBold, accent);
      cursorY -= 18;

      if (cpfClean) {
        drawCentered(`CPF: ${cpfClean}`, cursorY, 10, fontRegular, darkText);
        cursorY -= 24;
      } else {
        cursorY -= 8;
      }

      // Formal Certification Paragraph
      const bodyMargin = 76;
      const bodyWidth = width - bodyMargin * 2;
      const trainingDesc =
        spec.nrKey === 'nr-33'
          ? `o treinamento de ${spec.trainingTypeLabel || 'Capacitação'} da ${spec.nrLabel} - ${spec.officialTitle}, ${spec.audienceClause || 'para trabalhadores autorizados e vigia em espaço confinado'}`
          : spec.nrKey === 'nr-35' && spec.trainingTypeLabel
            ? `o treinamento de ${spec.trainingTypeLabel} da ${spec.nrLabel} - ${spec.officialTitle}`
            : `o treinamento de ${spec.nrLabel} - ${spec.officialTitle}`;
      const certSentence = `Certificamos que ${studentUpper} concluiu com aproveitamento (${score}%) ${trainingDesc}, promovido por ${companyUpper}, CNPJ ${companyCnpj}, com carga horária de ${workloadHours} horas e validade normativa de ${validityMonths} meses.`;
      const certLines = wrapLines(certSentence, bodyWidth, 10, fontRegular);
      for (const line of certLines) {
        page.drawText(line, {
          x: bodyMargin,
          y: cursorY,
          size: 10,
          font: fontRegular,
          color: darkText,
        });
        cursorY -= 15;
      }

      // Middle Section: CONTEÚDO PROGRAMÁTICO - NR-XX
      cursorY -= 20;
      drawCentered(`CONTEÚDO PROGRAMÁTICO – ${spec.nrLabel}`, cursorY, 9.5, fontBold, accent);
      cursorY -= 18;
      const progTitleSize = fontBold.widthOfTextAtSize(safeText(spec.officialTitle), 13) > width - 80 ? 11 : 13;
      drawCentered(spec.officialTitle, cursorY, progTitleSize, fontBold, accent);
      cursorY -= 22;

      const modalityText = spec.modalitySummary || 'Treinamento teórico EAD conforme NR-01';
      const metaLine = `Modalidade informada: ${modalityText} | Avaliação formal: ${score}% | Código de validação: ${validationCode}`;
      const metaLines = wrapLines(metaLine, width - boxMargin * 2, 9.5, fontRegular);
      for (const ml of metaLines) {
        page.drawText(ml, {
          x: boxMargin,
          y: cursorY,
          size: 9.5,
          font: fontRegular,
          color: darkText,
        });
        cursorY -= 14;
      }

      cursorY -= 10;
      page.drawText('Conteúdo ministrado:', {
        x: boxMargin,
        y: cursorY,
        size: 10,
        font: fontBold,
        color: darkText,
      });
      cursorY -= 16;

      // NR-Specific Official Bulleted Syllabus
      const items =
        Array.isArray(syllabusItems) && syllabusItems.length > 0 ? syllabusItems : spec.syllabus;
      const bulletIndent = boxMargin + 10;
      const bulletMaxW = width - bulletIndent - boxMargin;

      for (const item of items) {
        const wrapped = wrapLines(item, bulletMaxW - 12, 9.5, fontRegular);
        if (cursorY - wrapped.length * 13 < 165) break;
        wrapped.forEach((line, idx) => {
          if (idx === 0) {
            page.drawText('•', {
              x: bulletIndent,
              y: cursorY,
              size: 10,
              font: fontBold,
              color: darkText,
            });
          }
          page.drawText(line, {
            x: bulletIndent + 12,
            y: cursorY,
            size: 9.5,
            font: fontRegular,
            color: darkText,
          });
          cursorY -= 13.5;
        });
      }

      // Centered Long-Form Date
      const dateFormatted =
        issuedDateStr ||
        new Date().toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      drawCentered(`São Paulo/SP, ${dateFormatted}`, 142, 9.5, fontRegular, darkText);

      // Two Side-by-Side Signature Blocks (Instructor + Student Signature Space)
      const sigLineY = 92;
      const leftStart = 96;
      const leftEnd = 276;
      const rightStart = 319;
      const rightEnd = 499;

      // Left Signature: Technical Responsible
      page.drawLine({
        start: { x: leftStart, y: sigLineY },
        end: { x: leftEnd, y: sigLineY },
        thickness: 0.9,
        color: darkText,
      });
      const cleanInstr = safeText(instructorName || 'Eng. Carlos Eduardo Mendes');
      const cleanReg = safeText(instructorRegistry || 'CREA-SP 5069821470');
      const instrCenter = (leftStart + leftEnd) / 2;
      const instrW = fontRegular.widthOfTextAtSize(cleanInstr, 9);
      page.drawText(cleanInstr, {
        x: instrCenter - instrW / 2,
        y: sigLineY - 12,
        size: 9,
        font: fontRegular,
        color: darkText,
      });
      const roleSub = safeText(`Responsável técnico – ${cleanReg}`);
      const roleSubSize = fontRegular.widthOfTextAtSize(roleSub, 8.5) > leftEnd - leftStart + 20 ? 7.5 : 8.5;
      const roleW = fontRegular.widthOfTextAtSize(roleSub, roleSubSize);
      page.drawText(roleSub, {
        x: instrCenter - roleW / 2,
        y: sigLineY - 24,
        size: roleSubSize,
        font: fontRegular,
        color: darkText,
      });

      // Right Signature: Blank space for Student Signature + Student Name
      page.drawLine({
        start: { x: rightStart, y: sigLineY },
        end: { x: rightEnd, y: sigLineY },
        thickness: 0.9,
        color: darkText,
      });
      const studentCenter = (rightStart + rightEnd) / 2;
      const studentSigSize = fontRegular.widthOfTextAtSize(studentUpper, 9) > rightEnd - rightStart + 20 ? 7.8 : 9;
      const studentSigW = fontRegular.widthOfTextAtSize(studentUpper, studentSigSize);
      page.drawText(studentUpper, {
        x: studentCenter - studentSigW / 2,
        y: sigLineY - 12,
        size: studentSigSize,
        font: fontRegular,
        color: darkText,
      });
      const studentRoleLabel = 'Aluno(a) certificado(a) – Assinatura';
      const studentRoleW = fontRegular.widthOfTextAtSize(studentRoleLabel, 8.5);
      page.drawText(studentRoleLabel, {
        x: studentCenter - studentRoleW / 2,
        y: sigLineY - 24,
        size: 8.5,
        font: fontRegular,
        color: darkText,
      });

      // Institutional Footer (4K TREINAMENTOS ONLY)
      drawCentered(
        `${companyUpper} | CNPJ ${companyCnpj} | ${phoneStr}`,
        38,
        7.5,
        fontRegular,
        mutedText
      );
      drawCentered(
        `${addrStr} | Validação em /validar · Código: ${validationCode}`,
        26,
        7.5,
        fontRegular,
        mutedText
      );

      const pdfBytes = await pdfDoc.save();
      const origin = getAppOrigin(req);
      const stored = await storeToBlobOrLocal(
        `certificates/${validationCode}.pdf`,
        Buffer.from(pdfBytes),
        'application/pdf',
        origin
      );

      return res.json({
        pdfUrl: stored.url,
        storageProvider: stored.storageProvider,
        validationCode,
      });
    } catch (error) {
      console.error('Erro ao gerar certificado PDF:', error);
      return res.status(500).json({ error: 'Falha ao gerar arquivo PDF do certificado.' });
    }
  });

  app.post('/api/safety-docs/generate-apr', async (req, res) => {
    try {
      const {
        requestId,
        companyName,
        requesterName,
        serviceDescription,
        workAtHeight,
        equipmentList,
        workersInvolved,
        identifiedRisks,
        preventiveMeasures,
        applicableNrs,
      } = req.body as {
        requestId?: string;
        companyName?: string;
        requesterName?: string;
        serviceDescription?: string;
        workAtHeight?: boolean;
        equipmentList?: string;
        workersInvolved?: string;
        identifiedRisks?: string[];
        preventiveMeasures?: string[];
        applicableNrs?: string[];
      };

      if (!serviceDescription || !workersInvolved) {
        return res.status(400).json({ error: 'Descrição do serviço e colaboradores envolvidos são obrigatórios.' });
      }

      const sanitizeAscii = (txt: string) =>
        (txt || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\x20-\x7E\n]/g, ' ');

      const docId = sanitizeAscii(requestId || `APR-${Date.now()}`);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const navy = rgb(0.039, 0.145, 0.251);
      const amber = rgb(0.961, 0.773, 0.094);
      const slate = rgb(0.28, 0.33, 0.41);
      const lightBg = rgb(0.968, 0.976, 0.988);

      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
      page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: navy });

      let titleX = 40;
      const logoBytes = findLogoBytes();
      if (logoBytes) {
        try {
          const logoImage = await pdfDoc.embedPng(logoBytes);
          const logoH = 44;
          const logoW = (logoImage.width / logoImage.height) * logoH;
          page.drawImage(logoImage, { x: 36, y: height - 70, width: logoW, height: logoH });
          titleX = 36 + logoW + 14;
        } catch {
          // Fallback silently
        }
      }

      page.drawText('ANALISE PRELIMINAR DE RISCO (APR)', {
        x: titleX,
        y: height - 44,
        size: 14,
        font: fontBold,
        color: amber,
      });
      page.drawText('4k Treinamentos · Documentacao Tecnica de Seguranca do Trabalho', {
        x: titleX,
        y: height - 62,
        size: 9,
        font: fontRegular,
        color: rgb(0.85, 0.88, 0.92),
      });
      page.drawText(`CODIGO: ${docId}  |  EMISSAO: ${new Date().toLocaleDateString('pt-BR')}`, {
        x: titleX,
        y: height - 78,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      let cursorY = height - 122;
      const margin = 36;
      const contentW = width - margin * 2;

      const wrapText = (text: string, maxWidth: number, fontSize: number, font = fontRegular) => {
        const words = sanitizeAscii(text).replace(/\n+/g, ' ').split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let cur = '';
        for (const w of words) {
          const cand = cur ? `${cur} ${w}` : w;
          if (font.widthOfTextAtSize(cand, fontSize) <= maxWidth) {
            cur = cand;
          } else {
            if (cur) lines.push(cur);
            cur = w;
          }
        }
        if (cur) lines.push(cur);
        return lines;
      };

      const drawSectionBox = (heading: string, lines: string[], accentBg = false) => {
        const boxH = 26 + Math.max(1, lines.length) * 14 + 10;
        if (cursorY - boxH < 90) return;
        page.drawRectangle({
          x: margin,
          y: cursorY - boxH,
          width: contentW,
          height: boxH,
          color: accentBg ? lightBg : rgb(1, 1, 1),
          borderColor: rgb(0.84, 0.87, 0.91),
          borderWidth: 1,
        });
        page.drawText(sanitizeAscii(heading).toUpperCase(), {
          x: margin + 12,
          y: cursorY - 18,
          size: 8.5,
          font: fontBold,
          color: navy,
        });
        lines.forEach((line, idx) => {
          page.drawText(line, {
            x: margin + 12,
            y: cursorY - 35 - idx * 14,
            size: 9.5,
            font: fontRegular,
            color: slate,
          });
        });
        cursorY -= boxH + 12;
      };

      drawSectionBox(
        '1. Identificacao da Atividade e Responsaveis',
        [
          `Empresa / Solicitante: ${sanitizeAscii(companyName || requesterName || 'Nao informado')} (Resp: ${sanitizeAscii(requesterName || '-')})`,
          `Trabalho em Altura (> 2,00m - NR-35): ${workAtHeight ? 'SIM - Exige cinto paraquedista, linha de vida e PT' : 'NAO'}`,
          `Normas Aplicaveis: ${sanitizeAscii((applicableNrs && applicableNrs.length ? applicableNrs : ['NR-01', 'NR-06']).join(', '))}`,
        ],
        true
      );

      drawSectionBox(
        '2. Descricao do Servico Executado',
        wrapText(serviceDescription, contentW - 24, 9.5).slice(0, 6)
      );

      drawSectionBox(
        '3. Equipamentos, Ferramentas e EPIs Relacionados',
        wrapText(equipmentList || 'EPIs basicos (capacete, oculos, botina e luvas conforme NR-06).', contentW - 24, 9.5).slice(0, 4),
        true
      );

      drawSectionBox(
        '4. Riscos Identificados Automaticamente',
        (identifiedRisks && identifiedRisks.length > 0 ? identifiedRisks : ['Riscos mecanicos, ergonomicos e operacionais inerentes a tarefa.'])
          .slice(0, 5)
          .flatMap((r) => wrapText(`• ${r}`, contentW - 24, 9.5))
          .slice(0, 8)
      );

      drawSectionBox(
        '5. Medidas Preventivas e Controles Obrigatorios',
        (preventiveMeasures && preventiveMeasures.length > 0
          ? preventiveMeasures
          : ['Inspecao previa de ferramentas e uso integral de EPIs com CA ativo.'])
          .slice(0, 6)
          .flatMap((m) => wrapText(`• ${m}`, contentW - 24, 9.5))
          .slice(0, 9),
        true
      );

      drawSectionBox(
        '6. Equipe Envolvida e Ciencia de Execucao',
        wrapText(`Colaboradores: ${workersInvolved}`, contentW - 24, 9.5).slice(0, 4)
      );

      const sigY = 58;
      page.drawLine({ start: { x: margin, y: sigY + 18 }, end: { x: 270, y: sigY + 18 }, thickness: 1, color: navy });
      page.drawText('Responsavel pela Liberacao / Lideranca', { x: margin, y: sigY + 5, size: 8.5, font: fontBold, color: navy });
      page.drawLine({ start: { x: 325, y: sigY + 18 }, end: { x: width - margin, y: sigY + 18 }, thickness: 1, color: navy });
      page.drawText('Ciencia dos Colaboradores Executantes', { x: 325, y: sigY + 5, size: 8.5, font: fontBold, color: navy });
      page.drawText('Documento gerado via 4k Treinamentos · Valide sua equipe e emita certificados em 4ktreinamentos', {
        x: margin,
        y: 26,
        size: 7.5,
        font: fontRegular,
        color: slate,
      });

      const pdfBytes = await pdfDoc.save();
      const origin = getAppOrigin(req);
      const stored = await storeToBlobOrLocal(
        `safety-docs/${docId}.pdf`,
        Buffer.from(pdfBytes),
        'application/pdf',
        origin
      );

      return res.json({
        pdfUrl: stored.url,
        storageProvider: stored.storageProvider,
        docId,
      });
    } catch (error) {
      console.error('Erro ao gerar APR PDF:', error);
      return res.status(500).json({ error: 'Falha ao gerar arquivo PDF da APR.' });
    }
  });

  return app;
}
