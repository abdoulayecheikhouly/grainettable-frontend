# Boutique sans compte et administration

## Parcours public

La navbar comporte le logo, une recherche, les catégories et le panier. Aucun compte client n’est demandé. Le catalogue avec filtres, tri et pagination est présent sur l’accueil et sur /produits. Chaque carte affiche les données réelles du produit ; aucun avis ni score de dégustation n’est inventé.

Le client prépare son panier, renseigne son nom, son téléphone et éventuellement un message. L’API vérifie les prix et disponibilités, enregistre une demande puis prépare le lien WhatsApp du numéro configuré. Le client doit envoyer le message dans WhatsApp ; l’ouverture du lien n’est pas une vente confirmée. Aucun paiement en ligne.

## Administration

Seuls les administrateurs peuvent accéder aux données de gestion.

- Vue d’ensemble : chiffre d’affaires, commandes et articles confirmés, meilleur produit, histogramme des 10 meilleures ventes classées par quantité. Choisir un mois, une semaine ISO ou une plage de dates. Dates inclusives, heure de Dakar. Les commandes annulées et en attente sont exclues.
- Produits et catégories : création, prix, stock, photos, publication et retrait.
- Suivi du stock : recherche, filtres rupture/faible (1 à 5), ajustement avec motif et derniers mouvements. Une confirmation décrémente une seule fois ; une annulation rétablit le stock.
- Réglages : identité, logo, bandeau, textes d’accueil, adresse, téléphones, numéro WhatsApp, e-mail public, horaires et réseaux sociaux. Ces données alimentent le site et les messages WhatsApp.
- Localisation GPS : bouton disponible dès le tableau de bord et dans les réglages. À utiliser depuis la boutique, avec autorisation du navigateur. Les coordonnées de l’appareil sont enregistrées immédiatement. Une saisie manuelle latitude/longitude reste possible ; elles alimentent les liens Google Maps.

## Données et migration

La migration additive V2 préserve les utilisateurs, produits et commandes existants. Les demandes invitées n’ont aucun utilisateur associé. Le numéro de demande est aléatoire et les reprises utilisent une clé d’idempotence UUID. L’accès aux listes de commandes, statistiques, stocks et réglages d’administration reste protégé par l’API. Les prix et quantités sont contrôlés au serveur ; CSRF, origine et limite de demandes s’appliquent aux commandes invitées.

Les anciens comptes de test ou clients ne sont pas supprimés de la base. Les routes publiques /compte et /inscription redirigent vers le panier et le catalogue. La connexion est réservée à l’équipe. La PWA ne met en cache aucune réponse API et les réglages nécessitent une connexion.
