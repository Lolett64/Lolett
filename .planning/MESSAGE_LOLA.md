# Message WhatsApp à envoyer à Lola — Code Namecheap pour finaliser emails

## Version recommandée

```
Coucou Lola,

On a presque tout fini ! Le site est en ligne et tous les tests
sont OK :

→ https://lolettshop.com

Tu peux y aller te balader, tester avec un code promo si tu veux.
Les emails de confirmation arrivent bien.

Il reste juste UNE dernière étape pour que les emails partent
depuis une adresse pro (genre bonjour@lolettshop.com) au lieu
de l'adresse temporaire actuelle.

On a presque tout fait, mais Namecheap (le registrar du domaine)
va t'envoyer un code de vérification par mail sur ton adresse perso.

Dis-nous juste quand t'es dispo (5 min suffisent), on lance la
demande de notre côté → tu reçois le code dans ta boîte mail →
tu nous l'envoies → on finalise. Et après les emails partiront
en bonjour@lolettshop.com.

Étienne et Lyes
```

## Notes Lyes

- **Ce que tu attends d'elle** : juste sa dispo (5 min). Tu lances la demande sur Brevo qui va déclencher l'envoi du code Namecheap sur l'email perso de Lola. Elle te transmet le code, tu le saisis sur Brevo.
- **Email Namecheap de Lola** : visible dans la modale = `l********t@g*******m` (probablement Gmail perso). Code arrive là.
- **Délai du code** : valide ~10-15 min en général, donc faut que vous soyez en sync.
- **Une fois le code validé** : Brevo crée les 3 records DNS automatiquement sur Namecheap. Vérification ~1-2h max.
- **Côté code post-validation** : changer `DEFAULT_FROM` dans `lib/email-provider.ts` ligne 26 + UPDATE SQL sur `email_settings.from_email` pour basculer vers `bonjour@lolettshop.com` (ou autre choix).

## Pour mémoire — anciens messages

Avant ce message, on avait préparé un message de recette à 24h. Plus pertinent (tests faits par Lyes). Garde uniquement le message ci-dessus.
