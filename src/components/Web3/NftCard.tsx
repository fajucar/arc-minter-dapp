import { useEffect, useState } from "react";
import { ipfsToHttp } from "./ipfs";

type Meta = {
  name?: string;
  description?: string;
  image?: string;
};

export function NftCard({ tokenUri }: { tokenUri: string }) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const url = ipfsToHttp(tokenUri);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao carregar metadata");
        const json = (await res.json()) as Meta;
        if (alive) setMeta(json);
      } catch (e: any) {
        if (alive) setError(e.message);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [tokenUri]);

  if (error) return <div>Erro: {error}</div>;
  if (!meta) return <div>Carregando NFT...</div>;

  const imageUrl = meta.image ? ipfsToHttp(meta.image) : "";

  return (
    <div style={{ border: "1px solid #333", padding: 12, borderRadius: 12 }}>
      <strong>{meta.name ?? "NFT"}</strong>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={meta.name}
          style={{ width: "100%", borderRadius: 10, marginTop: 8 }}
        />
      ) : (
        <div>Sem imagem</div>
      )}

      {meta.description && (
        <p style={{ opacity: 0.8 }}>{meta.description}</p>
      )}
    </div>
  );
}
