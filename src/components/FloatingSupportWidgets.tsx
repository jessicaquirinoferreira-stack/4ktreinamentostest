import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, MessageCircle, Send, UserCheck, X } from 'lucide-react';

const WHATSAPP_NUMBER = '5521989298200';
const WHATSAPP_DISPLAY = '(21) 98929-8200';

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  whatsappCtaText?: string;
}

const QUICK_TOPICS: { label: string; question: string }[] = [
  { label: 'Qual NR escolher (40h ou Reciclagem)?', question: 'Qual NR escolher entre 40h e Reciclagem?' },
  { label: 'O certificado é válido no Brasil?', question: 'O certificado é válido e aceito nas empresas?' },
  { label: 'Como funciona pagamento e liberação?', question: 'Como funciona o pagamento e liberação do curso?' },
  { label: 'Empresas, APR e PGR', question: 'Quero orçamento para empresa ou APR e PGR' },
];

function generateAssistantReply(input: string): { text: string; whatsappText: string } {
  const q = input.toLowerCase();

  if (/(33|35|40h|16h|8h|reciclagem|forma[cç][aã]o|carga hor[aá]ria|vigia|altura|confinad)/.test(q)) {
    return {
      text: 'Para quem está fazendo o curso pela primeira vez, indicamos a Formação Completa (40h). Se você já possui certificação anterior e precisa renovar, escolha a opção Reciclagem (16h na NR-33 para trabalhadores autorizados e vigia, ou 8h na NR-35). Quer ajuda para confirmar qual opção sua empresa exige?',
      whatsappText: 'Olá! Estava tirando dúvida com a Camila sobre Formação 40h e Reciclagem (NR-33 / NR-35) e gostaria de atendimento.',
    };
  }

  if (/(certificado|v[aá]lido|crea|mte|assinatura|esocial|validar|pdf)/.test(q)) {
    return {
      text: 'Sim! Todos os certificados da 4k Treinamentos seguem a NR-01 (EAD), contam com assinatura de Engenheiro de Segurança do Trabalho com registro CREA/MTE, conteúdo programático completo no verso e código público de verificação em /validar.',
      whatsappText: 'Olá! Gostaria de confirmar detalhes sobre a emissão e validade do certificado da 4k Treinamentos.',
    };
  }

  if (/(pix|cart[aã]o|pagamento|pre[cç]o|valor|libera[cç][aã]o|acesso|parcela|infinitepay)/.test(q)) {
    return {
      text: 'O pagamento é feito em ambiente seguro via InfinitePay (Pix instantâneo ou cartão em até 12x). Assim que o Pix é confirmado, seu acesso é liberado automaticamente na Área do Aluno para estudar e emitir o certificado.',
      whatsappText: 'Olá! Quero tirar uma dúvida sobre valores, Pix ou liberação imediata de curso na 4k Treinamentos.',
    };
  }

  if (/(empresa|cnpj|equipe|lote|or[cç]amento|apr|pgr|documento)/.test(q)) {
    return {
      text: 'Para equipes e empresas, oferecemos condições especiais por volume, emissão de APR automática em PDF e elaboração personalizada de PGR com base no CNPJ e riscos reais da operação. Fale direto com nossa equipe comercial no WhatsApp!',
      whatsappText: 'Olá! Gostaria de solicitar atendimento para empresa (treinamentos em lote, APR ou PGR).',
    };
  }

  if (/(prova|exame|nota|tenta|reprova)/.test(q)) {
    return {
      text: 'Após concluir as aulas na Área do Aluno, você realiza a prova formal online (nota mínima 70%). Caso precise, novas tentativas já estão inclusas sem custo adicional, e o certificado é liberado na hora após a aprovação.',
      whatsappText: 'Olá! Tenho uma dúvida sobre a prova online e emissão do certificado.',
    };
  }

  return {
    text: `Posso te ajudar com cursos NR (NR-06 a NR-35), Formação 40h vs. Reciclagem, validade do certificado, pagamentos ou documentos APR/PGR. Para atendimento humano rápido agora mesmo, chame nossa equipe no WhatsApp ${WHATSAPP_DISPLAY}.`,
    whatsappText: `Olá! Vim pelo site da 4k Treinamentos com a dúvida: "${input.slice(0, 120)}"`,
  };
}

