export interface NrCertificateSpec {
  nrKey: string;
  nrLabel: string;
  officialTitle: string;
  bannerSubtitle?: string;
  audienceClause?: string;
  modalitySummary?: string;
  trainingTypeLabel?: string;
  accentHex: string;
  tintHex: string;
  accentRgb: [number, number, number];
  tintRgb: [number, number, number];
  syllabus: string[];
}

export const NR_CERTIFICATE_SPECS: Record<string, NrCertificateSpec> = {
  'nr-06': {
    nrKey: 'nr-06',
    nrLabel: 'NR-06',
    officialTitle: 'EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL – EPI',
    accentHex: '#1E5B45',
    tintHex: '#EDF5F1',
    accentRgb: [0.118, 0.357, 0.271],
    tintRgb: [0.929, 0.961, 0.945],
    syllabus: [
      'O que são Normas Regulamentadoras',
      'NR-06 e regulamentações vigentes',
      'Responsabilidades, direitos e obrigações',
      'Responsabilidade do empregador e do trabalhador',
      'Certificado de Aprovação (CA) e validade do EPI',
      'Proteção da cabeça, olhos e face',
      'Proteção auditiva e proteção respiratória',
      'Proteção do tronco, membros superiores e inferiores',
      'Proteção do corpo inteiro e proteção contra quedas',
      'Uso correto, higienização, guarda e conservação dos EPIs',
    ],
  },
  'nr-10': {
    nrKey: 'nr-10',
    nrLabel: 'NR-10',
    officialTitle: 'SEGURANÇA EM INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE',
    accentHex: '#1D4ED8',
    tintHex: '#EFF4FF',
    accentRgb: [0.114, 0.306, 0.847],
    tintRgb: [0.937, 0.957, 1.0],
    syllabus: [
      'Introdução à segurança com eletricidade (Anexo III – 40h)',
      'Riscos em instalações elétricas: choque elétrico e arco voltaico',
      'Técnicas de Análise de Risco e medidas de controle',
      'Aterramento elétrico, equipotencialização e dispositivo DR',
      'Desenergização (6 passos obrigatórios) e bloqueio LOTO',
      'Zona de Risco, Zona Controlada e Zona Livre (Anexo II)',
      'Equipamentos de Proteção Coletiva (EPC) e Individual (ATPV / luvas)',
      'Rotinas de trabalho, documentação e sinalização de segurança',
      'Proteção e combate a incêndios em instalações elétricas (Classe C)',
      'Noções de primeiros socorros e reanimação cardiopulmonar (RCP)',
    ],
  },
  'nr-11': {
    nrKey: 'nr-11',
    nrLabel: 'NR-11',
    officialTitle: 'TRANSPORTE, MOVIMENTAÇÃO, ARMAZENAGEM E MANUSEIO DE MATERIAIS',
    accentHex: '#0F5E63',
    tintHex: '#EDF7F7',
    accentRgb: [0.059, 0.369, 0.388],
    tintRgb: [0.929, 0.969, 0.969],
    syllabus: [
      'Normas técnicas e disposições gerais da NR-11',
      'Segurança na operação de empilhadeiras, paleteiras e pontes rolantes',
      'Triângulo de estabilidade, centro de gravidade e diagrama de carga',
      'Inspeção diária (checklist pré-operacional) de máquinas e acessórios',
      'Cintas, cabos de aço, correntes, manilhas e ganchos de içamento',
      'Sinalização de segurança, isolamento de área e circulação segura',
      'Armazenamento seguro, empilhamento e limites de carga no piso',
      'Transporte manual de cargas e prevenção de riscos ergonômicos',
      'Responsabilidades do operador habilitado e manutenção preventiva',
    ],
  },
  'nr-12': {
    nrKey: 'nr-12',
    nrLabel: 'NR-12',
    officialTitle: 'SEGURANÇA NO TRABALHO EM MÁQUINAS E EQUIPAMENTOS',
    accentHex: '#1E4D7B',
    tintHex: '#EEF4FA',
    accentRgb: [0.118, 0.302, 0.482],
    tintRgb: [0.933, 0.957, 0.98],
    syllabus: [
      'Descrição e identificação dos riscos associados a cada máquina e equipamento e das proteções específicas contra cada risco',
      'Funcionamento das proteções: como e por quê devem ser utilizadas',
      'Condições e responsáveis pela remoção de proteções, quando aplicável',
      'Procedimentos diante de proteção danificada ou que tenha perdido sua função',
      'Princípios de segurança na utilização de máquinas e equipamentos',
      'Segurança para riscos mecânicos, elétricos e outros relevantes',
      'Método de trabalho seguro e dispositivos de parada de emergência',
      'Permissão de trabalho e análise prévia da operação',
      'Sistema de bloqueio e etiquetagem (LOTO) durante inspeção, limpeza, lubrificação e manutenção',
      'Ferramentas manuais e portáteis: parafusadeira, furadeira, lixadeira, esmerilhadeira e serra circular',
    ],
  },
  'nr-18': {
    nrKey: 'nr-18',
    nrLabel: 'NR-18',
    officialTitle: 'SEGURANÇA E SAÚDE NO TRABALHO NA INDÚSTRIA DA CONSTRUÇÃO',
    accentHex: '#996B1F',
    tintHex: '#FAF5EB',
    accentRgb: [0.6, 0.42, 0.122],
    tintRgb: [0.98, 0.961, 0.922],
    syllabus: [
      'Apresentação, conceitos gerais da NR-18 e PGR na construção civil',
      'Fontes de risco: químicos, físicos, biológicos, ergonômicos e de acidentes',
      'Definição e prevenção de acidentes de trabalho',
      'CIPA e medidas de proteção coletiva (guarda-corpos e plataformas)',
      'Movimentação e transporte de cargas e materiais com equipamentos',
      'Sinalização de obra e isolamento de áreas de risco',
      'Inspeção em máquinas, betoneiras e equipamentos de canteiro',
      'Cuidados com instalações elétricas provisórias na obra',
      'Manuseio seguro de ferramentas portáteis e organização da obra',
      'Equipamentos de Proteção Individual (EPIs) e noções de trabalho em altura',
    ],
  },
  'nr-20': {
    nrKey: 'nr-20',
    nrLabel: 'NR-20',
    officialTitle: 'SEGURANÇA E SAÚDE NO TRABALHO COM INFLAMÁVEIS E COMBUSTÍVEIS',
    accentHex: '#9A3412',
    tintHex: '#FDF2ED',
    accentRgb: [0.604, 0.204, 0.071],
    tintRgb: [0.992, 0.949, 0.929],
    syllabus: [
      'Inflamáveis: características, propriedades, perigos e riscos',
      'Ponto de fulgor, limites de inflamabilidade (LIE/LSE) e classes',
      'Controles coletivos e individuais para trabalhos com inflamáveis',
      'Fontes de ignição, eletricidade estática e aterramento de transferência',
      'Proteção contra incêndio com inflamáveis e sistemas preventivos',
      'Permissão de Trabalho (PT) e controle em áreas classificadas',
      'Armazenamento, manuseio, transbordo e sinalização de recipientes',
      'Procedimentos básicos em situações de emergência e abandono de área',
    ],
  },
  'nr-23': {
    nrKey: 'nr-23',
    nrLabel: 'NR-23',
    officialTitle: 'PROTEÇÃO CONTRA INCÊNDIOS E BRIGADA BÁSICA',
    accentHex: '#991B1B',
    tintHex: '#FDF1F1',
    accentRgb: [0.6, 0.106, 0.106],
    tintRgb: [0.992, 0.945, 0.945],
    syllabus: [
      'Teoria do fogo: tetraedro do fogo e propagação do calor',
      'Classes de incêndio (A, B, C, D e K) e métodos de extinção',
      'Agentes extintores: água, PQS, CO2, espuma mecânica e indicações',
      'Sistemas preventivos: hidrantes, alarmes e detecção',
      'Saídas de emergência, sinalização fotoluminescente e rotas de fuga',
      'Procedimentos de abandono de área e ponto de encontro',
      'Prevenção de princípios de incêndio e inspeção periódica de extintores',
      'Atuação segura em emergências e acionamento do Corpo de Bombeiros',
    ],
  },
  'nr-33': {
    nrKey: 'nr-33',
    nrLabel: 'NR-33',
    officialTitle: 'SEGURANÇA E SAÚDE NOS TRABALHOS EM ESPAÇOS CONFINADOS',
    audienceClause: 'para trabalhadores autorizados e vigia em espaço confinado',
    accentHex: '#5B4B7A',
    tintHex: '#F3F1F8',
    accentRgb: [0.357, 0.294, 0.478],
    tintRgb: [0.953, 0.945, 0.973],
    syllabus: [
      'Definição de espaço confinado conforme NR-33',
      'Identificação, cadastro e reconhecimento de espaços confinados',
      'Riscos em espaços confinados: físicos, químicos, biológicos, mecânicos e ergonômicos',
      'Avaliação, controle de riscos atmosféricos e medidas de prevenção',
      'Procedimentos e Permissão de Entrada e Trabalho (PET)',
      'Equipamentos de Proteção Coletiva (EPC) e Proteção Individual (EPI)',
      'Monitoramento contínuo da atmosfera (O2, LEL, CO, H2S)',
      'Ventilação, exaustão e controle de gases',
      'Comunicação e responsabilidades entre trabalhador autorizado, vigia e supervisor',
      'Noções de primeiros socorros e procedimentos de emergência e resgate',
    ],
  },
  'nr-35': {
    nrKey: 'nr-35',
    nrLabel: 'NR-35',
    officialTitle: 'SEGURANÇA E SAÚDE NO TRABALHO EM ALTURA',
    accentHex: '#0F2C59',
    tintHex: '#EEF3FA',
    accentRgb: [0.059, 0.173, 0.349],
    tintRgb: [0.933, 0.953, 0.98],
    syllabus: [
      'Normas e regulamentos aplicáveis ao trabalho em altura (NR-35 e NR-01)',
      'Análise de Risco (AR), Permissão de Trabalho (PT) e condições impeditivas',
      'Riscos potenciais inerentes ao trabalho em altura e medidas de prevenção e controle',
      'Sistemas, equipamentos e procedimentos de proteção coletiva',
      'Equipamentos de Proteção Individual (EPI) para altura: seleção, inspeção, conservação e limitação de uso',
      'Cinturão tipo paraquedista, talabartes, trava-quedas e linhas de vida',
      'Sistemas de ancoragem, Fator de Queda e cálculo da Zona Livre de Queda (ZLQ)',
      'Acidentes típicos e prevenção da síndrome da suspensão inerte',
      'Condutas em situações de emergência, noções de resgate e primeiros socorros',
    ],
  },
};

