import type {
  Course,
  CourseModule,
  ExamQuestion,
  FunnelOffer,
  PublicSettings,
  Testimonial,
} from '../types';

import officialLogoImg from '../assets/images/logo_4k_treinamentos.png';
import heroBrandedImg from '../assets/images/hero_4k_branded_1794853557660.jpg';
import instructorBrandedImg from '../assets/images/instructor_4k_branded_1794853558864.jpg';
import corporateBrandedImg from '../assets/images/corporate_4k_branded_1794853562586.jpg';
import nr06CoverImg from '../assets/images/nr06_epi_uniform_4k_1794994491263.jpg';
import nr10CoverImg from '../assets/images/nr10_eletricidade_uniform_4k_1794994493510.jpg';
import nr11CoverImg from '../assets/images/nr11_movimentacao_uniform_4k_1794994492226.jpg';
import nr12CoverImg from '../assets/images/nr12_maquinas_fixed_1794994556546.jpg';
import nr18CoverImg from '../assets/images/nr18_construcao_uniform_4k_1794994493738.jpg';
import nr20CoverImg from '../assets/images/nr20_inflamaveis_fixed_1794994548105.jpg';
import nr23CoverImg from '../assets/images/nr23_incendio_uniform_4k_1794994496198.jpg';
import nr33Formacao40hCoverImg from '../assets/images/nr33_formacao_40h_fixed_1794994548028.jpg';
import nr33CoverImg from '../assets/images/nr33_reciclagem_16h_uniform_4k_1794994497408.jpg';
import nr35Formacao40hCoverImg from '../assets/images/nr35_formacao_40h_uniform_4k_1794994497663.jpg';
import nr35CoverImg from '../assets/images/nr35_reciclagem_8h_uniform_4k_1794994498812.jpg';

export const OFFICIAL_LOGO_URL = officialLogoImg;
export const HERO_IMAGE_URL = heroBrandedImg;
export const INSTRUCTOR_PORTRAIT_URL = instructorBrandedImg;
export const CORPORATE_TEAM_URL = corporateBrandedImg;
export const NR06_COVER_URL = nr06CoverImg;
export const NR10_COVER_URL = nr10CoverImg;
export const NR11_COVER_URL = nr11CoverImg;
export const NR12_COVER_URL = nr12CoverImg;
export const NR18_COVER_URL = nr18CoverImg;
export const NR20_COVER_URL = nr20CoverImg;
export const NR23_COVER_URL = nr23CoverImg;
export const NR33_40H_COVER_URL = nr33Formacao40hCoverImg;
export const NR33_COVER_URL = nr33CoverImg;
export const NR35_40H_COVER_URL = nr35Formacao40hCoverImg;
export const NR35_COVER_URL = nr35CoverImg;

export const DEFAULT_PUBLIC_SETTINGS: Omit<PublicSettings, 'updatedAt'> = {
  companyName: '4k Treinamentos',
  cnpj: '48.912.340/0001-72',
  email: 'contato@4ktreinamentos.com.br',
  phone: '(11) 4002-8922',
  address: 'Av. Paulista, 1439 · Conj. 82 · Bela Vista, São Paulo - SP',
  heroTitle: 'Certificados de NR válidos em todo o Brasil',
  heroSubtitle:
    'Capacitação online em Segurança do Trabalho (NR-06, NR-10, NR-11, NR-12, NR-18, NR-20, NR-23, NR-33 e NR-35) com conteúdo técnico atualizado, prova formal e certificado assinado.',
  footerNote:
    '4k Treinamentos LTDA · Treinamentos em Normas Regulamentadoras conforme diretrizes da Portaria MTP nº 672/2021 e NR-01.',
  certificateTemplateHeader: 'CERTIFICADO DE CONCLUSÃO E APROVAÇÃO',
  certificateTemplateBody:
    'Certificamos que o(a) aluno(a) acima identificado(a) concluiu com aproveitamento satisfatório o treinamento teórico e a avaliação formal da Norma Regulamentadora especificada, estando apto(a) para fins de comprovação documental junto ao empregador e fiscalização.',
  defaultInstructorName: 'Eng. Carlos Eduardo Mendes',
  defaultInstructorRole: 'Engenheiro de Segurança do Trabalho',
  defaultInstructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
};

export interface SeedCourseBundle {
  course: Omit<Course, 'createdAt' | 'updatedAt'>;
  modules: Omit<CourseModule, 'updatedAt'>[];
  questions: ExamQuestion[];
}

