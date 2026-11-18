import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { upload as uploadDirectToVercelBlob } from '@vercel/blob/client';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_PUBLIC_SETTINGS,
  NR06_COVER_URL,
  NR10_COVER_URL,
  NR11_COVER_URL,
  NR12_COVER_URL,
  NR18_COVER_URL,
  NR20_COVER_URL,
  NR23_COVER_URL,
  NR33_40H_COVER_URL,
  NR33_COVER_URL,
  NR35_40H_COVER_URL,
  NR35_COVER_URL,
  SEED_COURSES,
  SEED_FUNNEL_OFFERS,
  SEED_TESTIMONIALS,
} from '../data/seedCourses';
import type {
  Certificate,
  CorporateQuote,
  Course,
  CourseModule,
  Enrollment,
  ExamQuestion,
  FunnelOffer,
  Order,
  PublicSettings,
  SafetyDocRequest,
  SafetyDocStatus,
  Testimonial,
  UserProfile,
} from '../types';

const LEGACY_IMAGE_UPGRADES: Record<string, string> = {
  '/src/assets/images/course_nr35_height_1794852167540.jpg': NR35_COVER_URL,
  '/src/assets/images/nr35_4k_branded_1794853562294.jpg': NR35_COVER_URL,
  '/images/nr35_4k_branded.jpg': NR35_COVER_URL,
  '/src/assets/images/course_nr33_confined_1794852163245.jpg': NR33_COVER_URL,
  '/src/assets/images/nr33_4k_branded_1794853561553.jpg': NR33_COVER_URL,
  '/images/nr33_4k_branded.jpg': NR33_COVER_URL,
  '/src/assets/images/nr23_4k_branded_1794918470650.jpg': NR23_COVER_URL,
  '/images/nr23_4k_branded.jpg': NR23_COVER_URL,
  '/src/assets/images/nr20_4k_branded_1794918469472.jpg': NR20_COVER_URL,
  '/images/nr20_4k_branded.jpg': NR20_COVER_URL,
  '/src/assets/images/course_nr18_construction_1794852161695.jpg': NR18_COVER_URL,
  '/src/assets/images/nr18_4k_branded_1794853564817.jpg': NR18_COVER_URL,
  '/images/nr18_4k_branded.jpg': NR18_COVER_URL,
  '/src/assets/images/course_nr12_machinery_1794852161858.jpg': NR12_COVER_URL,
  '/src/assets/images/nr12_4k_branded_1794853565420.jpg': NR12_COVER_URL,
  '/images/nr12_4k_branded.jpg': NR12_COVER_URL,
  '/src/assets/images/nr11_4k_branded_1794918469511.jpg': NR11_COVER_URL,
  '/images/nr11_4k_branded.jpg': NR11_COVER_URL,
  '/src/assets/images/nr10_4k_branded_1794918469807.jpg': NR10_COVER_URL,
  '/images/nr10_4k_branded.jpg': NR10_COVER_URL,
  '/src/assets/images/course_nr06_epi_1794852161105.jpg': NR06_COVER_URL,
  '/src/assets/images/nr06_4k_branded_1794853562892.jpg': NR06_COVER_URL,
  '/images/nr06_4k_branded.jpg': NR06_COVER_URL,
};

const LEGACY_HASHED_COVER_PATTERN =
  /(_4k_branded|course_nr(?:06|12|18|33|35)|\/images\/nr(?:06|10|11|12|18|20|23|33|35)_4k_branded)/i;

const VERCEL_BLOB_HOST_PATTERN = /(^|\.)blob\.vercel-storage\.com$/i;

