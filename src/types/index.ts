export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  company?: string;
  role: UserRole;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'image';
  durationMinutes: number;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  order: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  updatedAt: unknown;
}

export interface ExamQuestion {
  id: string;
  courseId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  nrCode: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  salesHeadline?: string;
  salesSubheadline?: string;
  promoTag?: string;
  originalPriceCents?: number;
  enrolledCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  guaranteeDays?: number;
  workloadHours: number;
  priceCents: number;
  certificateValidityMonths: number;
  targetAudience?: string;
  notForAudience?: string[];
  includedBonuses?: string[];
  learningOutcomes?: string[];
  faq?: CourseFAQ[];
  coverImageUrl?: string;
  bannerImageUrl?: string;
  instructorName?: string;
  instructorRole?: string;
  instructorRegistry?: string;
  status: 'published' | 'draft';
  displayOrder: number;
  passingScore: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export type FunnelOfferType = 'order_bump' | 'upsell' | 'combo';

export interface FunnelOffer {
  id: string;
  type: FunnelOfferType;
  title: string;
  subtitle?: string;
  description: string;
  triggerCourseId?: string;
  includedCourseIds: string[];
  originalPriceCents: number;
  offerPriceCents: number;
  badgeLabel?: string;
  active: boolean;
  displayOrder: number;
  updatedAt: unknown;
}

export interface Testimonial {
  id: string;
  courseId: string;
  authorName: string;
  authorRole: string;
  company: string;
  rating: number;
  quote: string;
  verifiedPurchase: boolean;
  active: boolean;
  displayOrder: number;
  updatedAt: unknown;
}

export type OrderStatus = 'pending' | 'paid' | 'released' | 'cancelled';

export interface OrderItemSummary {
  id: string;
  title: string;
  priceCents: number;
  kind: 'course' | 'bump' | 'upsell' | 'combo';
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseIds?: string[];
  courseTitle: string;
  itemsSummary?: OrderItemSummary[];
  orderBumpId?: string;
  comboId?: string;
  parentOrderId?: string;
  upsellOfferId?: string;
  amountCents: number;
  status: OrderStatus;
  paymentProvider: string;
  checkoutUrl?: string;
  transactionNsu?: string;
  invoiceSlug?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  orderId: string;
  completedLessonIds: string[];
  progressPercent: number;
  examAttempts: number;
  examPassed: boolean;
  bestScore: number;
  certificateId?: string;
  enrolledAt: unknown;
  updatedAt: unknown;
}

export interface Certificate {
  id: string;
  validationCode: string;
  userId: string;
  studentName: string;
  studentCpf?: string;
  courseId: string;
  courseTitle: string;
  nrCode: string;
  workloadHours: number;
  validityMonths: number;
  instructorName: string;
  instructorRole?: string;
  instructorRegistry?: string;
  score: number;
  pdfUrl: string;
  issuedAt: unknown;
  status: 'valid' | 'revoked';
}

export interface CorporateQuote {
  id: string;
  companyName: string;
  cnpj?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  coursesInterest: string[];
  employeeCount: number;
  notes?: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: unknown;
}

export interface PublicSettings {
  companyName: string;
  cnpj?: string;
  email: string;
  phone?: string;
  address?: string;
  heroTitle: string;
  heroSubtitle: string;
  footerNote?: string;
  certificateTemplateHeader?: string;
  certificateTemplateBody?: string;
  defaultInstructorName?: string;
  defaultInstructorRole?: string;
  defaultInstructorRegistry?: string;
  updatedAt: unknown;
}

export interface IntegrationSettings {
  infinitePayHandle: string;
  updatedAt: unknown;
}

export type SafetyDocType = 'apr' | 'pgr';
export type SafetyDocStatus = 'generated' | 'pending_review' | 'completed';

export interface SafetyDocRequest {
  id: string;
  docType: SafetyDocType;
  userId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  companyName?: string;
  cnpj?: string;
  cnpjCardUrl?: string;
  serviceDescription?: string;
  workAtHeight?: boolean;
  equipmentList?: string;
  workersInvolved?: string;
  aprPdfUrl?: string;
  risksDescription?: string;
  employeeCount?: number;
  status: SafetyDocStatus;
  createdAt: unknown;
}

