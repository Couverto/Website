# Couverto Pro (mobile)

App mobile React Native (Expo) pour les restaurateurs Couverto. Reprend l'intégralité du dashboard
web : Dashboard, Réservations, Clients, Avis dans la navbar du bas ; Plan de salle (consultation +
affectation de table), Statistiques, Paramètres (général + horaires/fermetures exceptionnelles),
Collaborateurs (invitations par lien), Galerie (upload photo), Abonnement (changement de plan,
paiements, résiliation) et Parrainage dans l'onglet "Plus". Chaque section respecte le même
filtrage par rôle et par plan (`availablePages`) que le site web ; une section non incluse dans le
plan du restaurant s'affiche grisée avec "Non inclus dans votre plan" plutôt que d'être masquée.

Consomme la même API que le dashboard web (`../server`) — aucune route backend dédiée.

## Démarrer

1. Copier `.env.example` vers `.env` et renseigner `EXPO_PUBLIC_API_URL` (l'IP LAN de votre
   machine si vous testez sur un appareil physique ou un simulateur — `localhost` désigne
   l'appareil lui-même, pas votre machine).

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Lancer le serveur (`../server`), puis démarrer l'app :

   ```bash
   npx expo start
   ```

   Scannez le QR code avec [Expo Go](https://expo.dev/go), ou lancez un simulateur iOS/Android
   depuis le menu du CLI.

## Structure

- `app/` — routes Expo Router (file-based). `(restaurant)/` regroupe les onglets protégés
  (navbar du bas) derrière la sélection d'un restaurant.
- `src/api/` — client axios + fonctions par ressource, calquées sur `client/src/config/axiosConfig.ts`.
- `src/contexts/` — Auth (JWT via `expo-secure-store`), Restaurant actif (rôle/plan), Socket.IO.
- `src/hooks/` — hooks React Query par domaine (bookings, clients, reviews) + `useResponsive`
  pour l'adaptation tablette/rotation.
- `src/components/`, `src/types/`, `src/utils/` — UI partagée, types miroir de `server/src/interfaces`,
  formatage de dates.

## Notes techniques

- **NativeWind est figé à `4.1.x`** : les versions `4.2.x` ajoutent un plugin Babel
  (`react-native-worklets/plugin`) systématiquement requis même sans Reanimated 4, ce qui casse
  le bundling sur ce projet (pas de New Architecture / Reanimated ici). Ne pas monter en version
  sans revalider ce point.
- Pas de `GET /bookings/:id` ou `GET /clients/:id` côté serveur pour les collaborateurs (ces
  routes sont réservées au client propriétaire de la réservation) : les écrans de détail
  réservation/client reçoivent leurs données via les paramètres de navigation plutôt qu'un
  fetch dédié.
