# 4k Treinamentos — Plataforma de Cursos Online NR com Certificação

Plataforma completa de ensino e certificação em **Normas Regulamentadoras (NRs)** de Segurança do Trabalho (NR-06, NR-12, NR-18, NR-33 e NR-35), com área do aluno, prova formal objetiva, geração de certificado digital em PDF assinado pelo instrutor, validação pública por código, checkout integrado **InfinitePay**, armazenamento via **Vercel Blob** e painel administrativo completo.

---

## 1. Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Conta Firebase (já provisionada via `firebase-applet-config.json`)
- Conta InfinitePay (para receber pagamentos via InfiniteTag)
- Token Vercel Blob (`BLOB_READ_WRITE_TOKEN`) para uploads em produção

### Passo a passo
```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Iniciar servidor full-stack (Express + Vite) na porta 3000
npm run dev
```

Acesse:
- Site público: `http://localhost:3000`
- Área do Aluno: `http://localhost:3000/aluno`
- Validação de Certificado: `http://localhost:3000/validar`
- Painel Admin: `http://localhost:3000/admin` (credenciais padrão: `admin@x.com` / `admin4321`)

---

## 2. Como configurar a InfiniteTag (InfinitePay Checkout Integrado)

1. Abra o aplicativo da **InfinitePay** no seu celular e acesse **Perfil → Minha InfiniteTag** (exemplo: `suaempresa` sem o símbolo `@`).
2. Acesse o **Painel Admin** em `/admin`.
3. No menu lateral, clique em **Configurações**.
4. Informe sua **InfiniteTag (handle)** no campo indicado e clique em **Salvar todas as configurações**.
5. *(Opcional / Recomendado para produção)*: Adicione também `INFINITEPAY_HANDLE="suaempresa"` nas variáveis de ambiente da Vercel.

### Como funciona o fluxo oficial implementado em `server.ts`
- `POST /api/checkout/create-link`: cria o link oficial via `POST https://api.checkout.infinitepay.io/links` enviando `handle`, `items` (preço em centavos), `order_nsu`, `redirect_url` (`/checkout/sucesso`) e `webhook_url` (`/api/webhooks/infinitepay`).
- `POST /api/webhooks/infinitepay`: recebe a notificação assíncrona de pagamento aprovado e registra a confirmação do pedido.
- `POST /api/checkout/payment-check`: confirma o status na URL `https://api.checkout.infinitepay.io/invoices/public/checkout/payment_check` no retorno do cliente.

---

## 3. Como configurar Firebase Authentication e Vercel Blob

### Firebase Authentication
1. No [Firebase Console](https://console.firebase.google.com/), abra seu projeto provisionado (`voltaic-compiler-08gvj`).
2. Vá em **Authentication → Sign-in method**.
3. Certifique-se de que **Google** está ativo e habilite **E-mail/senha** para permitir o cadastro tradicional de alunos e o login `admin@x.com`.
4. Para que o webhook server-side (`/api/webhooks/infinitepay`) libere matrículas automaticamente no Firestore mesmo com o navegador fechado, gere uma **Service Account JSON** em *Configurações do Projeto → Contas de Serviço* e defina a variável `FIREBASE_SERVICE_ACCOUNT_JSON` na Vercel.

### Vercel Blob (Imagens, Vídeos, PDFs e Certificados)
1. No painel do seu projeto na **Vercel**, acesse **Storage → Create Database → Blob**.
2. Copie o token gerado `BLOB_READ_WRITE_TOKEN` e adicione ao `.env` local ou às Environment Variables da Vercel.
3. Todos os uploads de capa, materiais em PDF, vídeos de aula e PDFs dos certificados gerados passam pela rota `POST /api/blob/upload` e `POST /api/certificates/generate` usando `@vercel/blob`.

---

## 4. Como fazer o primeiro deploy na Vercel

1. Suba o repositório para o GitHub/GitLab.
2. Importe o projeto na **Vercel**.
3. Configure as variáveis de ambiente na Vercel:
   - `APP_URL` = URL de produção (ex: `https://4ktreinamentos.com.br`)
   - `BLOB_READ_WRITE_TOKEN` = token do Vercel Blob
   - `INFINITEPAY_HANDLE` = sua InfiniteTag
   - `ADMIN_SESSION_SECRET` = chave aleatória segura
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON da conta de serviço Firebase (uma linha)
4. Comando de build: `npm run build` · Comando de start: `npm start`.

---

## 5. Onde editar os cursos iniciais

- **Código-fonte inicial (seed)**: `src/data/seedCourses.ts` contém os 5 cursos principais (**NR-06**, **NR-12**, **NR-18**, **NR-33** e **NR-35**), seus módulos, aulas teóricas e questões da prova formal.
- **Edição em tempo real pelo navegador**: Após acessar `/admin`, vá em **Dashboard → Sincronizar NRs iniciais** para gravar os cursos no Firestore e editá-los diretamente nas abas **Cursos** e **Aulas & Provas**.
