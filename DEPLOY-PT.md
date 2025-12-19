# 🚀 Guia de Deployment - Passo a Passo

## PASSO 1: Build (OBRIGATÓRIO)

Abra o terminal (CMD, PowerShell ou terminal integrado) na pasta do projeto e execute:

```bash
npm run build
```

**O que acontece:**
- Verifica erros de TypeScript
- Gera os arquivos otimizados para produção
- Cria a pasta `dist/` com tudo pronto

**Tempo estimado:** 1-2 minutos

**Importante:** Se aparecer algum erro, corrija antes de continuar.

---

## PASSO 2: Preview (OPCIONAL - só para testar localmente)

Se quiser ver como ficou antes de fazer deploy:

```bash
npm run preview
```

Isso inicia um servidor local. Abra o navegador na URL que aparecer (geralmente `http://localhost:4173`).

**Use isso para:**
- Verificar se tudo está funcionando
- Testar os botões e funcionalidades
- Verificar se não há erros no console

---

## PASSO 3: Deploy (Escolha uma opção)

### Opção 1: Vercel (RECOMENDADO - Mais Fácil) ⭐

**Pré-requisitos:**
- Conta no Vercel (gratuita): https://vercel.com
- Git instalado (opcional, mas recomendado)

**Método A: Via CLI (Terminal)**
```bash
# Instale o Vercel CLI globalmente (uma vez só)
npm install -g vercel

# Faça login
vercel login

# Deploy de produção
vercel --prod
```

**Método B: Via Site (Mais Fácil)**
1. Acesse https://vercel.com
2. Faça login (pode usar GitHub)
3. Clique em "Add New Project"
4. Conecte seu repositório GitHub OU arraste a pasta `dist`
5. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Clique em "Deploy"

**Vantagens:**
- Grátis
- Deploy automático a cada push no Git
- URL customizada
- HTTPS automático

---

### Opção 2: Netlify (Muito Fácil) 🎯

**Pré-requisitos:**
- Conta no Netlify (gratuita): https://netlify.com

**Método A: Drag and Drop (Mais Fácil)**
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `dist` para o site
3. Pronto! Você terá uma URL automática

**Método B: Via Site (Com Git)**
1. Acesse https://app.netlify.com
2. Clique em "Add new site" → "Import an existing project"
3. Conecte seu repositório GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Clique em "Deploy site"

**Vantagens:**
- Grátis
- Drag and drop super fácil
- Deploy automático
- HTTPS automático

---

### Opção 3: GitHub Pages 📦

**Pré-requisitos:**
- Repositório no GitHub
- Git instalado

**Passos:**
1. Faça build: `npm run build`
2. Faça commit e push da pasta `dist`:
   ```bash
   git add dist
   git commit -m "Build for deployment"
   git push
   ```
3. No GitHub:
   - Vá em Settings → Pages
   - Source: selecione "GitHub Actions" ou configure para usar a branch `gh-pages`
   - Publish directory: `/dist`

**Vantagens:**
- Grátis
- Integrado com GitHub
- URL: `seu-usuario.github.io/nome-do-repo`

**Desvantagens:**
- Configuração mais complexa
- Precisa configurar GitHub Actions para deploy automático

---

## ✅ Checklist Final

Antes de fazer deploy, verifique:

- [ ] `npm run build` executou sem erros
- [ ] Pasta `dist/` foi criada
- [ ] `npm run preview` funciona localmente
- [ ] GM button funciona
- [ ] NFT section mostra "Coming Soon"
- [ ] Não há erros no console do navegador
- [ ] Variáveis de ambiente estão configuradas (`.env`)

---

## 🔧 Variáveis de Ambiente no Deploy

Dependendo da plataforma:

**Vercel:**
1. Vá em Project Settings → Environment Variables
2. Adicione: `VITE_GIFT_CARD_NFT_ADDRESS=0x...`

**Netlify:**
1. Vá em Site settings → Build & deploy → Environment
2. Adicione: `VITE_GIFT_CARD_NFT_ADDRESS=0x...`

**GitHub Pages:**
- Configure via GitHub Actions secrets

---

## 🆘 Problemas Comuns

**Erro: "npm: command not found"**
- Instale Node.js: https://nodejs.org

**Erro no build: TypeScript errors**
- Corrija os erros mostrados no terminal

**Site não carrega após deploy**
- Verifique se o Output Directory está correto (`dist`)
- Verifique se as variáveis de ambiente estão configuradas

**GM button não funciona**
- Verifique se está conectado à Arc Testnet na carteira
- Verifique se tem saldo de USDC para gas

---

## 📞 Próximos Passos

Após o deploy:
1. Teste todos os botões
2. Verifique no console se não há erros
3. Compartilhe a URL com outros usuários para teste
4. Configure domínio customizado (opcional)



