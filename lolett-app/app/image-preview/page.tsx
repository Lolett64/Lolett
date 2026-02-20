
const imageOptions = [
  {
    product: 'Chemise Lin Méditerranée',
    gender: 'homme',
    description: 'Chemise en lin léger, parfaite pour les soirées d\'été',
    images: [
      { url: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&q=85', label: 'Option A — Lin blanche décontractée' },
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=85', label: 'Option B — Chemise blanche studio' },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=85', label: 'Option C — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=85', label: 'Option D — Lin décontractée 2' },
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=85', label: 'Option E — Chemise lin pliée' },
    ],
  },
  {
    product: 'Chino Sable',
    gender: 'homme',
    description: 'Chino coupe slim en coton stretch',
    images: [
      { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=85', label: 'Option A — Homme pantalon beige' },
      { url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=85', label: 'Option B — Outfit complet beige' },
      { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=85', label: 'Option C — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=85', label: 'Option D — Style casual homme' },
      { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=85', label: 'Option E — Portrait homme élégant' },
    ],
  },
  {
    product: 'Polo Piqué Riviera',
    gender: 'homme',
    description: 'Polo en coton piqué premium, col souple, coupe ajustée',
    images: [
      { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=85', label: 'Option A — Polo porté' },
      { url: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=85', label: 'Option B — Polo bleu homme' },
      { url: 'https://images.unsplash.com/photo-1625910513413-5fc421e0bca7?w=800&q=85', label: 'Option C — Polo classique' },
      { url: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&q=85', label: 'Option D — Polo marine' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85', label: 'Option E — T-shirt/polo studio' },
    ],
  },
  {
    product: 'Bermuda Lin Mistral',
    gender: 'homme',
    description: 'Bermuda en lin mélangé, taille élastiquée',
    images: [
      { url: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&q=85', label: 'Option A — Short lin beige' },
      { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=85', label: 'Option B — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=85', label: 'Option C — Short été' },
      { url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=85', label: 'Option D — Bermuda porté plage' },
    ],
  },
  {
    product: 'Casquette Sunset',
    gender: 'homme',
    description: 'Casquette en coton canvas avec logo brodé',
    images: [
      { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=85', label: 'Option A — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=85', label: 'Option B — Casquette portée' },
      { url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=85', label: 'Option C — Casquette coton' },
      { url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=85', label: 'Option D — Casquette beige' },
    ],
  },
  {
    product: 'Ceinture Cuir Tressé',
    gender: 'homme',
    description: 'Ceinture en cuir tressé, boucle en laiton vieilli',
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85', label: 'Option A — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=85', label: 'Option B — Ceinture tressée détail' },
      { url: 'https://images.unsplash.com/photo-1585856331426-d7b3f9fc8868?w=800&q=85', label: 'Option C — Ceinture cuir marron' },
    ],
  },
  {
    product: 'Robe Midi Provençale',
    gender: 'femme',
    description: 'Robe midi fluide en viscose imprimée, bretelles ajustables',
    images: [
      { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=85', label: 'Option A — Robe midi fluide été' },
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=85', label: 'Option B — Robe été fleurie' },
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85', label: 'Option C — Femme robe été' },
      { url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=85', label: 'Option D — Robe terracotta' },
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=85', label: 'Option E — Robe longue fluide' },
    ],
  },
  {
    product: 'Top Lin Côte d\'Azur',
    gender: 'femme',
    description: 'Top en lin avec détails brodés, coupe ample et légère',
    images: [
      { url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=85', label: 'Option A — Top blanc femme' },
      { url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=85', label: 'Option B — Femme top lin été' },
      { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=85', label: 'Option C — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=85', label: 'Option D — Top blanc brodé' },
    ],
  },
  {
    product: 'Jupe Longue Soleil',
    gender: 'femme',
    description: 'Jupe longue fluide avec taille élastiquée, imprimé exclusif',
    images: [
      { url: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=85', label: 'Option A — Jupe longue fluide' },
      { url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=85', label: 'Option B — Jupe longue été' },
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=85', label: 'Option C — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=85', label: 'Option D — Jupe fluide ocre' },
    ],
  },
  {
    product: 'Blouse Romantique Calanques',
    gender: 'femme',
    description: 'Blouse en coton avec manches bouffantes et détails dentelle',
    images: [
      { url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=85', label: 'Option A — Blouse blanche romantique' },
      { url: 'https://images.unsplash.com/photo-1604575396334-816e8e258a44?w=800&q=85', label: 'Option B — Blouse manches bouffantes' },
      { url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=85', label: 'Option C — Actuelle' },
      { url: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800&q=85', label: 'Option D — Femme blouse blanche été' },
    ],
  },
  {
    product: 'Panier Plage Tressé',
    gender: 'femme',
    description: 'Panier en paille naturelle avec anses en cuir',
    images: [
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=85', label: 'Option A — Actuelle panier paille' },
      { url: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&q=85', label: 'Option B — Panier osier anses cuir' },
      { url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=85', label: 'Option C — Sac paille plage' },
      { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=85', label: 'Option D — Panier tressé' },
    ],
  },
  {
    product: 'Foulard Soie Mimosa',
    gender: 'femme',
    description: 'Foulard en soie naturelle, imprimé mimosa exclusif',
    images: [
      { url: 'https://images.unsplash.com/photo-1584030373081-f37b614eee3c?w=800&q=85', label: 'Option A — Foulard coloré' },
      { url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=85', label: 'Option B — Actuelle foulard soie' },
      { url: 'https://images.unsplash.com/photo-1601370690183-1c7796ecec61?w=800&q=85', label: 'Option C — Foulard jaune' },
      { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=85', label: 'Option D — Accessoire soie' },
    ],
  },
];

export default function ImagePreviewPage() {
  return (
    <div style={{ background: '#fefcf8', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
          Sélection d&apos;images — LOLETT
        </h1>
        <p style={{ color: '#666', marginBottom: 40, fontSize: 16 }}>
          Choisis les meilleures images pour chaque produit. Note les lettres (A, B, C...) de tes préférées.
        </p>

        {imageOptions.map((product, i) => (
          <div key={i} style={{ marginBottom: 60, borderBottom: '2px solid #e5e0d5', paddingBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: product.gender === 'homme' ? '#2418a6' : '#c4a44e',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {product.gender}
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {product.product}
              </h2>
            </div>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>{product.description}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 16,
            }}>
              {product.images.map((img, j) => (
                <div key={j} style={{
                  border: '2px solid #e5e0d5',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.label}
                    style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  <div style={{ padding: '10px 14px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                      {img.label}
                    </p>
                    <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0', wordBreak: 'break-all' }}>
                      {img.url.split('?')[0].split('/').pop()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
