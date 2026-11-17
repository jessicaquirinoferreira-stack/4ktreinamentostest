import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Layers,
  LogOut,
  PlayCircle,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { SafetyDocsSection } from '../components/SafetyDocsSection';
import { useAuth } from '../context/AuthContext';
import {
  fetchCourseBySlug,
  fetchCourseModules,
  fetchCourseQuestions,
  fetchFunnelOffers,
  fetchPublicSettings,
  fetchPublishedCourses,
  fetchUserCertificates,
  fetchUserEnrollments,
  fetchUserOrders,
  fetchUserSafetyDocRequests,
  saveCertificateRecord,
  updateEnrollmentProgress,
} from '../lib/firestoreService';
import { formatCurrencyBRL, formatInstallmentBRL, OFFICIAL_LOGO_URL } from '../data/seedCourses';
import type {
  Certificate,
  Course,
  CourseLesson,
  CourseModule,
  Enrollment,
  ExamQuestion,
  FunnelOffer,
  Order,
  PublicSettings,
  SafetyDocRequest,
} from '../types';

interface ServerVerifiedGrant {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseIds: string[];
  courseTitle?: string;
  confirmedAt: string;
}

export function StudentAreaPage() {
  const { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirectPath = params.get('redirect');

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  // Student dashboard data
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [firestoreEnrollmentIds, setFirestoreEnrollmentIds] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [safetyDocs, setSafetyDocs] = useState<SafetyDocRequest[]>([]);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [catalogCourses, setCatalogCourses] = useState<Course[]>([]);
  const [combos, setCombos] = useState<FunnelOffer[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Active course workspace
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  // Exam state
  const [examMode, setExamMode] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [issuingCert, setIssuingCert] = useState(false);

  async function loadStudentData() {
    if (!user) return;
    setLoadingData(true);
    try {
      const [enrs, ords, certs, sDocs, pub, allCourses, offers, grantsRes] = await Promise.all([
        fetchUserEnrollments(user.uid),
        fetchUserOrders(user.uid),
        fetchUserCertificates(user.uid),
        fetchUserSafetyDocRequests(user.uid).catch(() => []),
        fetchPublicSettings(),
        fetchPublishedCourses(),
        fetchFunnelOffers(true),
        fetch(`/api/student/verified-access?userId=${encodeURIComponent(user.uid)}`)
          .then((r) => r.json())
          .catch(() => ({ grants: [] })),
      ]);

      const fsIds = new Set(enrs.map((e) => e.id));
      setFirestoreEnrollmentIds(fsIds);

      const merged = [...enrs];
      const existingCourseIds = new Set(enrs.map((e) => e.courseId));
      const grants: ServerVerifiedGrant[] = Array.isArray(grantsRes?.grants) ? grantsRes.grants : [];

      for (const grant of grants) {
        for (const cId of grant.courseIds || []) {
          if (!existingCourseIds.has(cId)) {
            existingCourseIds.add(cId);
            const matchedCourse = allCourses.find((c) => c.id === cId);
            merged.push({
              id: `${user.uid}_${cId}`,
              userId: user.uid,
              userName: profile?.name || user.displayName || grant.userName || 'Aluno 4k',
              userEmail: user.email || grant.userEmail || '',
              courseId: cId,
              courseTitle: matchedCourse ? `${matchedCourse.nrCode} - ${matchedCourse.title}` : cId.toUpperCase(),
              orderId: grant.orderId,
              completedLessonIds: [],
              progressPercent: 0,
              examAttempts: 0,
              examPassed: false,
              bestScore: 0,
              enrolledAt: null,
              updatedAt: null,
            });
          }
        }
      }

      setEnrollments(merged);
      setOrders(ords);
      setCertificates(certs);
      setSafetyDocs(sDocs);
      setSettings(pub);
      setCatalogCourses(allCourses);
      setCombos(offers.filter((o) => o.type === 'combo'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar dados do aluno.');
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (user) {
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      loadStudentData();
    }
  }, [user]);

  const flatLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return flatLessons.findIndex((l) => l.id === activeLesson.id);
  }, [flatLessons, activeLesson]);

  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < flatLessons.length - 1
      ? flatLessons[currentLessonIndex + 1]
      : null;

  const recommendedCourses = useMemo(() => {
    const owned = new Set(enrollments.map((e) => e.courseId));
    return catalogCourses.filter((c) => !owned.has(c.id));
  }, [catalogCourses, enrollments]);

  const recommendedCombos = useMemo(() => {
    const owned = new Set(enrollments.map((e) => e.courseId));
    return combos.filter((combo) => combo.includedCourseIds.some((cid) => !owned.has(cid)));
  }, [combos, enrollments]);

  const totalCompletedLessons = useMemo(
    () => enrollments.reduce((sum, enr) => sum + (enr.completedLessonIds?.length || 0), 0),
    [enrollments]
  );

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        toast.success('Login realizado com sucesso.');
      } else {
        await registerWithEmail(name, email, password, cpf);
        toast.success('Conta criada com sucesso!');
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        toast.error(
          'O login por E-mail/Senha precisa ser ativado no Firebase Console (Authentication → Sign-in method). Use "Entrar com Google" abaixo enquanto isso.'
        );
      } else {
        toast.error(err instanceof Error ? err.message : 'Erro na autenticação.');
      }
    } finally {
      setAuthBusy(false);
    }
  }

  async function openCourseWorkspace(enrollment: Enrollment, startInExam = false) {
    setActiveEnrollment(enrollment);
    setExamMode(startInExam);
    setExamResult(null);
    setAnswers({});
    const [course, mods, qs] = await Promise.all([
      fetchCourseBySlug(enrollment.courseId),
      fetchCourseModules(enrollment.courseId),
      fetchCourseQuestions(enrollment.courseId),
    ]);
    setActiveCourse(course);
    setModules(mods);
    setQuestions(qs);

    const allLessons = mods.flatMap((m) => m.lessons);
    const firstPending =
      allLessons.find((l) => !enrollment.completedLessonIds?.includes(l.id)) || allLessons[0] || null;
    setActiveLesson(firstPending);
  }

  async function persistProgressPatch(
    enrollmentId: string,
    patch: Partial<Pick<Enrollment, 'completedLessonIds' | 'progressPercent' | 'examAttempts' | 'examPassed' | 'bestScore' | 'certificateId'>>
  ) {
    if (firestoreEnrollmentIds.has(enrollmentId)) {
      await updateEnrollmentProgress(enrollmentId, patch);
    }
  }

  async function markLessonCompleteAndAdvance(lessonId: string, advance: boolean) {
    if (!activeEnrollment) return;
    const allLessonIds = flatLessons.map((l) => l.id);
    const currentSet = new Set(activeEnrollment.completedLessonIds || []);

    if (advance) {
      currentSet.add(lessonId);
    } else if (currentSet.has(lessonId)) {
      currentSet.delete(lessonId);
    } else {
      currentSet.add(lessonId);
    }

    const updatedIds = Array.from(currentSet);
    const progressPercent = allLessonIds.length > 0 ? Math.round((updatedIds.length / allLessonIds.length) * 100) : 100;

    await persistProgressPatch(activeEnrollment.id, {
      completedLessonIds: updatedIds,
      progressPercent,
    });

    const updated = { ...activeEnrollment, completedLessonIds: updatedIds, progressPercent };
    setActiveEnrollment(updated);
    setEnrollments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    if (advance) {
      if (nextLesson) {
        setActiveLesson(nextLesson);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setExamMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Todas as aulas concluídas! Você já pode fazer a Prova Formal.');
      }
    } else {
      toast.success('Progresso atualizado.');
    }
  }

  async function handleSubmitExam(e: React.FormEvent) {
    e.preventDefault();
    if (!activeEnrollment || !activeCourse || questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correctCount++;
    });
    const score = Math.round((correctCount / questions.length) * 100);
    const passing = activeCourse.passingScore || 70;
    const passed = score >= passing;

    const nextAttempts = (activeEnrollment.examAttempts || 0) + 1;
    const nextBest = Math.max(activeEnrollment.bestScore || 0, score);
    const nextPassed = activeEnrollment.examPassed || passed;

    await persistProgressPatch(activeEnrollment.id, {
      examAttempts: nextAttempts,
      bestScore: nextBest,
      examPassed: nextPassed,
    });

    const updated = {
      ...activeEnrollment,
      examAttempts: nextAttempts,
      bestScore: nextBest,
      examPassed: nextPassed,
    };
    setActiveEnrollment(updated);
    setEnrollments((prev) => prev.map((en) => (en.id === updated.id ? updated : en)));
    setExamResult({ score, passed });

    if (passed) {
      toast.success(`Parabéns! Você foi aprovado com ${score}%. Já pode emitir seu certificado.`);
    } else {
      toast.error(`Nota obtida: ${score}%. Mínimo exigido: ${passing}%. Revise as aulas e tente novamente.`);
    }
  }

  async function handleGenerateCertificate() {
    if (!user || !activeEnrollment || !activeCourse || !activeEnrollment.examPassed) return;
    setIssuingCert(true);
    try {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const validationCode = `4K-${activeCourse.nrCode.replace(/[^A-Z0-9]/gi, '')}-${new Date().getFullYear()}-${rand}`;
      const certId = `cert_${Date.now()}_${rand.toLowerCase()}`;
      const studentName = profile?.name || user.displayName || activeEnrollment.userName;

      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationCode,
          studentName,
          courseTitle: activeCourse.title,
          nrCode: activeCourse.nrCode,
          workloadHours: activeCourse.workloadHours,
          validityMonths: activeCourse.certificateValidityMonths,
          score: activeEnrollment.bestScore || 100,
          instructorName: activeCourse.instructorName || settings?.defaultInstructorName || 'Eng. Carlos Eduardo Mendes',
          instructorRole: activeCourse.instructorRole || settings?.defaultInstructorRole || 'Engenheiro de Segurança do Trabalho',
          instructorRegistry: activeCourse.instructorRegistry || settings?.defaultInstructorRegistry || 'CREA-SP 5069821470',
          templateHeader: settings?.certificateTemplateHeader,
          templateBody: settings?.certificateTemplateBody,
          companyName: settings?.companyName,
          cnpj: settings?.cnpj,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar PDF do certificado.');

      const newCert: Omit<Certificate, 'issuedAt'> = {
        id: certId,
        validationCode,
        userId: user.uid,
        studentName,
        courseId: activeCourse.id,
        courseTitle: activeCourse.title,
        nrCode: activeCourse.nrCode,
        workloadHours: activeCourse.workloadHours,
        validityMonths: activeCourse.certificateValidityMonths,
        instructorName: activeCourse.instructorName || settings?.defaultInstructorName || 'Eng. Carlos Eduardo Mendes',
        instructorRole: activeCourse.instructorRole || settings?.defaultInstructorRole || 'Engenheiro de Segurança do Trabalho',
        instructorRegistry: activeCourse.instructorRegistry || settings?.defaultInstructorRegistry || 'CREA-SP 5069821470',
        score: activeEnrollment.bestScore || 100,
        pdfUrl: data.pdfUrl,
        status: 'valid',
      };

      if (firestoreEnrollmentIds.has(activeEnrollment.id)) {
        await saveCertificateRecord(newCert);
        await updateEnrollmentProgress(activeEnrollment.id, { certificateId: certId });
        await loadStudentData();
      } else {
        setCertificates((prev) => [{ ...newCert, issuedAt: null }, ...prev]);
      }

      setActiveEnrollment((prev) => (prev ? { ...prev, certificateId: certId } : prev));
      toast.success('Certificado emitido com sucesso! Faça o download abaixo.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao emitir certificado.');
    } finally {
      setIssuingCert(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F9FC]">
        <div className="w-8 h-8 border-2 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[80vh] bg-[#F7F9FC] py-14 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.06)]">
          <div className="space-y-2">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="4k Treinamentos"
              referrerPolicy="no-referrer"
              className="h-12 w-auto object-contain mb-2"
            />
            <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
              Ambiente de Estudos
            </p>
            <h1 className="font-display text-2xl font-extrabold text-[#0A2540]">
              {authMode === 'login' ? 'Acessar Área do Aluno' : 'Criar conta de aluno'}
            </h1>
            <p className="text-sm text-slate-600">
              Entre para estudar suas NRs, realizar a prova formal e baixar seus certificados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle().catch((err) => toast.error(err.message))}
            className="w-full min-h-[44px] py-3 px-4 border border-[#0F2C59] hover:bg-[#0A2540]/5 rounded-lg text-sm font-semibold text-[#0A2540] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Entrar com conta Google
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs text-slate-400">ou com e-mail e senha</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome completo (para o certificado) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo sem abreviações"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF (opcional)</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>

            <button
              type="submit"
              disabled={authBusy}
              className="w-full min-h-[44px] py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {authBusy ? 'Processando...' : authMode === 'login' ? 'Entrar na Área do Aluno' : 'Cadastrar e acessar'}
            </button>
          </form>

          <p className="text-xs text-center text-slate-600">
            {authMode === 'login' ? 'Ainda não tem cadastro?' : 'Já possui conta?'}{' '}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="font-semibold text-[#0F2C59] underline cursor-pointer"
            >
              {authMode === 'login' ? 'Criar conta agora' : 'Fazer login'}
            </button>
          </p>
        </div>
      </main>
    );
  }

  // Active Course Player / Exam Workspace
  if (activeEnrollment && activeCourse) {
    const existingCert = certificates.find(
      (c) => c.courseId === activeCourse.id || c.id === activeEnrollment.certificateId
    );
    const isLessonDone = activeLesson ? activeEnrollment.completedLessonIds?.includes(activeLesson.id) : false;

    return (
      <main className="min-h-screen bg-[#F7F9FC] pb-16">
        <div className="bg-[#0A2540] text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="4k Treinamentos"
                referrerPolicy="no-referrer"
                className="h-8 w-auto object-contain hidden sm:block shrink-0 bg-white/95 rounded px-1.5 py-0.5"
              />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveEnrollment(null)}
                  className="text-xs text-slate-300 hover:text-white mb-0.5 cursor-pointer block"
                >
                  ← Voltar para Meus Cursos
                </button>
                <h1 className="font-display text-lg sm:text-xl font-bold truncate">
                  {activeCourse.nrCode} – {activeCourse.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-slate-300 block">Progresso</span>
                <span className="font-mono text-sm font-bold text-[#F5C518] tabular-nums">
                  {activeEnrollment.progressPercent}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExamMode((v) => !v)}
                className="min-h-[42px] px-4 py-2 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-xs font-extrabold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                {examMode ? 'Voltar às aulas' : activeEnrollment.examPassed ? 'Ver Certificado' : 'Realizar Prova Formal'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Stage */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              {examMode ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="font-display text-2xl font-bold text-[#0A2540]">
                      Prova Formal · {activeCourse.nrCode}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Nota mínima para aprovação e emissão do certificado: {activeCourse.passingScore || 70}%.
                    </p>
                  </div>

                  {activeEnrollment.examPassed && (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">
                          Aprovado com nota {activeEnrollment.bestScore}%!
                        </p>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Seu certificado digital já está liberado para emissão e download.
                        </p>
                      </div>
                      {existingCert ? (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={existingCert.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg"
                          >
                            <Download className="w-4 h-4" />
                            Baixar PDF ({existingCert.validationCode})
                          </a>
                          <Link
                            to={`/validar?code=${existingCert.validationCode}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg bg-white"
                          >
                            Validar
                          </Link>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={issuingCert}
                          onClick={handleGenerateCertificate}
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-60"
                        >
                          {issuingCert ? 'Gerando PDF...' : 'Emitir Certificado PDF'}
                        </button>
                      )}
                    </div>
                  )}

                  {examResult && !examResult.passed && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                      Você obteve <strong>{examResult.score}%</strong>. A nota mínima é {activeCourse.passingScore || 70}%. Revise o material e envie novamente.
                    </div>
                  )}

                  {questions.length === 0 ? (
                    <p className="text-sm text-slate-600">Nenhuma questão cadastrada para este curso ainda.</p>
                  ) : (
                    <form onSubmit={handleSubmitExam} className="space-y-6">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="space-y-3 pb-5 border-b border-slate-100">
                          <p className="font-semibold text-[#0A2540] text-sm sm:text-base">
                            <span className="font-mono text-[#0F2C59] mr-2">{idx + 1}.</span>
                            {q.prompt}
                          </p>
                          <div className="space-y-2 pl-2">
                            {q.options.map((opt, optIdx) => (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                                  answers[q.id] === optIdx
                                    ? 'border-[#0A2540] bg-[#F7F9FC] font-medium'
                                    : 'border-slate-200 hover:bg-[#F7F9FC]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  required
                                  checked={answers[q.id] === optIdx}
                                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                  className="mt-1 accent-[#0A2540]"
                                />
                                <span className="text-slate-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        className="min-h-[44px] px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg cursor-pointer transition-colors"
                      >
                        Finalizar e corrigir prova
                      </button>
                    </form>
                  )}
                </div>
              ) : activeLesson ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase">
                        Aula {currentLessonIndex + 1} de {flatLessons.length} · {activeLesson.type} · {activeLesson.durationMinutes} min
                      </span>
                      <h2 className="font-display text-2xl font-bold text-[#0A2540] mt-1">{activeLesson.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => markLessonCompleteAndAdvance(activeLesson.id, false)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                        isLessonDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-[#0A2540] border-[#0A2540] text-white hover:bg-[#0F2C59]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isLessonDone ? 'Aula concluída' : 'Marcar como concluída'}
                    </button>
                  </div>

                  {activeLesson.videoUrl && (
                    <div className="aspect-video bg-[#0A2540] rounded-xl overflow-hidden">
                      <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                    </div>
                  )}

                  {activeLesson.pdfUrl && (
                    <div className="p-4 bg-[#F7F9FC] border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#0F2C59]" />
                        <span className="text-sm font-medium text-[#0A2540]">Apostila / Material complementar em PDF</span>
                      </div>
                      <a
                        href={activeLesson.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A2540] text-white text-xs font-semibold rounded-lg"
                      >
                        Abrir PDF
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {activeLesson.content}
                  </div>

                  {/* Next Lesson / Proceed to Exam Footer */}
                  <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-mono text-slate-500">
                      {nextLesson ? `Próxima aula: ${nextLesson.title}` : 'Última aula do programa teórico'}
                    </span>
                    <button
                      type="button"
                      onClick={() => markLessonCompleteAndAdvance(activeLesson.id, true)}
                      className="inline-flex items-center gap-2 min-h-[44px] px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {nextLesson ? 'Concluir e avançar para próxima aula' : 'Concluir e ir para Prova Formal'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Selecione uma aula na barra lateral para começar.</p>
              )}
            </div>

            {/* Sidebar Syllabus */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[#0A2540]">Módulos e Aulas</h3>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {activeEnrollment.completedLessonIds?.length || 0}/{flatLessons.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {modules.map((mod) => (
                    <div key={mod.id} className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">{mod.title}</p>
                      <div className="space-y-1.5">
                        {mod.lessons.map((lesson) => {
                          const completed = activeEnrollment.completedLessonIds?.includes(lesson.id);
                          const isCurrent = !examMode && activeLesson?.id === lesson.id;
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => {
                                setExamMode(false);
                                setActiveLesson(lesson);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'border-[#0A2540] bg-[#0A2540] text-white'
                                  : 'border-slate-200 hover:bg-[#F7F9FC] text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                {lesson.type === 'video' ? (
                                  <Video className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </span>
                              {completed && (
                                <CheckCircle2
                                  className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#F5C518]' : 'text-emerald-600'}`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0A2540] font-bold text-sm">
                  <ClipboardCheck className="w-4 h-4 text-[#0F2C59]" />
                  <span>Avaliação e Certificado</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Após estudar os módulos, clique abaixo para responder à prova formal e gerar seu certificado em PDF.
                </p>
                <button
                  type="button"
                  onClick={() => setExamMode(true)}
                  className="w-full py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  {activeEnrollment.examPassed ? 'Ver Resultado / Certificado' : 'Ir para Prova Formal'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-[#F7F9FC] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header + Member KPI Strip */}
        <div className="space-y-6 border-b border-slate-200 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Área do Aluno 4k Treinamentos
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
                Olá, {profile?.name || user.displayName || user.email}
              </h1>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#0F2C59] bg-white hover:bg-[#0A2540]/5 text-[#0A2540] text-sm font-semibold rounded-lg cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <div>
                <span className="text-xs text-slate-500">Cursos liberados</span>
                <p className="font-mono text-2xl font-extrabold text-[#0A2540] mt-0.5 tabular-nums">
                  {enrollments.length}
                </p>
              </div>
              <BookOpen className="w-6 h-6 text-[#0F2C59]" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <div>
                <span className="text-xs text-slate-500">Aulas concluídas</span>
                <p className="font-mono text-2xl font-extrabold text-[#0A2540] mt-0.5 tabular-nums">
                  {totalCompletedLessons}
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]">
              <div>
                <span className="text-xs text-slate-500">Certificados emitidos</span>
                <p className="font-mono text-2xl font-extrabold text-[#0A2540] mt-0.5 tabular-nums">
                  {certificates.length}
                </p>
              </div>
              <Award className="w-6 h-6 text-[#F5C518]" />
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#0A2540]">Meus Cursos Liberados</h2>
            <Link to="/" className="text-sm font-semibold text-[#0F2C59] hover:text-[#0A2540] underline">
              Ver catálogo completo
            </Link>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-[#0A2540]">Você ainda não possui cursos liberados</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Escolha uma Norma Regulamentadora no catálogo para iniciar seus estudos e emitir seu certificado.
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg"
              >
                Ver cursos disponíveis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enr) => {
                const courseMeta = catalogCourses.find((c) => c.id === enr.courseId);
                const courseCert = certificates.find(
                  (c) => c.courseId === enr.courseId || c.id === enr.certificateId
                );

                return (
                  <div
                    key={enr.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(10,37,64,0.04)]"
                  >
                    {courseMeta?.coverImageUrl && (
                      <div className="relative h-36 bg-[#0A2540]">
                        <img
                          src={courseMeta.coverImageUrl}
                          alt={enr.courseTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-xs font-mono text-white">
                          <span className="font-bold text-[#F5C518]">{courseMeta.nrCode}</span>
                          <span>{courseMeta.workloadHours}h carga horária</span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                          <span className={enr.examPassed ? 'text-emerald-700 font-bold' : ''}>
                            {enr.examPassed ? `Aprovado (${enr.bestScore}%)` : 'Em andamento'}
                          </span>
                          <span className="tabular-nums font-bold text-[#0A2540]">{enr.progressPercent}%</span>
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#0A2540] leading-snug">
                          {enr.courseTitle}
                        </h3>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0A2540] transition-all" style={{ width: `${enr.progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => openCourseWorkspace(enr, false)}
                          className="w-full min-h-[42px] py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg transition-colors cursor-pointer"
                        >
                          {enr.progressPercent > 0 ? 'Continuar aulas' : 'Iniciar aulas'}
                        </button>
                        {courseCert ? (
                          <a
                            href={courseCert.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg text-center inline-flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Baixar Certificado PDF
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCourseWorkspace(enr, true)}
                            className="w-full py-2 border border-[#0F2C59] hover:bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            {enr.examPassed ? 'Emitir Certificado' : 'Ir para Prova Formal'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Certificates */}
        {certificates.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A2540]">Meus Certificados Emitidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-[#0F2C59] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-[#0A2540] text-sm">
                        {cert.nrCode} – {cert.courseTitle}
                      </h3>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">
                        Código: {cert.validationCode} · Nota {cert.score}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-xs font-semibold rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar PDF
                    </a>
                    <Link
                      to={`/validar?code=${cert.validationCode}`}
                      className="px-3 py-2 border border-[#0F2C59] text-[#0A2540] text-xs font-semibold rounded-lg hover:bg-[#0A2540]/5"
                    >
                      Validar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* APR & PGR Technical Documentation inside Student Area */}
        <section id="documentacao-aluno" className="space-y-5 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Serviços de Documentação SST
              </p>
              <h2 className="font-display text-xl font-bold text-[#0A2540] mt-0.5">
                Minhas APRs & Solicitações de PGR
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDocGenerator((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg cursor-pointer self-start sm:self-auto"
            >
              <FileCheck2 className="w-4 h-4 text-[#F5C518]" />
              {showDocGenerator ? 'Ocultar formulário APR/PGR' : 'Gerar APR / Solicitar PGR'}
            </button>
          </div>

          {safetyDocs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safetyDocs.map((docItem) => (
                <div
                  key={docItem.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#0F2C59] uppercase">
                        {docItem.docType === 'apr' ? 'APR Automática' : 'PGR Personalizado'} · {docItem.id}
                      </span>
                      <h3 className="font-display font-bold text-sm text-[#0A2540] mt-1">
                        {docItem.docType === 'apr'
                          ? docItem.serviceDescription || 'Análise Preliminar de Risco'
                          : `${docItem.companyName || 'Empresa'} (${docItem.cnpj || ''})`}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">
                      {docItem.status === 'generated'
                        ? 'Gerada'
                        : docItem.status === 'completed'
                          ? 'Concluído'
                          : 'Em análise'}
                    </span>
                  </div>

                  {docItem.aprPdfUrl && (
                    <a
                      href={docItem.aprPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-xs font-extrabold rounded-lg self-start"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar APR em PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {showDocGenerator && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
              <SafetyDocsSection
                compact
                userId={user.uid}
                defaultName={profile?.name || user.displayName || ''}
                defaultEmail={user.email || ''}
                onSubmitted={() => loadStudentData()}
              />
            </div>
          )}
        </section>

        {/* Recommended Next NRs & Combos */}
        {(recommendedCourses.length > 0 || recommendedCombos.length > 0) && (
          <section className="space-y-5 pt-6 border-t border-slate-200">
            <div>
              <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
                Complemente sua formação
              </p>
              <h2 className="font-display text-xl font-bold text-[#0A2540] mt-0.5">
                Outras Normas Regulamentadoras para sua função
              </h2>
            </div>

            {recommendedCombos.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recommendedCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="bg-[#0A2540] text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-[11px] font-bold text-[#F5C518] inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {combo.badgeLabel || 'PACOTE COM DESCONTO'}
                      </span>
                      <h3 className="font-display font-bold text-base text-white">{combo.title}</h3>
                      <p className="font-mono text-xs text-slate-300 tabular-nums">
                        {formatCurrencyBRL(combo.offerPriceCents)} · ou {formatInstallmentBRL(combo.offerPriceCents)}
                      </p>
                    </div>
                    <Link
                      to={`/checkout/combo/${combo.id}`}
                      className="px-4 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-xs font-extrabold rounded-lg whitespace-nowrap shrink-0 text-center"
                    >
                      Aproveitar pacote
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {recommendedCourses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedCourses.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0F2C59]">
                        {c.nrCode} · {c.workloadHours}h
                      </span>
                      <h3 className="font-display font-bold text-sm text-[#0A2540] mt-1 line-clamp-2">{c.title}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-mono text-sm font-bold text-[#0A2540] tabular-nums">
                        {formatCurrencyBRL(c.priceCents)}
                      </span>
                      <Link
                        to={`/cursos/${c.slug}`}
                        className="text-xs font-bold text-[#0F2C59] hover:text-[#0A2540] underline"
                      >
                        Ver curso
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Orders History */}
        {orders.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0A2540]">Histórico de Pedidos</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7F9FC] border-b border-slate-200 text-xs text-slate-600 uppercase">
                  <tr>
                    <th className="py-3.5 px-4">Pedido</th>
                    <th className="py-3.5 px-4">Curso</th>
                    <th className="py-3.5 px-4 text-right">Valor</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{ord.id}</td>
                      <td className="py-3.5 px-4 font-medium text-[#0A2540]">{ord.courseTitle}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">{formatCurrencyBRL(ord.amountCents)}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {ord.status === 'released' || ord.status === 'paid' ? (
                          <span className="text-emerald-700">Liberado</span>
                        ) : ord.status === 'cancelled' ? (
                          <span className="text-red-700">Cancelado</span>
                        ) : (
                          <span className="text-amber-700">Aguardando pagamento</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ord.status === 'pending' && ord.checkoutUrl && (
                          <a
                            href={ord.checkoutUrl}
                            className="text-xs font-semibold text-[#0F2C59] underline"
                          >
                            Concluir no InfinitePay
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
