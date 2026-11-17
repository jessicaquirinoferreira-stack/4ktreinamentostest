import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PUBLIC_SETTINGS, formatCurrencyBRL, OFFICIAL_LOGO_URL } from '../data/seedCourses';
import { db } from '../lib/firebase';
import {
  deleteCourseAdmin,
  deleteCourseModuleAdmin,
  deleteExamQuestionAdmin,
  deleteFunnelOfferAdmin,
  deleteTestimonialAdmin,
  fetchAllCertificatesAdmin,
  fetchAllCoursesAdmin,
  fetchAllEnrollmentsAdmin,
  fetchAllOrdersAdmin,
  fetchAllSafetyDocRequestsAdmin,
  fetchAllUsersAdmin,
  fetchCorporateQuotesAdmin,
  fetchCourseModules,
  fetchCourseQuestions,
  fetchFunnelOffers,
  fetchPublicSettings,
  fetchPublishedCourses,
  fetchTestimonials,
  releaseOrderAndEnrollAdmin,
  saveCourseAdmin,
  saveCourseModuleAdmin,
  saveExamQuestionAdmin,
  saveFunnelOfferAdmin,
  saveTestimonialAdmin,
  seedInitialDatabaseIfEmpty,
  updateOrderStatusAdmin,
  updateSafetyDocStatusAdmin,
  uploadFileToVercelBlob,
} from '../lib/firestoreService';
import type {
  Certificate,
  CorporateQuote,
  Course,
  CourseLesson,
  CourseModule,
  Enrollment,
  ExamQuestion,
  FunnelOffer,
  FunnelOfferType,
  Order,
  PublicSettings,
  SafetyDocRequest,
  SafetyDocStatus,
  Testimonial,
  UserProfile,
} from '../types';

type AdminTab =
  | 'dashboard'
  | 'courses'
  | 'lessons'
  | 'funnel'
  | 'testimonials'
  | 'orders'
  | 'students'
  | 'certificates'
  | 'quotes'
  | 'safetyDocs'
  | 'settings';