export function FloatingSupportWidgets() {
  const location = useLocation();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Eu sou a Camila, assistente da 4k Treinamentos. Posso tirar dúvidas rápidas sobre os cursos NR, cargas horárias (40h e Reciclagem), certificados ou te encaminhar direto para nosso WhatsApp.',
      whatsappCtaText: 'Olá! Vim pelo site da 4k Treinamentos e gostaria de atendimento.',
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  // Avoid overlapping the sticky bottom bar on CourseDetailPage when user scrolls down
  const isCourseDetail = location.pathname.startsWith('/cursos/');
  const bottomOffsetClass = isCourseDetail ? 'bottom-[74px] sm:bottom-[76px]' : 'bottom-4 sm:bottom-6';

  useEffect(() => {
    if (assistantOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, assistantOpen]);

  function handleSendQuestion(rawQuestion: string) {
    const trimmed = rawQuestion.trim();
    if (!trimmed) return;

    const reply = generateAssistantReply(trimmed);
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    const botMsg: ChatMessage = {
      id: `a_${Date.now() + 1}`,
      sender: 'assistant',
      text: reply.text,
      whatsappCtaText: reply.whatsappText,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSendQuestion(inputText);
  }

  return (
    <>
      {/* LEFT FLOATING VIRTUAL ASSISTANT (CAMILA) */}
      <div className={`fixed left-4 sm:left-6 ${bottomOffsetClass} z-40 flex flex-col items-start gap-3`}>
        <AnimatePresence>
          {assistantOpen && (
            <motion.section
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Atendimento virtual Camila"
              className="w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-[0_24px_60px_-15px_rgba(10,37,64,0.32)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0A2540] text-white px-4 py-3.5 flex items-center justify-between gap-3 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F5C518] bg-[#0F2C59] shrink-0 flex items-center justify-center">
                    {!avatarError ? (
                      <img
                        src="/images/assistant_camila.jpg"
                        alt="Camila — Assistente 4k Treinamentos"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <UserCheck className="w-5 h-5 text-[#F5C518]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-white leading-tight truncate">
                      Camila
                    </p>
                    <p className="text-[11px] text-slate-300 truncate">
                      Assistente 4k Treinamentos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  aria-label="Fechar assistente"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Conversation Body */}
              <div
                ref={listRef}
                className="p-4 bg-[#F7F9FC] space-y-3 max-h-[300px] overflow-y-auto"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0A2540] text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-[#0A2540] rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.sender === 'assistant' && msg.whatsappCtaText && (
                        <a
                          href={buildWhatsAppUrl(msg.whatsappCtaText)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chamar no WhatsApp {WHATSAPP_DISPLAY}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {/* Quick Topics */}
                <div className="pt-1 space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-500">Perguntas frequentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TOPICS.map((topic) => (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => handleSendQuestion(topic.question)}
                        className="text-left text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0A2540] hover:bg-slate-50 text-[#0A2540] transition-colors cursor-pointer"
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleFormSubmit}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua dúvida simples..."
                  className="flex-1 min-w-0 px-3 py-2 text-xs bg-[#F7F9FC] border border-slate-200 rounded-lg text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
                <button
                  type="submit"
                  aria-label="Enviar dúvida"
                  className="p-2 min-w-[36px] min-h-[36px] rounded-lg bg-[#F5C518] hover:bg-[#E0B20F] text-[#0A2540] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Compact Launcher Button */}
        <button
          type="button"
          onClick={() => setAssistantOpen((prev) => !prev)}
          aria-expanded={assistantOpen}
          aria-label="Abrir atendimento com Camila"
          className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 min-h-[48px] bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 hover:border-[#0A2540] rounded-full shadow-[0_12px_30px_-8px_rgba(10,37,64,0.28)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          <span className="w-9 h-9 rounded-full overflow-hidden border border-[#F5C518] bg-[#0A2540] shrink-0 flex items-center justify-center">
            {!avatarError ? (
              <img
                src="/images/assistant_camila.jpg"
                alt="Camila — Assistente Virtual"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <UserCheck className="w-4 h-4 text-[#F5C518]" />
            )}
          </span>
          <span className="text-left leading-tight">
            <span className="block font-display text-xs font-bold text-[#0A2540] whitespace-nowrap">
              Camila
            </span>
            <span className="hidden sm:block text-[11px] text-slate-600 whitespace-nowrap">
              Dúvidas sobre NRs?
            </span>
          </span>
        </button>
      </div>

      {/* RIGHT FLOATING OFFICIAL WHATSAPP BUTTON (21989298200) */}
      <div className={`fixed right-4 sm:right-6 ${bottomOffsetClass} z-40`}>
        <a
          href={buildWhatsAppUrl('Olá! Vim pelo site da 4k Treinamentos e gostaria de atendimento.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Falar no WhatsApp ${WHATSAPP_DISPLAY}`}
          title={`WhatsApp ${WHATSAPP_DISPLAY}`}
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-[0_12px_28px_-6px_rgba(37,211,102,0.55)] hover:shadow-[0_16px_34px_-6px_rgba(37,211,102,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]"
        >
          {/* Desktop hover label */}
          <span className="hidden md:block pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[#0A2540] text-white text-xs font-semibold whitespace-nowrap shadow-lg">
            WhatsApp {WHATSAPP_DISPLAY}
          </span>

          {/* Official WhatsApp SVG Logo */}
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            aria-hidden="true"
            className="w-7 h-7 sm:w-8 sm:h-8"
          >
            <path d="M16.002 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.352.615 4.648 1.782 6.672L2.667 29.333l6.835-1.792A13.27 13.27 0 0 0 16.002 29.333C23.364 29.333 29.333 23.36 29.333 16S23.364 2.667 16.002 2.667Zm0 24.442c-2.054 0-4.067-.553-5.822-1.598l-.418-.248-4.057 1.064 1.083-3.954-.272-.433a11.06 11.06 0 0 1-1.695-5.94c0-6.135 4.992-11.127 11.181-11.127 6.136 0 11.127 4.992 11.127 11.127 0 6.136-4.991 11.109-11.127 11.109Zm6.103-8.334c-.334-.167-1.978-.976-2.285-1.088-.306-.112-.529-.167-.752.167-.223.335-.863 1.088-1.058 1.311-.195.223-.39.251-.724.084-.334-.167-1.412-.521-2.69-1.66-.994-.886-1.665-1.981-1.86-2.316-.195-.334-.021-.515.147-.681.15-.15.334-.39.501-.585.167-.195.223-.334.334-.557.112-.223.056-.418-.028-.585-.084-.167-.752-1.812-1.03-2.48-.271-.651-.547-.563-.752-.574l-.641-.011c-.223 0-.585.084-.891.418-.306.334-1.17 1.143-1.17 2.787 0 1.644 1.198 3.233 1.365 3.456.167.223 2.357 3.599 5.71 5.047.798.344 1.421.55 1.907.704.801.255 1.53.219 2.106.133.643-.096 1.978-.808 2.257-1.589.279-.78.279-1.449.195-1.589-.084-.139-.307-.223-.641-.39Z" />
          </svg>
        </a>
      </div>
    </>
  );
}
