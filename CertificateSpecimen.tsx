import { useState } from 'react';
import { motion } from 'motion/react';
import { FileCheck2, QrCode } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../data/seedCourses';
import type { Course, PublicSettings } from '../types';

interface Props {
  courses: Course[];
  settings: PublicSettings;
}

export function CertificateSpecimen({ courses, settings }: Props) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [previewName, setPreviewName] = useState('JOÃO PEDRO ALMEIDA');
  const [selectedId, setSelectedId] = useState(courses[0]?.id || 'nr-35');

  const activeCourse = courses.find((c) => c.id === selectedId) || courses[0];

  if (!activeCourse) return null;

  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Controls & Explanation */}
          <div className="lg:col-span-5 space-y-6">
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
                Cada documento é gerado em PDF de alta definição com código único verificável em{' '}
                <span className="font-mono font-semibold text-[#0A2540]">/validar</span>, carga horária, aproveitamento
                na prova e dados completos do engenheiro responsável.
              </p>
            </div>

            <div className="space-y-4 pt-2">
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

              {/* Front / Back Switch */}
              <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(['front', 'back'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setSide(tabKey)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      side === tabKey ? 'text-[#0A2540]' : 'text-slate-600 hover:text-[#0A2540]'
                    }`}
                  >
                    {side === tabKey && (
                      <motion.span
                        layoutId="certSideIndicator"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-md shadow-xs"
                      />
                    )}
                    <span className="relative z-10">
                      {tabKey === 'front' ? 'Frente do Certificado' : 'Verso · Conteúdo Programático'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Realistic Certificate Frame */}
          <div className="lg:col-span-7">
            <motion.div
              key={`${side}-${activeCourse.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border-2 border-[#0A2540] rounded-xl p-2 shadow-[0_20px_50px_-20px_rgba(10,37,64,0.22)]"
            >
              <div className="border border-[#F5C518] rounded-lg overflow-hidden bg-white">
                {side === 'front' ? (
                  <div>
                    <div className="bg-[#0A2540] px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={OFFICIAL_LOGO_URL}
                          alt="4k Treinamentos"
                          referrerPolicy="no-referrer"
                          className="h-11 w-auto object-contain shrink-0"
                        />
                        <p className="hidden sm:block text-[10px] sm:text-xs text-slate-300 font-mono">
                          SEGURANÇA DO TRABALHO · NORMAS REGULAMENTADORAS
                        </p>
                      </div>
                      <div className="text-right font-mono text-[10px] sm:text-xs text-white">
                        <span className="text-slate-300 block">CÓDIGO DE VALIDAÇÃO</span>
                        <span className="text-[#F5C518]">4K-{activeCourse.nrCode.replace('-', '')}-2026-8F92A</span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 text-center space-y-5">
                      <p className="font-mono text-xs font-bold tracking-widest text-slate-500 uppercase">
                        {settings.certificateTemplateHeader || 'CERTIFICADO DE CONCLUSÃO E APROVAÇÃO'}
                      </p>

                      <div>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight break-words">
                          {previewName || 'NOME DO ALUNO'}
                        </p>
                        <div className="w-48 h-0.5 bg-[#F5C518] mx-auto mt-2" />
                      </div>

                      <p className="font-display text-base sm:text-lg font-bold text-[#0F2C59]">
                        {activeCourse.nrCode} – {activeCourse.title}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                        Concluiu com aproveitamento satisfatório na avaliação formal o treinamento teórico da {activeCourse.nrCode}, com carga horária de{' '}
                        <strong className="text-[#0A2540]">{activeCourse.workloadHours} horas</strong> e validade normativa de{' '}
                        <strong className="text-[#0A2540]">{activeCourse.certificateValidityMonths} meses</strong>, conforme diretrizes da NR-01 e MTE.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F9FC] border border-slate-200 rounded-lg p-3 text-left">
                        <div>
                          <span className="text-[10px] text-slate-500 block">CARGA HORÁRIA</span>
                          <span className="font-mono text-xs font-bold text-[#0A2540] tabular-nums">
                            {activeCourse.workloadHours} horas
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">APROVAÇÃO</span>
                          <span className="font-mono text-xs font-bold text-[#0A2540] tabular-nums">92% (Mín. 70%)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">VALIDADE</span>
                          <span className="font-mono text-xs font-bold text-[#0A2540] tabular-nums">
                            {activeCourse.certificateValidityMonths} meses
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">AUTENTICIDADE</span>
                          <span className="font-mono text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Válido
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left items-end">
                        <div className="border-t border-[#0A2540] pt-2">
                          <p className="text-xs font-bold text-[#0A2540]">
                            {activeCourse.instructorName || settings.defaultInstructorName}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {activeCourse.instructorRole || settings.defaultInstructorRole}
                          </p>
                          <p className="font-mono text-[10px] text-slate-500">
                            {activeCourse.instructorRegistry || settings.defaultInstructorRegistry}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-[#0A2540] pt-2">
                          <div>
                            <p className="text-xs font-bold text-[#0A2540]">{settings.companyName || '4k Treinamentos'}</p>
                            <p className="font-mono text-[10px] text-slate-500">CNPJ {settings.cnpj || '48.912.340/0001-72'}</p>
                          </div>
                          <QrCode className="w-9 h-9 text-[#0A2540] shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-xs font-mono font-bold text-[#0F2C59]">VERSO DO CERTIFICADO</p>
                        <h3 className="font-display text-lg font-bold text-[#0A2540]">
                          Conteúdo Programático · {activeCourse.nrCode}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {activeCourse.workloadHours}h totais
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                      {(activeCourse.learningOutcomes || []).map((item, idx) => (
                        <div key={idx} className="p-3 bg-[#F7F9FC] border border-slate-200 rounded-lg">
                          <span className="font-mono font-bold text-[#0A2540] mr-1.5">0{idx + 1}.</span>
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
                      <span>Modalidade: Ensino a Distância (NR-01 item 1.7)</span>
                      <span className="font-mono">Registro digital verificável em /validar</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
