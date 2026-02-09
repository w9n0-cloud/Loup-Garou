# ╔═══════════════════════════════════════════════════════════════╗
# ║           🐺 LA MEUTE - RÈGLES DU JEU LOUP-GAROU 🌕            ║
# ╚═══════════════════════════════════════════════════════════════╝

## 📜 INTRODUCTION

Bienvenue dans **La Meute**, une adaptation Minecraft du célèbre jeu 
**Loup-Garou de Thiercelieux** !

Le village de Thiercelieux est maudit. Chaque nuit, des loups-garous
dévorent un habitant. Le jour, les villageois se réunissent pour 
tenter d'identifier et éliminer les monstres parmi eux.

---

## 👥 COMPOSITION RECOMMANDÉE

| Joueurs | Loups | Voyante | Sorcière | Chasseur | Cupidon | Salvateur |
|---------|-------|---------|----------|----------|---------|-----------|
| 8       | 2     | 1       | 1        | 1        | 0       | 0         |
| 10      | 2     | 1       | 1        | 1        | 1       | 0         |
| 12      | 3     | 1       | 1        | 1        | 1       | 1         |
| 16      | 4     | 1       | 1        | 1        | 1       | 1         |

---

## 🎭 LES RÔLES

### 🐺 LOUP-GAROU (Camp des Loups)
**Objectif** : Éliminer tous les villageois

- Chaque nuit, les loups se réveillent ensemble
- Ils choisissent une victime à dévorer
- Le jour, ils doivent se faire passer pour des villageois
- Immunité aux attaques des autres loups

**En jeu Minecraft** :
- 🦴 **Clic droit avec un OS** sur un joueur = Le désigner comme victime
- Vision nocturne pendant la nuit
- Force et vitesse augmentées sous la pleine lune

---

### 🏠 VILLAGEOIS (Camp du Village)
**Objectif** : Identifier et éliminer tous les loups-garous

- Aucun pouvoir spécial
- Doit observer, déduire et voter
- La force du nombre est son atout

**En jeu Minecraft** :
- Joueur de base
- Peut construire des défenses
- 👇 **S'accroupir + regarder en l'air** = Voir son rôle

---

### 👁️ VOYANTE (Camp du Village)
**Objectif** : Aider le village grâce à ses visions

- Chaque nuit, peut voir le rôle d'un joueur
- Doit guider le village sans se dévoiler
- Cible prioritaire des loups si découverte

**En jeu Minecraft** :
- 🕷️ **Clic droit avec ŒIL D'ARAIGNÉE** sur un joueur = Voir son rôle
- 1 utilisation par nuit

---

### ⚗️ SORCIÈRE (Camp du Village)
**Objectif** : Utiliser ses potions avec sagesse

- Possède 2 potions (une seule utilisation chacune)
  - **Potion de Vie** : Sauve la victime de la nuit
  - **Potion de Mort** : Tue un joueur

**En jeu Minecraft** :
- 🍎 **Clic droit avec POMME DORÉE** sur un joueur = Potion de vie
- 🥀 **Clic droit avec ROSE DES TÉNÈBRES** sur un joueur = Potion de mort
- 1 utilisation de chaque pour toute la partie

---

### 🏹 CHASSEUR (Camp du Village)
**Objectif** : Emporter un suspect dans la tombe

- Quand il meurt, il désigne un joueur qui meurt aussi
- Peut viser un loup ou un innocent par erreur
- Son dernier acte peut changer la partie

**En jeu Minecraft** :
- 🏹 **Clic droit avec ARC** quand mort = Tirer sur quelqu'un

---

### 💕 CUPIDON (Camp du Village / Camp des Amoureux)
**Objectif** : Créer le couple et les voir gagner

- Au début de la partie, désigne 2 joueurs amoureux
- Si l'un meurt, l'autre meurt de chagrin
- Si le couple est Loup + Villageois, ils forment un 3ème camp

**En jeu Minecraft** :
- 🌹 **Clic droit avec COQUELICOT** sur 2 joueurs = Les lier par l'amour
- À utiliser au premier jour

---

### 🛡️ SALVATEUR (Camp du Village)
**Objectif** : Protéger le village des attaques nocturnes

- Chaque nuit, protège un joueur des loups
- Ne peut pas protéger la même personne 2 nuits de suite
- Peut se protéger lui-même

**En jeu Minecraft** :
- 🛡️ **Clic droit avec BOUCLIER** sur un joueur = Le protéger cette nuit

