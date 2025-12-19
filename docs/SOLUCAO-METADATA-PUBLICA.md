# Solução: NFTs Aparecerem com Imagens na MetaMask

## Problema Identificado

Os NFTs foram mintados com `tokenURI` apontando para `http://localhost:3000/metadata/arc1.json`, mas `localhost` **não é acessível pela MetaMask** porque só funciona no mesmo computador.

## Soluções Possíveis

### Opção 1: Usar IPFS (RECOMENDADO para produção)

1. Faça upload das imagens e metadados para IPFS (Pinata, NFT.Storage, ou similar)
2. Atualize os metadados JSON com URLs IPFS
3. Para novos mints, use URLs IPFS

### Opção 2: Hospedar em um Servidor Público

1. Hospede os arquivos `public/metadata/` e `public/arc-nfts/` em um servidor web público
2. Atualize os metadados JSON com a URL pública
3. Para novos mints, use a URL pública

### Opção 3: Usar GitHub Pages (Rápido e Gratuito)

1. Faça commit dos arquivos `public/metadata/` e `public/arc-nfts/`
2. Publique no GitHub Pages
3. Use a URL do GitHub Pages nos metadados

### Opção 4: Usar um Serviço de Hospedagem Temporária

- Netlify Drop
- Vercel
- Fleek
- Outros serviços similares

## IMPORTANTE

**NFTs já mintados NÃO podem ter seu tokenURI alterado!** 

O tokenURI é armazenado no contrato no momento do mint e é imutável. Se você já mintou NFTs com `localhost`, eles sempre apontarão para `localhost`.

### Solução para NFTs já mintados:

Você terá que fazer **novo mint** com o tokenURI correto (URL pública).

### Para Novos Mints:

Use uma das opções acima para hospedar os metadados e imagens publicamente ANTES de fazer o mint.

## Exemplo: Usando GitHub Pages

1. Commit dos arquivos:
   ```bash
   git add public/metadata public/arc-nfts
   git commit -m "Add NFT metadata and images"
   git push
   ```

2. No GitHub, vá em Settings > Pages e ative GitHub Pages

3. Sua URL será: `https://seu-usuario.github.io/seu-repo/`

4. Atualize os metadados JSON:
   ```json
   {
     "image": "https://seu-usuario.github.io/seu-repo/arc-nfts/arc1.png"
   }
   ```

5. Atualize o `tokenURI` no código antes de fazer novos mints



