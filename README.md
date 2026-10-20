# Grain & Table — Angular

Frontend Angular 22 standalone, TypeScript, signaux, routage et HttpClient. Visuel issu de la maquette Figma : crème, olive, Cormorant Garamond, DM Sans, emblème vectoriel et photos locales.

## Développement

Node 24 : `npm ci`, puis `npm start` sur http://localhost:4200. Démarrer l’API Java du dépôt `grainettable-backend` sur localhost:8080. Le proxy conserve la même origine pour les sessions et la protection CSRF.

`npm run build` compile le site. Pour les tests navigateur : API locale avec `SEED_DEMO=true`, `ADMIN_EMAIL=admin@grainettable.local`, `ADMIN_PASSWORD=Local-test-only-password-2026` **uniquement dans la base de test**, puis `npx playwright install chromium` et `npx playwright test`. Les tests n’envoient aucun message WhatsApp.

## Fonctions

Accueil, catalogue avec recherche, filtres, tri et pagination dans l’URL, fiche produit, panier conservé localement, commande sans compte, coordonnées de la boutique et Google Maps. Le checkout invité collecte le nom, le téléphone et le message, puis vérifie le panier côté API, enregistre la demande et redirige vers WhatsApp. Le client doit ensuite envoyer le message et attendre la confirmation de la boutique.

Administration : produits et catégories, import photo, prix, stock, visibilité, liste des demandes et confirmation. Les gardes Angular servent à la navigation ; l’API contrôle réellement les autorisations.

## Déploiement

Image Docker Node 24 → Nginx sans privilèges sur 8080. Les requêtes /api sont relayées vers le service Java du réseau privé. TLS est géré par le Caddy déjà présent sur le VPS. Les polices et assets sont locaux, sans URL Figma temporaire.

Le workflow GitHub vérifie le build, l’audit et les tests navigateur avec Java 21. Après configuration des secrets `VPS_SSH_KEY` / `VPS_KNOWN_HOSTS` et de la variable `DEPLOY_ENABLED=true`, les commits testés sur main sont déployés par un compte SSH à commande forcée. Aucun accès root interactif n’est utilisé par le pipeline.

Les prix et produits de la maquette ne sont pas chargés en production : ajouter les vraies références depuis l’administration. Les photos d’ambiance restent illustratives. Aucun paiement en ligne n’est demandé ; son intégration sera une évolution distincte.

## Interface responsive et PWA

Tailwind CSS 4 et Angular Material 22, thèmes issus de Figma. Navigation mobile, administration avec tiroir et cartes produits sur téléphone, champs Material, grilles adaptatives de 320 à 1440 px. Site installable (manifeste et service worker Angular en production). Voir [les choix de structure, la référence du template et les consignes CSS/PWA](docs/template-adaptation.md).

## Nouvelle gestion

Consulter [le fonctionnement de la boutique sans compte et de l’administration](docs/gestion-boutique.md) pour les statistiques, les stocks, les réglages et le bouton GPS.
