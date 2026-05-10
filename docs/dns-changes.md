# Changements DNS à appliquer — Lorett

> Doc générée le 2026-05-08 dans le cadre de l'audit livraison V1.
> Registrar : NameCheap (domaine `lolettshop.com`).

## 1. Renforcer DMARC (priorité 🔴)

**Pourquoi** : actuellement `p=none`, c'est-à-dire mode monitoring uniquement. Si un attaquant usurpe `@lolettshop.com` pour envoyer du phishing, rien ne l'arrête côté destinataire. La checklist livraison exige `p=quarantine` minimum.

### Pré-requis : aligner SPF avant de durcir DMARC

Le SPF actuel ne mentionne **que Brevo**, alors que Resend envoie aussi des mails (templates de commande). Si on durcit DMARC sans aligner SPF, les mails Resend pourraient passer en spam.

**SPF actuel** (`lolettshop.com` TXT) :
```
v=spf1 include:spf.brevo.com ~all
```

**SPF corrigé à mettre** :
```
v=spf1 include:spf.brevo.com include:_spf.resend.com ~all
```

> ⚠️ Vérifier d'abord que **toutes** les sources d'envoi sont listées. Inventaire actuel :
> - Brevo (transactionnels via SMTP) → `include:spf.brevo.com` ✓
> - Resend (templates React Email) → `include:_spf.resend.com` à ajouter
> - Aucune autre source identifiée dans le code (Stripe envoie depuis ses propres domaines, pas concerné)

### Étape 1 — Ajouter Resend au SPF

Dans NameCheap → **Advanced DNS** → modifier le `TXT` host `@` :

```
v=spf1 include:spf.brevo.com include:_spf.resend.com ~all
```

Attendre 1h pour la propagation. Tester avec :
```bash
dig +short lolettshop.com TXT
# Vérifier qu'on voit bien les deux includes
```

> 💡 **Vérifier le quota DNS lookups SPF (max 10)** avant et après la modification :
> - https://mxtoolbox.com/spf.aspx
> - https://dmarcian.com/spf-survey/
>
> Avec `spf.brevo.com` + `_spf.resend.com`, on est à ~3-4 lookups, large marge. Si on ajoute d'autres providers (Mailchimp, Sendgrid…), recompter.

### Étape 2 — Durcir DMARC progressivement

**Enregistrement actuel** (`_dmarc.lolettshop.com` TXT) :
```
v=DMARC1; p=none; rua=mailto:bonjour@lolettshop.com; ruf=mailto:bonjour@lolettshop.com; fo=1
```

**Phase 1 — Quarantine 10 % (pendant 1 semaine)** :
```
v=DMARC1; p=quarantine; pct=10; rua=mailto:bonjour@lolettshop.com; ruf=mailto:bonjour@lolettshop.com; fo=1
```

→ Surveiller les rapports `rua` reçus sur bonjour@. Si tout est OK :

**Phase 2 — Quarantine 50 % (semaine d'après)** :
```
v=DMARC1; p=quarantine; pct=50; rua=mailto:bonjour@lolettshop.com; ruf=mailto:bonjour@lolettshop.com; fo=1
```

**Phase 3 — Quarantine 100 % (semaine d'après)** :
```
v=DMARC1; p=quarantine; rua=mailto:bonjour@lolettshop.com; ruf=mailto:bonjour@lolettshop.com; fo=1
```

**Phase 4 — Reject (idéal long terme)** :
```
v=DMARC1; p=reject; rua=mailto:bonjour@lolettshop.com; ruf=mailto:bonjour@lolettshop.com; fo=1
```

### Tester

```bash
# Vérifier la conformité globale
# https://www.mail-tester.com (envoyer un mail depuis lolettshop.com et lire le rapport)

# Vérifier l'enregistrement DMARC
dig +short _dmarc.lolettshop.com TXT
```

---

## 2. (Bonus) Améliorer HSTS — quand on aura le temps

**Pourquoi** : Vercel ajoute par défaut `Strict-Transport-Security: max-age=63072000` (2 ans), mais sans `includeSubDomains` ni `preload`. Ça empêche la soumission au HSTS preload list de Chrome/Firefox/Edge.

**Action côté code** (`next.config.ts`) — ajouter dans `sharedSecurityHeaders` :
```ts
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
```

**Action côté soumission** : une fois déployé, soumettre `lolettshop.com` à https://hstspreload.org/.

> ⚠️ Avant `preload` : s'assurer que **tous** les sous-domaines actifs sont en HTTPS. Ici pas de sous-domaine actif détecté (juste apex + www), donc safe.

---

## 3. (Bonus) Email pro

`MX` actuel = NameCheap eForward (forwarding basique vers une boîte personnelle).

Pour un site e-commerce, recommandation : passer sur Google Workspace, Infomaniak ou OVH pour avoir une vraie boîte `bonjour@lolettshop.com` avec interface webmail, signature, archivage. Coût ~5-7 €/mois.

À traiter quand le client le demande, pas bloquant pour la livraison.
