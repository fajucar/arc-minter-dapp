# 🧪 Guia de Teste - Mint de NFTs

## ✅ Pré-requisitos

1. **Arquivo .env configurado** ✅ (já está configurado)
2. **Carteira conectada** na Arc Testnet
3. **Saldo de USDC** para gas fees na Arc Testnet

## 🚀 Passos para Testar

### 1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`

### 2. Abrir no Navegador

Abra `http://localhost:3000` no seu navegador.

### 3. Conectar Carteira

1. Clique no botão **"Connect Wallet"**
2. Escolha sua carteira (MetaMask, Rabby, etc.)
3. **IMPORTANTE**: Certifique-se de estar conectado à **Arc Testnet**
   - Chain ID: `5042002`
   - Se não estiver, o app pedirá para trocar automaticamente

### 4. Abrir o Console do Navegador (F12)

Abra as **DevTools** (F12) e vá para a aba **Console** para ver os logs de debug.

### 5. Testar o Botão GM

1. Encontre o botão **"Send GM"** na página inicial
2. Clique no botão
3. **Confirme a transação** na sua carteira
4. **Observe o console** - você deve ver:
   - `TX START (GM): mintImageNFT`
   - `TX HASH: 0x...`
   - `TX CONFIRMED: 0x...`
   - `ERC-721 MINT SUCCESS`
   - `TOKEN ID: X`
5. **Resultado esperado**:
   - ✅ Animação de confete aparece
   - ✅ Modal de compartilhamento aparece após 3 segundos
   - ✅ Token ID é exibido

### 6. Testar o Mint de NFT

1. Navegue para a página **"Mint"** (ou clique em "Mint NFTs")
2. Escolha um dos 3 NFTs disponíveis:
   - Arc Explorer
   - Arc Builder
   - Arc Guardian
3. Clique no botão **"Mint NFT"**
4. **Confirme a transação** na sua carteira
5. **Observe o console** - você deve ver:
   - `TX START (MINT): mintImageNFT`
   - `TX HASH: 0x...`
   - `RECEIPT STATUS: success`
   - `TX CONFIRMED: 0x...`
   - `ERC-721 MINT SUCCESS`
   - `TOKEN ID: X`
6. **Resultado esperado**:
   - ✅ Token ID aparece abaixo do botão
   - ✅ Botão "Copy Import Info" aparece
   - ✅ Link "View on Explorer" aparece
   - ✅ NFT marcado como "Minted ✔"

## 🔍 Logs para Monitorar

No console (F12), procure por estas mensagens:

### Quando a transação é iniciada:
```
TX START (GM|MINT): mintImageNFT
TX START (GM|MINT): Minter Contract: 0x...
TX START (GM|MINT): NFT Contract: 0x...
TX START (GM|MINT): Method: mintImageNFT(string)
TX START (GM|MINT): Args: [...]
```

### Quando o hash é recebido:
```
TX HASH: 0x...
WRITE CONTRACT STATUS: success
```

### Quando está aguardando confirmação:
```
RECEIPT STATUS: pending
TX STATE: isPending=false isConfirming=true isSuccess=false
```

### Quando confirmado:
```
TX CONFIRMED: 0x...
Transfer event found: { from: '0x...', to: '0x...', tokenId: 'X' }
ERC-721 MINT SUCCESS
TOKEN ID: X
```

## ⚠️ Problemas Comuns

### Transação não completa

**Sintomas**: TX HASH aparece mas nunca confirma

**Soluções**:
1. Verifique se você tem saldo suficiente de USDC na Arc Testnet
2. Verifique a conexão com a rede (RPC pode estar lento)
3. Verifique no explorer se a transação foi realmente enviada:
   - Vá para: https://testnet.arcscan.app
   - Cole o TX HASH

### Erro "Minter contract not configured"

**Solução**: Certifique-se de que o arquivo `.env` contém:
```
VITE_GIFT_CARD_MINTER_ADDRESS=0xB8e8F05E425158e76F2747db926940662906Cf4e
```

Depois, **reinicie o servidor** (`npm run dev`)

### Erro "Only minter contract can call"

**Solução**: Já foi corrigido! Agora usamos o minter contract corretamente.

### Não aparece Token ID

**Sintomas**: Transação confirma mas não aparece Token ID

**Soluções**:
1. Verifique no console se há erro de parsing do Transfer event
2. Verifique se o contrato NFT está emitindo o evento Transfer corretamente
3. Verifique no explorer se a transação realmente criou um NFT

## 🎯 Checklist de Sucesso

- [ ] Servidor inicia sem erros
- [ ] Carteira conecta na Arc Testnet
- [ ] Botão GM completa transação
- [ ] Animação de confete aparece (GM)
- [ ] Token ID aparece (GM)
- [ ] Mint de NFT completa transação
- [ ] Token ID aparece (NFT)
- [ ] Link para explorer funciona
- [ ] NFT aparece na carteira (opcional - depende da carteira)

## 📞 Se algo não funcionar

1. **Verifique os logs no console** (F12)
2. **Copie as mensagens de erro**
3. **Verifique no explorer** se a transação foi enviada:
   - https://testnet.arcscan.app
4. **Verifique o saldo** de USDC na carteira

## 🔗 Links Úteis

- **Arc Explorer**: https://testnet.arcscan.app
- **Arc Faucet**: (verifique documentação da Arc Network)
- **Documentação Arc**: https://docs.arc.network



