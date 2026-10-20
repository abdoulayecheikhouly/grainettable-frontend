# Référence du template et adaptation Grain & Table

Référence demandée : https://github.com/arkarmin-gg/angular-tailwind-e-commerce-template
Révision examinée : 4be2a255729c6384ebf9a20fbf1a3c2e4ec91ed9.

Le dépôt utilise Angular 19, Tailwind 4, DaisyUI et FakeStore API. Aucun fichier de licence n’est fourni dans la révision examinée. Aucun code source du dépôt n’est redistribué ici : les composants ont été écrits pour Grain & Table en reprenant ses principes généraux de composition.

| Organisation du template             | Implémentation Grain & Table                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Header responsive et compteur panier | Header Figma, navigation Material mobile, logo local et compteur signal                |
| ProductCard indépendant              | components/product-card : modèle réel API, FCFA, disponibilité, détail et ajout panier |
| ProductCardSkeleton                  | components/product-card-skeleton : chargement des grilles sans faux produits           |
| ShoppingCartItem indépendant         | components/cart-item : photo, référence, quantité et retrait                           |
| Deux colonnes commande/récapitulatif | Résumé sticky sur ordinateur, empilé sur téléphone, prix vérifiés par API              |

La source visuelle reste le fichier Figma Gt27nGTVC9ylSkFfmlp49F : crème #f7f4ed, olive #74734c, Cormorant Garamond, DM Sans et photographies de la maquette. Angular Material remplace les contrôles DaisyUI et conserve ce thème. L’authentification, l’administration et la commande WhatsApp restent reliées au backend Java 21.

## CSS et PWA

Tailwind 4 est généré avec PostCSS par scripts/styles.mjs ; le thème Material est généré par Sass JavaScript. npm start et npm run build génèrent les deux feuilles avant Angular, pour éviter le crash natif des workers CSS sur Windows. Après une modification des utilitaires Tailwind ou styles globaux pendant le développement, lancer npm run styles ; après un changement du thème, npm run theme.

Le service worker Angular fonctionne uniquement dans le build production. Il conserve le shell, les icônes et les assets ; aucune réponse /api n’est mise en cache. Les prix, stocks et sessions nécessitent une connexion. Le panier reste dans localStorage. Le manifeste fournit des icônes PNG 192/512 et maskable. Un message explique le mode hors connexion, et une notification propose d’actualiser après une nouvelle version.
