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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.045, 0.22), ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white border border-slate-200/90 hover:border-[#0A2540]/30 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_-6px_rgba(10,37,64,0.07)] hover:shadow-[0_24px_48px_-16px_rgba(10,37,64,0.20)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Subtle top hover highlight bar */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[2px] z-10 bg-gradient-to-r from-[#0A2540] via-[#F5C518] to-[#0A2540] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <Link to={`/cursos/${course.slug}`} className="block relative aspect-[4/3] bg-[#0A2540] overflow-hidden">
        {!imgError && course.coverImageUrl ? (
          <img
            src={course.coverImageUrl}
            alt={`${course.nrCode} - ${course.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full bg-[#0A2540] flex flex-col items-center justify-center p-6 text-center">
            <ShieldCheck className="w-10 h-10 text-[#F5C518] mb-2" />
            <span className="font-mono text-sm font-semibold text-white">{course.nrCode}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071B30]/92 via-[#0A2540]/20 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
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

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {course.originalPriceCents && course.originalPriceCents > course.priceCents && (
                <span className="block font-mono text-[11px] text-slate-400 line-through tabular-nums">
                  {formatCurrencyBRL(course.originalPriceCents)}
                </span>
              )}
              <span className="font-mono text-xl font-extrabold text-[#0A2540] tabular-nums block leading-tight">
                {formatCurrencyBRL(course.priceCents)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
              {formatInstallmentBRL(course.priceCents)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/cursos/${course.slug}`}
              className="inline-flex items-center justify-center px-3 py-2.5 border border-slate-300 hover:border-[#0A2540] hover:bg-slate-50 text-[#0A2540] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Ver programa
            </Link>

            <Link
              to={`/cursos/${course.slug}`}
              className="btn-sheen inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] active:scale-[0.98] text-[#0A2540] text-xs font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap shadow-[0_6px_16px_-6px_rgba(245,197,24,0.65)]"
            >
              Matricular-se
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