export const SEED_COURSES: SeedCourseBundle[] = [
  {
    course: {
      id: 'nr-06',
      slug: 'nr-06',
      nrCode: 'NR-06',
      title: 'Equipamentos de Proteção Individual (EPI)',
      salesHeadline:
        'Comprove sua capacitação em NR-06 (EPIs) em poucas horas com certificado reconhecido em todo o país',
      salesSubheadline:
        'Entenda Certificado de Aprovação (CA), responsabilidades legais, seleção técnica por risco, conservação e higienização dos EPIs obrigatórios com emissão imediata de PDF.',
      promoTag: 'Mais acessível · Obrigatório em quase todas as integrações',
      originalPriceCents: 11900,
      priceCents: 6900,
      enrolledCount: 3190,
      ratingAverage: 4.9,
      ratingCount: 512,
      guaranteeDays: 7,
      shortDescription:
        'Seleção técnica, Certificado de Aprovação (CA), guarda, higienização e responsabilidades legais sobre o uso de EPIs.',
      fullDescription:
        'O curso de NR-06 orienta trabalhadores, encarregados e técnicos sobre a correta indicação, uso, conservação e substituição dos Equipamentos de Proteção Individual conforme atualização vigente da norma. Aborda validade do Certificado de Aprovação (CA), obrigações do empregador e do empregado, ficha de entrega eletrônica/física e proteção para cabeça, olhos, audição, vias respiratórias, tronco, mãos e pés.',
      workloadHours: 4,
      certificateValidityMonths: 24,
      targetAudience:
        'Todos os trabalhadores da indústria, construção civil, logística, elétrica, serviços gerais, almoxarifes e profissionais de SESMT/CIPA.',
      notForAudience: [
        'Quem não atua ou não pretende atuar em ambientes sujeitos a requisitos de Segurança e Saúde no Trabalho',
      ],
      includedBonuses: [
        'Guia rápido de consulta de Certificado de Aprovação (CA) ativo',
        'Modelo pronto de Ficha de Controle, Entrega e Substituição de EPI',
      ],
      learningOutcomes: [
        'Verificar a autenticidade e validade do Certificado de Aprovação (CA)',
        'Distinguir responsabilidades do empregador, do trabalhador e do fabricante',
        'Selecionar o EPI adequado para riscos físicos, químicos, biológicos e mecânicos',
        'Executar corretamente a higienização, guarda periódica e descarte de EPIs danificados',
      ],
      faq: [
        {
          question: 'A empresa pode cobrar do funcionário pelo EPI fornecido?',
          answer:
            'Não. A NR-06 determina que o empregador deve fornecer o EPI gratuitamente ao empregado, em perfeito estado de conservação e funcionamento.',
        },
        {
          question: 'O certificado de NR-06 tem validade para ficha de integração?',
          answer:
            'Sim. Inclui carga horária de 4h, conteúdo programático completo e código verificável em /validar.',
        },
      ],
      coverImageUrl: NR06_COVER_URL,
      bannerImageUrl: NR06_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 1,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-06-m1',
        courseId: 'nr-06',
        title: 'Módulo 1 · Conceitos, CA e Responsabilidades na NR-06',
        description: 'Base legal, Certificado de Aprovação (CA) e deveres de empregador e empregado.',
        order: 1,
        lessons: [
          {
            id: 'nr06-l1',
            title: 'Certificado de Aprovação (CA) e Obrigações Legais',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Considera-se Equipamento de Proteção Individual (EPI) todo dispositivo ou produto de uso individual utilizado pelo trabalhador, destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho.\n\nTodo EPI comercializado ou utilizado no Brasil deve possuir Certificado de Aprovação (CA) emitido pelo órgão nacional competente.\n\nCabe ao empregador:\n• Adquirir o EPI adequado ao risco de cada atividade.\n• Exigir seu uso e fornecer gratuitamente ao trabalhador.\n• Orientar e treinar o trabalhador sobre o uso adequado, guarda e conservação.\n• Substituir imediatamente quando danificado ou extraviado.\n• Registrar o fornecimento ao empregado (ficha de EPI física ou eletrônica).\n\nCabe ao empregado:\n• Usar o EPI apenas para a finalidade a que se destina.\n• Responsabilizar-se pela guarda e conservação.\n• Comunicar ao empregador qualquer alteração que o torne impróprio para uso.',
          },
        ],
      },
      {
        id: 'nr-06-m2',
        courseId: 'nr-06',
        title: 'Módulo 2 · Seleção Técnica por Risco e Conservação',
        description: 'Classificação de EPIs por região anatômica, higienização e vida útil.',
        order: 2,
        lessons: [
          {
            id: 'nr06-l2',
            title: 'Proteção por Região Anatômica, Guarda e Descarte',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'A escolha do EPI deve seguir a hierarquia de controles do PGR/NR-01: primeiro adotam-se medidas coletivas (EPC) e administrativas; quando inviáveis ou complementares, especifica-se o EPI:\n\n• Cabeça: capacete classe A (impactos) ou classe B (impactos e tensão elétrica até 20 kV) com jugular.\n• Olhos e Face: óculos de segurança incolor/fumê, ampla visão contra respingos químicos ou protetor facial.\n• Auditiva: protetores tipo plug de inserção ou concha, compatíveis com a atenuação (NRRsf) exigida.\n• Respiratória: respiradores PFF1, PFF2, PFF3 ou semifaciais com filtros químicos/combinados (PPR).\n• Mãos e Pés: luvas mecânicas, nitrílicas, térmicas ou isolantes (NR-10) e calçados com biqueira composite/aço e solado isolante.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr06-q1',
        courseId: 'nr-06',
        order: 1,
        prompt: 'O que garante que um EPI foi testado e autorizado para comercialização e uso no Brasil?',
        options: [
          'A cor do equipamento.',
          'O Certificado de Aprovação (CA) válido gravado no equipamento.',
          'Apenas o logotipo da empresa compradora.',
          'Um selo adesivo da transportadora.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr06-q2',
        courseId: 'nr-06',
        order: 2,
        prompt: 'De quem é a responsabilidade pelo fornecimento gratuito e substituição imediata de EPI danificado?',
        options: [
          'Do sindicato da categoria.',
          'Do próprio empregado, mediante desconto em folha.',
          'Do empregador.',
          'Da prefeitura municipal.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr06-q3',
        courseId: 'nr-06',
        order: 3,
        prompt: 'Qual é uma obrigação legal do empregado em relação ao EPI segundo a NR-06?',
        options: [
          'Comprar o próprio capacete e botina na admissão.',
          'Utilizá-lo apenas quando houver fiscalização na obra.',
          'Responsabilizar-se pela guarda e conservação e comunicar qualquer dano que o torne impróprio para uso.',
          'Alterar o formato do EPI para maior conforto térmico.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr06-q4',
        courseId: 'nr-06',
        order: 4,
        prompt: 'Qual classe de capacete de segurança oferece proteção adicional contra choques elétricos em alta tensão?',
        options: [
          'Capacete Classe B.',
          'Boné de tecido simples.',
          'Capacete apenas decorativo sem carneira.',
          'Protetor auricular tipo plug.',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    course: {
      id: 'nr-10',
      slug: 'nr-10',
      nrCode: 'NR-10 Básico',
      title: 'Segurança em Instalações e Serviços com Eletricidade',
      salesHeadline:
        'Conquiste seu Certificado NR-10 Básico (40h) conforme Anexo III e atue com segurança em instalações elétricas',
      salesSubheadline:
        'Treinamento teórico completo de 40h cobrindo riscos elétricos, arco voltaico, os 6 passos de desenergização, Zonas de Risco/Controlada, EPIs/EPCs isolantes e primeiros socorros.',
      promoTag: 'Carga horária oficial de 40h · Anexo III da NR-10',
      originalPriceCents: 25900,
      priceCents: 17900,
      enrolledCount: 2840,
      ratingAverage: 4.9,
      ratingCount: 465,
      guaranteeDays: 7,
      shortDescription:
        'Curso Básico de 40h (Anexo III da NR-10): riscos elétricos, desenergização, EPCs/EPIs isolantes, rotinas e emergências.',
      fullDescription:
        'A NR-10 estabelece os requisitos e condições mínimas objetivando a implementação de medidas de controle e sistemas preventivos para garantir a segurança e a saúde dos trabalhadores que, direta ou indiretamente, interajam em instalações elétricas e serviços com eletricidade. Este Curso Básico (40 horas, conforme Anexo III) abrange choque elétrico, arco voltaico, aterramento, os 6 procedimentos obrigatórios de desenergização, Zona de Risco e Zona Controlada, vestimenta FR/ATP, ferramentas isoladas, proteção contra incêndio e noções de RCP.',
      workloadHours: 40,
      certificateValidityMonths: 24,
      targetAudience:
        'Eletricistas industriais e prediais, técnicos em eletrotécnica, automação, refrigeração, instaladores solares, mantenedores e engenheiros eletricistas.',
      notForAudience: [
        'Atividades exclusivas no Sistema Elétrico de Potência (SEP) acima de 1000 VCA sem curso Complementar SEP',
        'Quem busca apenas certificado sem realizar avaliação formal de aproveitamento',
      ],
      includedBonuses: [
        'Checklist dos 6 Passos Obrigatórios da Desenergização Elétrica (item 10.5.1)',
        'Tabela de Raios das Zonas de Risco (Zr) e Zona Controlada (Zc) por Nível de Tensão',
        'Guia de Seleção de Luvas Isolantes (Classes 00 a 4) e Vestimenta ATPV',
      ],
      learningOutcomes: [
        'Identificar riscos de choque elétrico, queimaduras por arco voltaico e campos eletromagnéticos',
        'Executar rigorosamente a sequência dos 6 passos de desenergização e bloqueio LOTO',
        'Delimitar Zona de Risco, Zona Controlada e Zona Livre em painéis e subestações',
        'Aplicar medidas de controle, aterramento temporário, combate a incêndio elétrico e primeiros socorros',
      ],
      faq: [
        {
          question: 'A carga horária deste curso segue o Anexo III da NR-10?',
          answer:
            'Sim. O Curso Básico de NR-10 da 4k Treinamentos possui carga horária integral de 40 horas, atendendo ao conteúdo programático mínimo do Anexo III da NR-10.',
        },
        {
          question: 'Qual a validade do certificado NR-10 Básico?',
          answer:
            'A reciclagem da NR-10 deve ocorrer bienalmente (a cada 24 meses) ou sempre que houver troca de função, retorno de afastamento superior a 3 meses ou modificações significativas nas instalações.',
        },
        {
          question: 'Este curso habilita o profissional para o SEP (Alta Tensão)?',
          answer:
            'Este é o Curso Básico de 40h (pré-requisito obrigatório para qualquer trabalho em eletricidade). Para atuar no Sistema Elétrico de Potência (SEP), é exigido também o módulo complementar específico.',
        },
      ],
      coverImageUrl: NR10_COVER_URL,
      bannerImageUrl: NR10_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 2,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-10-m1',
        courseId: 'nr-10',
        title: 'Módulo 1 · Riscos Elétricos, Choque, Arco e Medidas de Controle',
        description: 'Efeitos da corrente elétrica, arco voltaico, aterramento, seccionamento automático e DR.',
        order: 1,
        lessons: [
          {
            id: 'nr10-l1',
            title: 'Introdução à NR-10, Choque Elétrico e Arco Voltaico',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'A Norma Regulamentadora nº 10 aplica-se às fases de geração, transmissão, distribuição e consumo, incluindo projeto, construção, montagem, operação e manutenção das instalações elétricas.\n\nPrincipais riscos:\n• Choque Elétrico: passagem da corrente elétrica pelo corpo humano, podendo provocar tetanização muscular, parada respiratória, fibrilação ventricular e queimaduras internas.\n• Arco Voltaico (Arc Flash): descarga elétrica pelo ar ionizado com temperaturas superiores a 19.000 °C, projeção de metal fundido e onda de choque acústico/mecânico.\n• Quedas em altura ou projeção decorrentes de contração involuntária.\n\nA hierarquia de controle exige, prioritariamente, a desenergização elétrica; na impossibilidade, o emprego de tensão de segurança (extra-baixa tensão) e isolação de partes vivas.',
          },
          {
            id: 'nr10-l2',
            title: 'Aterramento Elétrico, Equipotencialização e Dispositivo DR',
            type: 'text',
            durationMinutes: 90,
            order: 2,
            content:
              'O aterramento de proteção (PE) e a equipotencialização garantem que massas metálicas acessíveis não assumam potenciais perigosos em caso de falha de isolação.\n\nEsquemas de aterramento segundo ABNT NBR 5410 (TN-S, TN-C, TT, IT) determinam o comportamento da corrente de falta e a atuação de dispositivos de proteção.\n\nO Dispositivo Diferencial Residual (DR) de alta sensibilidade (corrente diferencial nominal ≤ 30 mA) interrompe o circuito em milissegundos ao detectar fuga de corrente à terra, prevenindo choques letais.',
          },
        ],
      },
      {
        id: 'nr-10-m2',
        courseId: 'nr-10',
        title: 'Módulo 2 · Desenergização (6 Passos), Bloqueio e Zonas de Segurança',
        description: 'Sequência obrigatória para considerar uma instalação desenergizada e distâncias de segurança.',
        order: 2,
        lessons: [
          {
            id: 'nr10-l3',
            title: 'Os 6 Procedimentos Obrigatórios de Desenergização (Item 10.5.1)',
            type: 'text',
            durationMinutes: 100,
            order: 1,
            content:
              'Somente serão consideradas desenergizadas as instalações elétricas liberadas para trabalho mediante os procedimentos apropriados, obedecida rigorosamente a seguinte sequência:\n\n1. Seccionamento: abertura completa do dispositivo de manobra garantindo afastamento físico.\n2. Impedimento de reenergização: travamento mecânico com cadeados individuais e etiquetas de bloqueio (LOTO).\n3. Constatação da ausência de tensão: medição com detector/multímetro calibrado CAT III/IV testado antes e depois.\n4. Instalação de aterramento temporário com equipotencialização dos condutores das fases.\n5. Proteção dos elementos energizados existentes na zona controlada.\n6. Instalação da sinalização de impedimento de reenergização.\n\nPara reenergizar o circuito após o término do serviço, executa-se a sequência inversa após retirada de todas as ferramentas e confirmação da saída dos trabalhadores.',
          },
          {
            id: 'nr10-l4',
            title: 'Zona de Risco, Zona Controlada e Responsabilidades (Habilitado x Autorizado)',
            type: 'text',
            durationMinutes: 80,
            order: 2,
            content:
              'A NR-10 define raios de delimitação ao redor de pontos energizados não isolados conforme a tensão nominal (Anexo II):\n• Zona de Risco (Zr): entorno de parte condutora energizada, não segregada, acessível inclusive acidentalmente, onde somente trabalhadores autorizados podem ingressar com técnicas, ferramentas e EPIs específicos.\n• Zona Controlada (Zc): entorno da Zona de Risco, acessível apenas a trabalhadores autorizados.\n• Zona Livre: área externa à Zc.\n\nQualificação e Autorização:\n• Qualificado: concluiu curso específico na área elétrica reconhecido pelo Sistema Oficial de Ensino.\n• Legalmente Habilitado: qualificado com registro ativo no competente conselho de classe (CREA/CFT).\n• Capacitado: recebeu capacitação sob orientação e responsabilidade de profissional habilitado e autorizado.\n• Autorizado: qualificado/capacitado/habilitado com anuência formal da empresa e exames médicos (ASO) compatíveis.',
          },
        ],
      },
      {
        id: 'nr-10-m3',
        courseId: 'nr-10',
        title: 'Módulo 3 · EPIs, EPCs Isolantes, Incêndio Elétrico e Primeiros Socorros',
        description: 'Vestimenta retardante à chama (ATPV), luvas isolantes, extintores classe C e RCP.',
        order: 3,
        lessons: [
          {
            id: 'nr10-l5',
            title: 'Vestimenta ATPV, Luvas Isolantes e Ferramentas CAT III/IV',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'Trabalhadores expostos a risco de arco elétrico devem usar vestimentas condutivas/retardantes à chama com classificação ATPV compatível com a energia incidente calculada (proibido uso de adornos metálicos, relógios, anéis e tecidos sintéticos comuns como poliéster puro).\n\nLuvas isolantes de borracha são classificadas por tensão máxima de uso (Classe 00 até 500V, Classe 0 até 1.000V, Classes 1 a 4 para média/alta tensão) e devem ser inspecionadas por ensaio de inflagem antes do uso e protegidas por luva de cobertura em vaqueta.\n\nEm incêndios envolvendo equipamentos energizados (Classe C), utilizam-se agentes extintores não condutores de eletricidade (CO2 ou Pó Químico Seco), jamais água ou espuma comum enquanto houver tensão.',
          },
          {
            id: 'nr10-l6',
            title: 'Atendimento a Acidentados: Remoção Segura e Suporte Básico de Vida',
            type: 'text',
            durationMinutes: 90,
            order: 2,
            content:
              'Ao presenciar uma vítima de choque elétrico:\n1. NUNCA toque diretamente na vítima antes de desligar a fonte de energia ou afastá-la com bastão isolante seco/certificado.\n2. Acione imediatamente o serviço médico de emergência (SAMU 192 / Bombeiros 193).\n3. Avalie responsividade e respiração; na ausência de sinais vitais, inicie imediatamente manobras de Reanimação Cardiopulmonar (RCP) com compressões torácicas contínuas e utilize Desfibrilador Externo Automático (DEA) assim que disponível.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr10-q1',
        courseId: 'nr-10',
        order: 1,
        prompt: 'Qual é a primeira etapa obrigatória na sequência de desenergização elétrica prevista no item 10.5.1 da NR-10?',
        options: [
          'Instalar aterramento temporário imediatamente.',
          'Seccionamento do circuito.',
          'Retirar os cadeados dos disjuntores.',
          'Lavar o painel com água desmineralizada.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr10-q2',
        courseId: 'nr-10',
        order: 2,
        prompt: 'Por que a NR-10 proíbe o uso de adornos pessoais (anéis, pulseiras, relógios) e roupas sintéticas comuns em serviços elétricos?',
        options: [
          'Apenas por padrão estético da empresa.',
          'Porque metais conduzem corrente e tecidos sintéticos derretem e aderem à pele durante um arco elétrico.',
          'Para facilitar a passagem nos corredores estreitos.',
          'Essa restrição aplica-se apenas a serviços acima de 138 kV.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr10-q3',
        courseId: 'nr-10',
        order: 3,
        prompt: 'Segundo a NR-10, quem é considerado trabalhador "Autorizado"?',
        options: [
          'Qualquer funcionário contratado há mais de 6 meses.',
          'O trabalhador qualificado, habilitado ou capacitado que possua anuência formal da empresa e aptidão médica para atuar nas instalações.',
          'Apenas o proprietário da empresa contratante.',
          'Qualquer estagiário de áreas administrativas.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr10-q4',
        courseId: 'nr-10',
        order: 4,
        prompt: 'Em caso de princípio de incêndio em um quadro elétrico energizado (Classe C), qual agente extintor NÃO deve ser utilizado?',
        options: [
          'Gás Carbônico (CO2).',
          'Pó Químico Seco (BC ou ABC).',
          'Água pressurizada ou espuma mecânica.',
          'Extintor certificado para Classe C.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr10-q5',
        courseId: 'nr-10',
        order: 5,
        prompt: 'O que garante a proteção da luva isolante de borracha contra perfurações mecânicas durante o manuseio de cabos e barramentos?',
        options: [
          'Uso conjunto com luva de cobertura de vaqueta sobreposta.',
          'Aplicação de graxa na superfície externa.',
          'Dobrar o punho da luva para dentro.',
          'Utilizar luvas cirúrgicas por cima.',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    course: {
      id: 'nr-11',
      slug: 'nr-11',
      nrCode: 'NR-11',
      title: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
      salesHeadline:
        'Capacitação NR-11 completa para operação segura de empilhadeiras, pontes rolantes e movimentação de cargas',
      salesSubheadline:
        'Domine o triângulo de estabilidade, centro de gravidade, inspeção diária de equipamentos de içamento, sinalização e regras de armazenagem com certificado válido.',
      promoTag: 'Logística, Armazéns & Indústria · Acesso imediato',
      originalPriceCents: 17900,
      priceCents: 11900,
      enrolledCount: 1520,
      ratingAverage: 4.9,
      ratingCount: 248,
      guaranteeDays: 7,
      shortDescription:
        'Normas de segurança para empilhadeiras, ponte rolante, talhas, amarração de cargas, empilhamento e prevenção de tombamentos.',
      fullDescription:
        'A NR-11 regulamenta a operação segura de elevadores de carga, guindastes, transportadores industriais, empilhadeiras, pontes rolantes e métodos de armazenagem e movimentação manual/mecânica de materiais. O curso aborda capacidade nominal, centro de carga e triângulo de estabilidade, inspeção de cabos de aço/cintas têxteis, sinalização sonora e visual, trânsito em rampas e isolamento de área sob carga suspensa.',
      workloadHours: 8,
      certificateValidityMonths: 12,
      targetAudience:
        'Operadores de empilhadeira e paleteira elétrica, operadores de ponte rolante, sinaleiros/amarradores de carga, auxiliares de logística e almoxarifado.',
      notForAudience: [
        'Quem não pretende respeitar limites de carga nominal ou sinalização de segurança em armazéns',
        'Aulas práticas presenciais em pista de manobra (que devem ser complementadas na empresa quando exigido pelo equipamento específico)',
      ],
      includedBonuses: [
        'Checklist Diário de Pré-Operação (Inspeção Inicial) para Empilhadeira e Ponte Rolante',
        'Tabela de Redução de Capacidade de Cintas Têxteis por Ângulo de Içamento',
      ],
      learningOutcomes: [
        'Compreender centro de gravidade, centro de carga e o triângulo de estabilidade em empilhadeiras',
        'Inspecionar cabos de aço, correntes, ganchos e cintas de poliéster antes do içamento',
        'Aplicar sinalização sonora, visual e distâncias seguras em corredores e rampas',
        'Organizar pilhas e porta-paletes respeitando resistência do piso e rotas de emergência',
      ],
      faq: [
        {
          question: 'É obrigatório portar cartão de identificação visível ao operar empilhadeira?',
          answer:
            'Sim. A NR-11 (item 11.1.6) determina que os operadores de equipamentos de transporte motorizado sejam habilitados e portem cartão de identificação com nome e fotografia em lugar visível, com validade de 1 ano mediante exame de saúde.',
        },
        {
          question: 'Posso circular sob uma carga suspensa por ponte rolante ou talha?',
          answer:
            'Jamais. É expressamente proibido permanecer ou transitar sob cargas suspensas, devendo a área de movimentação permanecer isolada e sinalizada.',
        },
      ],
      coverImageUrl: NR11_COVER_URL,
      bannerImageUrl: NR11_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 3,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-11-m1',
        courseId: 'nr-11',
        title: 'Módulo 1 · Equipamentos Motorizados, Estabilidade e Inspeção',
        description: 'Requisitos legais da NR-11, triângulo de estabilidade e checklist pré-uso.',
        order: 1,
        lessons: [
          {
            id: 'nr11-l1',
            title: 'Habilitação, Cartão de Identificação e Estabilidade da Empilhadeira',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Os equipamentos utilizados na movimentação de materiais devem ser calculados e construídos de maneira a oferecer garantias de resistência e segurança, com inspeção permanente de cabos, correntes, roldanas e ganchos.\n\nExigência para operadores (item 11.1.6):\n• Treinamento específico com aproveitamento comprovado.\n• Cartão de identificação com nome e fotografia em local visível.\n• Revalidação anual mediante exame de saúde completo (ASO).\n\nPrincípio do Triângulo de Estabilidade:\nA empilhadeira apoia-se em três pontos (duas rodas dianteiras e o pino pivô do eixo traseiro). Se o centro de gravidade combinado (máquina + carga) sair desse triângulo — por excesso de peso, carga elevada em curvas ou velocidade excessiva — ocorre tombamento lateral ou frontal.',
          },
          {
            id: 'nr11-l2',
            title: 'Condução Segura em Rampas, Corredores e Pontos Cegos',
            type: 'text',
            durationMinutes: 60,
            order: 2,
            content:
              'Regras operacionais fundamentais:\n• Trafegar sempre com os garfos baixos (cerca de 15 a 20 cm do piso) e torre inclinada levemente para trás.\n• Em rampas com carga: subir de frente e descer de marcha à ré para evitar deslizamento da carga dos garfos.\n• Se a carga obstruir a visão frontal, conduzir em marcha à ré com atenção redobrada e buzina em cruzamentos.\n• Proibido transportar passageiros nos garfos, no contrapeso ou dentro da cabine de empilhadeiras monoposto.',
          },
        ],
      },
      {
        id: 'nr-11-m2',
        courseId: 'nr-11',
        title: 'Módulo 2 · Içamento, Amarração de Cargas e Armazenamento',
        description: 'Inspeção de cintas/cabos, sinalização de ponte rolante e regras de estocagem.',
        order: 2,
        lessons: [
          {
            id: 'nr11-l3',
            title: 'Cintas, Cabos de Aço e Armazenamento Seguro de Materiais',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Antes de qualquer içamento com ponte rolante, pórtico ou talha:\n• Verificar a plaqueta de carga máxima admissível.\n• Inspecionar travas de segurança do gancho, desgaste de correntes, fios rompidos em cabos de aço e cortes/costuras em cintas sintéticas.\n• Proteger cintas contra cantos vivos utilizando quebra-cantos.\n\nRegras de Armazenagem (item 11.3):\n• O peso do material armazenado não pode exceder a capacidade de carga calculada para o piso.\n• Materiais empilhados devem ficar afastados pelo menos 0,50 m das estruturas laterais do prédio e jamais obstruir saídas de emergência, extintores ou quadros elétricos.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr11-q1',
        courseId: 'nr-11',
        order: 1,
        prompt: 'Qual a validade do cartão de identificação obrigatório para operadores de equipamentos de transporte motorizado (como empilhadeiras), segundo a NR-11?',
        options: [
          'Validade indeterminada após a primeira emissão.',
          'Validade de 1 ano, renovado mediante exame de saúde completo por conta do empregador.',
          'Validade de 5 anos sem necessidade de exame médico.',
          'Apenas durante o período de experiência de 90 dias.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr11-q2',
        courseId: 'nr-11',
        order: 2,
        prompt: 'Ao descer uma rampa transportando carga na empilhadeira, qual deve ser a direção correta de condução?',
        options: [
          'De frente em alta velocidade.',
          'De marcha à ré, mantendo a carga voltada para o alto da rampa e garfos baixos.',
          'Em ponto morto para economizar combustível.',
          'Com a torre totalmente erguida no topo.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr11-q3',
        courseId: 'nr-11',
        order: 3,
        prompt: 'Qual é a distância mínima de afastamento que os materiais empilhados devem manter em relação às paredes e estruturas laterais do prédio?',
        options: [
          '0,10 m.',
          '0,50 m (50 centímetros).',
          'Podem encostar diretamente nas paredes e hidrantes.',
          'Apenas 2,00 m nos fundos.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr11-q4',
        courseId: 'nr-11',
        order: 4,
        prompt: 'Se um trabalhador notar que uma cinta de poliéster apresenta corte na borda ou etiqueta ilegível antes de um içamento, o que deve fazer?',
        options: [
          'Dar um nó na cinta para reforçar.',
          'Utilizá-la apenas em velocidade reduzida.',
          'Retirá-la imediatamente de uso, interditar e solicitar substituição.',
          'Enrolar fita isolante no corte.',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    course: {
      id: 'nr-12',
      slug: 'nr-12',
      nrCode: 'NR-12',
      title: 'Segurança no Trabalho em Máquinas e Equipamentos',
      salesHeadline:
        'Capacitação NR-12 completa para operar e manter máquinas industriais com segurança e respaldo legal',
      salesSubheadline:
        'Proteções fixas e móveis, intertravamentos, cortinas de luz, parada de emergência e bloqueio LOTO em um curso direto ao ponto, com emissão rápida de certificado em PDF.',
      promoTag: 'Condição promocional · Indústria & Manutenção',
      originalPriceCents: 15900,
      priceCents: 9900,
      enrolledCount: 1120,
      ratingAverage: 4.8,
      ratingCount: 196,
      guaranteeDays: 7,
      shortDescription:
        'Proteções fixas e móveis, dispositivos de parada de emergência, bloqueio LOTO e operação segura de máquinas industriais.',
      fullDescription:
        'A NR-12 define referências técnicas, princípios fundamentais e medidas de proteção para resguardar a saúde e a integridade física dos trabalhadores na operação, manutenção, limpeza e ajuste de máquinas e equipamentos. O curso aborda zonas de perigo, proteções mecânicas, cortinas de luz, comandos bimanuais, botões de emergência e bloqueio de fontes de energia.',
      workloadHours: 8,
      certificateValidityMonths: 24,
      targetAudience:
        'Operadores de máquinas CNC, prensas, injetoras, tornos, serras, mecânicos de manutenção industrial e supervisores de produção.',
      notForAudience: [
        'Quem deseja burlar procedimentos de segurança ou neutralizar sensores de fábrica',
        'Projetistas buscando exclusivamente dimensionamento elétrico SIL/PLr de painéis',
      ],
      includedBonuses: [
        'Fluxograma de Bloqueio e Etiquetagem (LOTO) passo a passo',
        'Checklist diário de inspeção de proteções e botão de emergência',
      ],
      learningOutcomes: [
        'Reconhecer riscos mecânicos, elétricos e térmicos em zonas de operação',
        'Compreender o funcionamento de proteções fixas, intertravamentos e sensores ópticos',
        'Aplicar corretamente os dispositivos de parada de emergência e rearme seguro',
        'Executar procedimentos de bloqueio e etiquetagem (LOTO) em intervenções e limpeza',
      ],
      faq: [
        {
          question: 'Posso burlar um sensor de intertravamento para agilizar a produção?',
          answer:
            'Nunca. A neutralização de dispositivos de segurança é proibida pela NR-12 e expõe o operador a risco grave de amputação ou esmagamento.',
        },
        {
          question: 'O certificado da NR-12 serve para operadores e mecânicos?',
          answer:
            'Sim. Abrange operação segura, limpeza, inspeção e bloqueio de energias para manutenção conforme a NR-12.',
        },
      ],
      coverImageUrl: NR12_COVER_URL,
      bannerImageUrl: NR12_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 4,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-12-m1',
        courseId: 'nr-12',
        title: 'Módulo 1 · Sistemas de Segurança e Proteções NR-12',
        description: 'Arranjo físico, proteções fixas/móveis, intertravamento e parada de emergência.',
        order: 1,
        lessons: [
          {
            id: 'nr12-l1',
            title: 'Zonas de Perigo, Proteções e Dispositivos de Segurança',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'As máquinas devem possuir sistemas de segurança que garantam proteção à saúde e integridade física nos momentos de operação, manutenção e limpeza.\n\nOrdem de prioridade das medidas de proteção:\n1. Medidas de proteção coletiva (enclausuramento, proteções fixas e móveis intertravadas, cortinas de luz).\n2. Medidas administrativas ou de organização do trabalho.\n3. Medidas de proteção individual (EPI).\n\nOs dispositivos de parada de emergência (botão tipo cogumelo vermelho sobre fundo amarelo) devem permanecer sempre desobstruídos, facilmente acessíveis e NÃO devem ser usados como botão de desligamento rotineiro.',
          },
        ],
      },
      {
        id: 'nr-12-m2',
        courseId: 'nr-12',
        title: 'Módulo 2 · Manutenção, Limpeza, Bloqueio LOTO e Operação Segura',
        description: 'Controle de energias perigosas, energia zero e rearme após emergência.',
        order: 2,
        lessons: [
          {
            id: 'nr12-l2',
            title: 'Procedimentos de Manutenção, Limpeza e Bloqueio (LOTO)',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Qualquer intervenção para limpeza, lubrificação, ajuste ou manutenção deve ocorrer com a máquina parada e suas fontes de energia (elétrica, pneumática, hidráulica) isoladas, bloqueadas com cadeado individual e etiquetadas.\n\nAntes de iniciar a intervenção, deve-se realizar o teste de energia zero para assegurar que não há energia residual armazenada (molas comprimidas, acumuladores hidráulicos ou peças elevadas sem calço mecânico).\n\nApós acionamento do botão de emergência, o simples destravamento do botão NÃO deve religar a máquina automaticamente; exige-se comando intencional de rearme (reset).',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr12-q1',
        courseId: 'nr-12',
        order: 1,
        prompt: 'Qual a ordem de prioridade das medidas de proteção estabelecida pela NR-12?',
        options: [
          'EPI primeiro, depois medidas administrativas e por último proteção coletiva.',
          'Medidas de proteção coletiva primeiro, depois administrativas/organização do trabalho e por último EPI.',
          'Apenas treinamento verbal substitui a proteção coletiva.',
          'Uso exclusivo de botão de emergência sem carenagem.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr12-q2',
        courseId: 'nr-12',
        order: 2,
        prompt: 'Sobre o botão de parada de emergência em máquinas NR-12, é correto afirmar:',
        options: [
          'Deve ser utilizado para desligar a máquina no fim do expediente.',
          'Deve ser posicionado em local visível, desobstruído e nunca utilizado como chave geral de rotina.',
          'Pode ficar trancado dentro do painel elétrico.',
          'Ao ser solto, deve religar a máquina automaticamente.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr12-q3',
        courseId: 'nr-12',
        order: 3,
        prompt: 'Qual procedimento é obrigatório antes de realizar limpeza ou ajuste na zona de perigo de uma máquina?',
        options: [
          'Apenas reduzir a rotação do motor.',
          'Pedir a um colega para segurar a chave liga/desliga.',
          'Desenergizar, realizar o bloqueio e etiquetagem (LOTO) das fontes de energia e testar energia zero.',
          'Usar apenas luva de vaqueta com a máquina em movimento.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr12-q4',
        courseId: 'nr-12',
        order: 4,
        prompt: 'O que acontece quando um botão de parada de emergência é destravado após uma ocorrência?',
        options: [
          'A máquina religa imediatamente sozinha.',
          'O destravamento apenas libera o circuito para que o operador dê comando manual de rearme e partida.',
          'Os sensores de proteção ficam desativados por 10 minutos.',
          'A porta intertravada abre mesmo com o eixo girando.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-18',
      slug: 'nr-18',
      nrCode: 'NR-18',
      title: 'Segurança na Indústria da Construção',
      salesHeadline:
        'Integração e capacitação NR-18 para liberar sua entrada em canteiros de obras com certificado verificado',
      salesSubheadline:
        'Aprenda as exigências da nova NR-18 e do PGR de obras: guarda-corpos, escavações, andaimes, máquinas de obra e instalações elétricas temporárias.',
      promoTag: 'Condição promocional · Construção Civil',
      originalPriceCents: 15900,
      priceCents: 9900,
      enrolledCount: 1380,
      ratingAverage: 4.9,
      ratingCount: 229,
      guaranteeDays: 7,
      shortDescription:
        'Diretrizes da nova NR-18 e PGR na construção civil: escavações, andaimes, proteção contra quedas, eletricidade e canteiro.',
      fullDescription:
        'Voltado para profissionais de obras e engenharia, o curso de NR-18 apresenta as diretrizes de prevenção de acidentes na Indústria da Construção. Inclui Programa de Gerenciamento de Riscos (PGR) do canteiro, escavações e fundações, carpintaria e armação, instalações elétricas temporárias, movimentação de cargas, andaimes e proteções coletivas de periferia.',
      workloadHours: 8,
      certificateValidityMonths: 24,
      targetAudience:
        'Pedreiros, serventes, carpinteiros, armadores, mestres de obras, engenheiros civis e técnicos de segurança em canteiros.',
      notForAudience: [
        'Profissionais que atuam exclusivamente em atividades administrativas fora de canteiros de obras',
      ],
      includedBonuses: [
        'Tabela de medidas regulamentares de Guarda-Corpo e Rodapé (GcR)',
        'Checklist de conformidade para andaimes e quadros elétricos de obra',
      ],
      learningOutcomes: [
        'Compreender a integração do PGR na construção civil conforme a nova NR-18',
        'Inspecionar guarda-corpos de periferia, bandejas de proteção e andaimes',
        'Aplicar medidas preventivas em escavações, taludes e escoramentos',
        'Controlar riscos em serras circulares, betoneiras e quadros elétricos de obra',
      ],
      faq: [
        {
          question: 'O curso atende o treinamento admissional na construção civil?',
          answer:
            'Sim. Cobre a carga horária teórica exigida para capacitação inicial e reciclagem de trabalhadores em canteiros de obras.',
        },
        {
          question: 'Qual a validade do certificado NR-18?',
          answer:
            'O certificado possui validade de 24 meses e código verificável para apresentação imediata no canteiro.',
        },
      ],
      coverImageUrl: NR18_COVER_URL,
      bannerImageUrl: NR18_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 5,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-18-m1',
        courseId: 'nr-18',
        title: 'Módulo 1 · PGR no Canteiro e Proteções Coletivas de Periferia',
        description: 'PGR da obra, áreas de vivência, guarda-corpo padrão e isolamento de vãos.',
        order: 1,
        lessons: [
          {
            id: 'nr18-l1',
            title: 'Sistema de Guarda-Corpo e Rodapé (GcR) e Periferias',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'É obrigatória a instalação de proteção coletiva onde houver risco de queda de trabalhadores ou de projeção de materiais.\n\nPadrão dimensional do Guarda-Corpo e Rodapé:\n• Travessão superior: 1,20 m de altura.\n• Travessão intermediário: 0,70 m de altura.\n• Rodapé: altura mínima de 0,15 m (15 cm).\n• Vão entre travessões fechado com tela resistente.\n\nAberturas no piso (como vãos de elevador e shafts) devem possuir fechamento provisório resistente ou guarda-corpo fixado de modo seguro.',
          },
        ],
      },
      {
        id: 'nr-18-m2',
        courseId: 'nr-18',
        title: 'Módulo 2 · Escavações, Andaimes e Instalações Elétricas',
        description: 'Estabilidade de taludes, forração de andaimes, serras circulares e proteção DR.',
        order: 2,
        lessons: [
          {
            id: 'nr18-l2',
            title: 'Segurança em Escavações, Andaimes e Quadros Elétricos de Obra',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Escavações com profundidade superior a 1,25 m devem dispor de escadas ou rampas próximas aos postos de trabalho para saída rápida em emergência, além de escoramento ou taludamento conforme projeto.\n\nOs andaimes devem possuir piso de trabalho com forração completa, antiderrapante, nivelado e travado, além de guarda-corpo e rodapé em todo o perímetro.\n\nQuadros elétricos temporários devem estar aterrados, sinalizados, trancados e equipados com Dispositivo Diferencial Residual (DR).',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr18-q1',
        courseId: 'nr-18',
        order: 1,
        prompt: 'Quais são as alturas regulamentares do travessão superior, travessão intermediário e rodapé de um guarda-corpo na NR-18?',
        options: [
          '0,90 m, 0,45 m e 0,10 m.',
          '1,20 m (superior), 0,70 m (intermediário) e mínimo de 0,15 m (rodapé).',
          '1,50 m, 1,00 m e 0,05 m.',
          'Não há medida mínima definida na norma.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr18-q2',
        courseId: 'nr-18',
        order: 2,
        prompt: 'A partir de qual profundidade escavações exigem escadas ou rampas para saída rápida dos trabalhadores?',
        options: [
          'Superior a 0,50 m.',
          'Superior a 1,25 m.',
          'Apenas acima de 3,50 m.',
          'Somente em escavações com água.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr18-q3',
        courseId: 'nr-18',
        order: 3,
        prompt: 'Qual dispositivo elétrico de proteção contra choques é obrigatório nos circuitos de obra da NR-18?',
        options: [
          'Apenas fita isolante dupla.',
          'Dispositivo Diferencial Residual (DR) e aterramento adequado.',
          'Chave faca aberta.',
          'Extensão sem pino terra.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr18-q4',
        courseId: 'nr-18',
        order: 4,
        prompt: 'Como deve ser o piso de trabalho de um andaime segundo a NR-18?',
        options: [
          'Com pranchas soltas e espaçadas para economizar madeira.',
          'Com forração completa, antiderrapante, nivelada e fixada/travada de modo seguro.',
          'Apenas uma tábua estreita no centro.',
          'Sem necessidade de rodapé acima de 3 metros.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-20',
      slug: 'nr-20',
      nrCode: 'NR-20',
      title: 'Segurança com Inflamáveis e Combustíveis (Básico)',
      salesHeadline:
        'Emita seu Certificado NR-20 Básico (8h) e trabalhe em áreas com combustíveis, gases e produtos inflamáveis',
      salesSubheadline:
        'Domine classificação de inflamáveis (Ponto de Fulgor), Limites de Explosividade (LIE/LSE), aterramento contra eletricidade estática, controle de fontes de ignição e resposta a vazamentos.',
      promoTag: 'Postos, Tanques & Indústria Química · Anexo II NR-20',
      originalPriceCents: 18900,
      priceCents: 12900,
      enrolledCount: 1410,
      ratingAverage: 4.9,
      ratingCount: 235,
      guaranteeDays: 7,
      shortDescription:
        'Capacitação Básica (8h) NR-20: propriedades físico-químicas, controle de ignição, aterramento, FDS/FISPQ e emergência com inflamáveis.',
      fullDescription:
        'A NR-20 estabelece requisitos mínimos para a gestão da segurança e saúde no trabalho contra os fatores de risco de acidentes provenientes das atividades de extração, produção, armazenamento, transferência, manuseio e manipulação de inflamáveis e líquidos combustíveis. O curso Básico (8h) cobre definição legal (ponto de fulgor ≤ 60 °C vs combustíveis), LIE/LSE, fontes de ignição e eletricidade estática, FDS (antiga FISPQ), Permissão para Trabalho a Quente e procedimentos de emergência.',
      workloadHours: 8,
      certificateValidityMonths: 36,
      targetAudience:
        'Frentistas, operadores de descarga de combustíveis, profissionais de manutenção industrial, químicos, soldadores próximos a áreas classificadas e técnicos de segurança.',
      notForAudience: [
        'Operações específicas que exigem curso Intermediário (16h) ou Avançado (24h/32h) em instalações Classe II e III sem complementação',
      ],
      includedBonuses: [
        'Tabela Comparativa: Líquido Inflamável (≤ 60 °C) x Líquido Combustível (> 60 °C a ≤ 93 °C)',
        'Checklist de Transbordo Seguro, Aterramento Eletrostático e Controle de Ignição',
      ],
      learningOutcomes: [
        'Diferenciar líquidos inflamáveis, combustíveis e gases inflamáveis pelo Ponto de Fulgor',
        'Interpretar Ficha com Dados de Segurança (FDS) e Limites de Explosividade (LIE e LSE)',
        'Controlar fontes de ignição, chamas abertas, faíscas e descargas eletrostáticas',
        'Atuar corretamente na contenção inicial de vazamentos e acionamento do plano de emergência',
      ],
      faq: [
        {
          question: 'Qual a diferença entre líquido inflamável e líquido combustível na NR-20?',
          answer:
            'Líquidos inflamáveis possuem ponto de fulgor ≤ 60 °C (ex.: gasolina, etanol, acetona). Líquidos combustíveis possuem ponto de fulgor > 60 °C e ≤ 93 °C (ex.: óleo diesel).',
        },
        {
          question: 'Qual a periodicidade de reciclagem do curso Básico da NR-20?',
          answer:
            'Conforme o Anexo II da NR-20, o curso Básico deve ser atualizado a cada 3 anos (36 meses) com reciclagem de 4 horas, ou antes em caso de alteração de processo ou ocorrência de incidente.',
        },
      ],
      coverImageUrl: NR20_COVER_URL,
      bannerImageUrl: NR20_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 6,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-20-m1',
        courseId: 'nr-20',
        title: 'Módulo 1 · Propriedades dos Inflamáveis e Classificação NR-20',
        description: 'Ponto de fulgor, combustão, LIE/LSE, gases inflamáveis e leitura de FDS.',
        order: 1,
        lessons: [
          {
            id: 'nr20-l1',
            title: 'Ponto de Fulgor, Faixa de Explosividade (LIE/LSE) e FDS',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Classificação oficial pela NR-20:\n• Líquidos Inflamáveis: líquidos que possuem ponto de fulgor ≤ 60 °C.\n• Gases Inflamáveis: gases que inflamam com o ar a 20 °C e pressão padrão de 101,3 kPa.\n• Líquidos Combustíveis: líquidos com ponto de fulgor > 60 °C e ≤ 93 °C.\n\nParâmetros Críticos de Segurança:\n• Ponto de Fulgor (Flash Point): menor temperatura na qual um líquido libera vapores suficientes para formar mistura inflamável com o ar próxima à superfície.\n• LIE (Limite Inferior de Explosividade): concentração mínima de gás/vapor no ar abaixo da qual a mistura é "pobre" e não queima.\n• LSE (Limite Superior de Explosividade): concentração máxima acima da qual a mistura é "rica" (falta oxigênio). Entre o LIE e o LSE existe perigo imediato de explosão.',
          },
        ],
      },
      {
        id: 'nr-20-m2',
        courseId: 'nr-20',
        title: 'Módulo 2 · Controle de Fontes de Ignição, Aterramento e Emergências',
        description: 'Áreas classificadas (Ex), eletricidade estática, trabalho a quente e contenção de derrames.',
        order: 2,
        lessons: [
          {
            id: 'nr20-l2',
            title: 'Eletricidade Estática, Equipamentos Ex e Resposta a Vazamentos',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Em áreas classificadas com risco de formação de atmosfera explosiva:\n• Todos os equipamentos elétricos devem possuir certificação à prova de explosão ou segurança intrínseca (Ex).\n• Caminhões-tanque, tambores metálicos e mangotes de transferência devem ser interligados e aterrados antes de abrir válvulas para dissipar cargas eletrostáticas.\n• É proibido o uso de celulares não certificados, cigarros, esmerilhadeiras ou solda sem Permissão de Trabalho (PT) específica e monitoramento contínuo de LEL.\n\nEm caso de vazamento:\nEliminar imediatamente fontes de ignição, isolar a área a favor do vento, conter o derrame com diques/mantas absorventes (evitando rede pluvial) e acionar a brigada de emergência.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr20-q1',
        courseId: 'nr-20',
        order: 1,
        prompt: 'Pela NR-20, qual é o critério técnico que define um Líquido Inflamável?',
        options: [
          'Líquido com ponto de fulgor inferior ou igual a 60 °C.',
          'Líquido com ponto de fulgor acima de 150 °C.',
          'Qualquer líquido armazenado em galões azuis.',
          'Apenas líquidos congelados abaixo de 0 °C.',
        ],
        correctIndex: 0,
      },
      {
        id: 'nr20-q2',
        courseId: 'nr-20',
        order: 2,
        prompt: 'Por que tambores metálicos e caminhões-tanque devem ser aterrados durante o transbordo de combustíveis?',
        options: [
          'Para aumentar a pressão da bomba de descarga.',
          'Para dissipar a eletricidade estática acumulada pelo atrito do fluido e evitar faíscas de ignição.',
          'Para aquecer o combustível antes da descarga.',
          'Apenas para marcar a vaga de estacionamento.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr20-q3',
        courseId: 'nr-20',
        order: 3,
        prompt: 'O que significa o intervalo entre o LIE (Limite Inferior de Explosividade) e o LSE (Limite Superior de Explosividade)?',
        options: [
          'Faixa em que a concentração de vapor/gás inflamável no ar permite combustão ou explosão na presença de fonte de ignição.',
          'Horário de funcionamento permitido para o posto de abastecimento.',
          'Faixa segura onde não há nenhum risco de fogo.',
          'Pressão máxima suportada pela mangueira.',
        ],
        correctIndex: 0,
      },
      {
        id: 'nr20-q4',
        courseId: 'nr-20',
        order: 4,
        prompt: 'Qual a conduta correta antes de executar solda ou corte (trabalho a quente) próximo a área com histórico de inflamáveis?',
        options: [
          'Iniciar rapidamente para terminar antes que o gás se espalhe.',
          'Emitir Permissão de Trabalho (PT), purgar/ventilar recipientes, medir ausência de gases (0% LEL) e manter extintores de prontidão.',
          'Molhar apenas o chão com água.',
          'Desligar os alarmes de fumaça para evitar disparos falsos.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-23',
      slug: 'nr-23',
      nrCode: 'NR-23',
      title: 'Proteção Contra Incêndios e Combate a Incêndio',
      salesHeadline:
        'Certificação NR-23 completa: aprenda classes de fogo, extintores, hidrantes e plano de abandono de área',
      salesSubheadline:
        'Saiba agir nos primeiros minutos críticos de um princípio de incêndio sem erros fatais na escolha do extintor, com emissão instantânea de certificado em PDF.',
      promoTag: 'Essencial para todas as empresas · CIPA & Brigada',
      originalPriceCents: 13900,
      priceCents: 8900,
      enrolledCount: 2150,
      ratingAverage: 4.9,
      ratingCount: 374,
      guaranteeDays: 7,
      shortDescription:
        'Tetraedro do fogo, classes de incêndio (A, B, C, D, K), seleção de extintores, saídas de emergência e evacuação segura.',
      fullDescription:
        'A NR-23 determina que todos os empregadores adotem medidas de prevenção de incêndios em conformidade com a legislação estadual e as normas técnicas aplicáveis, além de providenciar informações aos trabalhadores sobre utilização dos equipamentos de combate ao incêndio, procedimentos para evacuação e dispositivos de alarme. O curso aborda teoria do fogo, métodos de extinção, classes A/B/C/D/K, inspeção e manuseio de extintores e hidrantes, sinalização e evacuação organizada.',
      workloadHours: 4,
      certificateValidityMonths: 12,
      targetAudience:
        'Colaboradores de todos os setores industriais, comerciais e canteiros de obras, membros da CIPA, porteiros, vigilantes e equipes de apoio à brigada.',
      notForAudience: [
        'Quem busca habilitação presencial exclusiva de Bombeiro Civil profissional (Lei 11.901/2009)',
      ],
      includedBonuses: [
        'Guia Visual de Seleção de Extintores por Classe de Incêndio (A, B, C, D e K)',
        'Checklist Mensal de Inspeção de Extintores, Mangueiras e Rotas de Fuga',
      ],
      learningOutcomes: [
        'Compreender os quatro elementos do Tetraedro do Fogo e os métodos de extinção',
        'Identificar corretamente as Classes de Incêndio A, B, C, D e K',
        'Selecionar e operar com segurança extintores de Água, PQS (BC/ABC), CO2 e Espuma',
        'Manter rotas de fuga desobstruídas e coordenar abandono de área em segurança',
      ],
      faq: [
        {
          question: 'Posso usar extintor de água em fogo envolvendo equipamentos elétricos ou óleo?',
          answer:
            'Nunca. A água conduz eletricidade (risco de choque fatal na Classe C) e afunda sob líquidos inflamáveis (espalhando as chamas na Classe B).',
        },
        {
          question: 'As portas das saídas de emergência podem ficar trancadas por fora com corrente durante o turno?',
          answer:
            'Jamais. A NR-23 proíbe trancar ou obstruir saídas de emergência durante a jornada de trabalho; elas devem abrir no sentido da saída com barra antipânico ou destravamento imediato.',
        },
      ],
      coverImageUrl: NR23_COVER_URL,
      bannerImageUrl: NR23_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 7,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-23-m1',
        courseId: 'nr-23',
        title: 'Módulo 1 · Teoria do Fogo, Propagação e Classes de Incêndio',
        description: 'Tetraedro do fogo, métodos de extinção e classificação A, B, C, D e K.',
        order: 1,
        lessons: [
          {
            id: 'nr23-l1',
            title: 'Tetraedro do Fogo e Classes de Incêndio (A, B, C, D, K)',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'A combustão sustentada depende de quatro elementos (Tetraedro do Fogo): Combustível, Comburente (Oxigênio), Calor e Reação em Cadeia. Extingue-se o fogo por resfriamento (retira calor), abafamento (retira oxigênio), isolamento (retira combustível) ou quebra da reação em cadeia.\n\nClasses de Incêndio:\n• Classe A: materiais sólidos fibrosos que deixam brasas (madeira, papel, tecido, plásticos). Combate principal por resfriamento (Água ou Pó ABC).\n• Classe B: líquidos e gases inflamáveis que queimam em superfície sem deixar resíduos (gasolina, álcool, tintas, GLP). Combate por abafamento/quebra de cadeia (Pó BC/ABC, CO2, Espuma).\n• Classe C: equipamentos e instalações elétricas energizadas. Exige agente não condutor (CO2 ou Pó Químico Seco).\n• Classe D: metais pirofóricos (magnésio, sódio, titânio) — exigem pós especiais secos.\n• Classe K: óleos e gorduras em cozinhas comerciais — requer agente químico úmido (acetato de potássio).',
          },
        ],
      },
      {
        id: 'nr-23-m2',
        courseId: 'nr-23',
        title: 'Módulo 2 · Extintores, Hidrantes e Abandono de Área (NR-23)',
        description: 'Inspeção de lacre/manômetro, técnica PASS de combate e evacuação.',
        order: 2,
        lessons: [
          {
            id: 'nr23-l2',
            title: 'Uso Correto de Extintores, Saídas de Emergência e Evacuação',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'Inspeção rápida do extintor:\n• Verificar se o acesso está totalmente desobstruído e sinalizado.\n• Conferir o ponteiro do manômetro na faixa verde (exceto CO2, que é verificado por pesagem).\n• Conferir lacre intacto e validade da recarga / teste hidrostático.\n\nTécnica de Aplicação:\n1. Posicione-se a favor do vento mantendo rota de fuga livre atrás de você.\n2. Rompa o lacre e retire o pino trava.\n3. Direcione o jato à BASE das chamas fazendo movimento em leque.\n\nRegras NR-23 de Abandono de Área:\n• Saídas nunca podem ser fechadas à chave ou bloqueadas por estoques.\n• Nunca utilizar elevadores durante incêndio.\n• Deslocar-se agachado em caso de fumaça densa e dirigir-se ao Ponto de Encontro.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr23-q1',
        courseId: 'nr-23',
        order: 1,
        prompt: 'Quais tipos de materiais pertencem à Classe A de incêndio e qual seu método principal de extinção?',
        options: [
          'Líquidos inflamáveis; extinção exclusiva com água em jato sólido.',
          'Materiais sólidos fibrosos que deixam brasas (madeira, papel, tecido); combate principal por resfriamento.',
          'Equipamentos elétricos energizados; combate com água.',
          'Metais pirofóricos como magnésio.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr23-q2',
        courseId: 'nr-23',
        order: 2,
        prompt: 'Para combater um princípio de incêndio em um painel elétrico energizado (Classe C), quais extintores são adequados?',
        options: [
          'Água Pressurizada ou Espuma Mecânica.',
          'CO2 (Gás Carbônico) ou Pó Químico Seco (PQS BC/ABC).',
          'Balde com água e sabão.',
          'Qualquer líquido refrigerante.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr23-q3',
        courseId: 'nr-23',
        order: 3,
        prompt: 'Ao utilizar um extintor portátil em um princípio de incêndio, para onde o jato deve ser direcionado?',
        options: [
          'Para o alto da fumaça.',
          'Para a base das chamas (onde está o material combustível), com movimento em leque.',
          'Para as paredes laterais distantes.',
          'Diretamente para o teto do galpão.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr23-q4',
        courseId: 'nr-23',
        order: 4,
        prompt: 'Segundo a NR-23, o que é terminantemente proibido em relação às saídas de emergência durante o horário de trabalho?',
        options: [
          'Sinalizá-las com placas fotoluminescentes.',
          'Fechá-las a chave, aferrolhá-las ou obstruí-las com materiais e paletes.',
          'Instalar barras antipânico.',
          'Manter iluminação de emergência funcionando.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-33-40h',
      slug: 'nr-33-40h',
      nrCode: 'NR-33 · 40h',
      title: 'Espaços Confinados – Trabalhadores Autorizados e Vigia (40h)',
      salesHeadline:
        'Formação completa NR-33 (40h) para Trabalhadores Autorizados e Vigia em Espaços Confinados',
      salesSubheadline:
        'Capacitação inicial obrigatória de 40h cobrindo identificação de espaços confinados, medição multigás (O2, LEL, CO, H2S), PET, bloqueio LOTO e procedimentos de resgate com emissão imediata de certificado.',
      promoTag: 'Formação Completa 40h · Trabalhadores Autorizados e Vigia',
      originalPriceCents: 31900,
      priceCents: 21900,
      enrolledCount: 1420,
      ratingAverage: 4.9,
      ratingCount: 236,
      guaranteeDays: 7,
      shortDescription:
        'Formação inicial de 40h para trabalhadores autorizados e vigia em espaço confinado: gases, PET, ventilação e salvamento.',
      fullDescription:
        'Capacitação teórica completa de 40 horas para Trabalhadores Autorizados e Vigias em Espaços Confinados (NR-33). Abrange reconhecimento e cadastro de espaços confinados, avaliação de riscos atmosféricos (deficiência/enriquecimento de O2, gases inflamáveis LEL, CO e H2S), emissão e encerramento da Permissão de Entrada e Trabalho (PET), bloqueio e etiquetagem (LOTO), ventilação mecânica, deveres do vigia e noções de emergência e resgate.',
      workloadHours: 40,
      certificateValidityMonths: 12,
      targetAudience:
        'Trabalhadores autorizados, vigias, operadores industriais, equipe de manutenção de tanques, silos, galerias e profissionais que necessitam da formação inicial de 40h na NR-33.',
      notForAudience: [
        'Quem já possui formação NR-33 ativa e precisa apenas da Reciclagem periódica de 16h',
        'Quem procura conteúdo superficial sem avaliação formal de aproveitamento',
      ],
      includedBonuses: [
        'Modelo comentado de Permissão de Entrada e Trabalho (PET) conforme NR-33',
        'Guia de Limites Seguros de Detector Multigás (O2, LEL, CO e H2S)',
        'Checklist completo de atribuições do Vigia e do Trabalhador Autorizado',
      ],
      learningOutcomes: [
        'Identificar, sinalizar e isolar espaços confinados conforme a NR-33',
        'Interpretar leituras de detector multigás em topo, meio e fundo',
        'Aplicar corretamente a Permissão de Entrada e Trabalho (PET) e bloqueio LOTO',
        'Atuar com segurança como Trabalhador Autorizado ou Vigia em situações normais e de emergência',
      ],
      faq: [
        {
          question: 'Qual a diferença entre a NR-33 de 40h e a Reciclagem de 16h?',
          answer:
            'A carga horária de 40h é voltada à formação completa/aprofundada para trabalhadores autorizados e vigia em espaço confinado, enquanto a de 16h atende trabalhadores autorizados e vigias na modalidade de reciclagem periódica.',
        },
        {
          question: 'O certificado menciona Trabalhadores Autorizados e Vigia em Espaço Confinado?',
          answer:
            'Sim. O texto oficial do certificado gerado em PDF informa explicitamente "para trabalhadores autorizados e vigia em espaço confinado" com carga horária de 40 horas.',
        },
      ],
      coverImageUrl: NR33_40H_COVER_URL,
      bannerImageUrl: NR33_40H_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 8,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-33-40h-m1',
        courseId: 'nr-33-40h',
        title: 'Módulo 1 · Legislação NR-33, Cadastro e Papéis Operacionais',
        description: 'Responsabilidades do empregador, Supervisor, Vigia e Trabalhador Autorizado.',
        order: 1,
        lessons: [
          {
            id: 'nr33-40h-l1',
            title: 'Definição, Reconhecimento e Gestão de Espaços Confinados',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'Espaço confinado é qualquer área não projetada para ocupação humana contínua, com meios limitados de entrada e saída e ventilação insuficiente para remover contaminantes ou manter níveis seguros de oxigênio.\n\nNa formação de 40h, estudamos o inventário completo de espaços confinados (tanques, silos, poços de visita, caldeiras, galerias e dutos), sinalização obrigatória e definição formal das responsabilidades de Trabalhadores Autorizados e Vigias.',
          },
          {
            id: 'nr33-40h-l2',
            title: 'Atribuições do Trabalhador Autorizado e do Vigia',
            type: 'text',
            durationMinutes: 90,
            order: 2,
            content:
              'O Trabalhador Autorizado deve conhecer os riscos do ambiente, utilizar corretamente os EPIs e manter comunicação constante com o Vigia.\n\nO Vigia permanece do lado externo durante toda a operação, controla o acesso, mantém contagem exata de pessoas no interior, monitora sinais de alarme e ordena evacuação imediata em qualquer situação anormal — nunca entrando para tentar resgate sem substituição e equipe de salvamento.',
          },
        ],
      },
      {
        id: 'nr-33-40h-m2',
        courseId: 'nr-33-40h',
        title: 'Módulo 2 · Atmosferas Perigosas, Multigás e PET',
        description: 'Limites de O2, inflamáveis, gases tóxicos, ventilação e emissão da PET.',
        order: 2,
        lessons: [
          {
            id: 'nr33-40h-l3',
            title: 'Monitoramento Atmosférico (O2, LEL, CO, H2S) e Ventilação',
            type: 'text',
            durationMinutes: 120,
            order: 1,
            content:
              'Os testes atmosféricos devem ocorrer em topo, meio e fundo antes e durante a permanência:\n• Oxigênio (O2): entre 19,5% e 23,0%.\n• Inflamáveis (LIE/LEL): abaixo de 10% do limite inferior de explosividade.\n• Gases tóxicos (CO e H2S): abaixo dos limites de tolerância.\n\nA ventilação mecânica (insuflação/exaustão) deve garantir renovação contínua do ar com ar atmosférico limpo — jamais utilizando oxigênio puro.',
          },
          {
            id: 'nr33-40h-l4',
            title: 'Permissão de Entrada e Trabalho (PET) e Bloqueio LOTO',
            type: 'text',
            durationMinutes: 90,
            order: 2,
            content:
              'Nenhuma entrada ocorre sem PET emitida e assinada para aquela jornada específica. Antes da abertura de linhas ou ingresso, aplicam-se bloqueios mecânicos, elétricos, pneumáticos e hidráulicos (LOTO) com cadeado e etiqueta individual.',
          },
        ],
      },
      {
        id: 'nr-33-40h-m3',
        courseId: 'nr-33-40h',
        title: 'Módulo 3 · Resgate, Emergências e Primeiros Socorros',
        description: 'Plano de salvamento, içamento por tripé e primeiros socorros em espaços confinados.',
        order: 3,
        lessons: [
          {
            id: 'nr33-40h-l5',
            title: 'Sistemas de Içamento, Plano de Salvamento e Primeiros Socorros',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'Em emergências, a equipe utiliza sistemas de resgate sem ingresso quando possível (tripé com guincho resgatador acoplado ao cinturão tipo paraquedista) ou equipe equipada com EPR autônomo. A capacitação inclui acionamento imediato, controle de cena e suporte básico à vida.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr33-40h-q1',
        courseId: 'nr-33-40h',
        order: 1,
        prompt: 'Qual a faixa segura de Oxigênio (O2) exigida antes da entrada em espaço confinado sem EPR autônomo?',
        options: [
          'Entre 15,0% e 18,5%.',
          'Entre 19,5% e 23,0%.',
          'Entre 24,0% e 28,0%.',
          'Abaixo de 19,0%.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-40h-q2',
        courseId: 'nr-33-40h',
        order: 2,
        prompt: 'Qual é o papel exclusivo e insubstituível do Vigia durante a execução de um serviço em espaço confinado?',
        options: [
          'Entrar no tanque para ajudar o trabalhador quando o espaço for amplo.',
          'Permanecer no exterior mantendo contagem e comunicação contínua com os trabalhadores e acionar resgate se necessário.',
          'Desligar o detector multigás após os primeiros 5 minutos.',
          'Alterar a PET sem comunicar o Supervisor de Entrada.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-40h-q3',
        courseId: 'nr-33-40h',
        order: 3,
        prompt: 'Por que a leitura de gases deve abranger topo, meio e fundo do espaço confinado?',
        options: [
          'Porque gases diferentes possuem densidades distintas em relação ao ar e podem estratificar em camadas.',
          'Apenas para registrar três horários diferentes no formulário.',
          'Porque o oxigênio não existe no fundo de nenhum tanque.',
          'Para testar se a mangueira do exaustor alcança o piso.',
        ],
        correctIndex: 0,
      },
      {
        id: 'nr33-40h-q4',
        courseId: 'nr-33-40h',
        order: 4,
        prompt: 'Qual é a validade da Permissão de Entrada e Trabalho (PET) segundo a NR-33?',
        options: [
          'Válida por 30 dias corridos.',
          'Válida para uma única entrada e deve ser encerrada ao término da atividade.',
          'Válida por 12 meses para toda a planta.',
          'Opcional quando o trabalho durar menos de 1 hora.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-40h-q5',
        courseId: 'nr-33-40h',
        order: 5,
        prompt: 'Antes de ingressar em tanque com agitador elétrico ou tubulação de vapor, o que deve ser feito?',
        options: [
          'Apenas avisar verbalmente a portaria.',
          'Realizar bloqueio, isolamento e etiquetagem (LOTO) de todas as fontes de energia e fluidos.',
          'Injetar oxigênio puro para resfriar o ambiente.',
          'Entrar sem cinturão para facilitar a passagem pela boca de visita.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-33',
      slug: 'nr-33',
      nrCode: 'NR-33 · 16h',
      title: 'Espaços Confinados – Reciclagem Autorizado e Vigia (16h)',
      salesHeadline:
        'Renove sua NR-33 Reciclagem (16h) para Trabalhadores Autorizados e Vigia em Espaço Confinado ainda hoje',
      salesSubheadline:
        'Atualização periódica de 16h com revisão de monitoramento atmosférico (O2, LEL, CO, H2S), PET, bloqueio LOTO e plano de salvamento, com emissão imediata de certificado válido.',
      promoTag: 'Reciclagem 16h · Trabalhadores Autorizados e Vigia',
      originalPriceCents: 22900,
      priceCents: 14900,
      enrolledCount: 1640,
      ratingAverage: 4.9,
      ratingCount: 284,
      guaranteeDays: 7,
      shortDescription:
        'Reciclagem de 16h para trabalhadores autorizados e vigias em espaço confinado: avaliação atmosférica, PET, ventilação e resgate.',
      fullDescription:
        'A NR-33 exige capacitação periódica (reciclagem) para trabalhadores autorizados e vigias que atuam em espaços confinados. Este treinamento de 16 horas revisa reconhecimento de riscos atmosféricos (O2, inflamáveis, CO e H2S), Permissão de Entrada e Trabalho (PET), bloqueio e etiquetagem (LOTO), deveres do vigia e procedimentos de emergência.',
      workloadHours: 16,
      certificateValidityMonths: 12,
      targetAudience:
        'Operadores industriais, trabalhadores autorizados e vigias de espaço confinado que precisam realizar a reciclagem periódica de 16h da NR-33.',
      notForAudience: [
        'Quem precisa da formação inicial/completa de 40h (escolha a opção NR-33 40h)',
        'Quem procura conteúdo sem avaliação formal de aproveitamento',
      ],
      includedBonuses: [
        'Modelo comentado de Permissão de Entrada e Trabalho (PET) conforme NR-33',
        'Guia de Limites Seguros de Detector Multigás (O2, LEL, CO e H2S)',
        'Checklist de deveres do Vigia antes, durante e após a entrada',
        'Suporte técnico para dúvidas sobre validação documental no eSocial',
      ],
      learningOutcomes: [
        'Identificar e caracterizar espaços confinados conforme critérios da NR-33',
        'Interpretar leituras de detector multigás (O2, LEL, CO e H2S)',
        'Preencher e auditar a Permissão de Entrada e Trabalho (PET)',
        'Executar isolamento de energias perigosas, ventilação forçada e comunicação com vigia',
      ],
      faq: [
        {
          question: 'Qual a validade do certificado da NR-33 Reciclagem 16h?',
          answer:
            'A reciclagem da NR-33 deve ser realizada periodicamente a cada 12 meses (1 ano), conforme exigência da norma.',
        },
        {
          question: 'O certificado informa que é para trabalhadores autorizados e vigia?',
          answer:
            'Sim. O certificado impresso em PDF informa explicitamente "para trabalhadores autorizados e vigia em espaço confinado" na modalidade Reciclagem (16 horas).',
        },
        {
          question: 'Posso escolher a NR-33 de 40h em vez da de 16h?',
          answer:
            'Sim! Na página do curso ou no checkout você pode alternar entre a Formação de 40h e a Reciclagem de 16h conforme a exigência da sua empresa.',
        },
      ],
      coverImageUrl: NR33_COVER_URL,
      bannerImageUrl: NR33_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 9,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-33-m1',
        courseId: 'nr-33',
        title: 'Módulo 1 · Caracterização, Atmosferas Perigosas e PET',
        description: 'Definição legal de espaço confinado, gases tóxicos, deficiência/enriquecimento de O2 e PET.',
        order: 1,
        lessons: [
          {
            id: 'nr33-l1',
            title: 'O que define um Espaço Confinado na NR-33',
            type: 'text',
            durationMinutes: 55,
            order: 1,
            content:
              'Espaço confinado é qualquer área ou ambiente não projetado para ocupação humana contínua, que possua meios limitados de entrada e saída, cuja ventilação existente é insuficiente para remover contaminantes ou onde possa existir a deficiência ou enriquecimento de oxigênio.\n\nExemplos comuns:\n• Tanques, silos, caldeiras, vasos de pressão.\n• Galerias subterrâneas, poços de visita, tubulações.\n• Fosso de elevadores, dutos e reservatórios.\n\nPapéis fundamentais na operação:\n1. Responsável Técnico\n2. Supervisor de Entrada (emite a PET)\n3. Vigia (permanece fora, em contato contínuo)\n4. Trabalhador Autorizado (executa a atividade interna).',
          },
          {
            id: 'nr33-l2',
            title: 'Monitoramento Atmosférico e Limites Seguros',
            type: 'text',
            durationMinutes: 60,
            order: 2,
            content:
              'Antes de qualquer ingresso, o Supervisor de Entrada deve realizar testes atmosféricos em diferentes níveis (topo, meio e fundo) com detector multigás calibrado.\n\nParâmetros de referência:\n• Oxigênio (O2): faixa segura entre 19,5% e 23,0%. Abaixo de 19,5% há risco de asfixia; acima de 23% há risco de incêndio/explosão.\n• Gases inflamáveis: abaixo de 10% do Limite Inferior de Explosividade (LIE / LEL).\n• Monóxido de Carbono (CO) e Sulfeto de Hidrogênio (H2S): dentro dos limites de tolerância previstos na NR-15.\n\nJamais utilize oxigênio puro para ventilar um espaço confinado; utilize insuflação/exaustão com ar atmosférico limpo.',
          },
        ],
      },
      {
        id: 'nr-33-m2',
        courseId: 'nr-33',
        title: 'Módulo 2 · Deveres do Vigia, Bloqueios e Resgate',
        description: 'Atuação permanente do vigia, bloqueio de energias (LOTO) e plano de salvamento.',
        order: 2,
        lessons: [
          {
            id: 'nr33-l3',
            title: 'Responsabilidades do Vigia e Permissão de Entrada e Trabalho (PET)',
            type: 'text',
            durationMinutes: 50,
            order: 1,
            content:
              'A Permissão de Entrada e Trabalho (PET) é o documento escrito que autoriza a entrada em espaço confinado, válida apenas para uma única entrada e devendo ser encerrada ao término dos serviços.\n\nO Vigia NUNCA deve entrar no espaço confinado para tentar resgatar um colega sem antes acionar a equipe de salvamento e ser substituído por outro vigia qualificado. Suas atribuições incluem manter contagem exata dos trabalhadores, controlar o acesso e ordenar abandono imediato ao detectar qualquer condição de risco.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr33-q1',
        courseId: 'nr-33',
        order: 1,
        prompt: 'Qual a faixa segura de concentração de Oxigênio (O2) para entrada em espaço confinado sem proteção respiratória autônoma?',
        options: [
          'Entre 14,0% e 18,0%.',
          'Entre 19,5% e 23,0%.',
          'Acima de 25,0%.',
          'Qualquer valor acima de 10,0%.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-q2',
        courseId: 'nr-33',
        order: 2,
        prompt: 'Quem tem a responsabilidade de emitir e assinar a Permissão de Entrada e Trabalho (PET)?',
        options: [
          'O próprio trabalhador autorizado.',
          'O Supervisor de Entrada.',
          'O porteiro da fábrica.',
          'Qualquer integrante da CIPA sem treinamento específico.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-q3',
        courseId: 'nr-33',
        order: 3,
        prompt: 'Em caso de emergência com um trabalhador desacordado dentro do espaço confinado, o que o Vigia deve fazer primeiro?',
        options: [
          'Entrar imediatamente sem equipamento para puxar o colega.',
          'Acionar a equipe de resgate/emergência e permanecer em seu posto mantendo a monitoração externa.',
          'Fechar a tampa de acesso para conter gases.',
          'Injetar oxigênio puro dentro do tanque.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr33-q4',
        courseId: 'nr-33',
        order: 4,
        prompt: 'Por que a medição atmosférica deve ser feita no topo, meio e fundo do espaço confinado?',
        options: [
          'Apenas para gastar bateria do aparelho.',
          'Porque diferentes gases têm densidades distintas e podem se acumular no topo (metano), no meio (CO) ou no fundo (H2S).',
          'Para verificar a temperatura da parede metálica.',
          'Não é necessário medir no fundo, apenas na boca de visita.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-35-40h',
      slug: 'nr-35-40h',
      nrCode: 'NR-35 · 40h',
      title: 'Trabalho em Altura – Formação Completa (40h)',
      salesHeadline:
        'Formação completa NR-35 (40h) com certificação avançada para obras, plantas industriais e paradas de manutenção',
      salesSubheadline:
        'Treinamento teórico aprofundado de 40h conforme NR-35, cobrindo Análise de Risco (AR), Permissão de Trabalho, sistemas de ancoragem, linhas de vida, cálculo de ZLQ e resgate em altura.',
      promoTag: 'Formação Completa 40h · Certificado válido em todo o Brasil',
      originalPriceCents: 27900,
      priceCents: 18900,
      enrolledCount: 1960,
      ratingAverage: 4.9,
      ratingCount: 310,
      guaranteeDays: 7,
      shortDescription:
        'Capacitação completa de 40h em Trabalho em Altura: planejamento, AR/PT, ancoragens, linhas de vida, cálculo de ZLQ e resgate.',
      fullDescription:
        'O curso completo de 40 horas da NR-35 é indicado para profissionais que precisam de carga horária estendida em Trabalho em Altura para contratos industriais, energia, telecomunicações, construção pesada e supervisão de frentes acima de 2 metros. Abrange legislação NR-35 e NR-01, condições impeditivas, AR e PT, seleção e inspeção de SPIQ/EPC, engenharia básica de pontos de ancoragem, cálculo de Fator de Queda e Zona Livre de Queda (ZLQ), suspensão inerte e técnicas de salvamento.',
      workloadHours: 40,
      certificateValidityMonths: 24,
      targetAudience:
        'Montadores industriais, técnicos de energia eólica/solar, eletricistas de linha viva/torre, trabalhadores de construção pesada e líderes de obra que necessitam da NR-35 de 40 horas.',
      notForAudience: [
        'Quem já possui formação NR-35 e precisa apenas da Reciclagem de 8h',
        'Quem busca certificado sem passar pela avaliação formal de aproveitamento',
      ],
      includedBonuses: [
        'Checklist completo de Inspeção Prévia de Cinturão, Talabarte, Trava-Quedas e Ancoragens',
        'Modelos prontos de Análise de Risco (AR) e Permissão de Trabalho (PT)',
        'Planilha de cálculo rápido de Zona Livre de Queda (ZLQ) e Fator de Queda',
      ],
      learningOutcomes: [
        'Planejar e supervisionar frentes de trabalho acima de 2,00m com AR e PT completas',
        'Dimensionar sistemas de ancoragem, linhas de vida rígidas/flexíveis e ZLQ',
        'Especificar e inspecionar todo o Sistema de Proteção Individual contra Quedas (SPIQ)',
        'Conduzir protocolos de resgate e prevenção da síndrome da suspensão inerte',
      ],
      faq: [
        {
          question: 'Quando escolher a NR-35 de 40h em vez da Reciclagem de 8h?',
          answer:
            'Escolha a de 40h quando a contratante, planta industrial ou edital exigir formação ampliada (40h) para trabalho em altura. Caso já possua NR-35 e queira apenas a carga horária básica ou reciclagem bienal, utilize a opção NR-35 de 8h.',
        },
        {
          question: 'A carga horária de 40 horas vem especificada no certificado PDF?',
          answer:
            'Sim. O certificado PDF exibe "NR-35 | TRABALHO EM ALTURA – FORMAÇÃO COMPLETA (40H)", carga horária de 40 horas, conteúdo programático completo e código de validação.',
        },
      ],
      coverImageUrl: NR35_40H_COVER_URL,
      bannerImageUrl: NR35_40H_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 10,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-35-40h-m1',
        courseId: 'nr-35-40h',
        title: 'Módulo 1 · Gestão, Planejamento, AR e Permissão de Trabalho',
        description: 'Fundamentos da NR-35, responsabilidades, condições impeditivas, AR e PT.',
        order: 1,
        lessons: [
          {
            id: 'nr35-40h-l1',
            title: 'Escopo da NR-35, Direito de Recusa e Condições Impeditivas',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'Trabalho em altura compreende toda atividade executada acima de 2,00 m do nível inferior onde haja risco de queda.\n\nNa formação de 40h aprofundamos o gerenciamento das condições impeditivas (ventos excessivos, chuva, descargas atmosféricas, falta de ponto de ancoragem certificado e ausência de aptidão clínica no ASO) e a aplicação do Direito de Recusa pelo trabalhador.',
          },
          {
            id: 'nr35-40h-l2',
            title: 'Elaboração Detalhada de AR e Permissão de Trabalho (PT)',
            type: 'text',
            durationMinutes: 90,
            order: 2,
            content:
              'A Análise de Risco (AR) avalia entorno, riscos de queda de materiais, redes energizadas próximas e sistemas de proteção coletiva. Para atividades não rotineiras, emite-se Permissão de Trabalho (PT) com validade restrita à jornada e à equipe envolvida.',
          },
        ],
      },
      {
        id: 'nr-35-40h-m2',
        courseId: 'nr-35-40h',
        title: 'Módulo 2 · SPIQ, Ancoragens, Linhas de Vida e ZLQ',
        description: 'Sistemas de proteção coletiva, ancoragens, Fator de Queda e cálculo da ZLQ.',
        order: 2,
        lessons: [
          {
            id: 'nr35-40h-l3',
            title: 'Pontos de Ancoragem, Linhas de Vida e Fator de Queda',
            type: 'text',
            durationMinutes: 120,
            order: 1,
            content:
              'Todo Sistema de Proteção Individual contra Quedas (SPIQ) depende de ancoragem dimensionada com resistência mínima de 15 kN para um trabalhador, elemento de ligação com absorvedor de energia e cinturão tipo paraquedista.\n\nEstudamos o cálculo exato da Zona Livre de Queda (ZLQ) considerando comprimento do talabarte, abertura do absorvedor (até 1,75 m), altura do trabalhador e margem mínima de segurança de 1 metro.',
          },
        ],
      },
      {
        id: 'nr-35-40h-m3',
        courseId: 'nr-35-40h',
        title: 'Módulo 3 · Emergência, Suspensão Inerte e Resgate Técnico',
        description: 'Plano de emergência em altura, fita anti-trauma e procedimentos de salvamento.',
        order: 3,
        lessons: [
          {
            id: 'nr35-40h-l4',
            title: 'Prevenção da Suspensão Inerte e Protocolos de Resgate',
            type: 'text',
            durationMinutes: 90,
            order: 1,
            content:
              'Trabalhadores retidos pelo cinturão após queda devem acionar imediatamente a equipe de resgate e utilizar fita anti-trauma para aliviar a compressão arterial femoral até a descida controlada e atendimento médico em posição semi-sentada.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr35-40h-q1',
        courseId: 'nr-35-40h',
        order: 1,
        prompt: 'A partir de qual desnível em relação ao nível inferior a NR-35 considera Trabalho em Altura?',
        options: [
          'Acima de 1,20 metro.',
          'Acima de 2,00 metros com risco de queda.',
          'Apenas acima de 3,50 metros.',
          'Somente em coberturas sem platibanda acima de 5 metros.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr35-40h-q2',
        courseId: 'nr-35-40h',
        order: 2,
        prompt: 'Qual a resistência estática mínima recomendada para um ponto de ancoragem individual em SPIQ de retenção de queda?',
        options: [
          '3 kN.',
          '15 kN (aprox. 1.500 kgf).',
          '5 kN sem absorvedor.',
          'Qualquer tubulação de PVC próxima.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr35-40h-q3',
        courseId: 'nr-35-40h',
        order: 3,
        prompt: 'Por que o absorvedor de energia é obrigatório em talabartes de retenção de queda com Fator de Queda 1 ou 2?',
        options: [
          'Para aumentar a velocidade da queda.',
          'Para dissipar a energia cinética e limitar a força de impacto transmitida ao corpo do trabalhador (máx. 6 kN).',
          'Para substituir o cinturão tipo paraquedista.',
          'Apenas por exigência estética do fabricante.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr35-40h-q4',
        courseId: 'nr-35-40h',
        order: 4,
        prompt: 'O que é a Síndrome da Suspensão Inerte?',
        options: [
          'Cansaço leve após subir escadas.',
          'Comprometimento circulatório grave causado pela imobilidade prolongada suspenso nas fitas do cinturão após queda.',
          'Excesso de vento durante o içamento de cargas.',
          'Falta de inspeção visual no capacete.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr35-40h-q5',
        courseId: 'nr-35-40h',
        order: 5,
        prompt: 'Antes de iniciar qualquer trabalho não rotineiro acima de 2 metros, quais documentos são obrigatórios?',
        options: [
          'Apenas recibo de compra do EPI.',
          'Análise de Risco (AR) e Permissão de Trabalho (PT).',
          'Contrato social da contratante.',
          'Nenhum documento quando houver escada portátil.',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    course: {
      id: 'nr-35',
      slug: 'nr-35',
      nrCode: 'NR-35 · 8h',
      title: 'Trabalho em Altura – Reciclagem (8h)',
      salesHeadline:
        'Emita hoje sua NR-35 Reciclagem (8h) válida em todo o Brasil e entre em obra sem barreiras na portaria',
      salesSubheadline:
        'Treinamento teórico de reciclagem (8h) conforme a NR-35 e Portaria MTE, com acesso imediato após o Pix, prova formal objetiva e certificado em PDF assinado por Engenheiro de Segurança do Trabalho.',
      promoTag: 'Reciclagem 8h · Mais procurado com acesso imediato após Pix',
      originalPriceCents: 18900,
      priceCents: 11900,
      enrolledCount: 2480,
      ratingAverage: 4.9,
      ratingCount: 418,
      guaranteeDays: 7,
      shortDescription:
        'Reciclagem de 8h para planejamento, organização e execução segura de atividades acima de 2 metros com risco de queda.',
      fullDescription:
        'O treinamento de reciclagem da NR-35 (8 horas) atualiza profissionais que atuam acima de 2,00 metros do nível inferior, onde haja risco de queda. O conteúdo cobre Análise de Risco (AR), Permissão de Trabalho (PT), seleção e inspeção de EPIs contra quedas, sistemas de ancoragem, fator de queda, zona livre de queda e noções de resgate e primeiros socorros conforme atualização vigente do Ministério do Trabalho e Emprego.',
      workloadHours: 8,
      certificateValidityMonths: 24,
      targetAudience:
        'Trabalhadores da construção civil, manutenção industrial, energia solar, telecomunicações, pintores prediais e eletricistas que precisam da NR-35 de 8h (reciclagem/atualização).',
      notForAudience: [
        'Quem precisa da carga horária estendida de 40h (selecione a opção NR-35 40h)',
        'Quem busca apenas um certificado impresso sem realizar estudo nem avaliação formal de aproveitamento',
        'Menores de 18 anos ou profissionais sem aptidão médica (ASO para trabalho em altura)',
      ],
      includedBonuses: [
        'Checklist editável de Inspeção Prévia de Cinturão, Talabarte e Trava-Quedas',
        'Modelo pronto de Análise de Risco (AR) e Permissão de Trabalho (PT) em PDF',
        'Tabela rápida de cálculo de Zona Livre de Queda (ZLQ) e Fator de Queda',
        'Acesso por 12 meses para revisões e consulta pública vitalícia do certificado',
      ],
      learningOutcomes: [
        'Elaborar e interpretar a Análise de Risco (AR) e Permissão de Trabalho (PT)',
        'Calcular Zona Livre de Queda (ZLQ) e identificar Fator de Queda (0, 1 e 2)',
        'Selecionar, inspecionar e utilizar cinturão tipo paraquedista, talabarte e trava-quedas',
        'Aplicar procedimentos de emergência, suspensão inerte e resgate em altura',
      ],
      faq: [
        {
          question: 'Posso escolher entre a NR-35 de 40h e a de 8h (Reciclagem)?',
          answer:
            'Sim! Disponibilizamos tanto a Formação Completa de 40h quanto a Reciclagem de 8h, cada uma com seu valor específico e carga horária impressa corretamente no certificado.',
        },
        {
          question: 'O certificado de NR-35 online é aceito em empresas, portarias e fiscalizações?',
          answer:
            'Sim. A NR-01 autoriza o ensino a distância (EAD) para o conteúdo teórico das Normas Regulamentadoras. O certificado da 4k Treinamentos traz assinatura e registro CREA/MTE do Engenheiro Instrutor, conteúdo programático completo e código verificável em /validar.',
        },
        {
          question: 'Em quanto tempo recebo o certificado após comprar?',
          answer:
            'No pagamento via Pix ou cartão aprovado, o curso é liberado na hora na Área do Aluno. Assim que você estudar os módulos e atingir 70% na prova formal, o PDF é gerado instantaneamente.',
        },
        {
          question: 'E se eu não passar na prova de primeira?',
          answer:
            'Você pode revisar as aulas e refazer a avaliação sem custo adicional até atingir a nota mínima exigida.',
        },
        {
          question: 'Qual a validade do certificado NR-35?',
          answer:
            'A reciclagem periódica da NR-35 deve ocorrer a cada 2 anos (24 meses), ou sempre que houver mudança nos procedimentos ou retorno de afastamento superior a 90 dias.',
        },
      ],
      coverImageUrl: NR35_COVER_URL,
      bannerImageUrl: NR35_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 11,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-35-m1',
        courseId: 'nr-35',
        title: 'Módulo 1 · Normas, Responsabilidades e Análise de Risco',
        description: 'Fundamentos legais da NR-35, deveres do empregador e trabalhador, AR e PT.',
        order: 1,
        lessons: [
          {
            id: 'nr35-l1',
            title: 'Introdução à NR-35 e Definição de Trabalho em Altura',
            type: 'text',
            durationMinutes: 45,
            order: 1,
            content:
              'A Norma Regulamentadora nº 35 estabelece os requisitos e as medidas de prevenção para o trabalho em altura, envolvendo o planejamento, a organização e a execução.\n\nConsidera-se trabalho em altura toda atividade executada acima de 2,00 m (dois metros) do nível inferior, onde haja risco de queda.\n\nResponsabilidades do Empregador:\n• Garantir a implementação das medidas de proteção estabelecidas na NR-35.\n• Assegurar a realização da Análise de Risco (AR) e, quando aplicável, a emissão da Permissão de Trabalho (PT).\n• Desenvolver procedimento operacional para as atividades rotineiras de trabalho em altura.\n• Assegurar a realização de avaliação prévia das condições no local do trabalho em altura.\n\nResponsabilidades do Trabalhador:\n• Cumprir as disposições legais e regulamentares sobre trabalho em altura.\n• Colaborar com o empregador na implementação das disposições contidas na norma.\n• Interromper suas atividades exercendo o direito de recusa sempre que constatar evidências de riscos graves e iminentes.',
          },
          {
            id: 'nr35-l2',
            title: 'Análise de Risco (AR) e Permissão de Trabalho (PT)',
            type: 'text',
            durationMinutes: 50,
            order: 2,
            content:
              'Todo trabalho em altura deve ser precedido de Análise de Risco (AR).\n\nA AR deve considerar:\n1. O local em que os serviços serão executados e seu entorno.\n2. O isolamento e a sinalização no entorno da área de trabalho.\n3. O estabelecimento dos sistemas e pontos de ancoragem.\n4. As condições meteorológicas adversas (ventos fortes, chuva, descargas atmosféricas).\n5. A seleção, inspeção, forma de utilização e limitação de uso dos sistemas de proteção coletiva e individual.\n\nPara atividades não rotineiras, as medidas de controle devem ser evidenciadas na Análise de Risco e na Permissão de Trabalho (PT), que tem validade limitada à duração da atividade.',
          },
        ],
      },
      {
        id: 'nr-35-m2',
        courseId: 'nr-35',
        title: 'Módulo 2 · Equipamentos, Fator de Queda e Resgate',
        description: 'Cinturão paraquedista, cálculo de ZLQ, síndrome da suspensão inerte e emergência.',
        order: 2,
        lessons: [
          {
            id: 'nr35-l3',
            title: 'SPIQ, Fator de Queda e Zona Livre de Queda (ZLQ)',
            type: 'text',
            durationMinutes: 60,
            order: 1,
            content:
              'O Sistema de Proteção Individual contra Quedas (SPIQ) é composto por sistema de ancoragem, elemento de ligação (talabarte com absorvedor de energia ou trava-quedas) e cinturão de segurança tipo paraquedista.\n\nFator de Queda (FQ):\nÉ a razão entre a distância que o trabalhador percorreria na queda e o comprimento do equipamento que irá detê-lo:\n• Fator de Queda 0: ponto de ancoragem acima da cabeça (menor impacto).\n• Fator de Queda 1: ponto de ancoragem na altura do peito/dorsal.\n• Fator de Queda 2: ponto de ancoragem na altura dos pés (maior impacto, exige absorvedor de energia obrigatório).\n\nZona Livre de Queda (ZLQ):\nÉ a distância mínima medida do ponto de ancoragem até o solo ou obstáculo inferior, considerando comprimento do talabarte, extensão do absorvedor de energia (até 1,75 m), estatura do trabalhador e margem de segurança de 1 metro.',
          },
          {
            id: 'nr35-l4',
            title: 'Noções de Resgate e Síndrome da Suspensão Inerte',
            type: 'text',
            durationMinutes: 45,
            order: 2,
            content:
              'Após a retenção de uma queda, o trabalhador fica suspenso pelo cinturão. Se permanecer imóvel por mais de 15 a 20 minutos, a compressão das artérias femorais pelas fitas das pernas reduz o retorno venoso, podendo levar ao choque ortostático (Síndrome da Suspensão Inerte).\n\nProcedimento Imediato:\n• Acionar imediatamente a equipe de resgate da empresa.\n• Manter o trabalhador consciente e orientá-lo a movimentar as pernas ou apoiar-se em fita anti-trauma.\n• Após o resgate, não deitar a vítima bruscamente na horizontal; mantê-la em posição semi-sentada por alguns minutos antes de atendimento médico.',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'nr35-q1',
        courseId: 'nr-35',
        order: 1,
        prompt: 'A partir de qual altura em relação ao nível inferior a NR-35 considera uma atividade como Trabalho em Altura?',
        options: [
          'Acima de 1,50 metro, desde que haja uso de escada.',
          'Acima de 2,00 metros do nível inferior, onde haja risco de queda.',
          'Acima de 3,00 metros em obras industriais e 4,00 metros em residências.',
          'Apenas acima de 5,00 metros em telhados sem platibanda.',
        ],
        correctIndex: 1,
      },
      {
        id: 'nr35-q2',
        courseId: 'nr-35',
        order: 2,
        prompt: 'Qual documento deve preceder obrigatoriamente qualquer trabalho em altura para identificar perigos e medidas de controle?',
        options: [
          'Apenas o registro de ponto eletrônico.',
          'Laudo de Insalubridade anual.',
          'Análise de Risco (AR) e, para atividades não rotineiras, Permissão de Trabalho (PT).',
          'Nota fiscal de compra dos equipamentos.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr35-q3',
        courseId: 'nr-35',
        order: 3,
        prompt: 'Quando o ponto de ancoragem está posicionado acima da cabeça do trabalhador, qual é o Fator de Queda aproximado?',
        options: [
          'Fator de Queda menor que 1 (próximo a 0).',
          'Fator de Queda 2 (máximo impacto).',
          'Fator de Queda 4.',
          'Não existe fator de queda em ancoragens aéreas.',
        ],
        correctIndex: 0,
      },
      {
        id: 'nr35-q4',
        courseId: 'nr-35',
        order: 4,
        prompt: 'Sobre a Zona Livre de Queda (ZLQ), é correto afirmar que:',
        options: [
          'É a largura lateral da área isolada no térreo.',
          'Considera apenas o comprimento do cinturão abdominal.',
          'É a distância vertical mínima necessária abaixo da ancoragem para evitar colisão com o solo ou obstáculos.',
          'Só precisa ser calculada em trabalhos com andaime fachadeiro.',
        ],
        correctIndex: 2,
      },
      {
        id: 'nr35-q5',
        courseId: 'nr-35',
        order: 5,
        prompt: 'O que caracteriza o Direito de Recusa previsto na NR-35?',
        options: [
          'Recusar o treinamento periódico por já possuir experiência prática.',
          'Interromper a atividade ao constatar evidências de riscos graves e iminentes para sua segurança ou de outras pessoas.',
          'Escolher não usar capacete com jugular em dias quentes.',
          'Substituir o cinturão tipo paraquedista por cinto abdominal.',
        ],
        correctIndex: 1,
      },
    ],
  },
];

export const SEED_FUNNEL_OFFERS: Omit<FunnelOffer, 'updatedAt'>[] = [
  {
    id: 'bump-nr06-checkout',
    type: 'order_bump',
    title: 'Adicionar NR-06 – EPIs (4h) com 43% OFF',
    subtitle: 'Mais vendido como complemento de portaria',
    description:
      'Leve também o certificado de Equipamentos de Proteção Individual (NR-06) por um valor exclusivo de checkout e apresente a documentação completa na integração da empresa.',
    triggerCourseId: 'all',
    includedCourseIds: ['nr-06'],
    originalPriceCents: 6900,
    offerPriceCents: 3900,
    badgeLabel: 'Oferta exclusiva de checkout',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'bump-nr23-para-nr20',
    type: 'order_bump',
    title: 'Adicionar NR-23 – Combate a Incêndio (4h) com 44% OFF',
    subtitle: 'Complemento direto para quem atua com inflamáveis',
    description:
      'Complete sua capacitação de NR-20 adicionando NR-23 Combate a Incêndio por apenas R$ 49,00 e domine seleção de extintores e evacuação de emergência.',
    triggerCourseId: 'nr-20',
    includedCourseIds: ['nr-23'],
    originalPriceCents: 8900,
    offerPriceCents: 4900,
    badgeLabel: 'Recomendado junto com NR-20',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'bump-nr35-para-nr33',
    type: 'order_bump',
    title: 'Adicionar NR-35 – Trabalho em Altura (8h) com desconto',
    subtitle: 'Combinação exigida em acessos verticais a tanques e silos',
    description:
      'Muitos espaços confinados exigem ingresso com linha de vida vertical ou tripé acima de 2 metros. Inclua a NR-35 agora com 33% de desconto.',
    triggerCourseId: 'nr-33',
    includedCourseIds: ['nr-35'],
    originalPriceCents: 11900,
    offerPriceCents: 7900,
    badgeLabel: 'Recomendado junto com NR-33',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'upsell-nr33-pos-nr35',
    type: 'upsell',
    title: 'Complete sua qualificação: NR-33 Espaços Confinados (16h) com 40% OFF',
    subtitle: 'Oferta única pós-matrícula válida apenas agora',
    description:
      'Profissionais certificados em Trabalho em Altura (NR-35) que também possuem NR-33 têm acesso imediato às vagas de parada industrial e manutenção de plantas. Aproveite esta condição única antes de ir para a Área do Aluno.',
    triggerCourseId: 'nr-35',
    includedCourseIds: ['nr-33'],
    originalPriceCents: 14900,
    offerPriceCents: 8900,
    badgeLabel: 'Oferta única pós-compra',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'upsell-nr35-pos-geral',
    type: 'upsell',
    title: 'Adicione NR-35 – Trabalho em Altura (8h) por apenas R$ 69,00',
    subtitle: 'Condição exclusiva de aluno já matriculado',
    description:
      'Garanta a norma mais exigida do Brasil com 42% de desconto e receba dois certificados digitais válidos na mesma conta da Área do Aluno.',
    triggerCourseId: 'all',
    includedCourseIds: ['nr-35'],
    originalPriceCents: 11900,
    offerPriceCents: 6900,
    badgeLabel: 'Oferta única pós-compra',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'combo-seguranca-completa',
    type: 'combo',
    title: 'Combo Segurança Completa · NR-35 + NR-33 + NR-06',
    subtitle: '28 horas totais · 3 Certificados Digitais Oficiais',
    description:
      'O pacote definitivo para trabalhadores industriais, terceirizados e manutenção. Inclui Trabalho em Altura (NR-35), Espaços Confinados (NR-33) e EPIs (NR-06) com economia de R$ 108,00.',
    triggerCourseId: 'all',
    includedCourseIds: ['nr-35', 'nr-33', 'nr-06'],
    originalPriceCents: 33700,
    offerPriceCents: 22900,
    badgeLabel: 'Pacote mais vantajoso · Economize R$ 108',
    active: true,
    displayOrder: 6,
  },
  {
    id: 'combo-industria-eletrica',
    type: 'combo',
    title: 'Combo Indústria & Elétrica · NR-10 Básico + NR-12 + NR-11',
    subtitle: '56 horas totais · 3 Certificados Digitais Oficiais',
    description:
      'Formação estratégica para eletricistas, mantenedores industriais e operadores logísticos. Reúne Eletricidade NR-10 (40h), Máquinas NR-12 (8h) e Movimentação de Materiais NR-11 (8h).',
    triggerCourseId: 'all',
    includedCourseIds: ['nr-10', 'nr-12', 'nr-11'],
    originalPriceCents: 39700,
    offerPriceCents: 26900,
    badgeLabel: 'Pacote Indústria · Economize R$ 128',
    active: true,
    displayOrder: 7,
  },
  {
    id: 'combo-prevencao-emergencia',
    type: 'combo',
    title: 'Combo Prevenção & Obra · NR-20 + NR-23 + NR-18',
    subtitle: '20 horas totais · 3 Certificados Digitais Oficiais',
    description:
      'Ideal para equipes de segurança patrimonial, obras industriais, depósitos e combate a emergências com inflamáveis e incêndios.',
    triggerCourseId: 'all',
    includedCourseIds: ['nr-20', 'nr-23', 'nr-18'],
    originalPriceCents: 31700,
    offerPriceCents: 21900,
    badgeLabel: 'Pacote Prevenção · Economize R$ 98',
    active: true,
    displayOrder: 8,
  },
];

export const SEED_TESTIMONIALS: Omit<Testimonial, 'updatedAt'>[] = [
  {
    id: 'test-nr35-1',
    courseId: 'nr-35',
    authorName: 'Marcelo Vasconcelos',
    authorRole: 'Técnico de Segurança do Trabalho',
    company: 'Construtora Vale Verde',
    rating: 5,
    quote:
      'Precisávamos regularizar 18 montadores para acesso a uma planta industrial em Cubatão. Fizemos NR-35 e NR-06 aqui e apresentamos todos os certificados com código de validação na portaria sem nenhuma ressalva.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 1,
  },
  {
    id: 'test-nr10-1',
    courseId: 'nr-10',
    authorName: 'Eduardo Siqueira Lima',
    authorRole: 'Eletrotécnico Industrial',
    company: 'EletroSul Manutenção',
    rating: 5,
    quote:
      'O curso NR-10 Básico de 40h explica os 6 passos de desenergização e Zonas de Risco com clareza impressionante. Emiti meu certificado com registro CREA do engenheiro no mesmo dia da prova.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 2,
  },
  {
    id: 'test-nr33-1',
    courseId: 'nr-33',
    authorName: 'Fernanda Albuquerque',
    authorRole: 'Supervisora de Manutenção Industrial',
    company: 'Metalúrgica São Bento',
    rating: 5,
    quote:
      'O módulo de detector multigás e PET da NR-33 é muito claro e técnico. Também treinamos nossa brigada na NR-23 e os operadores na NR-11 com total aprovação do nosso SESMT.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 3,
  },
  {
    id: 'test-nr35-2',
    courseId: 'nr-35',
    authorName: 'Rafael Almeida Duarte',
    authorRole: 'Instalador Solar Autônomo',
    company: 'Duarte Energia Fotovoltaica',
    rating: 5,
    quote:
      'Antes eu perdia dois dias de serviço para renovar NR-35 presencial. Aqui estudei à noite pelo celular, fiz a prova formal de ZLQ e fator de queda e baixei meu PDF assinado na hora.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 4,
  },
  {
    id: 'test-all-1',
    courseId: 'all',
    authorName: 'Eng. Henrique Tavares',
    authorRole: 'Coordenador de Obras',
    company: 'Tavares Engenharia',
    rating: 5,
    quote:
      'A validação pública pelo código no site facilita demais a conferência na entrada da obra. Passa total confiança para contratantes e fiscais.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 5,
  },
];

export function formatCurrencyBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatInstallmentBRL(cents: number, installments = 12): string {
  const perMonth = Math.round(cents / installments);
  return `${installments}x de ${formatCurrencyBRL(perMonth)}`;
}

export function getNrFamilyKey(courseIdOrNr?: string): string {
  const raw = (courseIdOrNr || '').toLowerCase();
  const match = raw.match(/nr[-\s]?(\d{2})/);
  return match ? `nr-${match[1]}` : raw;
}

