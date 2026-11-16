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
import nr35CoverImg from '../assets/images/nr35_4k_branded_1794853562294.jpg';
import nr33CoverImg from '../assets/images/nr33_4k_branded_1794853561553.jpg';
import nr12CoverImg from '../assets/images/nr12_4k_branded_1794853565420.jpg';
import nr18CoverImg from '../assets/images/nr18_4k_branded_1794853564817.jpg';
import nr06CoverImg from '../assets/images/nr06_4k_branded_1794853562892.jpg';

export const OFFICIAL_LOGO_URL = officialLogoImg;
export const HERO_IMAGE_URL = heroBrandedImg;
export const INSTRUCTOR_PORTRAIT_URL = instructorBrandedImg;
export const CORPORATE_TEAM_URL = corporateBrandedImg;
export const NR35_COVER_URL = nr35CoverImg;
export const NR33_COVER_URL = nr33CoverImg;
export const NR12_COVER_URL = nr12CoverImg;
export const NR18_COVER_URL = nr18CoverImg;
export const NR06_COVER_URL = nr06CoverImg;

export const DEFAULT_PUBLIC_SETTINGS: Omit<PublicSettings, 'updatedAt'> = {
  companyName: '4k Treinamentos',
  cnpj: '48.912.340/0001-72',
  email: 'contato@4ktreinamentos.com.br',
  phone: '(11) 4002-8922',
  address: 'Av. Paulista, 1439 · Conj. 82 · Bela Vista, São Paulo - SP',
  heroTitle: 'Certificados de NR válidos em todo o Brasil',
  heroSubtitle:
    'Capacitação online em Segurança do Trabalho com conteúdo técnico atualizado, prova formal de aproveitamento e certificado assinado por profissional habilitado.',
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
      id: 'nr-35',
      slug: 'nr-35',
      nrCode: 'NR-35',
      title: 'Trabalho em Altura',
      salesHeadline:
        'Emita hoje o seu Certificado NR-35 válido em todo o Brasil e entre em obra sem barreiras na portaria',
      salesSubheadline:
        'Treinamento teórico completo (8h) conforme a NR-35 e Portaria MTE, com acesso imediato após o Pix, prova formal objetiva e certificado em PDF assinado por Engenheiro de Segurança do Trabalho.',
      promoTag: 'Condição promocional de lançamento · Acesso imediato',
      originalPriceCents: 18900,
      priceCents: 11900,
      enrolledCount: 2480,
      ratingAverage: 4.9,
      ratingCount: 418,
      guaranteeDays: 7,
      shortDescription:
        'Requisitos mínimos de proteção para planejamento, organização e execução de atividades acima de 2 metros com risco de queda.',
      fullDescription:
        'O treinamento de NR-35 capacita profissionais que atuam acima de 2,00 metros do nível inferior, onde haja risco de queda. O conteúdo cobre Análise de Risco (AR), Permissão de Trabalho (PT), seleção e inspeção de EPIs contra quedas, sistemas de ancoragem, fator de queda, zona livre de queda e noções de resgate e primeiros socorros conforme atualização vigente do Ministério do Trabalho e Emprego.',
      workloadHours: 8,
      certificateValidityMonths: 24,
      targetAudience:
        'Trabalhadores da construção civil, manutenção industrial, energia solar, telecomunicações, pintores prediais, eletricistas e técnicos de segurança que precisam comprovar capacitação NR-35.',
      notForAudience: [
        'Quem busca apenas um certificado impresso sem realizar estudo nem avaliação formal de aproveitamento',
        'Atividades que exigem exclusivamente parte prática presencial em campo (que deve ser complementada na empresa quando aplicável)',
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
        {
          question: 'Tenho garantia caso não goste do treinamento?',
          answer:
            'Sim. Você conta com 7 dias corridos de garantia incondicional a partir da compra, conforme o Código de Defesa do Consumidor.',
        },
      ],
      coverImageUrl: NR35_COVER_URL,
      bannerImageUrl: NR35_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 1,
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
  {
    course: {
      id: 'nr-33',
      slug: 'nr-33',
      nrCode: 'NR-33',
      title: 'Segurança e Saúde em Espaços Confinados',
      salesHeadline:
        'Domine os requisitos da NR-33 (16h) e conquiste sua certificação de Trabalhador Autorizado e Vigia ainda hoje',
      salesSubheadline:
        'Aprenda monitoramento atmosférico (O2, LEL, CO, H2S), emissão de PET, bloqueio LOTO e plano de salvamento em uma plataforma objetiva com emissão imediata de certificado válido.',
      promoTag: 'Condição promocional · Reciclagem e Formação 16h',
      originalPriceCents: 22900,
      priceCents: 14900,
      enrolledCount: 1640,
      ratingAverage: 4.9,
      ratingCount: 284,
      guaranteeDays: 7,
      shortDescription:
        'Capacitação para trabalhadores autorizados e vigias em espaços confinados: avaliação atmosférica, PET, ventilação e resgate.',
      fullDescription:
        'A NR-33 trata da gestão de segurança e saúde nos trabalhos em espaços confinados — áreas não projetadas para ocupação humana contínua, com meios limitados de entrada e saída e ventilação insuficiente. Este curso abrange reconhecimento de riscos atmosféricos (O2, inflamáveis, CO e H2S), Permissão de Entrada e Trabalho (PET), bloqueio e etiquetagem (LOTO), atuação do vigia e procedimentos de emergência.',
      workloadHours: 16,
      certificateValidityMonths: 12,
      targetAudience:
        'Operadores industriais, equipes de manutenção de tanques, silos, galerias, reservatórios, técnicos de segurança e vigias de espaço confinado.',
      notForAudience: [
        'Profissionais que não passarão pela avaliação formal exigida pela NR-33',
        'Atividades que demandem certificação específica de Supervisor de Entrada (40h)',
        'Quem procura conteúdo superficial sem foco em gases tóxicos e procedimentos de PET',
      ],
      includedBonuses: [
        'Modelo comentando de Permissão de Entrada e Trabalho (PET) conforme NR-33',
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
          question: 'Qual a validade do certificado da NR-33?',
          answer:
            'A reciclagem da NR-33 deve ser realizada periodicamente a cada 12 meses (1 ano), conforme exigência da norma.',
        },
        {
          question: 'Este curso atende trabalhadores autorizados e vigias?',
          answer:
            'Sim. O conteúdo programático contempla todas as diretrizes teóricas para Trabalhadores Autorizados e Vigias (16 horas).',
        },
        {
          question: 'Como funciona a validação do certificado pelo SESMT da contratante?',
          answer:
            'Cada certificado possui um código único impresso no cabeçalho. Qualquer técnico de segurança ou auditor pode confirmar a autenticidade instantaneamente na página /validar.',
        },
        {
          question: 'Posso parcelar no cartão ou pagar no Pix?',
          answer:
            'Sim. Aceitamos Pix com liberação imediata e cartão de crédito em até 12x via InfinitePay Checkout Integrado.',
        },
      ],
      coverImageUrl: NR33_COVER_URL,
      bannerImageUrl: NR33_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 2,
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
      id: 'nr-12',
      slug: 'nr-12',
      nrCode: 'NR-12',
      title: 'Segurança no Trabalho em Máquinas e Equipamentos',
      salesHeadline:
        'Capacitação NR-12 completa para operar e manter máquinas industriais com segurança e respaldo legal',
      salesSubheadline:
        'Proteções fixas e móveis, intertravamentos, parada de emergência e bloqueio LOTO em um curso direto ao ponto, com emissão rápida de certificado em PDF.',
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
      displayOrder: 3,
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
            durationMinutes: 55,
            order: 1,
            content:
              'As máquinas devem possuir sistemas de segurança que garantam proteção à saúde e integridade física nos momentos de operação, manutenção e limpeza.\n\nOrdem de prioridade das medidas de proteção:\n1. Medidas de proteção coletiva (enclausuramento, proteções fixas e móveis intertravadas, cortinas de luz).\n2. Medidas administrativas ou de organização do trabalho.\n3. Medidas de proteção individual (EPI).\n\nOs dispositivos de parada de emergência (botão tipo cogumelo vermelho sobre fundo amarelo) devem permanecer sempre desobstruídos, facilmente acessíveis e NÃO devem ser usados como botão de desligamento rotineiro.',
          },
          {
            id: 'nr12-l2',
            title: 'Procedimentos de Manutenção, Limpeza e Bloqueio (LOTO)',
            type: 'text',
            durationMinutes: 50,
            order: 2,
            content:
              'Qualquer intervenção para limpeza, lubrificação, ajuste ou manutenção deve ocorrer com a máquina parada e suas fontes de energia (elétrica, pneumática, hidráulica) isoladas, bloqueadas com cadeado individual e etiquetadas.\n\nAntes de iniciar a intervenção, deve-se realizar o teste de energia zero para assegurar que não há energia residual armazenada.',
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
        'Aprenda as exigências da nova NR-18 e do PGR de obras: guarda-corpos, escavações, andaimes e instalações elétricas temporárias.',
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
      displayOrder: 4,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-18-m1',
        courseId: 'nr-18',
        title: 'Módulo 1 · PGR no Canteiro, Escavações e Proteções Coletivas',
        description: 'Organização do canteiro, guarda-corpo padrão, andaimes e escavações.',
        order: 1,
        lessons: [
          {
            id: 'nr18-l1',
            title: 'Sistema de Guarda-Corpo e Rodapé (GcR) e Periferias',
            type: 'text',
            durationMinutes: 50,
            order: 1,
            content:
              'É obrigatória a instalação de proteção coletiva onde houver risco de queda de trabalhadores ou de projeção de materiais.\n\nPadrão dimensional do Guarda-Corpo e Rodapé:\n• Travessão superior: 1,20 m de altura.\n• Travessão intermediário: 0,70 m de altura.\n• Rodapé: altura mínima de 0,15 m (15 cm).\n• Vão entre travessões fechado com tela resistente.\n\nAberturas no piso (como vãos de elevador) devem possuir fechamento provisório resistente ou guarda-corpo fixado de modo seguro.',
          },
          {
            id: 'nr18-l2',
            title: 'Segurança em Escavações, Andaimes e Instalações Elétricas',
            type: 'text',
            durationMinutes: 55,
            order: 2,
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
    ],
  },
  {
    course: {
      id: 'nr-06',
      slug: 'nr-06',
      nrCode: 'NR-06',
      title: 'Equipamentos de Proteção Individual (EPI)',
      salesHeadline:
        'Comprove sua capacitação em NR-06 (EPIs) em poucas horas com certificado reconhecido em todo o país',
      salesSubheadline:
        'Entenda Certificado de Aprovação (CA), responsabilidades legais, conservação e escolha correta dos EPIs obrigatórios com emissão imediata de PDF.',
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
        'O curso de NR-06 orienta trabalhadores, encarregados e técnicos sobre a correta indicação, uso, conservação e substituição dos Equipamentos de Proteção Individual. Aborda a validade do Certificado de Aprovação (CA), responsabilidades do empregador e do empregado, ficha de entrega de EPI e proteção específica para cabeça, olhos, audição, vias respiratórias, mãos e pés.',
      workloadHours: 4,
      certificateValidityMonths: 24,
      targetAudience:
        'Todos os trabalhadores da indústria, construção civil, logística, serviços gerais, almoxarifes e profissionais de SESMT/CIPA.',
      notForAudience: [
        'Quem não atua ou não pretende atuar em ambientes sujeitos a requisitos de SST',
      ],
      includedBonuses: [
        'Guia rápido de consulta de Certificado de Aprovação (CA) ativo',
        'Modelo de Ficha de Controle e Entrega de EPI',
      ],
      learningOutcomes: [
        'Verificar a autenticidade e validade do Certificado de Aprovação (CA)',
        'Distinguir responsabilidades do empregador, do trabalhador e do fabricante',
        'Selecionar o EPI adequado para riscos físicos, químicos e mecânicos',
        'Executar corretamente a higienização, guarda e descarte de EPIs danificados',
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
            'Sim. Inclui carga horária de 4h, conteúdo programático completo e código verificável.',
        },
      ],
      coverImageUrl: NR06_COVER_URL,
      bannerImageUrl: NR06_COVER_URL,
      instructorName: 'Eng. Carlos Eduardo Mendes',
      instructorRole: 'Engenheiro de Segurança do Trabalho',
      instructorRegistry: 'CREA-SP 5069821470 · MTE 0041289',
      status: 'published',
      displayOrder: 5,
      passingScore: 70,
    },
    modules: [
      {
        id: 'nr-06-m1',
        courseId: 'nr-06',
        title: 'Módulo Único · Conceitos, CA e Responsabilidades na NR-06',
        description: 'Obrigações legais, Certificado de Aprovação e proteção por região anatômica.',
        order: 1,
        lessons: [
          {
            id: 'nr06-l1',
            title: 'Certificado de Aprovação (CA) e Obrigações Legais',
            type: 'text',
            durationMinutes: 45,
            order: 1,
            content:
              'Considera-se Equipamento de Proteção Individual (EPI) todo dispositivo ou produto de uso individual utilizado pelo trabalhador, destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho.\n\nTodo EPI comercializado ou utilizado no Brasil deve possuir Certificado de Aprovação (CA) emitido pelo órgão nacional competente.\n\nCabe ao empregador:\n• Adquirir o EPI adequado ao risco de cada atividade.\n• Exigir seu uso e fornecer gratuitamente ao trabalhador.\n• Orientar e treinar o trabalhador sobre o uso adequado, guarda e conservação.\n• Substituir imediatamente quando danificado ou extraviado.\n• Registrar o fornecimento ao empregado (ficha de EPI física ou eletrônica).\n\nCabe ao empregado:\n• Usar o EPI apenas para a finalidade a que se destina.\n• Responsabilizar-se pela guarda e conservação.\n• Comunicar ao empregador qualquer alteração que o torne impróprio para uso.',
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
    displayOrder: 2,
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
    displayOrder: 3,
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
    displayOrder: 4,
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
    displayOrder: 5,
  },
  {
    id: 'combo-obra-altura',
    type: 'combo',
    title: 'Combo Obra & Altura · NR-35 + NR-18',
    subtitle: '16 horas totais · Ideal para Construção Civil',
    description:
      'Capacitação completa para canteiros de obras, fachadas, telhados e montagens estruturais com dois certificados verificáveis.',
    triggerCourseId: 'nr-18',
    includedCourseIds: ['nr-35', 'nr-18'],
    originalPriceCents: 21800,
    offerPriceCents: 15900,
    badgeLabel: 'Pacote Construção · Economize R$ 59',
    active: true,
    displayOrder: 6,
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
      'O módulo de detector multigás e PET da NR-33 é muito claro e técnico. O certificado saiu com o CREA do engenheiro responsável e foi aprovado imediatamente pela nossa auditoria de SESMT.',
    verifiedPurchase: true,
    active: true,
    displayOrder: 3,
  },
  {
    id: 'test-nr33-2',
    courseId: 'nr-33',
    authorName: 'Júlio César Nogueira',
    authorRole: 'Caldeireiro Industrial',
    company: 'Serviços Industriais Paulista',
    rating: 5,
    quote:
      'Comprei a NR-35 e aproveitei o desconto da NR-33 na sequência. Consegui apresentar os dois certificados para uma parada de manutenção em refinaria no mesmo fim de semana.',
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