export function isManagedAssetUrl(rawUrl?: string): boolean {
  if (!rawUrl || !rawUrl.trim()) return true;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return false;
  }
  if (trimmed.startsWith('/')) {
    return (
      trimmed.startsWith('/assets/') ||
      trimmed.startsWith('/src/assets/') ||
      trimmed.startsWith('/images/') ||
      trimmed.startsWith('/api/blob/local/')
    );
  }
  try {
    const parsed = new URL(trimmed);
    if (VERCEL_BLOB_HOST_PATTERN.test(parsed.hostname)) {
      return parsed.protocol === 'https:';
    }
    if (
      typeof window !== 'undefined' &&
      parsed.origin === window.location.origin &&
      (parsed.pathname.startsWith('/api/blob/local/') ||
        parsed.pathname.startsWith('/assets/') ||
        parsed.pathname.startsWith('/src/assets/') ||
        parsed.pathname.startsWith('/images/'))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function assertNoExternalAssetUrl(rawUrl?: string, fieldLabel = 'arquivo'): string | undefined {
  if (!rawUrl || !rawUrl.trim()) return undefined;
  const trimmed = rawUrl.trim();
  if (!isManagedAssetUrl(trimmed)) {
    throw new Error(
      `URL externa não permitida para ${fieldLabel}. Envie o arquivo diretamente pelo Vercel Blob Storage.`
    );
  }
  return trimmed;
}

function isBundledSeedPath(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/src/assets/') ||
    trimmed.startsWith('/images/')
  ) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.pathname.startsWith('/assets/') ||
      parsed.pathname.startsWith('/src/assets/') ||
      parsed.pathname.startsWith('/images/')
    );
  } catch {
    return false;
  }
}

function resolveCourseImage(rawUrl: string | undefined, seedFallback: string | undefined): string | undefined {
  if (!rawUrl) return seedFallback;
  if (
    LEGACY_IMAGE_UPGRADES[rawUrl] ||
    LEGACY_HASHED_COVER_PATTERN.test(rawUrl) ||
    (seedFallback && isBundledSeedPath(rawUrl))
  ) {
    return seedFallback || LEGACY_IMAGE_UPGRADES[rawUrl] || rawUrl;
  }
  if (!isManagedAssetUrl(rawUrl)) {
    return seedFallback;
  }
  return rawUrl;
}

function enrichCourse(course: Course): Course {
  const seedMatch = SEED_COURSES.find((b) => b.course.id === course.id || b.course.slug === course.slug)?.course;
  const resolvedCover = resolveCourseImage(course.coverImageUrl, seedMatch?.coverImageUrl);
  const resolvedBanner = resolveCourseImage(
    course.bannerImageUrl,
    seedMatch?.bannerImageUrl || resolvedCover,
  );

  // Keep references used for bundle consistency checks
  void NR33_40H_COVER_URL;
  void NR35_40H_COVER_URL;

  const isLegacyNr33 =
    course.id === 'nr-33' &&
    course.nrCode === 'NR-33' &&
    course.title === 'Segurança e Saúde em Espaços Confinados';
  const isLegacyNr35 =
    course.id === 'nr-35' &&
    course.nrCode === 'NR-35' &&
    course.title === 'Trabalho em Altura';

  return {
    ...course,
    nrCode: (isLegacyNr33 || isLegacyNr35) && seedMatch ? seedMatch.nrCode : course.nrCode,
    title: (isLegacyNr33 || isLegacyNr35) && seedMatch ? seedMatch.title : course.title,
    coverImageUrl: resolvedCover,
    bannerImageUrl: resolvedBanner,
    salesHeadline: course.salesHeadline || seedMatch?.salesHeadline,
    salesSubheadline: course.salesSubheadline || seedMatch?.salesSubheadline,
    promoTag: course.promoTag || seedMatch?.promoTag,
    originalPriceCents: course.originalPriceCents ?? seedMatch?.originalPriceCents,
    enrolledCount: course.enrolledCount ?? seedMatch?.enrolledCount,
    ratingAverage: course.ratingAverage ?? seedMatch?.ratingAverage,
    ratingCount: course.ratingCount ?? seedMatch?.ratingCount,
    guaranteeDays: course.guaranteeDays ?? seedMatch?.guaranteeDays ?? 7,
    notForAudience: course.notForAudience?.length ? course.notForAudience : seedMatch?.notForAudience,
    includedBonuses: course.includedBonuses?.length ? course.includedBonuses : seedMatch?.includedBonuses,
  };
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  try {
    const q = query(collection(db, 'courses'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_COURSES.map((b) => ({ ...b.course, createdAt: null, updatedAt: null }));
    }
    const items = snap.docs.map((d) => enrichCourse(d.data() as Course));
    const existingIds = new Set(items.map((c) => c.id));
    for (const bundle of SEED_COURSES) {
      if (!existingIds.has(bundle.course.id) && bundle.course.status === 'published') {
        items.push({ ...bundle.course, createdAt: null, updatedAt: null });
      }
    }
    return items.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  } catch (error) {
    console.warn('Usando catálogo inicial enquanto Firestore sincroniza:', error);
    return SEED_COURSES.map((b) => ({ ...b.course, createdAt: null, updatedAt: null }));
  }
}

export async function fetchAllCoursesAdmin(): Promise<Course[]> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    if (snap.empty) {
      return SEED_COURSES.map((b) => ({ ...b.course, createdAt: null, updatedAt: null }));
    }
    const items = snap.docs.map((d) => enrichCourse(d.data() as Course));
    const existingIds = new Set(items.map((c) => c.id));
    for (const bundle of SEED_COURSES) {
      if (!existingIds.has(bundle.course.id)) {
        items.push({ ...bundle.course, createdAt: null, updatedAt: null });
      }
    }
    return items.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'courses');
  }
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const direct = await getDoc(doc(db, 'courses', slug));
    if (direct.exists()) return enrichCourse(direct.data() as Course);
    const q = query(collection(db, 'courses'), where('slug', '==', slug), where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (!snap.empty) return enrichCourse(snap.docs[0].data() as Course);
    const seed = SEED_COURSES.find((b) => b.course.slug === slug || b.course.id === slug);
    return seed ? { ...seed.course, createdAt: null, updatedAt: null } : null;
  } catch {
    const seed = SEED_COURSES.find((b) => b.course.slug === slug || b.course.id === slug);
    return seed ? { ...seed.course, createdAt: null, updatedAt: null } : null;
  }
}

