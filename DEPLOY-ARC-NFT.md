# 🚀 Deploy Guide - ArcNFT (Public Mint)

Guia passo a passo para deploy do novo contrato ArcNFT com mint público.

---

## 📋 Pré-requisitos

1. **Node.js** instalado (v18 ou superior)
2. **Carteira** com saldo de USDC na Arc Testnet
3. **Private Key** da carteira para deploy (NUNCA compartilhe!)

---

## 🔧 Passo 1: Instalar Dependências

```bash
npm install
```

Se for a primeira vez, instale também Hardhat:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify
```

---

## 📝 Passo 2: Configurar .env

Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):

```env
# RPC URL do Arc Network
VITE_RPC_URL=https://rpc.testnet.arc.network

# Private Key para deploy (sem 0x)
DEPLOYER_PRIVATE_KEY=sua_private_key_aqui

# Opcional: API Key do ArcScan para verificação
ARCSCAN_API_KEY=sua_api_key_aqui
```

**⚠️ IMPORTANTE:**
- NUNCA commite o arquivo `.env`
- Mantenha sua private key segura
- Use uma carteira de teste, não sua carteira principal

---

## 📦 Passo 3: Compilar o Contrato

```bash
npm run compile
```

Isso vai compilar o contrato `ArcNFT.sol` e gerar os artifacts.

---

## 🚀 Passo 4: Deploy do Contrato

```bash
npm run deploy
```

Ou explicitamente:
```bash
npx hardhat run scripts/deploy-arc-nft.js --network arc
```

**O que vai acontecer:**
1. Conecta na Arc Testnet
2. Deploy do contrato ArcNFT
3. Define você como owner
4. Mostra o endereço do contrato deployed

**Exemplo de output:**
```
✅ ArcNFT deployed to: 0x1234567890123456789012345678901234567890
📋 Deployer address: 0xYourAddress...
🌐 Network: arc
🔗 Chain ID: 5042002
```

**⚠️ IMPORTANTE:** Copie o endereço do contrato! Você vai precisar dele.

---

## 🔗 Passo 5: Atualizar .env com Endereço do Contrato

Adicione o endereço do contrato no `.env`:

```env
VITE_ARC_NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

**Reinicie o servidor** para carregar as novas variáveis:
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## 🌐 Passo 6: Build e Deploy do Frontend

### 6.1 Build

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos prontos.

### 6.2 Deploy na Vercel (Recomendado)

1. Acesse https://vercel.com
2. Faça login (pode usar GitHub)
3. Clique em "Add New Project"
4. Conecte seu repositório GitHub OU arraste a pasta `dist/`
5. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Adicione `VITE_ARC_NFT_CONTRACT_ADDRESS`
6. Clique em "Deploy"

### 6.3 Outras Opções

- **Netlify**: Arraste a pasta `dist/` para https://app.netlify.com/drop
- **GitHub Pages**: Configure nas settings do GitHub

---

## 📡 Passo 7: Configurar baseURI no Contrato

Após o frontend estar deployado, você precisa configurar o baseURI no contrato para que os NFTs apontem para os metadata corretos.

**Exemplo:** Se seu site está em `https://meu-site.vercel.app`, o baseURI deve ser:
```
https://meu-site.vercel.app/metadata/
```

**Comando:**
```bash
npm run set-uri -- --uri "https://meu-site.vercel.app/metadata/"
```

Ou explicitamente:
```bash
npx hardhat run scripts/setBaseURI.js --network arc -- --uri "https://meu-site.vercel.app/metadata/"
```

**⚠️ IMPORTANTE:**
- O baseURI deve terminar com `/`
- Os arquivos de metadata devem estar em `/metadata/0.json`, `/metadata/1.json`, `/metadata/2.json`
- Certifique-se de que os arquivos estão acessíveis publicamente

---

## ✅ Passo 8: Atualizar Metadata com URLs Corretas

Os arquivos de metadata em `public/metadata/` devem ter as URLs corretas das imagens.

**Atualize os arquivos:**
- `public/metadata/0.json`
- `public/metadata/1.json`
- `public/metadata/2.json`

**Exemplo de `0.json`:**
```json
{
  "name": "Arc Explorer",
  "description": "...",
  "image": "https://meu-site.vercel.app/images/explorer.png",
  "attributes": [...]
}
```

Certifique-se de que as imagens também estão deployadas no frontend.

---

## 🧪 Passo 9: Testar o Mint

1. **Conecte sua carteira** na Arc Testnet
2. **Acesse a página de Mint**
3. **Escolha um NFT** (Explorer, Builder ou Guardian)
4. **Clique em "Mint NFT"**
5. **Confirme a transação** na carteira
6. **Aguarde confirmação**
7. **Verifique:**
   - Token ID aparece na tela
   - Link "View on Explorer" funciona
   - NFT aparece na sua carteira (MetaMask/Rabby)

---

## 📱 Passo 10: Importar NFT na MetaMask

1. Abra a MetaMask
2. Vá em "NFTs" ou "Collectibles"
3. Clique em "Import NFT"
4. Cole:
   - **Contract Address**: O endereço do contrato deployado
   - **Token ID**: O ID do NFT mintado (ex: 0, 1, 2, etc.)
5. Clique em "Add"

O NFT deve aparecer com a imagem e metadata corretos.

---

## 🔍 Verificação no Explorer

Acesse o ArcScan e verifique:
- Contrato: `https://testnet.arcscan.app/address/CONTRACT_ADDRESS`
- Transação: `https://testnet.arcscan.app/tx/TX_HASH`
- Token: `https://testnet.arcscan.app/token/CONTRACT_ADDRESS?a=TOKEN_ID`

---

## 📊 Comandos Úteis

```bash
# Compilar contrato
npm run compile

# Deploy
npm run deploy

# Atualizar baseURI
npm run set-uri -- --uri "https://seu-site.com/metadata/"

# Build frontend
npm run build

# Preview local
npm run preview
```

---

## ⚠️ Troubleshooting

### Erro: "Private key is invalid"
- Verifique se a private key está correta no `.env`
- Remova o `0x` se estiver presente
- Certifique-se de que tem 64 caracteres hexadecimais

### Erro: "Insufficient funds"
- Certifique-se de ter USDC suficiente para gas
- Use o faucet: https://faucet.circle.com

### Erro: "Contract address not configured"
- Verifique se `VITE_ARC_NFT_CONTRACT_ADDRESS` está no `.env`
- Reinicie o servidor após adicionar

### NFT não aparece na carteira
- Verifique se o baseURI está configurado corretamente
- Verifique se os arquivos de metadata estão acessíveis
- Verifique se as imagens estão acessíveis

### Metadata não carrega
- Verifique se o baseURI termina com `/`
- Verifique se os arquivos estão em `/metadata/0.json`, etc.
- Teste a URL diretamente no navegador

---

## 📝 Checklist Final

- [ ] Contrato compilado
- [ ] Contrato deployado
- [ ] Endereço do contrato no `.env`
- [ ] Frontend buildado
- [ ] Frontend deployado
- [ ] baseURI configurado no contrato
- [ ] Metadata atualizada com URLs corretas
- [ ] Teste de mint realizado
- [ ] NFT aparece na carteira
- [ ] Metadata e imagem carregam corretamente

---

## 🎉 Pronto!

Agora você tem um sistema completo de mint de NFTs funcionando com mint público! 🚀