---

### 👀 PETITE FILLE (Camp du Village)
**Objectif** : Espionner les loups sans se faire repérer

- Peut espionner les loups pendant leur réveil
- Si les loups la repèrent, elle meurt immédiatement
- Information précieuse mais risquée

**En jeu Minecraft** :
- Peut se cacher près des loups la nuit
- Si repérée, les loups peuvent la désigner

---

### 👴 ANCIEN (Camp du Village)
**Objectif** : Survivre grâce à son expérience

- Résiste à la première attaque des loups-garous la nuit
- S'il est tué par le vote du village, il perd ses pouvoirs (et meurt)
- S'il est tué par la sorcière ou le chasseur, il meurt instantanément

**En jeu Minecraft** :
- 📖 **Item : LIVRE** (Savoir des anciens)
- Passif : 1 vie supplémentaire contre les loups

---

### 🤡 IDIOT DU VILLAGE (Camp du Village)
**Objectif** : Aider le village même après avoir été découvert

- Si le village vote pour l'éliminer, il ne meurt pas
- Il est gracié mais perd son droit de vote pour le reste de la partie
- Il reste en vie et peut continuer à parler/débattre

**En jeu Minecraft** :
- 🪶 **Item : PLUME** (Légèreté d'esprit)
- Passif : Immunité au premier vote d'élimination

---

## ⏰ DÉROULEMENT D'UNE PARTIE

### 🌅 PRÉPARATION
1. Le Maître du Jeu distribue les rôles : `/lameute role [joueur] [role]`
2. Cupidon désigne les amoureux
3. Le village se construit/s'installe

### 🌙 PHASE DE NUIT
1. **Annonce** : `/lameute nuit`
2. Tous les joueurs ferment les yeux (regardent le sol)
3. **La Voyante** : Choisit qui sonder
4. **Le Salvateur** : Choisit qui protéger
5. **Les Loups** : Se réunissent et choisissent leur victime
6. **La Sorcière** : Décide d'utiliser ses potions ou non

### ☀️ PHASE DE JOUR
1. **Annonce** : `/lameute jour`
2. Le Maître du Jeu annonce la/les victime(s)
3. Le Chasseur tire s'il est mort
4. **Débat** : Les joueurs discutent (5-10 minutes)
5. **Vote** : `/lameute vote [joueur]`
6. Le joueur avec le plus de votes est éliminé
7. On recommence la nuit

---

## 🏆 CONDITIONS DE VICTOIRE

| Camp | Condition |
|------|-----------|
| 🐺 Loups-Garous | Tous les villageois sont morts |
| 🏠 Village | Tous les loups-garous sont morts |
| 💕 Amoureux (mixte) | Ils sont les 2 derniers survivants |

---

## 💡 CONSEILS STRATÉGIQUES

### Pour les Loups 🐺
- Ne vous défendez pas trop, c'est suspect
- Accusez subtilement les villageois
- Tuez la Voyante en priorité
- Divisez le village

### Pour le Village 🏠
- Observez qui défend qui
- Méfiez-vous des silencieux
- Protégez la Voyante (sans la dévoiler)
- Écoutez les arguments, pas les émotions

### Pour la Voyante 👁️
- Ne révélez pas votre rôle trop tôt
- Guidez le village subtilement
- Si vous trouvez un loup, préparez vos arguments

### Pour la Sorcière ⚗️
- Gardez la potion de vie pour un rôle important
- La potion de mort peut sauver la partie
- Ne gaspillez pas vos ressources trop tôt

---

## 🎮 COMMANDES DU MAÎTRE DU JEU

```
/lameute start [nb_loups]      - 🎴 DÉMARRE LA PARTIE ! Distribue les cartes
/lameute timer auto            - ⏰ Active le mode automatique (jour/nuit auto)
/lameute timer stop            - Arrête le mode automatique
/lameute timer jour [3/5/7]    - Configure la durée du jour (3, 5 ou 7 min)
/lameute timer nuit [minutes]  - Configure la durée max de la nuit
/lameute roles                  - Afficher tous les rôles disponibles
/lameute role [joueur] [role]  - Assigner manuellement un rôle
/lameute nuit                   - Passer à la nuit (mode manuel)
/lameute jour                   - Passer au jour (mode manuel)
/lameute resultat               - Afficher le résultat du vote (mode manuel)
/lameute hurlement              - Hurler (ambiance)
```

---

## ⏰ SYSTÈME DE TIMER AUTOMATIQUE

### La barre d'XP = Timer visuel !
- Le **niveau** affiche les minutes restantes
- La **barre** se vide progressivement
- **30 secondes** restantes → Avertissement sonore
- **10 secondes** restantes → Dernier avertissement

### Configuration du temps :
| Phase | Durée | Configurable |
|-------|-------|--------------|
| ☀️ **Jour** | 3, 5 ou 7 min | `/lameute timer jour 5` |
| 🌙 **Nuit** | 6 min (max) | `/lameute timer nuit 6` |

### ⚡ Accélération de la nuit
La nuit peut finir **PLUS TÔT** si tous les rôles ont joué :
- ✅ Tous les loups ont désigné une victime
- ✅ La Voyante a utilisé son pouvoir
- ✅ Le Salvateur a protégé quelqu'un
- → *"Tous les rôles ont joué ! Passage au jour dans 5 secondes..."*

---

## 🎴 DISTRIBUTION DES CARTES

Quand le MJ lance `/lameute start 2` (par exemple pour 2 loups) :

1. **Annonce dramatique** → Musique et texte d'ambiance
2. **Une carte mystérieuse** apparaît devant chaque joueur (titre à l'écran)
3. **Clic droit** → La carte se retourne et révèle VOTRE rôle !
4. Vous recevez automatiquement l'**item de votre pouvoir**
5. **Seul vous** pouvez voir votre rôle !

> 💡 Si vous ne cliquez pas, la carte se révèle automatiquement après 10 secondes.

### Distribution automatique des rôles :
| Joueurs | Loups | Voyante | Sorcière | Chasseur | Cupidon | Salvateur |
|---------|-------|---------|----------|----------|---------|-----------|
| 4-5     | 1     | ❌      | ❌       | ❌       | ❌      | ❌        |
| 6       | 1-2   | ✅      | ❌       | ❌       | ❌      | ❌        |
| 7       | 2     | ✅      | ✅       | ❌       | ❌      | ❌        |
| 8-9     | 2     | ✅      | ✅       | ✅       | ❌      | ❌        |
| 10-11   | 2-3   | ✅      | ✅       | ✅       | ✅      | ❌        |
| 12-13   | 3     | ✅      | ✅       | ✅       | ✅      | ✅        |
| 14+     | 3-4   | ✅      | ✅       | ✅       | ✅      | ✅        |

---

## 🗳️ SYSTÈME DE VOTE (Jour)

**C'est ULTRA SIMPLE !**

1. Quand le MJ fait `/lameute jour`, la phase de vote s'active
2. **Regardez le joueur** que vous voulez éliminer
3. **Faites un CLIC DROIT** sur lui → Vote enregistré ! ✅
4. **Faites un CLIC GAUCHE** sur un joueur → Retire votre vote ! ❌
5. Le MJ fait `/lameute resultat` pour voir qui est éliminé

---

## 🌙 ACTIONS DE NUIT (par clic)

| Rôle | Item | Action |
|------|------|--------|
| 🐺 **Loup-Garou** | 🦴 Os | Clic droit = Désigner victime |
| 👁️ **Voyante** | 🕷️ Œil d'araignée | Clic droit = Voir le rôle |
| ⚗️ **Sorcière** | 🍎 Pomme dorée | Clic droit = Sauver |
| ⚗️ **Sorcière** | 🥀 Rose des ténèbres | Clic droit = Tuer |
| 🛡️ **Salvateur** | 🛡️ Bouclier | Clic droit = Protéger |
| 💕 **Cupidon** | 🌹 Coquelicot | Clic droit x2 = Lier |
| 🏹 **Chasseur** | 🏹 Arc | Clic droit (si mort) = Tirer |

---

## ❓ VOIR SON RÔLE

**S'accroupir (Shift) + Regarder vers le ciel** = Votre rôle s'affiche !

---

## 🌕 LA PLEINE LUNE

Tous les 8 jours Minecraft, c'est la **pleine lune** !

Effets spéciaux :
- 🐺 Loups-garous plus puissants
- 👁️ Visions de la Voyante plus claires
- 🌫️ Brouillard mystérieux
- 🔊 Hurlements au loin

---

**🐺 QUE LA MEILLEURE MEUTE GAGNE ! 🌕**

*"Dans l'ombre de la nuit, nul ne sait qui est le loup..."*