export function getNrCertificateSpec(
  nrCodeOrId?: string,
  fallbackTitle?: string,
  workloadHours?: number
): NrCertificateSpec {
  const raw = (nrCodeOrId || '').toLowerCase();
  const titleLower = (fallbackTitle || '').toLowerCase();
  const match = raw.match(/nr[-\s]?(\d{2})/) || titleLower.match(/nr[-\s]?(\d{2})/);
  const key = match ? `nr-${match[1]}` : raw;

  const is40h =
    workloadHours === 40 ||
    /40\s*h/.test(raw) ||
    /40\s*h/.test(titleLower);

  const isReciclagem =
    !is40h &&
    (/reciclagem/.test(raw) ||
      /reciclagem/.test(titleLower) ||
      (key === 'nr-33' && workloadHours === 16) ||
      (key === 'nr-35' && workloadHours === 8) ||
      key === 'nr-33' ||
      key === 'nr-35');

  const base = NR_CERTIFICATE_SPECS[key];
  if (base) {
    if (key === 'nr-33') {
      const trainingTypeLabel = is40h ? 'Formação (40h)' : 'Reciclagem (16h)';
      return {
        ...base,
        trainingTypeLabel,
        bannerSubtitle: is40h
          ? 'NR-33 | ESPAÇOS CONFINADOS – TRABALHADORES AUTORIZADOS E VIGIA (40H)'
          : 'NR-33 | ESPAÇOS CONFINADOS – RECICLAGEM AUTORIZADOS E VIGIA (16H)',
        audienceClause: 'para trabalhadores autorizados e vigia em espaço confinado',
        modalitySummary: is40h
          ? 'Para trabalhadores autorizados e vigia em espaço confinado (Formação 40h) · EAD (NR-01)'
          : 'Para trabalhadores autorizados e vigia em espaço confinado (Reciclagem 16h) · EAD (NR-01)',
      };
    }

    if (key === 'nr-35') {
      const trainingTypeLabel = is40h
        ? 'Formação Completa (40h)'
        : isReciclagem
          ? 'Reciclagem (8h)'
          : 'Capacitação (8h)';
      return {
        ...base,
        trainingTypeLabel,
        bannerSubtitle: is40h
          ? 'NR-35 | TRABALHO EM ALTURA – FORMAÇÃO COMPLETA (40H)'
          : 'NR-35 | TRABALHO EM ALTURA – RECICLAGEM (8H)',
        modalitySummary: is40h
          ? 'Formação Completa em Trabalho em Altura (40h) · EAD (NR-01)'
          : 'Reciclagem em Trabalho em Altura (8h) · EAD (NR-01)',
      };
    }

    return base;
  }

  return {
    nrKey: key || 'nr',
    nrLabel: (nrCodeOrId || 'NR').toUpperCase(),
    officialTitle: (fallbackTitle || 'TREINAMENTO EM SEGURANÇA DO TRABALHO').toUpperCase(),
    accentHex: '#0F2C59',
    tintHex: '#EEF3FA',
    accentRgb: [0.059, 0.173, 0.349],
    tintRgb: [0.933, 0.953, 0.98],
    syllabus: [
      'Normas Regulamentadoras e obrigações legais (NR-01)',
      'Identificação e avaliação de riscos ocupacionais na atividade',
      'Medidas preventivas, proteção coletiva (EPC) e EPIs obrigatórios',
      'Procedimentos seguros de operação e resposta a emergências',
    ],
  };
}
