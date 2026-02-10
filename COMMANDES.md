# 🐺 LA MEUTE - COMMANDES DISPONIBLES
## Développé par w9n0

---

## 🎮 COMMANDES DU JEU

### `/lameute start <nombre_de_loups>`
Lance une nouvelle partie avec distribution automatique des rôles.
- Distribue les cartes à tous les joueurs connectés
- Le nombre de loups est à définir selon les joueurs présents

**Exemple:** `/lameute start 2` (2 loups-garous)

---

### `/lameute timer <option>`
Gère le timer automatique jour/nuit.

| Option | Description |
|--------|-------------|
| `auto` | Active le timer automatique |
| `stop` | Arrête le timer |
| `jour` | Force le passage au jour |
| `nuit` | Force le passage à la nuit |
| `jour <3/5/7>` | Définit la durée du jour en minutes |

**Exemples:**
- `/lameute timer auto` - Active le timer
- `/lameute timer jour 5` - Jours de 5 minutes

---

### `/lameute roles`
Affiche la liste de tous les rôles et leurs joueurs (Maître du Jeu uniquement).

---

### `/lameute reset`
Réinitialise la partie et retire tous les rôles.

---

### `/lameute hurlement`
Joue un hurlement de loup pour l'ambiance.

---

### `/lameute votes <mode>`
Change le mode d'affichage des votes.

| Mode | Description |
|------|-------------|
| `public` | Tout le monde voit qui vote pour qui en temps réel |
| `anonyme` | Les votes restent secrets jusqu'au décompte (défaut) |

**Votes publics - Annonce dans le chat :**
```
══════════════════════════════════════════
   VILLAGEOIS DE THIERCELIEUX
   [Joueur] a décidé de voter pour [Cible]
══════════════════════════════════════════
```

---

### `/lameute maire <joueur>`
Nomme un joueur comme Maire du village.
- Le vote du Maire compte **DOUBLE**
- Utilisez `/lameute maire remove` pour retirer le maire

**Note :** L'élection du Maire se fait automatiquement au **Jour 2** par vote.

---

## 👑 SYSTÈME DE MAIRE

- **Élection automatique** au Jour 2
- **Vote double** : Le vote du Maire compte x2
- Si le Maire meurt, il peut désigner son successeur (non implémenté encore)

---

## ☠️ MODE SPECTATEUR

Quand un joueur meurt :
- Il passe automatiquement en **mode spectateur**
- Ses messages dans le chat ne sont vus que par le **MJ**
- Il peut observer la partie sans interférer

---

## 📖 LIVRE DES RÈGLES

Chaque joueur reçoit automatiquement un **Livre des Règles** personnel contenant :
- 📜 Son rôle et sa description
- 🎯 Son équipe et son objectif
- 🎮 Comment jouer (jour/nuit)
- ⌨️ Les raccourcis utiles

---

## 📢 APPEL DES RÔLES (Maître du Jeu)

Pendant la nuit, le MJ peut appeler chaque rôle individuellement.
**Seul le rôle appelé voit le titre et peut parler au MJ.**

| Commande | Rôle appelé |
|----------|-------------|
| `/lameute appel loups` | 🐺 Loups-Garous, Loup Blanc, Loup Alpha |
| `/lameute appel voyante` | 👁 Voyante |
| `/lameute appel sorciere` | ⚗ Sorcière et Sorcière Noire |
| `/lameute appel salvateur` | 🛡 Salvateur |
| `/lameute appel cupidon` | 💕 Cupidon |
| `/lameute appel chasseur` | 🏹 Chasseur |
| `/lameute appel renard` | 🦊 Renard |
| `/lameute appel joueur_flute` | 🎵 Joueur de Flûte |
| `/lameute appel corbeau` | 🐦 Corbeau |
| `/lameute appel tous` | ☀️ Réveille tout le monde |
| `/lameute appel silence` | 🤫 Demande le silence |
| `/lameute appel dors` | 💤 Rendort tout le monde |

