import { useState } from 'react';
import { motion } from 'motion/react';
import { OFFICIAL_LOGO_URL } from '../data/seedCourses';
import { getNrCertificateSpec } from '../data/certificateCatalog';
import type { Course, PublicSettings } from '../types';

interface Props {
  courses: Course[];
  settings: PublicSettings;
}

export function CertificateSpecimen({ courses, settings }: Props) {
  const [previewName, setPreviewName] = useState('JOÃO PEDRO ALMEIDA');
  const [previewCpf, setPreviewCpf] = useState('123.456.789-00');
  const [selectedId, setSelectedId] = useState(courses[0]?.id || 'nr-33');

  const activeCourse = courses.find((c) => c.id === selectedId) || courses[0];

  if (!activeCourse) return null;

  const spec = getNrCertificateSpec(
    activeCourse.nrCode || activeCourse.id,
    activeCourse.title,
    activeCourse.workloadHours
  );
  const companyLabel = (settings.companyName || '4K TREINAMENTOS').toUpperCase();
  const cnpjLabel = settings.cnpj || '48.912.340/0001-72';
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Controls & Explanation */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-2.5">
              <p className="text-xs font-mono font-semibold text-[#0F2C59] tracking-wide uppercase">
                Documentação completa e auditável
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Modelo oficial do certificado emitido após aprovação
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Cada documento é gerado em PDF A4 de alta definição com os dados reais do aluno, conteúdo programático completo da NR escolhida, espaço para assinatura do aluno, responsável técnico e código único verificável em{' '}
                <span className="font-mono font-semibold text-[#0A2540]">/validar</span>.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A2540] mb-1.5">
                    Simular nome no certificado
                  </label>
                  <input
                    type="text"
                    maxLength={48}
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value.toUpperCase())}
                    placeholder="Digite seu nome completo"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-medium text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A2540] mb-1.5">
                    Simular CPF
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={previewCpf}
                    onChange={(e) => setPreviewCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A2540] mb-1.5">
                  Selecionar Norma Regulamentadora
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                        activeCourse.id === c.id
                          ? 'bg-[#0A2540] text-white border-[#0A2540]'
                          : 'bg-white text-[#0A2540] border-slate-300 hover:border-[#0A2540]'
                      }`}
                    >
                      {c.nrCode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Official Certificate Model (Exact Reference Layout) */}
          <div className="lg:col-span-7">
            <motion.div
              key={activeCourse.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-slate-300 rounded-xl p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(10,37,64,0.18)] space-y-6"
            >
              {/* Top Company Header */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <img
                  src={OFFICIAL_LOGO_URL}
                  alt={companyLabel}
                  referrerPolicy="no-referrer"
                  className="h-9 w-auto object-contain"
                />
                <p
                  className="font-display text-sm sm:text-base font-extrabold tracking-wide uppercase"
                  style={{ color: spec.accentHex }}
                >
                  {companyLabel}
                </p>
              </div>

              {/* Bordered Tinted Certificate Banner */}
              <div
                className="border-2 px-4 py-5 text-center space-y-1.5"
                style={{
                  borderColor: spec.accentHex,
                  backgroundColor: spec.tintHex,
                }}
              >
                <p
                  className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: spec.accentHex }}
                >
                  CERTIFICADO
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  {spec.bannerSubtitle || `${spec.nrLabel} | ${spec.officialTitle}`}
                </p>
              </div>

              {/* Student Name + CPF + Certification Text */}
              <div className="text-center space-y-2.5">
                <p
                  className="font-display text-lg sm:text-2xl font-extrabold tracking-tight uppercase break-words"
                  style={{ color: spec.accentHex }}
                >
                  {previewName || 'NOME DO ALUNO'}
                </p>
                {previewCpf && (
                  <p className="font-mono text-xs text-slate-700 font-medium">
                    CPF: {previewCpf}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto text-left sm:text-center pt-1">
                  Certificamos que <strong>{previewName || 'NOME DO ALUNO'}</strong> participou e concluiu com aproveitamento o treinamento{' '}
                  {spec.trainingTypeLabel ? <>de <strong>{spec.trainingTypeLabel}</strong> </> : null}
                  da <strong>{spec.nrLabel}</strong> – {spec.officialTitle}
                  {spec.audienceClause ? (
                    <>
                      , <strong>{spec.audienceClause}</strong>
                    </>
                  ) : null}
                  , promovido por <strong>{companyLabel}</strong>, CNPJ {cnpjLabel}, com carga horária de{' '}
                  <strong>{activeCourse.workloadHours} horas</strong> e validade normativa de{' '}
                  <strong>{activeCourse.certificateValidityMonths} meses</strong>.
                </p>
              </div>

              {/* Conteúdo Programático Section */}
              <div className="space-y-3 pt-2">
                <div className="text-center space-y-1">
                  <p
                    className="text-[11px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: spec.accentHex }}
                  >
                    CONTEÚDO PROGRAMÁTICO – {spec.nrLabel}
                  </p>
                  <p
                    className="font-display text-sm sm:text-base font-extrabold uppercase"
                    style={{ color: spec.accentHex }}
                  >
                    {spec.officialTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Modalidade informada:</strong>{' '}
                  {spec.modalitySummary || 'Treinamento teórico EAD (NR-01)'} · Carga horária:{' '}
                  {activeCourse.workloadHours}h · Código de validação:{' '}
                  <span className="font-mono font-semibold">4K-{spec.nrLabel.replace('-', '')}-2026-8F92A</span>
                </p>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">Conteúdo ministrado:</p>
                  <ul className="space-y-1 text-xs text-slate-800 pl-2">
                    {spec.syllabus.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-snug">
                        <span className="font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Date Line */}
              <p className="text-center text-xs text-slate-700 pt-2">
                São Paulo/SP, {todayFormatted}
              </p>

              {/* Two Side-by-Side Signature Blocks (with Student Signature Space) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                <div className="text-center space-y-0.5 pt-2 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-900">
                    {activeCourse.instructorName || settings.defaultInstructorName}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Responsável técnico – {activeCourse.instructorRegistry || settings.defaultInstructorRegistry}
                  </p>
                </div>

                <div className="text-center space-y-0.5 pt-2 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 uppercase">
                    {previewName || 'NOME DO ALUNO'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Aluno(a) certificado(a) · Assinatura
                  </p>
                </div>
              </div>

              {/* Institutional Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 space-y-0.5">
                <p>
                  {companyLabel} | CNPJ {cnpjLabel} | {settings.phone || '(11) 4002-8922'}
                </p>
                <p>{settings.address || 'Av. Paulista, 1439 · Bela Vista, São Paulo - SP'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
