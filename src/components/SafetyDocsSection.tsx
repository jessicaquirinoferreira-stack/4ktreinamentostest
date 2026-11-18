import { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileSpreadsheet,
  HardHat,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { submitSafetyDocRequest, uploadFileToVercelBlob } from '../lib/firestoreService';
import type { SafetyDocRequest } from '../types';

interface SafetyDocsSectionProps {
  userId?: string;
  defaultName?: string;
  defaultEmail?: string;
  compact?: boolean;
  onSubmitted?: (record: Omit<SafetyDocRequest, 'createdAt'>) => void;
}

interface AprAnalysis {
  applicableNrs: string[];
  risks: string[];
  controls: string[];
  ppes: string[];
}

function analyzeAprInputs(
  serviceDescription: string,
  equipmentList: string,
  workAtHeight: boolean
): AprAnalysis {
  const combined = `${serviceDescription} ${equipmentList}`.toLowerCase();
  const applicableNrs = new Set<string>(['NR-01', 'NR-06']);
  const risks: string[] = [];
  const controls: string[] = [];
  const ppes = new Set<string>([
    'Capacete de segurança com jugular',
    'Óculos de proteção contra impactos',
    'Calçado de segurança com biqueira',
    'Luvas de proteção adequadas à tarefa',
  ]);

  if (
    workAtHeight ||
    /(altura|telhado|andaime|escada|balancim|ancoragem|cadeirinha|cinto)/.test(combined)
  ) {
    applicableNrs.add('NR-35');
    risks.push('Queda de colaborador ou queda de ferramentas e materiais em nível superior.');
    controls.push(
      'Uso obrigatório de cinturão tipo paraquedista com talabarte duplo ancorado em ponto resistente e isolamento da área inferior.'
    );
    ppes.add('Cinturão tipo paraquedista com talabarte duplo / trava-quedas');
  }

  if (/(eletr|elétr|quadro|painel|tensão|tensao|cabo|disjuntor|multímetro|multimetro)/.test(combined)) {
    applicableNrs.add('NR-10');
    risks.push('Choque elétrico, arco voltaico e queimaduras por contato acidental com partes energizadas.');
    controls.push(
      'Desenergização prévia, bloqueio e etiquetagem (LOTO), teste de ausência de tensão e ferramentas com isolação 1000V.'
    );
    ppes.add('Luva isolante de borracha e vestimenta antichama (FR)');
  }

  if (/(máquina|maquina|prensa|serra|esmerilhadeira|torno|lixadeira|policorte|roçadeira)/.test(combined)) {
    applicableNrs.add('NR-12');
    risks.push('Prensamento, corte, abrasão e projeção de partículas ou fragmentos rotativos.');
    controls.push(
      'Inspeção prévia das proteções fixas/móveis, botão de parada de emergência funcional e bloqueio de fontes de energia.'
    );
    ppes.add('Protetor facial em policarbonato e protetor auricular');
  }

  if (/(confinad|tanque|silo|galeria|poço|poco|reservatório|reservatorio|caldeira)/.test(combined)) {
    applicableNrs.add('NR-33');
    risks.push('Deficiência de oxigênio, atmosfera tóxica ou inflamável em espaço confinado.');
    controls.push(
      'Emissão de PET (Permissão de Entrada e Trabalho), monitoramento contínuo multigás, ventilação forçada e vigia permanente.'
    );
  }

  if (/(solda|inflamável|inflamavel|combustível|combustivel|solvente|gás|gas|tinta|maçarico|macarico)/.test(combined)) {
    applicableNrs.add('NR-20');
    applicableNrs.add('NR-23');
    risks.push('Princípio de incêndio, explosão ou inalação de vapores e fumos químicos.');
    controls.push(
      'Remoção de materiais combustíveis em raio de 10 metros, extintor PQS/CO2 próximo à frente de trabalho e permissão para trabalho a quente.'
    );
    ppes.add('Respirador PFF2 / semifacial e avental em raspa (se trabalho a quente)');
  }

  if (/(empilhadeira|ponte rolante|guincho|munck|talha|carga|içamento|icamento|palete)/.test(combined)) {
    applicableNrs.add('NR-11');
    risks.push('Atropelamento, tombamento de carga ou ruptura de cintas de movimentação.');
    controls.push(
      'Sinalização de piso, inspeção de cintas/manilhas, operador habilitado e proibição de permanência sob carga suspensa.'
    );
  }

  if (/(obra|construção|construcao|escavação|escavacao|concreto|alvenaria|betoneira)/.test(combined)) {
    applicableNrs.add('NR-18');
    risks.push('Soterramento, quedas em desníveis, exposição a poeiras minerais e ruído.');
    controls.push(
      'Isolamento físico da frente de serviço, escoramento técnico e organização contínua de materiais e passagens.'
    );
  }

  if (risks.length === 0) {
    risks.push('Riscos ergonômicos, escorregões, cortes leves e projeção eventual de partículas durante a operação.');
    controls.push(
      'Briefing diário de segurança (DDS), inspeção prévia de ferramentas, sinalização do perímetro e cumprimento das instruções de trabalho.'
    );
  }

  return {
    applicableNrs: Array.from(applicableNrs),
    risks,
    controls,
    ppes: Array.from(ppes),
  };
}

export function SafetyDocsSection({
  userId,
  defaultName = '',
  defaultEmail = '',
  compact = false,
  onSubmitted,
}: SafetyDocsSectionProps) {
  const [activeTool, setActiveTool] = useState<'apr' | 'pgr'>('apr');
  const workspaceRef = useRef<HTMLDivElement>(null);

  // APR Form State
  const [aprName, setAprName] = useState(defaultName);
  const [aprEmail, setAprEmail] = useState(defaultEmail);
  const [aprPhone, setAprPhone] = useState('');
  const [aprCompany, setAprCompany] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [workAtHeight, setWorkAtHeight] = useState(false);
  const [equipmentList, setEquipmentList] = useState('');
  const [workersInvolved, setWorkersInvolved] = useState('');
  const [aprBusy, setAprBusy] = useState(false);
  const [generatedApr, setGeneratedApr] = useState<{
    record: Omit<SafetyDocRequest, 'createdAt'>;
    analysis: AprAnalysis;
  } | null>(null);

  // PGR Form State
  const [pgrName, setPgrName] = useState(defaultName);
  const [pgrEmail, setPgrEmail] = useState(defaultEmail);
  const [pgrPhone, setPgrPhone] = useState('');
  const [pgrCompany, setPgrCompany] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnpjCardUrl, setCnpjCardUrl] = useState('');
  const [cnpjFileName, setCnpjFileName] = useState('');
  const [cnpjIsImage, setCnpjIsImage] = useState(false);
  const [uploadingCnpj, setUploadingCnpj] = useState(false);
  const [cnpjUploadProgress, setCnpjUploadProgress] = useState(0);
  const [employeeCount, setEmployeeCount] = useState('15');
  const [risksDescription, setRisksDescription] = useState('');
  const [pgrBusy, setPgrBusy] = useState(false);
  const [submittedPgr, setSubmittedPgr] = useState<Omit<SafetyDocRequest, 'createdAt'> | null>(null);

  const liveAprPreview = useMemo(
    () => analyzeAprInputs(serviceDescription, equipmentList, workAtHeight),
    [serviceDescription, equipmentList, workAtHeight]
  );

  function selectTool(tool: 'apr' | 'pgr') {
    setActiveTool(tool);
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  async function handleGenerateApr(e: React.FormEvent) {
    e.preventDefault();
    if (!aprName.trim() || !aprEmail.trim() || !serviceDescription.trim() || !equipmentList.trim() || !workersInvolved.trim()) {
      toast.error('Preencha todos os campos essenciais para gerar sua APR.');
      return;
    }

    setAprBusy(true);
    try {
      const analysis = analyzeAprInputs(serviceDescription, equipmentList, workAtHeight);
      const docId = `apr_${Date.now()}`;

      const pdfRes = await fetch('/api/safety-docs/generate-apr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: docId,
          requesterName: aprName.trim(),
          companyName: aprCompany.trim(),
          serviceDescription: serviceDescription.trim(),
          workAtHeight,
          equipmentList: equipmentList.trim(),
          workersInvolved: workersInvolved.trim(),
          identifiedRisks: analysis.risks,
          preventiveMeasures: analysis.controls,
          requiredPpes: analysis.ppes,
          applicableNrs: analysis.applicableNrs,
        }),
      });
      const pdfData = await pdfRes.json();
      if (!pdfRes.ok) {
        throw new Error(pdfData.error || 'Não foi possível gerar o PDF da APR.');
      }

      const record: Omit<SafetyDocRequest, 'createdAt'> = {
        id: docId,
        ...(userId ? { userId } : {}),
        docType: 'apr',
        requesterName: aprName.trim().slice(0, 120),
        requesterEmail: aprEmail.trim().slice(0, 160),
        ...(aprPhone.trim() ? { requesterPhone: aprPhone.trim().slice(0, 40) } : {}),
        ...(aprCompany.trim() ? { companyName: aprCompany.trim().slice(0, 160) } : {}),
        serviceDescription: serviceDescription.trim().slice(0, 2000),
        workAtHeight,
        equipmentList: equipmentList.trim().slice(0, 1000),
        workersInvolved: workersInvolved.trim().slice(0, 1000),
        aprPdfUrl: pdfData.pdfUrl,
        status: 'generated',
      };

      await submitSafetyDocRequest(record);
      setGeneratedApr({ record, analysis });
      onSubmitted?.(record);
      toast.success('APR gerada e salva com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar APR.');
    } finally {
      setAprBusy(false);
    }
  }

  async function handleCnpjUpload(file: File) {
    setUploadingCnpj(true);
    setCnpjUploadProgress(0);
    try {
      const res = await uploadFileToVercelBlob(file, 'safety-docs', setCnpjUploadProgress);
      setCnpjCardUrl(res.url);
      setCnpjFileName(file.name);
      setCnpjIsImage(file.type.startsWith('image/'));
      toast.success(
        `Cartão CNPJ salvo no ${
          res.storageProvider === 'vercel-blob' ? 'Vercel Blob Storage' : 'Preview Local'
        }.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar Cartão CNPJ.');
    } finally {
      setUploadingCnpj(false);
      setCnpjUploadProgress(0);
    }
  }

  async function handleRequestPgr(e: React.FormEvent) {
    e.preventDefault();
    const countNum = Number(employeeCount);
    if (!pgrName.trim() || !pgrEmail.trim() || !pgrCompany.trim() || !cnpj.trim() || !risksDescription.trim() || !countNum || countNum < 1) {
      toast.error('Preencha Razão Social, CNPJ, quantidade de colaboradores e descrição dos riscos.');
      return;
    }

    setPgrBusy(true);
    try {
      const docId = `pgr_${Date.now()}`;
      const record: Omit<SafetyDocRequest, 'createdAt'> = {
        id: docId,
        ...(userId ? { userId } : {}),
        docType: 'pgr',
        requesterName: pgrName.trim().slice(0, 120),
        requesterEmail: pgrEmail.trim().slice(0, 160),
        ...(pgrPhone.trim() ? { requesterPhone: pgrPhone.trim().slice(0, 40) } : {}),
        companyName: pgrCompany.trim().slice(0, 160),
        cnpj: cnpj.trim().slice(0, 30),
        ...(cnpjCardUrl ? { cnpjCardUrl } : {}),
        employeeCount: Math.min(100000, Math.max(1, Math.round(countNum))),
        risksDescription: risksDescription.trim().slice(0, 3000),
        status: 'pending_review',
      };

      await submitSafetyDocRequest(record);
      setSubmittedPgr(record);
      onSubmitted?.(record);
      toast.success('Solicitação de PGR registrada! Nossa equipe técnica dará andamento.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar solicitação de PGR.');
    } finally {
      setPgrBusy(false);
    }
  }

  return (
    <section
      id="documentacao"
      className={compact ? 'space-y-8' : 'py-18 lg:py-24 bg-[#F7F9FC] border-y border-slate-200'}
    >
      <div className={compact ? 'space-y-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12'}>
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4 text-[#0A2540]" />
            <span>APR e PGR Online · Documentação SST</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight leading-tight">
            Serviços de Documentação Técnica
            <span className="block text-[#0F2C59] mt-1">APR e PGR com suporte especializado</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Documentação de segurança do trabalho gerada de forma prática, segura e alinhada às Normas Regulamentadoras.
          </p>
        </div>

        {/* Two Distinct Contrast Cards: APR vs PGR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: APR */}
          <article className="bg-white border border-slate-200/90 hover:border-[#0A2540]/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_12px_34px_-12px_rgba(10,37,64,0.09)] hover:shadow-[0_24px_48px_-16px_rgba(10,37,64,0.16)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F5C518] text-[#0A2540] text-xs font-mono font-extrabold uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5" />
                  Geração Automática · Rápida e Prática
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500">APR ONLINE</span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#0A2540]">
                  1. APR – Análise Preliminar de Risco
                </h3>
                <p className="text-xs font-mono font-semibold text-[#0F2C59] mt-1 uppercase tracking-wide">
                  Automática / Semi-automática · Emissão em PDF imediata
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Estruture os riscos operacionais, medidas de controle, NRs aplicáveis e EPIs obrigatórios antes de liberar a equipe para a frente de serviço.
              </p>

              {/* Visual Quote Highlight */}
              <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                <ClipboardCheck className="w-5 h-5 text-[#0F2C59] shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-[#0A2540] leading-snug">
                  “Basta descrever o serviço e os dados essenciais. Nós cuidamos do resto.”
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Você informa apenas 4 dados essenciais:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Descrição do serviço que será executado</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Se haverá trabalho em altura (NR-35)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Quais equipamentos e ferramentas serão utilizados</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Nome dos colaboradores envolvidos na atividade</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Gera documento estruturado pronto para imprimir e assinar.
              </span>
              <button
                type="button"
                onClick={() => selectTool('apr')}
                className="btn-sheen inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-[#0A2540] hover:bg-[#0F2C59] hover:-translate-y-0.5 text-white text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Solicitar APR
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          {/* Card 2: PGR */}
          <article className="bg-navy-grid text-white border border-white/15 hover:border-[#F5C518]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_18px_46px_-14px_rgba(10,37,64,0.42)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/15 text-[#F5C518] text-xs font-mono font-extrabold uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Personalizado · Conforme o perfil da empresa
                </div>
                <span className="text-xs font-mono font-semibold text-slate-300">NR-01 / GRO</span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  2. PGR – Programa de Gerenciamento de Riscos
                </h3>
                <p className="text-xs font-mono font-semibold text-[#F5C518] mt-1 uppercase tracking-wide">
                  Documento completo, técnico e sob medida
                </p>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">
                O PGR é um programa abrangente exigido pela NR-01. Elaboramos o Inventário de Riscos e o Plano de Ação de forma 100% personalizada com base no perfil real de risco da sua empresa, garantindo plena conformidade legal.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-mono font-bold text-[#F5C518] uppercase tracking-wider">
                  Dados oficiais necessários da empresa:
                </p>
                <ul className="space-y-2.5 text-sm text-slate-100">
                  <li className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                    <span>
                      <strong>Cartão CNPJ:</strong> identificação completa da razão social, CNAE e dados cadastrais
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                    <span>
                      <strong>Descrição dos riscos:</strong> mapeamento das atividades realizadas e agentes envolvidos
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                    <span>
                      <strong>Quantidade de colaboradores:</strong> dimensionamento por setor e função
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-300 font-medium">
                Elaborado conforme o perfil real da operação e normas vigentes.
              </span>
              <button
                type="button"
                onClick={() => selectTool('pgr')}
                className="btn-sheen inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 bg-[#F5C518] hover:bg-[#E0B20F] hover:-translate-y-0.5 text-[#0A2540] text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_8px_20px_-6px_rgba(245,197,24,0.55)]"
              >
                Solicitar PGR
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>

        {/* Interactive Dual-Mode Submission / Generation Workspace */}
        <div
          ref={workspaceRef}
          id="documentacao-form"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_-8px_rgba(10,37,64,0.08)]"
        >
          {/* Segmented Tab Header */}
          <div className="bg-[#0A2540] px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-[#F5C518] uppercase tracking-wider">
                Portal de Solicitação Técnica
              </span>
              <p className="text-sm text-slate-200">
                Selecione o documento desejado para preenchimento rápido.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Tipo de documentação técnica"
              className="inline-flex p-1 bg-white/10 border border-white/15 rounded-xl gap-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTool === 'apr'}
                onClick={() => setActiveTool('apr')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTool === 'apr'
                    ? 'bg-[#F5C518] text-[#0A2540] shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Gerar APR Automática
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTool === 'pgr'}
                onClick={() => setActiveTool('pgr')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTool === 'pgr'
                    ? 'bg-[#F5C518] text-[#0A2540] shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Solicitar PGR Personalizado
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTool === 'apr' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleGenerateApr} className="lg:col-span-7 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-[#0A2540]">
                      Gerador Automático de APR (Análise Preliminar de Risco)
                    </h3>
                    <p className="text-sm text-slate-600">
                      Descreva a atividade e os dados essenciais abaixo. O sistema identifica os riscos, medidas preventivas e gera o PDF pronto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Responsável pela solicitação *
                      </label>
                      <input
                        type="text"
                        required
                        value={aprName}
                        onChange={(e) => setAprName(e.target.value)}
                        placeholder="Ex: João Carlos (Encarregado)"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail para envio *
                      </label>
                      <input
                        type="email"
                        required
                        value={aprEmail}
                        onChange={(e) => setAprEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Empresa / Obra (opcional)
                      </label>
                      <input
                        type="text"
                        value={aprCompany}
                        onChange={(e) => setAprCompany(e.target.value)}
                        placeholder="Nome da empresa ou frente de serviço"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Telefone (opcional)
                      </label>
                      <input
                        type="tel"
                        value={aprPhone}
                        onChange={(e) => setAprPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. Descrição do serviço que será executado *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      placeholder="Ex: Instalação e manutenção de infraestrutura elétrica em galpão industrial a 4 metros de altura com uso de plataforma ou escada..."
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      2. Haverá trabalho em altura (acima de 2 metros)? *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setWorkAtHeight(true)}
                        className={`p-3 rounded-lg border text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          workAtHeight
                            ? 'bg-[#0A2540] border-[#0A2540] text-white'
                            : 'bg-[#F7F9FC] border-slate-300 text-slate-700 hover:border-[#0A2540]'
                        }`}
                      >
                        <span>Sim, haverá trabalho em altura (NR-35)</span>
                        {workAtHeight && <CheckCircle2 className="w-4 h-4 text-[#F5C518] shrink-0" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkAtHeight(false)}
                        className={`p-3 rounded-lg border text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          !workAtHeight
                            ? 'bg-[#0A2540] border-[#0A2540] text-white'
                            : 'bg-[#F7F9FC] border-slate-300 text-slate-700 hover:border-[#0A2540]'
                        }`}
                      >
                        <span>Não, atividade ao nível do solo</span>
                        {!workAtHeight && <CheckCircle2 className="w-4 h-4 text-[#F5C518] shrink-0" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      3. Quais equipamentos e ferramentas serão utilizados? *
                    </label>
                    <input
                      type="text"
                      required
                      value={equipmentList}
                      onChange={(e) => setEquipmentList(e.target.value)}
                      placeholder="Ex: Furadeira, escada extensível, multímetro isolado, esmerilhadeira, extensão elétrica"
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      4. Nome dos colaboradores envolvidos *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={workersInvolved}
                      onChange={(e) => setWorkersInvolved(e.target.value)}
                      placeholder="Ex: Marcos Antônio Silva, Pedro Henrique Souza, Lucas Ferreira"
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aprBusy}
                    className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {aprBusy ? 'Gerando APR em PDF...' : 'Gerar APR Automática + Baixar PDF'}
                  </button>
                </form>

                {/* Live Intelligence / Result Preview */}
                <div className="lg:col-span-5 bg-[#F7F9FC] border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
                  {generatedApr ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-700 uppercase">
                            APR Gerada com Sucesso
                          </span>
                          <h4 className="font-display font-bold text-lg text-[#0A2540]">
                            Protocolo {generatedApr.record.id}
                          </h4>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase">
                          NRs identificadas automaticamente
                        </p>
                        <p className="text-sm font-mono font-bold text-[#0A2540]">
                          {generatedApr.analysis.applicableNrs.join(' · ')}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase">
                          Riscos mapeados
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {generatedApr.analysis.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase">
                          EPIs recomendados (NR-06)
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {generatedApr.analysis.ppes.map((epi, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <HardHat className="w-3.5 h-3.5 text-[#0F2C59] shrink-0 mt-0.5" />
                              <span>{epi}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {generatedApr.record.aprPdfUrl && (
                        <a
                          href={generatedApr.record.aprPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full min-h-[44px] py-3 px-4 bg-[#0A2540] hover:bg-[#0F2C59] text-white text-sm font-bold rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4 text-[#F5C518]" />
                          Baixar APR em PDF Pronto
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[#0A2540]">
                        <Wrench className="w-4 h-4 text-[#0F2C59]" />
                        <h4 className="font-display font-bold text-base">
                          Prévia da Análise Automática
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Conforme você preenche a descrição e os equipamentos, nosso motor de análise identifica automaticamente as NRs e controles preventivos para incluir no documento.
                      </p>

                      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                          Normas detectadas no serviço
                        </span>
                        <p className="font-mono text-sm font-extrabold text-[#0A2540]">
                          {liveAprPreview.applicableNrs.join(' · ')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                          Medidas e EPIs sugeridos na APR
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {liveAprPreview.controls.slice(0, 3).map((ctrl, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{ctrl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleRequestPgr} className="lg:col-span-7 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-[#0A2540]">
                      Solicitação de PGR Personalizado (NR-01)
                    </h3>
                    <p className="text-sm text-slate-600">
                      Informe os dados cadastrais da empresa (Cartão CNPJ), quantidade de colaboradores e os riscos envolvidos nas atividades para elaboração sob medida.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Responsável pela empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={pgrName}
                        onChange={(e) => setPgrName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        value={pgrEmail}
                        onChange={(e) => setPgrEmail(e.target.value)}
                        placeholder="contato@empresa.com.br"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Razão Social / Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={pgrCompany}
                        onChange={(e) => setPgrCompany(e.target.value)}
                        placeholder="Razão Social conforme Cartão CNPJ"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Telefone
                      </label>
                      <input
                        type="tel"
                        value={pgrPhone}
                        onChange={(e) => setPgrPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CNPJ da Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantidade de colaboradores *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100000}
                        required
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                      />
                    </div>
                  </div>

                  {/* Optional Cartão CNPJ upload via Vercel Blob */}
                  <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#0A2540]">
                          Anexar Cartão CNPJ (PDF ou Imagem via Vercel Blob — opcional)
                        </p>
                        <p className="text-xs text-slate-500">
                          Upload direto para armazenamento seguro Vercel Blob. Agiliza a conferência oficial de razão social, endereço e CNAE.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#0F2C59] hover:bg-slate-50 text-[#0A2540] text-xs font-bold rounded-lg cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingCnpj
                            ? `Enviando (${cnpjUploadProgress}%)...`
                            : cnpjCardUrl
                              ? 'Trocar arquivo'
                              : 'Enviar Cartão CNPJ'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                          disabled={uploadingCnpj}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleCnpjUpload(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                    {cnpjCardUrl && (
                      <div className="bg-white border border-emerald-200 rounded-lg p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-mono text-emerald-700 font-semibold truncate max-w-sm">
                            Anexado no Storage: {cnpjFileName || 'Cartão CNPJ'}
                          </span>
                          <div className="flex items-center gap-3 text-xs">
                            <a
                              href={cnpjCardUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-[#0F2C59] underline"
                            >
                              Visualizar
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setCnpjCardUrl('');
                                setCnpjFileName('');
                                setCnpjIsImage(false);
                              }}
                              className="font-semibold text-red-600 cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                        {cnpjIsImage && (
                          <img
                            src={cnpjCardUrl}
                            alt="Prévia do Cartão CNPJ anexado"
                            className="max-h-36 rounded-md border border-slate-200 object-contain"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descrição dos riscos e atividades realizadas na empresa *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={risksDescription}
                      onChange={(e) => setRisksDescription(e.target.value)}
                      placeholder="Descreva os principais setores, funções, máquinas operadas, agentes químicos/físicos, serviços em altura ou eletricidade realizados pela empresa..."
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={pgrBusy}
                    className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] text-sm font-extrabold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {pgrBusy ? 'Registrando solicitação...' : 'Solicitar PGR Personalizado'}
                  </button>
                </form>

                {/* PGR Summary / Confirmation Card */}
                <div className="lg:col-span-5 bg-[#0A2540] text-white rounded-xl p-6 space-y-5">
                  {submittedPgr ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/15">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#F5C518] uppercase">
                            Solicitação Registrada
                          </span>
                          <h4 className="font-display font-bold text-lg text-white">
                            Protocolo {submittedPgr.id}
                          </h4>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-[#F5C518] shrink-0" />
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        Recebemos os dados da empresa <strong>{submittedPgr.companyName}</strong> ({submittedPgr.cnpj}) para {submittedPgr.employeeCount} colaboradores.
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 text-xs text-slate-200 space-y-1.5">
                        <p className="font-bold text-[#F5C518]">Próximos passos:</p>
                        <p>1. Nossa engenharia valida o CNAE e grau de risco no Cartão CNPJ.</p>
                        <p>2. Estruturamos o Inventário de Riscos e Plano de Ação conforme NR-01.</p>
                        <p>3. Enviamos a proposta/documento final para {submittedPgr.requesterEmail}.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmittedPgr(null)}
                        className="text-xs font-bold text-[#F5C518] underline cursor-pointer"
                      >
                        Enviar solicitação para outro CNPJ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-display text-lg font-bold text-white">
                        Por que o PGR exige dados completos da empresa?
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Diferente de uma APR pontual de campo, o PGR (Programa de Gerenciamento de Riscos – NR-01) é um documento legal auditável pelo Ministério do Trabalho e vinculado ao envio de eventos de SST no eSocial.
                      </p>
                      <ul className="space-y-2.5 text-xs text-slate-200">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                          <span>Enquadramento exato do CNAE e Grau de Risco oficial (NR-04).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                          <span>Inventário de Riscos por GHE (Grupo Homogêneo de Exposição).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#F5C518] shrink-0 mt-0.5" />
                          <span>Plano de Ação com cronograma, responsáveis e conformidade legal.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Short Trust Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F2C59] shrink-0" />
            <span>
              Documentação alinhada à NR-01 (GRO/PGR) e Normas Regulamentadoras vigentes para obras, indústrias e prestadores de serviço.
            </span>
          </div>
          <span className="font-mono font-semibold text-[#0A2540] shrink-0">
            Suporte técnico 4k Treinamentos
          </span>
        </div>
      </div>
    </section>
  );
}
