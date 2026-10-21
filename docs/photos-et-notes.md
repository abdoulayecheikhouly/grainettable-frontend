# Photos et notes des produits

Dans Administration → Produits → Ajouter / Modifier, « Sélectionner des photos » accepte plusieurs fichiers à la fois : huit photos au maximum, JPEG ou PNG, cinq Mo par fichier. Les fichiers sont contrôlés et réencodés en JPEG par le serveur, avec une dimension maximale de 1 600 pixels. Choisir « Principale » pour le visuel du catalogue, ou « Retirer » pour enlever une photo de la fiche. Enregistrer ensuite le produit. Les anciennes fiches conservent leur photo.

La fiche publique propose des miniatures et un agrandissement au clic. La fenêtre peut être fermée avec Échap et restitue le focus au bouton d’ouverture.

La notation publique va de 1 à 5 étoiles, sans création de compte. Un cookie technique HttpOnly et SameSite=Strict, conservé un an, rattache la note au navigateur. Une nouvelle note sur le même produit remplace la précédente. Le nombre et la moyenne proviennent des notes enregistrées, jamais de valeurs fictives. Aucun achat n’est vérifié. Effacer les cookies ou utiliser un autre navigateur permet une autre note : cette fonctionnalité ne garantit donc pas une seule note par personne. L’API conserve les protections CSRF, de même origine et limite les envois par adresse IP.

La migration backend V3 ajoute les tables product_image et product_rating. L’API backend doit être déployée avant l’interface. Les photos retirées d’une fiche ne sont pas effacées physiquement afin de préserver les éventuelles autres références à ces médias.

Vérification : tests Java de persistance, ordre, suppression, chemins refusés et notes modifiables ; test navigateur avec deux imports réels, choix de la principale, zoom, persistance après rechargement et affichage à 320, 390, 768 et 1440 pixels.
