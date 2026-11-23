# FinControle — Gestão Financeira Pessoal

Sistema profissional de acompanhamento de controle financeiro pessoal, desenvolvido com Next.js 16 (App Router), TypeScript, Tailwind CSS e Firebase (Authentication + Cloud Firestore).

---

## 🚀 O que foi construído

1. **Autenticação & Segurança de Usuário**:
   - Criação de perfil com senha criptografada e protegida por hash no Firebase Authentication.
   - Perfil de cada usuário salvo no Cloud Firestore com isolamento estrito de dados por `userId`.
   - Recuperação de senha por e-mail com fluxo completo.

2. **Gerenciamento de Lançamentos & Séries**:
   - Cadastro de Ganhos e Gastos com suporte a repetição por parcelas (1 a 60 meses).
   - Alternância rápida entre status **Previsto** e **Realizado** em um clique no próprio badge.
   - **Edição de séries**: escolha flexível entre alterar *Apenas esta parcela*, *Esta e parcelas futuras*, ou *Todas as parcelas da série*.
   - **Exclusão de séries**: escolha entre remover *Apenas esta parcela* ou *Toda a série agrupada*.

3. **Metas & Reservas Financeiras**:
   - Aplicação rigorosa da **Regra de Ouro**: o Fundo de Emergência e a Meta Principal nunca se misturam.
   - Metas simultâneas ilimitadas criadas livremente pelo usuário.
   - Suporte a valor-alvo e/ou prazo (data-alvo).
   - Barras de progresso dinâmicas em percentual e saldo restante.
   - Modal rápido para registro de aportes.

4. **Painel do Mês & Acompanhamento (Gráficos + Tabela)**:
   - Filtros de visualização: **Mensal** (com seletor rápido), **Anual** e **Customizado** (por intervalo de datas).
   - 3 Cards de resumo (Ganhos, Gastos e Saldo Livre Estimado vs. Realizado).
   - Gráfico de evolução dos últimos 6 meses (ganhos vs. gastos).
   - Gráfico de barras de distribuição de gastos por categoria.
   - Tabela analítica completa para acompanhamento contábil detalhado.

5. **Grade Matricial de 13 Meses**:
   - Visão de ciclo anual expandido a partir do mês inicial.
   - Linhas discriminadas de Entradas, Despesas, Reservas e Saldo Acumulado.
   - Botão de exportação direta em planilha CSV.

6. **Backup, Exportação & Importação**:
   - Exportação completa dos dados do usuário em JSON.
   - Importação de dados (compatível com backups e com o formato do modelo HTML anterior).

7. **Design System & Responsividade**:
   - Baseado fielmente no manual de design **FinControle Precision** (cores sóbrias, contrastes adequados, números tabulares).
   - Alternador de tema: **Claro**, **Escuro** e **Automático (sistema)**.
   - Interface 100% responsiva para Desktop, Tablet e Celular.

---

## 🛠️ Como rodar localmente

```bash
cd fincontrole
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🌐 Deploy no Vercel

### 1. No Firebase Console
1. Ative o **Firebase Authentication** com o provedor **E-mail/Senha**.
2. Crie a base de dados **Cloud Firestore** em modo de produção.
3. No painel do seu app web no Firebase Console, copie as variáveis do SDK Web.

### 2. No Vercel
Adicione as seguintes variáveis de ambiente nas configurações do seu projeto:

```env
# Frontend (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_web
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fincontrole-23467.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fincontrole-23467
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fincontrole-23467.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Backend (Admin)
FIREBASE_PROJECT_ID=fincontrole-23467
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fincontrole-23467.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