export function AdminPage() {
  const { user, loading: authLoading, isAdmin, loginAdminCredentials, loginWithGoogle, logout } = useAuth();
  const [loginEmail, setLoginEmail] = useState('admin@x.com');
  const [loginPass, setLoginPass] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [authHint, setAuthHint] = useState<string | null>(null);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [funnelOffers, setFunnelOffers] = useState<FunnelOffer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [quotes, setQuotes] = useState<CorporateQuote[]>([]);
  const [safetyDocs, setSafetyDocs] = useState<SafetyDocRequest[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({ ...DEFAULT_PUBLIC_SETTINGS, updatedAt: null });
  const [infinitePayHandle, setInfinitePayHandle] = useState('');
  const [blobConfigured, setBlobConfigured] = useState(false);

  // Course Editor State
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [outcomesText, setOutcomesText] = useState('');
  const [bonusesText, setBonusesText] = useState('');
  const [notForText, setNotForText] = useState('');

  // Funnel Offer Editor State
  const [editingOffer, setEditingOffer] = useState<Partial<FunnelOffer> | null>(null);
  const [isNewOffer, setIsNewOffer] = useState(false);

  // Testimonial Editor State
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isNewTestimonial, setIsNewTestimonial] = useState(false);

  // Lesson & Exam Manager State
  const [selectedCourseId, setSelectedCourseId] = useState('nr-35');
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [courseQuestions, setCourseQuestions] = useState<ExamQuestion[]>([]);
  const [newModTitle, setNewModTitle] = useState('');
  const [newLessonModId, setNewLessonModId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'text' | 'video' | 'pdf'>('text');
  const [newLessonDuration, setNewLessonDuration] = useState('30');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonMediaUrl, setNewLessonMediaUrl] = useState('');
  const [uploadingLessonMedia, setUploadingLessonMedia] = useState(false);

  // New Question state
  const [qPrompt, setQPrompt] = useState('');
  const [qOpts, setQOpts] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [cList, offersList, testList, pubSet, blobRes] = await Promise.all([
        user ? fetchAllCoursesAdmin().catch(() => fetchPublishedCourses()) : fetchPublishedCourses(),
        fetchFunnelOffers(false),
        fetchTestimonials(undefined, false),
        fetchPublicSettings(),
        fetch('/api/blob/status').then((r) => r.json()).catch(() => ({})),
      ]);
      setCourses(cList);
      setFunnelOffers(offersList);
      setTestimonials(testList);
      setSettings(pubSet);
      setBlobConfigured(Boolean(blobRes?.vercelBlobConfigured));
      if (blobRes?.infinitePayHandlePreview) {
        setInfinitePayHandle(blobRes.infinitePayHandlePreview);
      }

      if (user) {
        const [ords, enrs, usrs, certs, qts, sDocs] = await Promise.all([
          fetchAllOrdersAdmin().catch(() => []),
          fetchAllEnrollmentsAdmin().catch(() => []),
          fetchAllUsersAdmin().catch(() => []),
          fetchAllCertificatesAdmin().catch(() => []),
          fetchCorporateQuotesAdmin().catch(() => []),
          fetchAllSafetyDocRequestsAdmin().catch(() => []),
        ]);
        setOrders(ords);
        setEnrollments(enrs);
        setUsers(usrs);
        setCertificates(certs);
        setQuotes(qts);
        setSafetyDocs(sDocs);

        try {
          const intSnap = await getDoc(doc(db, 'settings', 'integrations'));
          if (intSnap.exists()) {
            const h = intSnap.data().infinitePayHandle || '';
            setInfinitePayHandle(h);
          }
        } catch {
          // Ignore if non-Firebase admin session
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAllAdminData();
    }
  }, [authLoading, isAdmin, user]);

  useEffect(() => {
    if (isAdmin && selectedCourseId) {
      Promise.all([
        fetchCourseModules(selectedCourseId),
        fetchCourseQuestions(selectedCourseId),
      ]).then(([mods, qs]) => {
        setCourseModules(mods);
        setCourseQuestions(qs);
        if (mods[0]) setNewLessonModId(mods[0].id);
      });
    }
  }, [isAdmin, selectedCourseId]);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setAuthHint(null);
    try {
      const result = await loginAdminCredentials(loginEmail, loginPass);
      if (result.note) setAuthHint(result.note);
      toast.success('Acesso administrativo autorizado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credenciais inválidas.');
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleSyncSeed() {
    try {
      const count = await seedInitialDatabaseIfEmpty();
      toast.success(
        count > 0
          ? `${count} cursos NR sincronizados/atualizados no Firestore!`
          : 'Todos os 9 cursos NR já estão sincronizados no Firestore.'
      );
      await loadAllAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao sincronizar cursos.');
    }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const res = await uploadFileToVercelBlob(file, 'courses');
      setEditingCourse((prev) => (prev ? { ...prev, coverImageUrl: res.url, bannerImageUrl: res.url } : prev));
      toast.success(`Imagem enviada (${res.storageProvider === 'vercel-blob' ? 'Vercel Blob' : 'Preview Local'}).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploadingCover(false);
    }
  }

  function openCourseEditor(course: Partial<Course>, creatingNew: boolean) {
    setIsNewCourse(creatingNew);
    setEditingCourse(course);
    setOutcomesText((course.learningOutcomes || []).join('\n'));
    setBonusesText((course.includedBonuses || []).join('\n'));
    setNotForText((course.notForAudience || []).join('\n'));
  }

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCourse?.id || !editingCourse?.title || !editingCourse?.nrCode) {
      toast.error('ID, Código NR e Título são obrigatórios.');
      return;
    }
    try {
      const cleanId = editingCourse.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const parseLines = (raw: string) =>
        raw
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

      const learningOutcomes = parseLines(outcomesText);
      const includedBonuses = parseLines(bonusesText);
      const notForAudience = parseLines(notForText);

      await saveCourseAdmin(
        {
          id: cleanId,
          slug: cleanId,
          nrCode: editingCourse.nrCode,
          title: editingCourse.title,
          shortDescription: editingCourse.shortDescription || '',
          fullDescription: editingCourse.fullDescription || '',
          ...(editingCourse.salesHeadline?.trim() ? { salesHeadline: editingCourse.salesHeadline.trim() } : {}),
          ...(editingCourse.salesSubheadline?.trim() ? { salesSubheadline: editingCourse.salesSubheadline.trim() } : {}),
          ...(editingCourse.promoTag?.trim() ? { promoTag: editingCourse.promoTag.trim() } : {}),
          ...(Number(editingCourse.originalPriceCents) > 0
            ? { originalPriceCents: Number(editingCourse.originalPriceCents) }
            : {}),
          ...(Number(editingCourse.enrolledCount) >= 0 && editingCourse.enrolledCount !== undefined
            ? { enrolledCount: Number(editingCourse.enrolledCount) }
            : {}),
          ...(editingCourse.ratingAverage ? { ratingAverage: Number(editingCourse.ratingAverage) } : {}),
          ...(editingCourse.ratingCount ? { ratingCount: Number(editingCourse.ratingCount) } : {}),
          guaranteeDays: Number(editingCourse.guaranteeDays) || 7,
          workloadHours: Number(editingCourse.workloadHours) || 8,
          priceCents: Number(editingCourse.priceCents) || 9900,
          certificateValidityMonths: Number(editingCourse.certificateValidityMonths) || 24,
          targetAudience: editingCourse.targetAudience || '',
          ...(notForAudience.length ? { notForAudience } : {}),
          ...(includedBonuses.length ? { includedBonuses } : {}),
          ...(learningOutcomes.length ? { learningOutcomes } : {}),
          ...(editingCourse.faq?.length ? { faq: editingCourse.faq } : {}),
          coverImageUrl: editingCourse.coverImageUrl || '',
          bannerImageUrl: editingCourse.bannerImageUrl || editingCourse.coverImageUrl || '',
          instructorName: editingCourse.instructorName || settings.defaultInstructorName || 'Eng. Carlos Eduardo Mendes',
          instructorRole: editingCourse.instructorRole || settings.defaultInstructorRole || 'Engenheiro de Segurança do Trabalho',
          instructorRegistry: editingCourse.instructorRegistry || settings.defaultInstructorRegistry || 'CREA-SP 5069821470',
          status: editingCourse.status || 'published',
          displayOrder: Number(editingCourse.displayOrder) || 1,
          passingScore: Number(editingCourse.passingScore) || 70,
        },
        isNewCourse
      );
      toast.success('Curso salvo no Firestore.');
      setEditingCourse(null);
      await loadAllAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar curso.');
    }
  }

  async function handleSaveFunnelOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOffer?.title?.trim() || !editingOffer.includedCourseIds?.length) {
      toast.error('Informe o título da oferta e selecione ao menos 1 curso incluído.');
      return;
    }
    try {
      const cleanId = (
        editingOffer.id?.trim() ||
        `${editingOffer.type || 'offer'}-${Date.now()}`
      )
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');

      await saveFunnelOfferAdmin({
        id: cleanId,
        type: (editingOffer.type || 'order_bump') as FunnelOfferType,
        title: editingOffer.title.trim(),
        ...(editingOffer.subtitle?.trim() ? { subtitle: editingOffer.subtitle.trim() } : {}),
        description: editingOffer.description?.trim() || '',
        ...(editingOffer.triggerCourseId?.trim() ? { triggerCourseId: editingOffer.triggerCourseId.trim() } : {}),
        includedCourseIds: editingOffer.includedCourseIds,
        originalPriceCents: Number(editingOffer.originalPriceCents) || 0,
        offerPriceCents: Number(editingOffer.offerPriceCents) || 0,
        ...(editingOffer.badgeLabel?.trim() ? { badgeLabel: editingOffer.badgeLabel.trim() } : {}),
        active: editingOffer.active ?? true,
        displayOrder: Number(editingOffer.displayOrder) || 1,
      });
      toast.success('Oferta de funil salva no Firestore.');
      setEditingOffer(null);
      await loadAllAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar oferta.');
    }
  }

  async function handleSaveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTestimonial?.authorName?.trim() || !editingTestimonial?.quote?.trim()) {
      toast.error('Nome do autor e depoimento são obrigatórios.');
      return;
    }
    try {
      const cleanId = (editingTestimonial.id?.trim() || `test-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');

      await saveTestimonialAdmin({
        id: cleanId,
        courseId: editingTestimonial.courseId || 'all',
        authorName: editingTestimonial.authorName.trim(),
        authorRole: editingTestimonial.authorRole?.trim() || 'Aluno Certificado',
        company: editingTestimonial.company?.trim() || 'Empresa Parceira',
        rating: Math.min(5, Math.max(1, Number(editingTestimonial.rating) || 5)),
        quote: editingTestimonial.quote.trim(),
        verifiedPurchase: editingTestimonial.verifiedPurchase ?? true,
        active: editingTestimonial.active ?? true,
        displayOrder: Number(editingTestimonial.displayOrder) || 1,
      });
      toast.success('Depoimento salvo com sucesso.');
      setEditingTestimonial(null);
      await loadAllAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar depoimento.');
    }
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    const modId = `mod_${Date.now()}`;
    try {
      await saveCourseModuleAdmin({
        id: modId,
        courseId: selectedCourseId,
        title: newModTitle.trim(),
        description: '',
        order: courseModules.length + 1,
        lessons: [],
      });
      setNewModTitle('');
      const mods = await fetchCourseModules(selectedCourseId);
      setCourseModules(mods);
      setNewLessonModId(modId);
      toast.success('Módulo adicionado.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar módulo.');
    }
  }

  async function handleLessonMediaUpload(file: File) {
    setUploadingLessonMedia(true);
    try {
      const res = await uploadFileToVercelBlob(file, 'lessons');
      setNewLessonMediaUrl(res.url);
      toast.success(`Arquivo enviado via ${res.storageProvider === 'vercel-blob' ? 'Vercel Blob' : 'Preview Local'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploadingLessonMedia(false);
    }
  }

  async function handleAddLesson(e: React.FormEvent) {
    e.preventDefault();
    const targetMod = courseModules.find((m) => m.id === newLessonModId);
    if (!targetMod || !newLessonTitle.trim()) {
      toast.error('Selecione um módulo e informe o título da aula.');
      return;
    }
    const newLesson: CourseLesson = {
      id: `les_${Date.now()}`,
      title: newLessonTitle.trim(),
      type: newLessonType,
      durationMinutes: Number(newLessonDuration) || 30,
      content: newLessonContent.trim() || 'Conteúdo da aula.',
      ...(newLessonType === 'video' && newLessonMediaUrl ? { videoUrl: newLessonMediaUrl } : {}),
      ...(newLessonType === 'pdf' && newLessonMediaUrl ? { pdfUrl: newLessonMediaUrl } : {}),
      order: targetMod.lessons.length + 1,
    };

    try {
      await saveCourseModuleAdmin({
        ...targetMod,
        lessons: [...targetMod.lessons, newLesson],
      });
      setNewLessonTitle('');
      setNewLessonContent('');
      setNewLessonMediaUrl('');
      const mods = await fetchCourseModules(selectedCourseId);
      setCourseModules(mods);
      toast.success('Aula salva no módulo.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar aula.');
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qPrompt.trim() || qOpts.some((o) => !o.trim())) {
      toast.error('Preencha o enunciado e as 4 alternativas.');
      return;
    }
    try {
      await saveExamQuestionAdmin({
        id: `q_${Date.now()}`,
        courseId: selectedCourseId,
        prompt: qPrompt.trim(),
        options: qOpts.map((o) => o.trim()),
        correctIndex: qCorrect,
        order: courseQuestions.length + 1,
      });
      setQPrompt('');
      setQOpts(['', '', '', '']);
      setQCorrect(0);
      const qs = await fetchCourseQuestions(selectedCourseId);
      setCourseQuestions(qs);
      toast.success('Questão adicionada à prova.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar questão.');
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infinitePayHandle }),
      });

      if (user) {
        await setDoc(doc(db, 'settings', 'public'), {
          ...settings,
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'settings', 'integrations'), {
          infinitePayHandle: infinitePayHandle.trim().replace(/^@/, ''),
          updatedAt: serverTimestamp(),
        });
      }
      toast.success('Configurações gerais e InfiniteTag salvas com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar configurações.');
    }
  }

  async function handleReissueCertificate(cert: Certificate) {
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationCode: cert.validationCode,
          studentName: cert.studentName,
          courseTitle: cert.courseTitle,
          nrCode: cert.nrCode,
          workloadHours: cert.workloadHours,
          validityMonths: cert.validityMonths,
          score: cert.score,
          instructorName: cert.instructorName,
          instructorRole: cert.instructorRole,
          instructorRegistry: cert.instructorRegistry,
          templateHeader: settings.certificateTemplateHeader,
          templateBody: settings.certificateTemplateBody,
          companyName: settings.companyName,
          cnpj: settings.cnpj,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await updateDoc(doc(db, 'certificates', cert.id), { pdfUrl: data.pdfUrl });
      toast.success('Certificado reemitido e atualizado no Blob.');
      await loadAllAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao reemitir certificado.');
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-[80vh] bg-[#0A2540] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="4k Treinamentos"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain mb-2"
            />
            <p className="text-xs font-mono font-bold text-[#0F2C59]">ADMINISTRAÇÃO 4K TREINAMENTOS</p>
            <h1 className="font-display text-2xl font-extrabold text-[#0A2540]">Painel Administrativo</h1>
            <p className="text-sm text-slate-600">Acesso restrito à gestão de cursos, vendas e certificados.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail administrativo</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full min-h-[44px] py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg cursor-pointer disabled:opacity-60 transition-colors"
            >
              {loginBusy ? 'Entrando...' : 'Entrar no Painel Admin'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => loginWithGoogle().catch((err) => toast.error(err.message))}
              className="w-full py-2.5 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold rounded-lg cursor-pointer"
            >
              Ou entrar com Google autorizado
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard KPI Calculations
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'released');
  const totalRevenueCents = paidOrders.reduce((acc, o) => acc + (o.amountCents || 0), 0);

  const courseSalesMap = new Map<string, { name: string; vendas: number; receita: number }>();
  paidOrders.forEach((o) => {
    const prev = courseSalesMap.get(o.courseId) || { name: o.courseId.toUpperCase(), vendas: 0, receita: 0 };
    prev.vendas += 1;
    prev.receita += o.amountCents / 100;
    courseSalesMap.set(o.courseId, prev);
  });
  const chartData =
    courseSalesMap.size > 0
      ? Array.from(courseSalesMap.values())
      : courses.map((c) => ({ name: c.nrCode, vendas: 0, receita: 0 }));

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = orderSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      o.userName?.toLowerCase().includes(q) ||
      o.userEmail?.toLowerCase().includes(q) ||
      o.courseTitle?.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const conversionRows = courses.map((c) => {
    const initiated = orders.filter(
      (o) => o.courseId === c.id || (Array.isArray(o.courseIds) && o.courseIds.includes(c.id))
    );
    const paidForCourse = initiated.filter((o) => o.status === 'paid' || o.status === 'released');
    const revenueCents = paidForCourse.reduce((sum, o) => {
      const count = Array.isArray(o.courseIds) && o.courseIds.length > 0 ? o.courseIds.length : 1;
      return sum + Math.round((o.amountCents || 0) / count);
    }, 0);
    const rate = initiated.length > 0 ? Math.round((paidForCourse.length / initiated.length) * 100) : 0;
    return {
      id: c.id,
      nrCode: c.nrCode,
      title: c.title,
      initiated: initiated.length,
      paid: paidForCourse.length,
      rate,
      revenueCents,
    };
  });

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Cursos & Páginas', icon: BookOpen },
    { id: 'funnel', label: 'Funil & Ofertas', icon: Layers },
    { id: 'testimonials', label: 'Depoimentos', icon: MessageSquareQuote },
    { id: 'lessons', label: 'Aulas & Provas', icon: Plus },
    { id: 'orders', label: 'Pedidos / Vendas', icon: CreditCard },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'quotes', label: 'Empresas', icon: Building2 },
    { id: 'safetyDocs', label: 'APR & PGR', icon: FileCheck2 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#0A2540] text-slate-200 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
        <div className="p-5 space-y-6">
          <div className="space-y-1.5">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="4k Treinamentos"
              referrerPolicy="no-referrer"
              className="h-10 w-auto object-contain bg-white/95 rounded px-2 py-1"
            />
            <span className="text-xs font-mono font-bold text-[#F5C518] block pt-1">
              Painel Administrativo
            </span>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'bg-[#F5C518] text-[#0A2540] font-bold' : 'text-slate-200 hover:bg-[#0F2C59] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-white/10 hidden lg:block space-y-3">
          {!user && (
            <button
              type="button"
              onClick={() => loginWithGoogle().catch((e) => toast.error(e.message))}
              className="w-full py-2 px-3 bg-[#0F2C59] hover:bg-[#143970] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Conectar Google (Firestore)
            </button>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-white/20 hover:bg-[#0F2C59] text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 sm:p-8 max-w-6xl space-y-6">
        {(authHint || !user) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <span>
              {authHint ||
                'Para gravar e consultar dados reais no Firestore com segurança, conecte sua conta Google autorizada ou ative Email/Password no Firebase Console.'}
            </span>
            <button
              type="button"
              onClick={() => loginWithGoogle().catch((e) => toast.error(e.message))}
              className="px-3.5 py-2 bg-[#0A2540] text-white font-semibold rounded-lg shrink-0 cursor-pointer"
            >
              Conectar Google Autorizado
            </button>
          </div>
        )}

        {/* TAB: DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0A2540]">Visão Geral</h1>
                <p className="text-sm text-slate-600">Métricas de vendas, alunos ativos e pedidos recentes.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncSeed}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0F2C59] bg-white hover:bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sincronizar NRs iniciais
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
                <span className="text-xs text-slate-500">Receita confirmada</span>
                <p className="font-mono text-2xl font-bold text-[#0A2540] mt-1 tabular-nums">
                  {formatCurrencyBRL(totalRevenueCents)}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
                <span className="text-xs text-slate-500">Pedidos pagos / liberados</span>
                <p className="font-mono text-2xl font-bold text-[#0A2540] mt-1 tabular-nums">{paidOrders.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
                <span className="text-xs text-slate-500">Alunos matriculados</span>
                <p className="font-mono text-2xl font-bold text-[#0A2540] mt-1 tabular-nums">{enrollments.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
                <span className="text-xs text-slate-500">Certificados emitidos</span>
                <p className="font-mono text-2xl font-bold text-[#0A2540] mt-1 tabular-nums">{certificates.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display font-bold text-[#0A2540]">Vendas por Norma Regulamentadora</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="vendas" fill="#0A2540" radius={[4, 4, 0, 0]} name="Matrículas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display font-bold text-slate-900">Últimos Pedidos</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum pedido registrado ainda.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{o.userName}</p>
                          <p className="text-slate-500 truncate">{o.courseTitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-slate-900 tabular-nums">
                            {formatCurrencyBRL(o.amountCents)}
                          </p>
                          <p className="text-slate-500">{o.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Per-course conversion metrics */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-slate-900">Conversão e Receita por Curso</h2>
                  <p className="text-xs text-slate-500">Acompanhe pedidos iniciados no checkout vs. matrículas confirmadas.</p>
                </div>
                <span className="text-xs font-mono text-slate-500">{funnelOffers.filter((f) => f.active).length} ofertas ativas</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">NR</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4 text-right">Checkouts Iniciados</th>
                    <th className="py-3 px-4 text-right">Pagos / Liberados</th>
                    <th className="py-3 px-4 text-right">Taxa de Conversão</th>
                    <th className="py-3 px-4 text-right">Receita Estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {conversionRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.nrCode}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{row.title}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{row.initiated}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                        {row.paid}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{row.rate}%</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatCurrencyBRL(row.revenueCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: COURSES CRUD */}
        {tab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Gestão de Cursos & Páginas de Vendas</h1>
                <p className="text-sm text-slate-600">Edite textos de alta conversão, preços ancorados, bônus e capas via Vercel Blob.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openCourseEditor(
                    {
                      id: '',
                      nrCode: 'NR-01',
                      title: '',
                      shortDescription: '',
                      fullDescription: '',
                      salesHeadline: '',
                      salesSubheadline: '',
                      promoTag: 'CERTIFICADO VÁLIDO EM TODO O BRASIL',
                      originalPriceCents: 19900,
                      priceCents: 9900,
                      enrolledCount: 500,
                      guaranteeDays: 7,
                      workloadHours: 8,
                      certificateValidityMonths: 24,
                      status: 'published',
                      displayOrder: courses.length + 1,
                      passingScore: 70,
                    },
                    true
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo curso
              </button>
            </div>

            {editingCourse && (
              <form onSubmit={handleSaveCourse} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {isNewCourse ? 'Cadastrar novo curso' : `Editar ${editingCourse.nrCode}`}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Slug / ID *</label>
                    <input
                      type="text"
                      required
                      disabled={!isNewCourse}
                      value={editingCourse.id || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, id: e.target.value })}
                      placeholder="nr-10"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código NR *</label>
                    <input
                      type="text"
                      required
                      value={editingCourse.nrCode || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, nrCode: e.target.value })}
                      placeholder="NR-10"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingCourse.status || 'published'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as 'published' | 'draft' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="published">Publicado</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Título do curso *</label>
                    <input
                      type="text"
                      required
                      value={editingCourse.title || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instrutor responsável</label>
                    <input
                      type="text"
                      value={editingCourse.instructorName || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço (centavos)</label>
                    <input
                      type="number"
                      value={editingCourse.priceCents ?? 9900}
                      onChange={(e) => setEditingCourse({ ...editingCourse, priceCents: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Carga horária (h)</label>
                    <input
                      type="number"
                      value={editingCourse.workloadHours ?? 8}
                      onChange={(e) => setEditingCourse({ ...editingCourse, workloadHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Validade (meses)</label>
                    <input
                      type="number"
                      value={editingCourse.certificateValidityMonths ?? 24}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, certificateValidityMonths: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ordem</label>
                    <input
                      type="number"
                      value={editingCourse.displayOrder ?? 1}
                      onChange={(e) => setEditingCourse({ ...editingCourse, displayOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resumo</label>
                  <input
                    type="text"
                    value={editingCourse.shortDescription || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição completa</label>
                  <textarea
                    rows={3}
                    value={editingCourse.fullDescription || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                {/* High-Conversion Sales Page Fields */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-amber-700 uppercase">
                    Configurações da Página de Vendas (Funil)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preço DE (ancoragem, centavos)</label>
                      <input
                        type="number"
                        value={editingCourse.originalPriceCents ?? ''}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            originalPriceCents: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Ex: 19900"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Alunos certificados (prova social)</label>
                      <input
                        type="number"
                        value={editingCourse.enrolledCount ?? ''}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            enrolledCount: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Ex: 4820"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Etiqueta promocional</label>
                      <input
                        type="text"
                        value={editingCourse.promoTag || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, promoTag: e.target.value })}
                        placeholder="MAIS VENDIDO · VÁLIDO EM TODO O BRASIL"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Headline principal (Página de Vendas)</label>
                    <input
                      type="text"
                      value={editingCourse.salesHeadline || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, salesHeadline: e.target.value })}
                      placeholder="Título de alto impacto para a página de vendas"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subheadline</label>
                    <textarea
                      rows={2}
                      value={editingCourse.salesSubheadline || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, salesSubheadline: e.target.value })}
                      placeholder="Explicação direta de como o aluno estuda e emite o certificado válido"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Para quem é (Público-alvo)</label>
                    <input
                      type="text"
                      value={editingCourse.targetAudience || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        O que o aluno ganha (1 por linha)
                      </label>
                      <textarea
                        rows={4}
                        value={outcomesText}
                        onChange={(e) => setOutcomesText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bônus inclusos (1 por linha)
                      </label>
                      <textarea
                        rows={4}
                        value={bonusesText}
                        onChange={(e) => setBonusesText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Para quem NÃO é (1 por linha)
                      </label>
                      <textarea
                        rows={4}
                        value={notForText}
                        onChange={(e) => setNotForText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50">
                    <Upload className="w-4 h-4" />
                    {uploadingCover ? 'Enviando...' : 'Upload Capa via Vercel Blob'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverUpload(f);
                      }}
                    />
                  </label>
                  {editingCourse.coverImageUrl && (
                    <span className="text-xs font-mono text-emerald-700 truncate max-w-md">
                      {editingCourse.coverImageUrl}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Salvar curso
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Ordem</th>
                    <th className="py-3 px-4">NR</th>
                    <th className="py-3 px-4">Título</th>
                    <th className="py-3 px-4 text-right">Carga</th>
                    <th className="py-3 px-4 text-right">Preço</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 font-mono tabular-nums">{c.displayOrder}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.nrCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{c.title}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{c.workloadHours}h</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{formatCurrencyBRL(c.priceCents)}</td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {c.status === 'published' ? (
                          <span className="text-emerald-700">Publicado</span>
                        ) : (
                          <span className="text-slate-500">Rascunho</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openCourseEditor(c, false)}
                          className="text-xs font-semibold text-slate-900 underline cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteCourseAdmin(c.id);
                            toast.success('Curso excluído.');
                            loadAllAdminData();
                          }}
                          className="text-xs font-semibold text-red-600 underline cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: FUNNEL OFFERS (ORDER BUMP, UPSELL, COMBO) */}
        {tab === 'funnel' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Funil de Vendas & Ofertas</h1>
                <p className="text-sm text-slate-600">
                  Gerencie Order Bumps do checkout, Upsells pós-compra e Pacotes / Combos promocionais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewOffer(true);
                  setEditingOffer({
                    id: '',
                    type: 'order_bump',
                    title: '',
                    subtitle: '',
                    description: '',
                    triggerCourseId: 'all',
                    includedCourseIds: ['nr-35'],
                    originalPriceCents: 11900,
                    offerPriceCents: 5900,
                    badgeLabel: 'ADICIONE COM DESCONTO NO CHECKOUT',
                    active: true,
                    displayOrder: funnelOffers.length + 1,
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nova oferta de funil
              </button>
            </div>

            {editingOffer && (
              <form onSubmit={handleSaveFunnelOffer} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {isNewOffer ? 'Criar oferta do funil' : `Editar ${editingOffer.title}`}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo da oferta *</label>
                    <select
                      value={editingOffer.type || 'order_bump'}
                      onChange={(e) => setEditingOffer({ ...editingOffer, type: e.target.value as FunnelOfferType })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="order_bump">Order Bump (Checkout)</option>
                      <option value="upsell">Upsell Pós-Compra</option>
                      <option value="combo">Combo / Pacote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ID / Slug (opcional)</label>
                    <input
                      type="text"
                      disabled={!isNewOffer}
                      value={editingOffer.id || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, id: e.target.value })}
                      placeholder="ex: combo-altura-nr35-nr33"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Curso gatilho</label>
                    <select
                      value={editingOffer.triggerCourseId || 'all'}
                      onChange={(e) => setEditingOffer({ ...editingOffer, triggerCourseId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="all">Todos os cursos</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nrCode} – {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Título da oferta *</label>
                    <input
                      type="text"
                      required
                      value={editingOffer.title || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Etiqueta (ex: OFERTA ÚNICA)</label>
                    <input
                      type="text"
                      value={editingOffer.badgeLabel || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, badgeLabel: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subtítulo (opcional)</label>
                  <input
                    type="text"
                    value={editingOffer.subtitle || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição persuasiva *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingOffer.description || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Cursos incluídos nesta oferta *</label>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((c) => {
                      const included = editingOffer.includedCourseIds?.includes(c.id) || false;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            const curr = editingOffer.includedCourseIds || [];
                            const next = included ? curr.filter((x) => x !== c.id) : [...curr, c.id];
                            setEditingOffer({ ...editingOffer, includedCourseIds: next });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                            included
                              ? 'bg-slate-950 text-white border-slate-950'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {c.nrCode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço DE (centavos)</label>
                    <input
                      type="number"
                      value={editingOffer.originalPriceCents ?? 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, originalPriceCents: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço POR (centavos)</label>
                    <input
                      type="number"
                      value={editingOffer.offerPriceCents ?? 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, offerPriceCents: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ordem</label>
                    <input
                      type="number"
                      value={editingOffer.displayOrder ?? 1}
                      onChange={(e) => setEditingOffer({ ...editingOffer, displayOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer.active ?? true}
                      onChange={(e) => setEditingOffer({ ...editingOffer, active: e.target.checked })}
                    />
                    Oferta ativa no funil
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Salvar oferta
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOffer(null)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Oferta</th>
                    <th className="py-3 px-4">Cursos Inclusos</th>
                    <th className="py-3 px-4 text-right">De / Por</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {funnelOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="py-3 px-4 font-mono text-xs font-bold uppercase text-amber-700">
                        {offer.type === 'order_bump' ? 'Order Bump' : offer.type === 'upsell' ? 'Upsell' : 'Combo'}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{offer.title}</p>
                        <p className="text-xs text-slate-500">Gatilho: {offer.triggerCourseId || 'all'}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {offer.includedCourseIds.map((id) => id.toUpperCase()).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs">
                        <span className="line-through text-slate-400 mr-1.5">
                          {formatCurrencyBRL(offer.originalPriceCents)}
                        </span>
                        <span className="font-bold text-slate-900">{formatCurrencyBRL(offer.offerPriceCents)}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={async () => {
                            await saveFunnelOfferAdmin({ ...offer, active: !offer.active });
                            toast.success('Status da oferta atualizado.');
                            loadAllAdminData();
                          }}
                          className={`underline cursor-pointer ${offer.active ? 'text-emerald-700' : 'text-slate-500'}`}
                        >
                          {offer.active ? 'Ativa' : 'Pausada'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewOffer(false);
                            setEditingOffer(offer);
                          }}
                          className="text-xs font-semibold text-slate-900 underline cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteFunnelOfferAdmin(offer.id);
                            toast.success('Oferta excluída.');
                            loadAllAdminData();
                          }}
                          className="text-xs font-semibold text-red-600 underline cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: TESTIMONIALS */}
        {tab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Depoimentos & Prova Social</h1>
                <p className="text-sm text-slate-600">
                  Gerencie avaliações reais exibidas na Home e nas páginas de vendas das NRs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewTestimonial(true);
                  setEditingTestimonial({
                    id: '',
                    courseId: 'nr-35',
                    authorName: '',
                    authorRole: '',
                    company: '',
                    rating: 5,
                    quote: '',
                    verifiedPurchase: true,
                    active: true,
                    displayOrder: testimonials.length + 1,
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo depoimento
              </button>
            </div>

            {editingTestimonial && (
              <form
                onSubmit={handleSaveTestimonial}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
              >
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {isNewTestimonial ? 'Adicionar depoimento' : `Editar depoimento de ${editingTestimonial.authorName}`}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Curso associado *</label>
                    <select
                      value={editingTestimonial.courseId || 'all'}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, courseId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="all">Geral (todos os cursos)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nrCode} – {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do aluno / gestor *</label>
                    <input
                      type="text"
                      required
                      value={editingTestimonial.authorName || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, authorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nota (1 a 5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingTestimonial.rating ?? 5}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={editingTestimonial.authorRole || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, authorRole: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={editingTestimonial.company || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Depoimento *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingTestimonial.quote || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTestimonial.verifiedPurchase ?? true}
                      onChange={(e) =>
                        setEditingTestimonial({ ...editingTestimonial, verifiedPurchase: e.target.checked })
                      }
                    />
                    Compra verificada
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTestimonial.active ?? true}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, active: e.target.checked })}
                    />
                    Exibir no site
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Salvar depoimento
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Autor</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4">Relato</th>
                    <th className="py-3 px-4 text-right">Nota</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testimonials.map((t) => (
                    <tr key={t.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{t.authorName}</p>
                        <p className="text-xs text-slate-500">
                          {t.authorRole} · {t.company}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs uppercase text-slate-700">{t.courseId}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-md truncate">“{t.quote}”</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{t.rating}/5</td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {t.active ? (
                          <span className="text-emerald-700">Visível</span>
                        ) : (
                          <span className="text-slate-500">Oculto</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewTestimonial(false);
                            setEditingTestimonial(t);
                          }}
                          className="text-xs font-semibold text-slate-900 underline cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteTestimonialAdmin(t.id);
                            toast.success('Depoimento excluído.');
                            loadAllAdminData();
                          }}
                          className="text-xs font-semibold text-red-600 underline cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: LESSONS & EXAMS */}
        {tab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Conteúdo das Aulas & Prova Formal</h1>
                <p className="text-sm text-slate-600">Gerencie módulos, vídeos/PDFs via Vercel Blob e questões objetivas.</p>
              </div>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nrCode} – {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modules & Lessons */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <h2 className="font-display font-bold text-slate-900">Módulos e Aulas</h2>

                <form onSubmit={handleAddModule} className="flex gap-2">
                  <input
                    type="text"
                    value={newModTitle}
                    onChange={(e) => setNewModTitle(e.target.value)}
                    placeholder="Novo título de módulo"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    + Módulo
                  </button>
                </form>

                <div className="space-y-3">
                  {courseModules.map((mod) => (
                    <div key={mod.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">{mod.title}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteCourseModuleAdmin(selectedCourseId, mod.id);
                            setCourseModules(await fetchCourseModules(selectedCourseId));
                          }}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {mod.lessons.map((l) => (
                          <li key={l.id} className="flex justify-between py-1 border-t border-slate-100">
                            <span>{l.title} ({l.type})</span>
                            <span className="font-mono">{l.durationMinutes}m</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddLesson} className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Adicionar aula ao módulo</h3>
                  <select
                    value={newLessonModId}
                    onChange={(e) => setNewLessonModId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {courseModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Título da aula"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Min"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={newLessonType}
                      onChange={(e) => setNewLessonType(e.target.value as 'text' | 'video' | 'pdf')}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="video">Vídeo (Blob)</option>
                      <option value="pdf">PDF (Blob)</option>
                    </select>
                    {newLessonType !== 'text' && (
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingLessonMedia ? 'Enviando...' : `Enviar ${newLessonType.toUpperCase()}`}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleLessonMediaUpload(f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {newLessonMediaUrl && (
                    <p className="text-xs font-mono text-emerald-700 truncate">{newLessonMediaUrl}</p>
                  )}
                  <textarea
                    rows={3}
                    placeholder="Conteúdo teórico ou instruções da aula"
                    value={newLessonContent}
                    onChange={(e) => setNewLessonContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Salvar aula
                  </button>
                </form>
              </div>

              {/* Exam Questions */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <h2 className="font-display font-bold text-slate-900">Banco de Questões da Prova</h2>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {courseQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          {idx + 1}. {q.prompt}
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteExamQuestionAdmin(selectedCourseId, q.id);
                            setCourseQuestions(await fetchCourseQuestions(selectedCourseId));
                          }}
                          className="text-red-600 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-emerald-700">Correta: {q.options[q.correctIndex]}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddQuestion} className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Nova questão objetiva</h3>
                  <textarea
                    rows={2}
                    placeholder="Enunciado da questão"
                    value={qPrompt}
                    onChange={(e) => setQPrompt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  {qOpts.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrect === idx}
                        onChange={() => setQCorrect(idx)}
                      />
                      <input
                        type="text"
                        placeholder={`Alternativa ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...qOpts];
                          next[idx] = e.target.value;
                          setQOpts(next);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Adicionar questão
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Pedidos & Vendas</h1>
                <p className="text-sm text-slate-600">Acompanhe pagamentos InfinitePay e libere acessos manualmente se necessário.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Buscar aluno, e-mail ou pedido..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">Todos status</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="released">Liberado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">ID Pedido</th>
                    <th className="py-3 px-4">Aluno</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{ord.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{ord.userName}</p>
                          <p className="text-xs text-slate-500">{ord.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{ord.courseTitle}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {formatCurrencyBRL(ord.amountCents)}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold">{ord.status}</td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          {ord.status !== 'released' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await releaseOrderAndEnrollAdmin(ord);
                                toast.success('Pedido liberado e matrícula criada!');
                                loadAllAdminData();
                              }}
                              className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Liberar acesso
                            </button>
                          )}
                          {ord.status === 'pending' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateOrderStatusAdmin(ord.id, 'cancelled');
                                toast.info('Pedido marcado como cancelado.');
                                loadAllAdminData();
                              }}
                              className="text-xs text-red-600 underline cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: STUDENTS */}
        {tab === 'students' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Alunos e Progresso</h1>
              <p className="text-sm text-slate-600">Visão consolidada de matrículas, notas e aprovação em prova.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Aluno</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4 text-right">Progresso</th>
                    <th className="py-3 px-4 text-right">Melhor Nota</th>
                    <th className="py-3 px-4">Prova Formal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhuma matrícula ativa encontrada ({users.length} perfis cadastrados).
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((en) => (
                      <tr key={en.id}>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{en.userName}</p>
                          <p className="text-xs text-slate-500">{en.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{en.courseTitle}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{en.progressPercent}%</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{en.bestScore}%</td>
                        <td className="py-3 px-4 text-xs font-semibold">
                          {en.examPassed ? (
                            <span className="text-emerald-700">Aprovado</span>
                          ) : (
                            <span className="text-slate-500">Não realizada ({en.examAttempts} tentativas)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CERTIFICATES */}
        {tab === 'certificates' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Certificados Emitidos</h1>
              <p className="text-sm text-slate-600">Gerencie registros válidos, PDFs armazenados no Vercel Blob e reemissões.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Aluno</th>
                    <th className="py-3 px-4">NR / Curso</th>
                    <th className="py-3 px-4 text-right">Nota</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhum certificado emitido até o momento.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id}>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-900">{cert.validationCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{cert.studentName}</td>
                        <td className="py-3 px-4 text-slate-700">{cert.nrCode} – {cert.courseTitle}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{cert.score}%</td>
                        <td className="py-3 px-4 text-right space-x-3 whitespace-nowrap">
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-slate-900 underline"
                          >
                            Ver PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => handleReissueCertificate(cert)}
                            className="text-xs font-semibold text-amber-700 underline cursor-pointer"
                          >
                            Reemitir PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: QUOTES */}
        {tab === 'quotes' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Solicitações Corporativas</h1>
              <p className="text-sm text-slate-600">Orçamentos enviados por empresas para treinamento em lote.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Contato</th>
                    <th className="py-3 px-4">NRs</th>
                    <th className="py-3 px-4 text-right">Qtd.</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhuma solicitação recebida ainda.
                      </td>
                    </tr>
                  ) : (
                    quotes.map((q) => (
                      <tr key={q.id}>
                        <td className="py-3 px-4 font-semibold text-slate-900">{q.companyName}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {q.contactName} · {q.contactEmail} · {q.contactPhone}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{q.coursesInterest.join(', ')}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{q.employeeCount}</td>
                        <td className="py-3 px-4 text-xs font-semibold">{q.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SAFETY DOCS (APR & PGR) */}
        {tab === 'safetyDocs' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Documentação Técnica (APR & PGR)</h1>
              <p className="text-sm text-slate-600">
                Gerencie as APRs geradas automaticamente e as solicitações personalizadas de PGR com Cartão CNPJ.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Tipo / Protocolo</th>
                    <th className="py-3 px-4">Solicitante / Empresa</th>
                    <th className="py-3 px-4">Detalhes Técnicos</th>
                    <th className="py-3 px-4">Anexo / PDF</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safetyDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhuma solicitação de APR ou PGR registrada ainda.
                      </td>
                    </tr>
                  ) : (
                    safetyDocs.map((docItem) => (
                      <tr key={docItem.id}>
                        <td className="py-3 px-4 align-top">
                          <span className="font-mono text-xs font-bold text-[#0A2540] uppercase block">
                            {docItem.docType === 'apr' ? 'APR Automática' : 'PGR Personalizado'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">{docItem.id}</span>
                        </td>
                        <td className="py-3 px-4 align-top text-xs">
                          <p className="font-semibold text-slate-900">
                            {docItem.companyName || docItem.requesterName}
                          </p>
                          <p className="text-slate-600">
                            {docItem.requesterName} · {docItem.requesterEmail}
                          </p>
                          {docItem.requesterPhone && <p className="text-slate-500">{docItem.requesterPhone}</p>}
                          {docItem.cnpj && <p className="font-mono text-slate-700 mt-0.5">CNPJ: {docItem.cnpj}</p>}
                        </td>
                        <td className="py-3 px-4 align-top text-xs text-slate-700 max-w-md space-y-1">
                          {docItem.docType === 'apr' ? (
                            <>
                              <p>
                                <strong>Serviço:</strong> {docItem.serviceDescription}
                              </p>
                              <p>
                                <strong>Altura:</strong> {docItem.workAtHeight ? 'Sim (NR-35)' : 'Não'} ·{' '}
                                <strong>Equip.:</strong> {docItem.equipmentList}
                              </p>
                              <p>
                                <strong>Colaboradores:</strong> {docItem.workersInvolved}
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                <strong>Colaboradores:</strong> {docItem.employeeCount || '-'}
                              </p>
                              <p>
                                <strong>Riscos:</strong> {docItem.risksDescription}
                              </p>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4 align-top text-xs whitespace-nowrap space-y-1.5">
                          {docItem.aprPdfUrl && (
                            <a
                              href={docItem.aprPdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block font-semibold text-[#0F2C59] underline"
                            >
                              Baixar APR PDF
                            </a>
                          )}
                          {docItem.cnpjCardUrl && (
                            <a
                              href={docItem.cnpjCardUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block font-semibold text-amber-700 underline"
                            >
                              Ver Cartão CNPJ
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 align-top">
                          <select
                            value={docItem.status}
                            onChange={async (e) => {
                              const nextStatus = e.target.value as SafetyDocStatus;
                              try {
                                await updateSafetyDocStatusAdmin(docItem.id, nextStatus);
                                toast.success('Status atualizado.');
                                loadAllAdminData();
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status.');
                              }
                            }}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                          >
                            <option value="generated">Gerado</option>
                            <option value="pending_review">Em Análise</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {tab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Configurações Gerais & Integrações</h1>
              <p className="text-sm text-slate-600">
                Configure sua InfiniteTag (InfinitePay), modelo do certificado e textos institucionais.
              </p>
            </div>

            {/* InfinitePay Configuration Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-slate-900">InfinitePay Checkout Integrado</h2>
                <span className="text-xs font-mono text-slate-500">
                  Vercel Blob: {blobConfigured ? 'Conectado' : 'Variável BLOB_READ_WRITE_TOKEN ausente (modo preview)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  InfiniteTag (handle) *
                </label>
                <input
                  type="text"
                  value={infinitePayHandle}
                  onChange={(e) => setInfinitePayHandle(e.target.value)}
                  placeholder="Ex: sua-infinitetag (sem o @)"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Encontre sua InfiniteTag no app da InfinitePay em <strong>Perfil → Minha InfiniteTag</strong>. Também pode ser definida via variável de ambiente <code className="font-mono">INFINITEPAY_HANDLE</code> na Vercel.
                </p>
              </div>
            </div>

            {/* Company & Site Copy */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display font-bold text-slate-900">Dados da Empresa & Textos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da empresa</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={settings.cnpj || ''}
                    onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de contato</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Hero (Home)</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtítulo do Hero</label>
                <textarea
                  rows={2}
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Certificate Template */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display font-bold text-slate-900">Modelo de Certificado & Instrutor Padrão</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instrutor padrão</label>
                  <input
                    type="text"
                    value={settings.defaultInstructorName || ''}
                    onChange={(e) => setSettings({ ...settings, defaultInstructorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Formação</label>
                  <input
                    type="text"
                    value={settings.defaultInstructorRole || ''}
                    onChange={(e) => setSettings({ ...settings, defaultInstructorRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registro (CREA / MTE)</label>
                  <input
                    type="text"
                    value={settings.defaultInstructorRegistry || ''}
                    onChange={(e) => setSettings({ ...settings, defaultInstructorRegistry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cabeçalho do certificado</label>
                <input
                  type="text"
                  value={settings.certificateTemplateHeader || ''}
                  onChange={(e) => setSettings({ ...settings, certificateTemplateHeader: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar todas as configurações
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
