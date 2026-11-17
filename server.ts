import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const BLOB_FALLBACK_DIR = path.resolve('/tmp/4k-blobs');
if (!fs.existsSync(BLOB_FALLBACK_DIR)) {
  fs.mkdirSync(BLOB_FALLBACK_DIR, { recursive: true });
}

const ADMIN_EMAIL = 'admin@x.com';
const ADMIN_PASS = 'admin4321';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '4k-treinamentos-session-secret-2026';

// In-memory + /tmp persisted runtime state synced with Admin settings & webhook callbacks
let runtimeInfinitePayHandle = process.env.INFINITEPAY_HANDLE || '';
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

// Optional Firebase Admin initialization for server-side webhook enrollment release
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
  if (process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Serve fallback blob files when BLOB_READ_WRITE_TOKEN is not set in preview
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
      infinitePayHandleConfigured: Boolean(runtimeInfinitePayHandle),
      infinitePayHandlePreview: runtimeInfinitePayHandle || null,
    });
  });

  // Upload any media (course cover, banner, PDF material, video) via Vercel Blob
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
    if (email?.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
      const token = signAdminCookie(ADMIN_EMAIL);
      res.cookie('4k_admin_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
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
    res.clearCookie('4k_admin_session');
    res.json({ ok: true });
  });

  app.post('/api/settings/integrations', (req, res) => {
    const { infinitePayHandle } = req.body as { infinitePayHandle?: string };
    if (typeof infinitePayHandle === 'string') {
      runtimeInfinitePayHandle = infinitePayHandle.trim().replace(/^@/, '');
    }
    res.json({ ok: true, infinitePayHandle: runtimeInfinitePayHandle });
  });

  // InfinitePay Checkout Integrado — Create Payment Link (Single, Combo, Order Bump, or Upsell)
  app.post('/api/checkout/create-link', async (req, res) => {
    try {
      const {
        orderId,
        courseTitle,
        priceCents,
        items,
        handleOverride,
        customerName,
        customerEmail,
        redirectPath,
        orderMeta,
      } = req.body as {
        orderId: string;
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

      const normalizedItems =
        Array.isArray(items) && items.length > 0
          ? items.map((it) => ({
              quantity: Math.max(1, Math.round(it.quantity || 1)),
              price: Math.round(it.price),
              description: String(it.description || 'Curso NR').slice(0, 120),
            }))
          : courseTitle && typeof priceCents === 'number'
            ? [
                {
                  quantity: 1,
                  price: Math.round(priceCents),
                  description: courseTitle.slice(0, 120),
                },
              ]
            : [];

      if (!orderId || normalizedItems.length === 0) {
        return res.status(400).json({ error: 'Dados do pedido incompletos.' });
      }

      if (orderMeta?.userId && Array.isArray(orderMeta.courseIds) && orderMeta.courseIds.length > 0) {
        pendingOrderMetaMap.set(orderId, {
          orderId,
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

      const handle = (handleOverride || runtimeInfinitePayHandle || process.env.INFINITEPAY_HANDLE || '').trim().replace(/^@/, '');
      if (!handle) {
        return res.status(422).json({
          requiresHandleConfig: true,
          error:
            'InfiniteTag (handle) não configurada. Acesse o Painel Admin → Configurações Gerais e informe sua InfiniteTag InfinitePay.',
        });
      }

      const origin = getAppOrigin(req);
      const finalRedirect = redirectPath
        ? `${origin}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`
        : `${origin}/checkout/sucesso?order_nsu=${encodeURIComponent(orderId)}`;

      const payload = {
        handle,
        items: normalizedItems,
        order_nsu: orderId,
        redirect_url: finalRedirect,
        webhook_url: `${origin}/api/webhooks/infinitepay`,
        ...(customerName || customerEmail
          ? {
              customer: {
                ...(customerName ? { name: customerName } : {}),
                ...(customerEmail ? { email: customerEmail } : {}),
              },
            }
          : {}),
      };

      const ipRes = await fetch('https://api.checkout.infinitepay.io/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await ipRes.json().catch(() => ({}))) as { url?: string; message?: string; error?: string };

      if (!ipRes.ok || !data.url) {
        return res.status(502).json({
          error: data.message || data.error || 'Erro ao gerar link na API InfinitePay.',
          details: data,
        });
      }

      return res.json({ url: data.url, order_nsu: orderId });
    } catch (error) {
      console.error('Erro InfinitePay create-link:', error);
      return res.status(500).json({ error: 'Falha ao conectar com InfinitePay Checkout Integrado.' });
    }
  });

  // Helper to release all courses in an order via Firebase Admin SDK + local verified grants cache
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

  // InfinitePay Official Webhook Receiver
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

  // InfinitePay Official Payment Check
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

      // Check local webhook cache first
      const cached = confirmedPayments.get(order_nsu);
      if (cached) {
        await releaseOrderViaFirebaseAdmin(order_nsu, cached.transaction_nsu, cached.invoice_slug);
        return res.json({
          paid: true,
          source: 'webhook',
          ...cached,
        });
      }

      const handle = (handleOverride || runtimeInfinitePayHandle || process.env.INFINITEPAY_HANDLE || '').trim().replace(/^@/, '');
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

  // Certificate PDF generation + upload to Vercel Blob
  app.post('/api/certificates/generate', async (req, res) => {
    try {
      const {
        validationCode,
        studentName,
        courseTitle,
        nrCode,
        workloadHours,
        validityMonths,
        score,
        issuedDateStr,
        instructorName,
        instructorRole,
        instructorRegistry,
        templateHeader,
        templateBody,
        companyName,
        cnpj,
      } = req.body as {
        validationCode: string;
        studentName: string;
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
      };

      if (!validationCode || !studentName || !courseTitle) {
        return res.status(400).json({ error: 'Dados do certificado incompletos.' });
      }

      // Generate A4 Landscape PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
      const { width, height } = page.getSize();

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const navy = rgb(0.058, 0.09, 0.165); // #0F172A
      const amber = rgb(0.96, 0.62, 0.043); // #F59E0B
      const slate = rgb(0.28, 0.33, 0.41);
      const lightBg = rgb(0.973, 0.98, 0.988);

      // Background & double architectural frame
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
      page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: navy, borderWidth: 3 });
      page.drawRectangle({ x: 34, y: 34, width: width - 68, height: height - 68, borderColor: amber, borderWidth: 1.5 });

      // Top Navy Header Band
      page.drawRectangle({ x: 35, y: height - 120, width: width - 70, height: 85, color: navy });

      let headerTextX = 64;
      const logoCandidates = [
        path.resolve(process.cwd(), 'dist/images/logo_4k_treinamentos.png'),
        path.resolve(process.cwd(), 'public/images/logo_4k_treinamentos.png'),
        path.resolve(process.cwd(), 'src/assets/images/logo_4k_treinamentos.png'),
      ];
      const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
      if (logoPath) {
        try {
          const logoBytes = fs.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoBytes);
          const logoH = 54;
          const logoW = (logoImage.width / logoImage.height) * logoH;
          page.drawImage(logoImage, {
            x: 56,
            y: height - 104,
            width: logoW,
            height: logoH,
          });
          headerTextX = 56 + logoW + 14;
        } catch {
          // Fallback cleanly to text header if logo embed fails
        }
      }

      page.drawText((companyName || '4K TREINAMENTOS').toUpperCase(), {
        x: headerTextX,
        y: height - 74,
        size: 18,
        font: fontBold,
        color: amber,
      });
      page.drawText('SEGURANCA DO TRABALHO · NORMAS REGULAMENTADORAS', {
        x: headerTextX,
        y: height - 96,
        size: 9,
        font: fontRegular,
        color: rgb(0.85, 0.88, 0.92),
      });

      const codeText = `CODIGO: ${validationCode}`;
      page.drawText(codeText, {
        x: width - 64 - fontBold.widthOfTextAtSize(codeText, 10),
        y: height - 82,
        size: 10,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      // Certificate Main Title
      const headerLabel = (templateHeader || 'CERTIFICADO DE CONCLUSAO E APROVACAO').toUpperCase();
      const headerWidth = fontBold.widthOfTextAtSize(headerLabel, 18);
      page.drawText(headerLabel, {
        x: (width - headerWidth) / 2,
        y: height - 168,
        size: 18,
        font: fontBold,
        color: navy,
      });

      // Student Name
      const cleanStudent = studentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const studentWidth = fontBold.widthOfTextAtSize(cleanStudent, 28);
      page.drawText(cleanStudent, {
        x: (width - studentWidth) / 2,
        y: height - 222,
        size: 28,
        font: fontBold,
        color: navy,
      });

      page.drawLine({
        start: { x: 160, y: height - 234 },
        end: { x: width - 160, y: height - 234 },
        thickness: 1.2,
        color: amber,
      });

      // Course Identification
      const cleanCourse = `${nrCode} - ${courseTitle}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const courseFontSize = cleanCourse.length > 52 ? 14 : 17;
      const courseWidth = fontBold.widthOfTextAtSize(cleanCourse, courseFontSize);
      page.drawText(cleanCourse, {
        x: (width - courseWidth) / 2,
        y: height - 270,
        size: courseFontSize,
        font: fontBold,
        color: navy,
      });

      // Body Paragraph (wrapped safely)
      const defaultBody = `Concluiu com aproveitamento de ${score}% na avaliacao formal o curso de capacitacao teorica em ${nrCode}, com carga horaria de ${workloadHours} horas e validade normativa de ${validityMonths} meses, em conformidade com as diretrizes do Ministerio do Trabalho e Emprego.`;
      const bodyRaw = (templateBody && templateBody.length > 20 ? `${defaultBody}` : defaultBody)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const words = bodyRaw.split(' ');
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (fontRegular.widthOfTextAtSize(next, 11.5) > width - 160) {
          lines.push(current);
          current = word;
        } else {
          current = next;
        }
      }
      if (current) lines.push(current);

      let cursorY = height - 308;
      for (const line of lines.slice(0, 4)) {
        const lw = fontRegular.widthOfTextAtSize(line, 11.5);
        page.drawText(line, {
          x: (width - lw) / 2,
          y: cursorY,
          size: 11.5,
          font: fontRegular,
          color: slate,
        });
        cursorY -= 18;
      }

      // Structured Metadata Strip
      page.drawRectangle({ x: 80, y: 158, width: width - 160, height: 48, color: lightBg, borderColor: rgb(0.88, 0.9, 0.94), borderWidth: 1 });
      const dateStr = issuedDateStr || new Date().toLocaleDateString('pt-BR');
      const metaItems = [
        { label: 'CARGA HORARIA', value: `${workloadHours} horas` },
        { label: 'APROVEITAMENTO', value: `${score}%` },
        { label: 'DATA DE EMISSAO', value: dateStr },
        { label: 'VALIDADE', value: `${validityMonths} meses` },
      ];
      const colW = (width - 160) / 4;
      metaItems.forEach((item, idx) => {
        const cx = 96 + idx * colW;
        page.drawText(item.label, { x: cx, y: 188, size: 7.5, font: fontBold, color: slate });
        page.drawText(item.value, { x: cx, y: 170, size: 11, font: fontBold, color: navy });
      });

      // Signature Blocks
      const sigY = 92;
      // Left: Instructor
      page.drawLine({ start: { x: 96, y: sigY + 22 }, end: { x: 340, y: sigY + 22 }, thickness: 1, color: navy });
      const cleanInstr = (instructorName || 'Eng. Carlos Eduardo Mendes').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanRole = (instructorRole || 'Engenheiro de Seguranca do Trabalho').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanReg = (instructorRegistry || 'CREA-SP 5069821470').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      page.drawText(cleanInstr, { x: 96, y: sigY + 8, size: 10, font: fontBold, color: navy });
      page.drawText(`${cleanRole} · ${cleanReg}`, { x: 96, y: sigY - 6, size: 8.5, font: fontRegular, color: slate });

      // Right: Institution
      page.drawLine({ start: { x: width - 340, y: sigY + 22 }, end: { x: width - 96, y: sigY + 22 }, thickness: 1, color: navy });
      page.drawText((companyName || '4k Treinamentos LTDA').normalize('NFD').replace(/[\u0300-\u036f]/g, ''), {
        x: width - 340,
        y: sigY + 8,
        size: 10,
        font: fontBold,
        color: navy,
      });
      page.drawText(`CNPJ ${cnpj || '48.912.340/0001-72'} · Validacao em /validar`, {
        x: width - 340,
        y: sigY - 6,
        size: 8.5,
        font: fontRegular,
        color: slate,
      });

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

  // ---------------------------------------------------------------------------
  // 5b. Automatic / Semi-Automatic APR PDF Generation
  // ---------------------------------------------------------------------------
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
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
      const { width, height } = page.getSize();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const navy = rgb(0.039, 0.145, 0.251); // #0A2540
      const amber = rgb(0.961, 0.773, 0.094); // #F5C518
      const slate = rgb(0.28, 0.33, 0.41);
      const lightBg = rgb(0.968, 0.976, 0.988);

      // Background & Header Band
      page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
      page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: navy });

      let titleX = 40;
      const logoCandidates = [
        path.resolve(process.cwd(), 'dist/images/logo_4k_treinamentos.png'),
        path.resolve(process.cwd(), 'public/images/logo_4k_treinamentos.png'),
        path.resolve(process.cwd(), 'src/assets/images/logo_4k_treinamentos.png'),
      ];
      const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
      if (logoPath) {
        try {
          const logoBytes = fs.readFileSync(logoPath);
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

      // Footer Signatures
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

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`4k Treinamentos rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