export async function fetchCourseModules(courseId: string): Promise<CourseModule[]> {
  try {
    const q = query(collection(db, 'courses', courseId, 'modules'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as CourseModule);
    }
  } catch {
    // Fallback to seed modules if not yet seeded in Firestore
  }
  const seed = SEED_COURSES.find((b) => b.course.id === courseId);
  return seed ? seed.modules.map((m) => ({ ...m, updatedAt: null })) : [];
}

export async function fetchCourseQuestions(courseId: string): Promise<ExamQuestion[]> {
  try {
    const q = query(collection(db, 'courses', courseId, 'examQuestions'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ExamQuestion);
    }
  } catch {
    // Fallback to seed exam questions if empty
  }
  const seed = SEED_COURSES.find((b) => b.course.id === courseId);
  return seed ? seed.questions : [];
}

export async function fetchFunnelOffers(onlyActive = true): Promise<FunnelOffer[]> {
  try {
    const q = onlyActive
      ? query(collection(db, 'funnelOffers'), where('active', '==', true))
      : collection(db, 'funnelOffers');
    const snap = await getDocs(q);
    if (snap.empty) {
      return SEED_FUNNEL_OFFERS.filter((o) => !onlyActive || o.active).map((o) => ({ ...o, updatedAt: null }));
    }
    const items = snap.docs.map((d) => d.data() as FunnelOffer);
    const existingOfferIds = new Set(items.map((o) => o.id));
    for (const seedOffer of SEED_FUNNEL_OFFERS) {
      if (!existingOfferIds.has(seedOffer.id) && (!onlyActive || seedOffer.active)) {
        items.push({ ...seedOffer, updatedAt: null });
      }
    }
    return items.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  } catch {
    return SEED_FUNNEL_OFFERS.filter((o) => !onlyActive || o.active).map((o) => ({ ...o, updatedAt: null }));
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export async function saveFunnelOfferAdmin(offer: Omit<FunnelOffer, 'updatedAt'>) {
  try {
    const clean = stripUndefined(offer as Record<string, unknown>);
    await setDoc(doc(db, 'funnelOffers', offer.id), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `funnelOffers/${offer.id}`);
  }
}

export async function deleteFunnelOfferAdmin(offerId: string) {
  try {
    await deleteDoc(doc(db, 'funnelOffers', offerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `funnelOffers/${offerId}`);
  }
}

export async function fetchTestimonials(courseId?: string, onlyActive = true): Promise<Testimonial[]> {
  try {
    const q = onlyActive
      ? query(collection(db, 'testimonials'), where('active', '==', true))
      : collection(db, 'testimonials');
    const snap = await getDocs(q);
    const items: Testimonial[] = snap.empty
      ? SEED_TESTIMONIALS.filter((t) => !onlyActive || t.active).map((t) => ({ ...t, updatedAt: null }))
      : snap.docs.map((d) => d.data() as Testimonial);
    const filtered = courseId
      ? items.filter((t) => t.courseId === courseId || t.courseId === 'all')
      : items;
    return filtered.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  } catch {
    const items = SEED_TESTIMONIALS.filter((t) => !onlyActive || t.active).map((t) => ({ ...t, updatedAt: null }));
    return courseId ? items.filter((t) => t.courseId === courseId || t.courseId === 'all') : items;
  }
}

export async function saveTestimonialAdmin(testimonial: Omit<Testimonial, 'updatedAt'>) {
  try {
    const clean = stripUndefined(testimonial as Record<string, unknown>);
    await setDoc(doc(db, 'testimonials', testimonial.id), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `testimonials/${testimonial.id}`);
  }
}

export async function deleteTestimonialAdmin(testimonialId: string) {
  try {
    await deleteDoc(doc(db, 'testimonials', testimonialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `testimonials/${testimonialId}`);
  }
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'public'));
    if (snap.exists()) return snap.data() as PublicSettings;
  } catch {
    // Fallback to defaults
  }
  return { ...DEFAULT_PUBLIC_SETTINGS, updatedAt: null };
}

export async function seedInitialDatabaseIfEmpty(): Promise<number> {
  let seeded = 0;
  try {
    for (const bundle of SEED_COURSES) {
      const courseRef = doc(db, 'courses', bundle.course.id);
      const courseSnap = await getDoc(courseRef);
      let courseAddedOrUpdated = false;

      if (!courseSnap.exists()) {
        await setDoc(courseRef, {
          ...bundle.course,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        courseAddedOrUpdated = true;
      }

      for (const mod of bundle.modules) {
        const modRef = doc(db, 'courses', bundle.course.id, 'modules', mod.id);
        const modSnap = await getDoc(modRef);
        if (!modSnap.exists()) {
          await setDoc(modRef, {
            ...mod,
            updatedAt: serverTimestamp(),
          });
          courseAddedOrUpdated = true;
        }
      }

      for (const q of bundle.questions) {
        const qRef = doc(db, 'courses', bundle.course.id, 'examQuestions', q.id);
        const qSnap = await getDoc(qRef);
        if (!qSnap.exists()) {
          await setDoc(qRef, q);
          courseAddedOrUpdated = true;
        }
      }

      if (courseAddedOrUpdated) {
        seeded++;
      }
    }

    for (const offer of SEED_FUNNEL_OFFERS) {
      const offerRef = doc(db, 'funnelOffers', offer.id);
      const offerSnap = await getDoc(offerRef);
      if (!offerSnap.exists()) {
        await setDoc(offerRef, {
          ...offer,
          updatedAt: serverTimestamp(),
        });
      }
    }

    for (const t of SEED_TESTIMONIALS) {
      const tRef = doc(db, 'testimonials', t.id);
      const tSnap = await getDoc(tRef);
      if (!tSnap.exists()) {
        await setDoc(tRef, {
          ...t,
          updatedAt: serverTimestamp(),
        });
      }
    }

    const pubSnap = await getDoc(doc(db, 'settings', 'public'));
    if (!pubSnap.exists()) {
      await setDoc(doc(db, 'settings', 'public'), {
        ...DEFAULT_PUBLIC_SETTINGS,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'courses');
  }
  return seeded;
}

export async function saveCourseAdmin(course: Partial<Course> & { id: string }, isNew: boolean) {
  try {
    if (course.coverImageUrl) {
      assertNoExternalAssetUrl(course.coverImageUrl, 'capa do curso');
    }
    if (course.bannerImageUrl) {
      assertNoExternalAssetUrl(course.bannerImageUrl, 'banner do curso');
    }

    const ref = doc(db, 'courses', course.id);
    const snap = await getDoc(ref);
    const shouldCreate = isNew || !snap.exists();
    const cleanCourse = stripUndefined({ ...course } as Record<string, unknown>);
    delete cleanCourse.createdAt;
    delete cleanCourse.updatedAt;

    if (shouldCreate) {
      await setDoc(ref, {
        ...cleanCourse,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        ...cleanCourse,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `courses/${course.id}`);
  }
}

export async function deleteCourseAdmin(courseId: string) {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
  }
}

export async function saveCourseModuleAdmin(mod: Omit<CourseModule, 'updatedAt'>) {
  try {
    for (const lesson of mod.lessons || []) {
      if (lesson.videoUrl) assertNoExternalAssetUrl(lesson.videoUrl, `vídeo da aula "${lesson.title}"`);
      if (lesson.pdfUrl) assertNoExternalAssetUrl(lesson.pdfUrl, `PDF da aula "${lesson.title}"`);
      if (lesson.imageUrl) assertNoExternalAssetUrl(lesson.imageUrl, `imagem da aula "${lesson.title}"`);
      if (lesson.attachmentUrl) assertNoExternalAssetUrl(lesson.attachmentUrl, `anexo da aula "${lesson.title}"`);
    }
    const cleanMod = stripUndefined(mod as Record<string, unknown>);
    await setDoc(doc(db, 'courses', mod.courseId, 'modules', mod.id), {
      ...cleanMod,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${mod.courseId}/modules/${mod.id}`);
  }
}

export async function deleteCourseModuleAdmin(courseId: string, moduleId: string) {
  try {
    await deleteDoc(doc(db, 'courses', courseId, 'modules', moduleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}/modules/${moduleId}`);
  }
}

export async function saveExamQuestionAdmin(question: ExamQuestion) {
  try {
    await setDoc(doc(db, 'courses', question.courseId, 'examQuestions', question.id), question);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${question.courseId}/examQuestions/${question.id}`);
  }
}

export async function deleteExamQuestionAdmin(courseId: string, questionId: string) {
  try {
    await deleteDoc(doc(db, 'courses', courseId, 'examQuestions', questionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}/examQuestions/${questionId}`);
  }
}

export async function createPendingOrder(order: Omit<Order, 'createdAt' | 'updatedAt'>) {
  try {
    const clean = stripUndefined(order as Record<string, unknown>);
    await setDoc(doc(db, 'orders', order.id), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
  }
}

export async function attachCheckoutUrlToOrder(orderId: string, checkoutUrl: string) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      checkoutUrl,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    return snap.docs.map((d) => d.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function releaseOrderAndEnrollAdmin(order: Order) {
  try {
    await updateDoc(doc(db, 'orders', order.id), {
      status: 'released',
      updatedAt: serverTimestamp(),
    });
    const targetCourseIds = order.courseIds && order.courseIds.length > 0 ? order.courseIds : [order.courseId];
    for (const cId of targetCourseIds) {
      const seedCourse = SEED_COURSES.find((b) => b.course.id === cId)?.course;
      const resolvedTitle =
        cId === order.courseId && targetCourseIds.length === 1
          ? order.courseTitle
          : seedCourse
            ? `${seedCourse.nrCode} - ${seedCourse.title}`
            : cId.toUpperCase();

      const enrollmentId = `${order.userId}_${cId}`;
      const enrollRef = doc(db, 'enrollments', enrollmentId);
      const existing = await getDoc(enrollRef);
      if (!existing.exists()) {
        const enrollment: Omit<Enrollment, 'enrolledAt' | 'updatedAt'> = {
          id: enrollmentId,
          userId: order.userId,
          userName: order.userName,
          userEmail: order.userEmail,
          courseId: cId,
          courseTitle: resolvedTitle,
          orderId: order.id,
          completedLessonIds: [],
          progressPercent: 0,
          examAttempts: 0,
          examPassed: false,
          bestScore: 0,
        };
        await setDoc(enrollRef, {
          ...enrollment,
          enrolledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function updateOrderStatusAdmin(orderId: string, status: Order['status']) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function fetchUserEnrollments(userId: string): Promise<Enrollment[]> {
  try {
    const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Enrollment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enrollments');
  }
}

export async function fetchAllEnrollmentsAdmin(): Promise<Enrollment[]> {
  try {
    const snap = await getDocs(collection(db, 'enrollments'));
    return snap.docs.map((d) => d.data() as Enrollment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'enrollments');
  }
}

export async function fetchAllUsersAdmin(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  patch: Partial<Pick<Enrollment, 'completedLessonIds' | 'progressPercent' | 'examAttempts' | 'examPassed' | 'bestScore' | 'certificateId'>>
) {
  try {
    await updateDoc(doc(db, 'enrollments', enrollmentId), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `enrollments/${enrollmentId}`);
  }
}

export async function saveCertificateRecord(cert: Omit<Certificate, 'issuedAt'>) {
  try {
    const clean = stripUndefined(cert as Record<string, unknown>);
    await setDoc(doc(db, 'certificates', cert.id), {
      ...clean,
      issuedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `certificates/${cert.id}`);
  }
}

export async function validateCertificateByCode(code: string): Promise<Certificate | null> {
  try {
    const clean = code.trim().toUpperCase();
    const q = query(
      collection(db, 'certificates'),
      where('validationCode', '==', clean),
      where('status', '==', 'valid')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Certificate;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'certificates');
  }
}

export async function fetchUserCertificates(userId: string): Promise<Certificate[]> {
  try {
    const q = query(
      collection(db, 'certificates'),
      where('userId', '==', userId),
      where('status', '==', 'valid')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Certificate);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'certificates');
  }
}

export async function fetchAllCertificatesAdmin(): Promise<Certificate[]> {
  try {
    const snap = await getDocs(collection(db, 'certificates'));
    return snap.docs.map((d) => d.data() as Certificate);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'certificates');
  }
}

export async function submitCorporateQuote(quote: Omit<CorporateQuote, 'createdAt'>) {
  try {
    await setDoc(doc(db, 'corporateQuotes', quote.id), {
      ...quote,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `corporateQuotes/${quote.id}`);
  }
}

export async function fetchCorporateQuotesAdmin(): Promise<CorporateQuote[]> {
  try {
    const snap = await getDocs(collection(db, 'corporateQuotes'));
    return snap.docs.map((d) => d.data() as CorporateQuote);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'corporateQuotes');
  }
}

export async function submitSafetyDocRequest(req: Omit<SafetyDocRequest, 'createdAt'>) {
  try {
    if (req.cnpjCardUrl) {
      assertNoExternalAssetUrl(req.cnpjCardUrl, 'Cartão CNPJ');
    }
    if (req.aprPdfUrl) {
      assertNoExternalAssetUrl(req.aprPdfUrl, 'PDF da APR');
    }
    const clean = stripUndefined(req as Record<string, unknown>);
    await setDoc(doc(db, 'safetyDocRequests', req.id), {
      ...clean,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `safetyDocRequests/${req.id}`);
  }
}

export async function fetchUserSafetyDocRequests(userId: string): Promise<SafetyDocRequest[]> {
  try {
    const q = query(collection(db, 'safetyDocRequests'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SafetyDocRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'safetyDocRequests');
  }
}

export async function fetchAllSafetyDocRequestsAdmin(): Promise<SafetyDocRequest[]> {
  try {
    const snap = await getDocs(collection(db, 'safetyDocRequests'));
    return snap.docs.map((d) => d.data() as SafetyDocRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'safetyDocRequests');
  }
}

export async function updateSafetyDocStatusAdmin(requestId: string, status: SafetyDocStatus) {
  try {
    await updateDoc(doc(db, 'safetyDocRequests', requestId), {
      status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `safetyDocRequests/${requestId}`);
  }
}

const ALLOWED_CLIENT_FOLDERS = new Set([
  'courses',
  'lessons',
  'safety-docs',
  'certificates',
  'attachments',
  'uploads',
]);

const ALLOWED_CLIENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export interface BlobUploadResult {
  url: string;
  pathname?: string;
  storageProvider: 'vercel-blob' | 'local-preview';
}

export async function uploadFileToVercelBlob(
  file: File,
  folder = 'uploads',
  onProgress?: (percentage: number) => void
): Promise<BlobUploadResult> {
  const normalizedFolder = ALLOWED_CLIENT_FOLDERS.has(folder) ? folder : 'uploads';
  const normalizedType = (file.type || '').toLowerCase().trim();
  if (normalizedType && !ALLOWED_CLIENT_MIME_TYPES.has(normalizedType)) {
    throw new Error(
      'Formato não suportado. Envie imagens (JPG, PNG, WEBP, GIF), PDF ou vídeos (MP4, WEBM, MOV).'
    );
  }
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('O arquivo excede o limite máximo de 100 MB no Vercel Blob.');
  }

  let statusInfo: { vercelBlobConfigured?: boolean; isVercelRuntime?: boolean } = {};
  try {
    const statusRes = await fetch('/api/blob/status');
    if (statusRes.ok) {
      statusInfo = (await statusRes.json()) as {
        vercelBlobConfigured?: boolean;
        isVercelRuntime?: boolean;
      };
    }
  } catch {
    // fallback handled below
  }

  if (statusInfo.isVercelRuntime && !statusInfo.vercelBlobConfigured) {
    throw new Error(
      'Storage Vercel Blob não configurado (BLOB_READ_WRITE_TOKEN ausente na Vercel). Ative o Vercel Blob Storage nas configurações do projeto.'
    );
  }

  const safeFilename = (file.name || `arquivo_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPathname = `${normalizedFolder}/${safeFilename}`;

  // Upload direto do navegador para o Vercel Blob Storage (suporta arquivos grandes sem limite de payload serverless)
  if (statusInfo.vercelBlobConfigured) {
    try {
      const blob = await uploadDirectToVercelBlob(targetPathname, file, {
        access: 'public',
        handleUploadUrl: '/api/blob/handle-upload',
        contentType: normalizedType || undefined,
        multipart: file.size > 4 * 1024 * 1024,
        onUploadProgress: (evt) => {
          if (onProgress && typeof evt.percentage === 'number') {
            onProgress(Math.round(evt.percentage));
          }
        },
      });
      onProgress?.(100);
      return {
        url: blob.url,
        pathname: blob.pathname,
        storageProvider: 'vercel-blob',
      };
    } catch (directErr) {
      // Fallback para upload via API caso o arquivo seja pequeno (<= 3 MB) e haja restrição de rede no cliente
      if (file.size > 3 * 1024 * 1024) {
        throw new Error(
          directErr instanceof Error
            ? `Falha no upload direto para o Vercel Blob: ${directErr.message}`
            : 'Falha no upload direto para o Vercel Blob.'
        );
      }
    }
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error(
      'Arquivo maior que 15 MB requer BLOB_READ_WRITE_TOKEN configurado para upload direto no Vercel Blob.'
    );
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Erro ao ler arquivo selecionado.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/blob/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: safeFilename,
      contentType: normalizedType || 'application/octet-stream',
      base64Data,
      folder: normalizedFolder,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as BlobUploadResult & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar arquivo para o Vercel Blob.');
  }
  onProgress?.(100);
  return data;
}