**Déroulement type d'une nuit :**
1. `/lameute nuit` - La nuit tombe
2. `/lameute appel cupidon` - (Première nuit seulement)
3. `/lameute appel dors`
4. `/lameute appel voyante`
5. `/lameute appel dors`
6. `/lameute appel loups`
7. `/lameute appel dors`
8. `/lameute appel sorciere`
9. `/lameute appel dors`
10. `/lameute jour` - Le jour se lève

---

## 🏷️ COMMANDES DE TITRES

### `/tab <joueur> <titre>`
Assigne un titre à un joueur (visible dans le TAB et le chat).

**Titres disponibles:**
- `dev` - §b§l[DEV]
- `maitre du jeu` ou `mj` - §6§l[MJ]
- `owner` - §4§l[OWNER]
- `admin` - §c§l[ADMIN]
- `modo` - §e§l[MODO]
- `vip` - §a§l[VIP]
- `tasty crousty` - §d§l[Tasty Crousty]
- `chicken street` - §6§l[Chicken Street]
- `joueur` - §7[Joueur] (défaut)

**Exemples:**
- `/tab IchigoatL Chicken Street`
- `/tab w9n0 Dev`
- `/tab MonAmi Owner`

### `/tab remove <joueur>`
Retire le titre d'un joueur (revient à "Joueur").

### `/tab list`
Affiche la liste de tous les titres disponibles.

---

## 🎭 ACTIONS PAR CLIC

### Voyante (Œil d'Araignée)
- **Clic droit sur un joueur** : Voir son rôle

### Sorcière (Pomme Dorée / Rose Wither)
- **Clic droit avec Pomme Dorée sur un joueur** : Sauver (1 utilisation)
- **Clic droit avec Rose Wither sur un joueur** : Tuer (1 utilisation)

### Salvateur (Bouclier)
- **Clic droit sur un joueur** : Protéger pour la nuit

### Cupidon (Coquelicot)
- **Clic droit sur deux joueurs** : Les lier par l'amour

### Loup-Garou (Os)
- **Clic droit sur un joueur** : Voter pour le dévorer

### Chasseur (Arc)
- **À la mort** : Clic droit sur un joueur pour l'emporter

### Voter (Jour)
- **Clic droit sur un joueur** : Voter pour l'éliminer
- **Clic gauche sur un joueur** : Annuler son vote

---

## 🌙 CHAT DE NUIT

**Pendant la nuit :**
- Les messages des joueurs sont **visibles uniquement par le MJ**
- Le MJ peut toujours parler à tout le monde
- Les joueurs reçoivent une confirmation que leur message a été envoyé

**Format des messages de nuit :**
```
[🌙 Nuit] [Titre] Joueur → Message
```

Cela permet aux rôles de communiquer avec le MJ sans que les autres joueurs entendent !

---

## 📊 SCOREBOARD

Le scoreboard affiche en permanence :
- 🎭 Votre rôle actuel
- ⏰ La phase actuelle (Jour/Nuit)
- 👤 Les crédits (Dev: w9n0)

---

## 💡 ASTUCES

- **S'accroupir + regarder en l'air** : Affiche votre rôle dans l'action bar
- Le **timer XP** indique le temps restant (barre = progression, niveau = minutes)
- La nuit se termine automatiquement si tous les rôles ont agi

---

## 🌙 DÉROULEMENT D'UNE PARTIE

1. **Préparation** : Tous les joueurs se connectent
2. **Distribution** : `/lameute start X` (X = nombre de loups)
3. **Révélation** : Chaque joueur clique sur sa carte mystère
4. **Timer** : `/lameute timer auto` pour lancer
5. **Nuit** : Les loups votent, Voyante regarde, Sorcière agit
6. **Jour** : Débat et vote d'élimination
7. **Répéter** jusqu'à victoire d'un camp !

---

*🐺 Bonne partie ! Que la meute soit avec vous ! 🌕*

*Développé par w9n0*
