import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { formatCurrencyBRL, formatInstallmentBRL } from '../data/seedCourses';
import type { Course } from '../types';

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(10,37,64,0.04)] hover:shadow-[0_14px_30px_-10px_rgba(10,37,64,0.14)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <Link to={`/cursos/${course.slug}`} className="block relative aspect-[4/3] bg-[#0A2540] overflow-hidden">
        {!imgError && course.coverImageUrl ? (
          <img
            src={course.coverImageUrl}
            alt={`${course.nrCode} - ${course.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-[#0A2540] flex flex-col items-center justify-center p-6 text-center">
            <ShieldCheck className="w-10 h-10 text-[#F5C518] mb-2" />
            <span className="font-mono text-sm font-semibold text-white">{course.nrCode}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/85 via-[#0A2540]/15 to-transparent" />
        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-white">
          <span className="font-mono font-bold tracking-wide text-[#F5C518]">{course.nrCode}</span>
          <span className="font-mono tabular-nums text-slate-100">
            {course.workloadHours}h · Validade {course.certificateValidityMonths}m
          </span>
        </div>
      </Link>

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0A2540] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
              {(course.ratingAverage || 4.9).toFixed(1)}
            </span>
            <span className="tabular-nums">
              +{(course.enrolledCount || 1100).toLocaleString('pt-BR')} alunos formados
            </span>
          </div>

          <Link to={`/cursos/${course.slug}`} className="block">
            <h3 className="font-display text-lg font-bold text-[#0A2540] leading-snug group-hover:text-[#0F2C59] transition-colors">
              {course.title}
            </h3>
          </Link>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{course.shortDescription}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            {course.originalPriceCents && course.originalPriceCents > course.priceCents && (
              <span className="block font-mono text-[11px] text-slate-400 line-through tabular-nums">
                {formatCurrencyBRL(course.originalPriceCents)}
              </span>
            )}
            <span className="font-mono text-xl font-extrabold text-[#0A2540] tabular-nums block leading-tight">
              {formatCurrencyBRL(course.priceCents)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {formatInstallmentBRL(course.priceCents)}
            </span>
          </div>

          <Link
            to={`/cursos/${course.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Ver curso
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
