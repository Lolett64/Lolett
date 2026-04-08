import Image from 'next/image';

const photos = [
  { id: 'A', src: '/images/wetransfer_lolett_2026-03-18_1501/Lola beige/1.jpg', label: 'A — Lola beige 1', desc: 'Portrait mi-corps, sourire face caméra' },
  { id: 'B', src: '/images/wetransfer_lolett_2026-03-18_1501/Lola beige/2.jpg', label: 'B — Lola beige 2', desc: 'Portrait épaules, regard de côté' },
  { id: 'C', src: '/images/fondatrice.jpg', label: 'C — Lola noir 1', desc: 'Portrait mi-corps, top noir, sourire' },
  { id: 'D', src: '/images/wetransfer_lolett_2026-03-18_1501/Lola noir/2.jpg', label: 'D — Lola noir 2', desc: 'Portrait mi-corps, top noir, bras tatoué' },
  { id: 'E', src: '/images/wetransfer_lolett_2026-03-18_1501/Isa marron/1.jpg', label: 'E — Isa marron 1', desc: 'Top marron, pantalon blanc, regard de côté' },
  { id: 'F', src: '/images/wetransfer_lolett_2026-03-18_1501/Isa marron/2.jpg', label: 'F — Isa marron 2', desc: 'Close-up buste, top marron' },
  { id: 'G', src: '/images/wetransfer_lolett_2026-03-18_1501/Didi/1.jpg', label: 'G — Didi 1', desc: 'Gilet crochet, sourire face caméra' },
  { id: 'H', src: '/images/wetransfer_lolett_2026-03-18_1501/Didi/2.jpg', label: 'H — Didi 2', desc: 'Gilet crochet, regard baissé, posé' },
];

export default function LolaPreview() {
  return (
    <div style={{ backgroundColor: '#FDF5E6', minHeight: '100vh', padding: '48px 32px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 36, color: '#1B0B94', marginBottom: 8 }}>
        Preview — Photo "Mon Histoire"
      </h1>
      <p style={{ color: '#1B0B94', opacity: 0.5, fontSize: 14, marginBottom: 48 }}>
        Dis-moi la lettre de la photo que tu veux
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {photos.map((photo) => (
          <div key={photo.id}>
            <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', background: '#e8e0d4' }}>
              <Image
                src={photo.src}
                alt={photo.label}
                fill
                style={{ objectFit: 'cover' }}
                sizes="25vw"
              />
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: '#1B0B94', color: '#fff',
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
              }}>
                {photo.id}
              </div>
            </div>
            <p style={{ marginTop: 10, fontWeight: 700, color: '#1B0B94', fontSize: 13 }}>{photo.label}</p>
            <p style={{ color: '#1B0B94', opacity: 0.5, fontSize: 12, marginTop: 2 }}>{photo.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
))}
      </div>
    </div>
  );
}
