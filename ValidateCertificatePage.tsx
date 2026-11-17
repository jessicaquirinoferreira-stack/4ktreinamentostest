import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileCheck2, Search, ShieldAlert } from 'lucide-react';
import { validateCertificateByCode } from '../lib/firestoreService';
import type { Certificate } from '../types';

export function ValidateCertificatePage() {
  const [params] = useSearchParams();
  const initialCode = params.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  async function runSearch(targetCode: string) {
    if (!targetCode.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await validateCertificateByCode(targetCode);
      setCertificate(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) {
      runSearch(initialCode);
    }
  }, [initialCode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(code);
  }

  function formatIssuedAt(val: any): string {
    if (!val) return '-';
    if (typeof val?.toDate === 'function') {
      return val.toDate().toLocaleDateString('pt-BR');
    }
    return new Date(val).toLocaleDateString('pt-BR');
  }

  return (
    <main className="min-h-[75vh] bg-[#F7F9FC] py-14 sm:py-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
            Autenticidade Documental
          </p>
          <h1 className="font-display text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Validação Pública de Certificado
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Consulte a autenticidade de certificados emitidos pela 4k Treinamentos informando o código impresso no documento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
          <label className="block text-xs font-semibold text-slate-700">
            Código de validação do certificado
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: 4K-NR35-2026-AB12CD"
              className="flex-1 px-4 py-3 bg-[#F7F9FC] border border-slate-300 rounded-lg font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-[46px] px-6 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Consultando...' : 'Validar código'}
            </button>
          </div>
        </form>

        {searched && !loading && (
          certificate ? (
            <div className="bg-white border border-emerald-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 block">
                      Certificado Autêntico e Válido
                    </span>
                    <h2 className="font-display text-xl font-bold text-[#0A2540]">
                      {certificate.studentName}
                    </h2>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500">{certificate.validationCode}</span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Treinamento</dt>
                  <dd className="font-semibold text-[#0A2540] mt-0.5">
                    {certificate.nrCode} – {certificate.courseTitle}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Carga horária · Validade</dt>
                  <dd className="font-mono font-semibold text-[#0A2540] mt-0.5 tabular-nums">
                    {certificate.workloadHours}h · {certificate.validityMonths} meses
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Aproveitamento na prova</dt>
                  <dd className="font-mono font-semibold text-[#0A2540] mt-0.5 tabular-nums">
                    {certificate.score}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Data de emissão</dt>
                  <dd className="font-mono font-semibold text-[#0A2540] mt-0.5 tabular-nums">
                    {formatIssuedAt(certificate.issuedAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Instrutor responsável</dt>
                  <dd className="font-medium text-[#0A2540] mt-0.5">
                    {certificate.instructorName}{' '}
                    {certificate.instructorRegistry ? `· ${certificate.instructorRegistry}` : ''}
                  </dd>
                </div>
              </dl>

              {certificate.pdfUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF do certificado
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-red-200 rounded-xl p-6 flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-bold text-[#0A2540]">Código não localizado</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Nenhum certificado válido foi encontrado com o código <span className="font-mono">{code}</span>. Confira se digitou exatamente como consta no documento.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
