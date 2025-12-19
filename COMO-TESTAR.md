# 🧪 Como Testar o Aplicativo

## ✅ Pré-requisitos

1. **Servidor rodando**: `npm run dev`
2. **Carteira conectada** na Arc Testnet
3. **Saldo de USDC** para gas fees
4. **Console do navegador aberto** (F12)

---

## 🚀 Teste 1: Botão GM

### Passos:
1. Abra o navegador em `http://localhost:3000`
2. Clique em **"Connect Wallet"** (se ainda não conectou)
3. Escolha sua carteira (MetaMask, Rabby, etc.)
4. Certifique-se de estar na **Arc Testnet**
5. Clique no botão **"Send GM"**

### O que deve acontecer:
- ✅ Transação pede confirmação na carteira
- ✅ Após confirmar, aparece animação de confete
- ✅ Toast mostra: "GM Sent! 🎉"
- ✅ Modal de compartilhamento aparece após 3 segundos
- ✅ **NÃO deve** procurar eventos Transfer (não é NFT)

### Console deve mostrar:
```
GM MODE: SELF_TX
GM TX START: Sending 0 value transaction to own address
GM TX HASH: 0x...
GM TX CONFIRMED: 0x...
[GMButton] ✅ GM transaction confirmed!
```

---

## 🎨 Teste 2: Mint de NFT

### Passos:
1. Na página inicial, clique em **"Mint NFTs"** ou vá para `/mint`
2. Escolha um dos 3 NFTs:
   - Arc Explorer
   - Arc Builder  
   - Arc Guardian
3. Clique no botão **"Mint NFT"**
4. Confirme a transação na carteira

### O que deve acontecer:
- ✅ Transação pede confirmação na carteira
- ✅ Após confirmar, aparece o Token ID abaixo do botão
- ✅ Botão "Copy Import Info" aparece
- ✅ Link "View on Explorer" aparece
- ✅ NFT marcado como "Minted ✔"
- ✅ **NÃO deve** mostrar erro sobre Transfer event

### Console deve mostrar:
```
MINT MODE: CONTRACT_MINT
MINT TX START: mintImageNFT
MINT TX START: Minter Contract: 0x...
MINT TX START: NFT Contract: 0x...
MINT TX HASH: 0x...
MINT TX CONFIRMED: 0x...
✅ ImageNFTRequested event found from minter: { tokenId: "X" }
✅ Using tokenId from ImageNFTRequested event: X
MINT TOKEN ID: X
```

---

## 🔍 Como Verificar se Funcionou

### 1. No Console (F12):
- Procure por mensagens de sucesso
- Verifique se não há erros vermelhos
- Confirme que o Token ID aparece

### 2. No Explorer:
- Clique no link "View on Explorer"
- Verifique que a transação foi confirmada
- Veja os eventos emitidos

### 3. Na Carteira (MetaMask/Rabby):
- Vá em "NFTs" ou "Collectibles"
- Procure pelo contrato: `0xf0b12cd751181C31a6FA8f8e32496c47611dC7C0`
- Verifique se o NFT aparece com a imagem

---

## ⚠️ Problemas Comuns

### "Mint Coming Soon" aparece:
- ✅ **Normal** se `VITE_GIFT_CARD_MINTER_ADDRESS` não estiver no `.env`
- ✅ O mint está intencionalmente desabilitado
- ✅ Isso é esperado para deployment

### Erro "No ERC-721 Transfer event found":
- ❌ **Não deve mais aparecer** após a correção
- Se aparecer, verifique o console para logs detalhados
- O código agora usa `ImageNFTRequested` como fonte primária

### Transação não completa:
- Verifique se tem saldo de USDC
- Verifique se está na Arc Testnet
- Veja se há erros no console
- Verifique a transação no explorer

### Carteira não conecta:
- Verifique se a extensão está instalada
- Tente recarregar a página
- Verifique se está na rede correta

---

## 📋 Checklist de Teste

### GM Button:
- [ ] Conecta carteira
- [ ] Confirma transação
- [ ] Animação de confete aparece
- [ ] Toast "GM Sent!" aparece
- [ ] Modal de compartilhamento aparece
- [ ] Link para explorer funciona

### Mint NFT:
- [ ] Vê os 3 cards de NFT
- [ ] Clica em "Mint NFT"
- [ ] Confirma transação
- [ ] Token ID aparece
- [ ] Botão "Copy Import Info" aparece
- [ ] Link "View on Explorer" funciona
- [ ] NFT aparece na carteira (opcional)
- [ ] **NÃO** mostra erro sobre Transfer event

---

## 🔗 Links Úteis

- **Arc Explorer**: https://testnet.arcscan.app
- **Arc Testnet Chain ID**: `5042002`
- **NFT Contract**: `0xf0b12cd751181C31a6FA8f8e32496c47611dC7C0`
- **Minter Contract**: `0xB8e8F05E425158e76F2747db926940662906Cf4e`

---

## 🆘 Se Algo Não Funcionar

1. **Abra o console (F12)** e copie os erros
2. **Verifique a transação no explorer** usando o hash
3. **Confirme as variáveis de ambiente** no `.env`
4. **Recarregue a página** (F5)
5. **Desconecte e reconecte** a carteira



