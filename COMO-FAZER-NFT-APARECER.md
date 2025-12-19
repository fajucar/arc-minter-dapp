# 🎯 SOLUÇÃO DEFINITIVA: NFTs Aparecerem na MetaMask

## ⚠️ PROBLEMA

Os NFTs foram mintados com `tokenURI` apontando para `localhost:3000`, que **NÃO funciona** na MetaMask porque:
- `localhost` só funciona no seu computador
- A MetaMask não consegue acessar `localhost` de forma externa
- Os metadados e imagens precisam estar em URLs **públicas e acessíveis**

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Opção 1: Usar ngrok (Mais Rápido para Testes)

1. **Instale o ngrok:**
   - Baixe em: https://ngrok.com/download
   - Ou: `choco install ngrok` (se tiver Chocolatey)

2. **Inicie seu servidor Vite:**
   ```powershell
   cd "C:\Users\Fabio Souza\OneDrive\Documentos\ARC\arc-minter-dapp-main"
   npm run dev
   ```

3. **Em outro terminal, inicie o ngrok:**
   ```powershell
   ngrok http 3000
   ```

4. **Copie a URL HTTPS** que o ngrok fornecer (exemplo: `https://abc123.ngrok.io`)

5. **Adicione ao .env:**
   ```env
   VITE_SITE_BASE_URL=https://abc123.ngrok.io
   ```

6. **Reinicie o servidor Vite** e faça novos mints

### Opção 2: Usar Netlify Drop (Permanente e Grátis)

1. **Acesse:** https://app.netlify.com/drop

2. **Arraste a pasta `public` inteira** para o Netlify Drop

3. **Copie a URL** que o Netlify fornecer (exemplo: `https://xyz.netlify.app`)

4. **Adicione ao .env:**
   ```env
   VITE_SITE_BASE_URL=https://xyz.netlify.app
   ```

5. **Atualize os metadados JSON** para usar essa URL (ou use o script abaixo)

6. **Reinicie o servidor** e faça novos mints

### Opção 3: Usar GitHub Pages (Permanente)

1. **Crie um repositório no GitHub**

2. **Faça upload dos arquivos:**
   ```powershell
   git init
   git add public/
   git commit -m "Add NFT metadata and images"
   git remote add origin https://github.com/seu-usuario/seu-repo.git
   git push -u origin main
   ```

3. **No GitHub, vá em Settings > Pages > Source: main branch / (root)**

4. **Sua URL será:** `https://seu-usuario.github.io/seu-repo/`

5. **Adicione ao .env:**
   ```env
   VITE_SITE_BASE_URL=https://seu-usuario.github.io/seu-repo
   ```

## 🔧 IMPORTANTE: Atualizar Metadados JSON

Depois de ter a URL pública, você precisa atualizar os arquivos JSON em `public/metadata/`:

**ANTES (não funciona):**
```json
{
  "image": "http://localhost:3000/arc-nfts/arc1.png"
}
```

**DEPOIS (funciona):**
```json
{
  "image": "https://sua-url-publica.com/arc-nfts/arc1.png"
}
```

### Script Automático:

Depois de configurar `VITE_SITE_BASE_URL`, execute:
```powershell
node scripts/update-metadata-urls.js
```

## 🚨 IMPORTANTE: NFTs Já Mintados

**NFTs que foram mintados com `localhost` NÃO podem ser corrigidos!**

O `tokenURI` é armazenado no contrato e é **imutável**. Você precisa fazer **NOVO MINT** com a URL pública correta.

## ✅ Checklist Final

- [ ] Tenho uma URL pública (ngrok, Netlify, GitHub Pages, etc.)
- [ ] Adicionei `VITE_SITE_BASE_URL` no `.env`
- [ ] Atualizei os metadados JSON com a URL pública
- [ ] Reiniciei o servidor Vite
- [ ] Fiz NOVO MINT (os antigos não funcionarão)

## 🎉 Depois de Fazer Isso

1. Faça um novo mint
2. Abra a MetaMask
3. Vá em NFTs
4. O NFT deve aparecer **COM A IMAGEM**! 🎨



