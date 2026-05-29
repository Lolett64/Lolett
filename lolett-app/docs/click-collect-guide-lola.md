# Click & Collect — Guide d'utilisation (Lola)

Le Click & Collect permet à une cliente de commander en ligne et de venir récupérer
sa commande dans l'une de tes boutiques partenaires. Le fonctionnement est manuel :
tu reçois la commande, tu la relaies au point de vente, puis tu suis l'avancée depuis
ton espace admin.

## Ajouter un point de retrait

1. Va dans **Admin → Gestion → Points de retrait** (`/admin/pickup-points`).
2. Clique sur **« Ajouter un point »**.
3. Remplis le nom de la boutique, l'adresse, le code postal, la ville.
   Les horaires et les instructions de retrait sont optionnels (mais conseillés —
   ils apparaissent dans l'email envoyé à la cliente).
4. Clique sur **« Créer »**. Le point est créé **masqué** par défaut.
5. Quand tu es prête, clique sur l'icône **œil** dans la liste pour l'**activer** :
   il devient alors visible au moment du paiement, côté boutique.

> Astuce : tant qu'un point est « Masqué », personne ne peut le choisir au checkout.
> C'est volontaire : tu actives tes points seulement quand tout est prêt.

## Réordonner les points

Les flèches **↑ / ↓** dans la colonne « Ordre » changent l'ordre d'affichage des points
dans le sélecteur de la cliente. Le premier de la liste apparaît en haut.

## Traiter une commande Click & Collect

1. Va dans **Admin → Commandes**. Utilise le filtre **« Mode de livraison » → Retrait
   en boutique (Click & Collect)**, ou la carte **« À retirer »** du tableau de bord, pour
   repérer les commandes concernées.
2. Ouvre la commande. Tu y vois le point de retrait choisi par la cliente.
3. **Relaie manuellement la commande au point de vente partenaire** (téléphone, email…).
4. Quand le point a la commande en main, clique sur **« Marquer prête au retrait »**
   puis **« Enregistrer »**.
   → Un **code de retrait** unique (format `LOL-XXXXX`) est généré et **envoyé à la
   cliente par email**. Ce code s'affiche aussi sur la fiche commande (encadré ambre).
5. Quand le point confirme que la cliente est venue récupérer sa commande, clique sur
   **« Marquer retirée »** puis **« Enregistrer »**. Aucun email n'est envoyé à cette
   étape — c'est juste pour ton suivi.

> Les commandes Click & Collect ne passent jamais par « Expédiée » / « Livrée » :
> il n'y a pas de transporteur ni d'étiquette. La page d'expédition affiche un message
> dédié pour ces commandes.

## Désactiver / masquer un point

- Dans la liste, clique sur l'icône **œil barré** d'un point actif.
- Une fenêtre te prévient s'il est **référencé par des commandes historiques** :
  le masquer ne supprime jamais ces données, les anciennes commandes gardent leur point.
- Le point disparaît du choix au checkout mais reste consultable sur les commandes passées.

> Il n'y a pas de bouton « Supprimer » : on masque toujours, jamais on n'efface,
> pour ne pas casser l'historique de tes commandes.

## La cliente n'est pas venue récupérer sa commande

1. Ouvre la commande.
2. Pour rembourser : utilise **« Rembourser via Stripe »** (remboursement automatique).
   Ce bouton fonctionne aussi quand la commande est au statut « Prête au retrait ».
3. Tu peux aussi passer la commande en **« Annulée »** (cela ne rembourse pas tout seul —
   pense à rembourser via Stripe si la cliente avait payé).

## Personnaliser l'email « Prête au retrait »

Va dans **Admin → Gestion → Emails**, template **« Commande prête au retrait »**.
Tu peux modifier l'objet, le message d'accueil et le texte. Les variables disponibles
sont `{firstName}`, `{orderNumber}`, `{pickupCode}`, `{pickupPointName}`.
L'aperçu utilise des données d'exemple (cliente Marie, code `LOL-A7K2X`).
