import { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { CORPORATE_TEAM_URL } from '../data/seedCourses';
import { submitCorporateQuote } from '../lib/firestoreService';

export function CorporatePage() {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [employeeCount, setEmployeeCount] = useState('20');
  const [selectedNrs, setSelectedNrs] = useState<string[]>(['NR-35', 'NR-06']);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleNr(nr: string) {
    setSelectedNrs((prev) => (prev.includes(nr) ? prev.filter((x) => x !== nr) : [...prev, nr]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedNrs.length === 0) {
      toast.error('Selecione ao menos uma Norma Regulamentadora.');
      return;
    }
    setSubmitting(true);
    try {
      await submitCorporateQuote({
        id: `quote_${Date.now()}`,
        companyName: companyName.trim(),
        ...(cnpj.trim() ? { cnpj: cnpj.trim() } : {}),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        coursesInterest: selectedNrs,
        employeeCount: Math.max(1, Number(employeeCount) || 1),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        status: 'new',
      });
      setDone(true);
      toast.success('Orçamento corporativo solicitado com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[#F7F9FC] py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
              Soluções Corporativas 4k
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
              Capacitação em NRs para equipes e terceirizados
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Simplifique a integração de obra e manutenção industrial com pacotes empresariais, emissão de certificados padronizados e rastreabilidade total pelo código público.
            </p>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/9] bg-[#0A2540]">
              <img
                src={CORPORATE_TEAM_URL}
                alt="Equipe industrial uniformizada com a marca 4k Treinamentos"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#0A2540]">Descontos progressivos por turma</h2>
                  <p className="text-xs text-slate-600 mt-0.5">Pacotes a partir de 5 colaboradores com liberação em lote.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#0A2540]">Prova formal obrigatória</h2>
                  <p className="text-xs text-slate-600 mt-0.5">Registro de aproveitamento individual para evidência em auditorias.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-sm text-[#0A2540]">Conformidade NR-01 (Ordens de Serviço)</h2>
                  <p className="text-xs text-slate-600 mt-0.5">Consulte nossos pacotes com documentação complementar de segurança.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(10,37,64,0.05)]">
            {done ? (
              <div className="py-12 text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                <h2 className="font-display text-2xl font-bold text-[#0A2540]">Proposta solicitada!</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Recebemos os dados da <strong>{companyName}</strong>. Nossa equipe responderá para {contactEmail} em até 1 dia útil.
                </p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="px-4 py-2 border border-[#0F2C59] rounded-lg text-sm font-semibold text-[#0A2540] hover:bg-[#0A2540]/5 cursor-pointer"
                >
                  Enviar outro pedido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-xl font-bold text-[#0A2540]">Dados da empresa e turma</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contato *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nº de colaboradores *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Cursos de interesse *</label>
                  <div className="flex flex-wrap gap-2">
                    {['NR-06', 'NR-10', 'NR-11', 'NR-12', 'NR-18', 'NR-20', 'NR-23', 'NR-33', 'NR-35'].map((nr) => (
                      <button
                        key={nr}
                        type="button"
                        onClick={() => toggleNr(nr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-colors ${
                          selectedNrs.includes(nr)
                            ? 'bg-[#0A2540] text-white border-[#0A2540]'
                            : 'bg-white text-[#0A2540] border-slate-300 hover:border-[#0A2540]'
                        }`}
                      >
                        {nr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informe prazos ou necessidades específicas"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[46px] py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] font-extrabold text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Enviando solicitação...' : 'Solicitar orçamento empresarial'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
