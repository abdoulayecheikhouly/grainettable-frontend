# Animations de la boutique

- Apparition des textes et visuels d’accueil au défilement (550 ms), une seule fois par élément ; léger décalage entre les cartes.
- Transitions de navigation (300 ms), confirmation d’ajout au panier et légère impulsion du compteur (360 ms).
- Survol des cartes, univers, boutons et liens de navigation uniquement pour les appareils disposant d’un pointeur adapté.
- Perspective CSS 3D sur les cartes, univers et visuel d’accueil : inclinaison de 2 à 5 degrés et ombres de profondeur. Aucun modèle produit 3D ou rendu WebGL n’est chargé. Les mobiles tactiles gardent un affichage stable ; le mode réduit supprime l’inclinaison.
- Aucun carrousel automatique, déplacement continu ou bibliothèque supplémentaire.

Les animations utilisent CSS et Web Animations API. Les observateurs sont déconnectés après apparition et lors de la destruction des vues. Les effets ne masquent pas le contenu si IntersectionObserver ou Web Animations API sont indisponibles. `prefers-reduced-motion: reduce` désactive les apparitions, impulsions et transitions de page. Le guide de test est `e2e/motion.spec.ts` : apparition au défilement, compteur après ajout, contenu visible et animations désactivées en mode réduit.
