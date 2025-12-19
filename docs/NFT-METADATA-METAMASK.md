# Como Garantir que NFTs Apareçam com Imagens na MetaMask

## Problema

Para que os NFTs apareçam corretamente na MetaMask (e outras carteiras), os metadados JSON precisam ter URLs HTTP completas e acessíveis para as imagens.

## Solução Implementada

### 1. Metadados JSON Atualizados

Todos os arquivos em `public/metadata/` foram atualizados para usar caminhos absolutos:
- ✅ `"image": "/arc-nfts/arc1.png"` (em vez de `"../arc-nfts/arc1.png"`)

### 2. URLs Completas nos tokenURI

O código usa `SITE_BASE_URL` para construir URLs completas:
- Em desenvolvimento: `http://localhost:3000/metadata/arc1.json`
- Em produção: será baseado em `VITE_SITE_BASE_URL` ou `window.location.origin`

### 3. Como Funciona

1. Quando um NFT é mintado, o `tokenURI` armazenado no contrato é algo como:
   ```
   http://localhost:3000/metadata/arc1.json
   ```

2. Quando a MetaMask busca esse tokenURI, ela recebe o JSON:
   ```json
   {
     "name": "Arc Genesis #1",
     "image": "/arc-nfts/arc1.png"
   }
   ```

3. A MetaMask resolve `/arc-nfts/arc1.png` relativamente ao domínio onde o JSON foi buscado:
   ```
   http://localhost:3000/arc-nfts/arc1.png
   ```

## Configuração para Produção

Para garantir que funcione em produção, configure a variável de ambiente:

```env
VITE_SITE_BASE_URL=https://seu-dominio.com
```

Isso garante que os tokenURI sejam URLs completas e acessíveis mesmo depois do deploy.

## Testando

1. Faça mint de um NFT
2. Abra a MetaMask
3. Vá em "NFTs" ou "Collectibles"
4. O NFT deve aparecer com a imagem correta

## Notas Importantes

- ⚠️ **Os metadados e imagens precisam estar acessíveis publicamente**
- ⚠️ **Se o site estiver em localhost, apenas funcionará no mesmo computador**
- ⚠️ **Para produção, considere usar IPFS ou um CDN para hospedar as imagens**

## Alternativa: Usar IPFS

Para uma solução mais robusta, você pode hospedar os metadados e imagens no IPFS:

1. Faça upload das imagens para IPFS (Pinata, NFT.Storage, etc.)
2. Atualize os metadados JSON com URLs IPFS
3. Use `ipfsToHttp()` (em `src/utils/ipfs.ts`) para converter URLs IPFS para HTTP

Exemplo:
```json
{
  "name": "Arc Genesis #1",
  "image": "ipfs://QmHash..."
}
```

A função `ipfsToHttp()` converterá para: `https://ipfs.io/ipfs/QmHash...`



