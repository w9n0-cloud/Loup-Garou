# 📂 STRUCTURE DU PROJET - LA MEUTE

Documentation complète de l'organisation du modpack.

---

## 🌳 Arborescence complète

```
modpack/
│
├── 📄 README.md                    # Documentation principale
├── 📄 CHANGELOG.md                 # Historique des versions
├── 📄 CONTRIBUTING.md              # Guide pour contribuer
├── 📄 PROJECT_STRUCTURE.md         # Ce fichier
├── 📄 INSTALLATION.md              # Guide d'installation
├── 📄 REGLES_DU_JEU.md            # Règles du Loup-Garou
├── 📄 COMMANDES.md                 # Liste des commandes
├── 📄 MODS_DOWNLOAD_LINKS.txt     # Liens de téléchargement
├── 📄 .gitignore                   # Fichiers à ignorer
├── 📄 manifest.json                # Manifeste CurseForge
├── 📄 modrinth.index.json          # Manifeste Modrinth
│
├── 📦 LaMeute-Client.zip           # Archive client
├── 📦 LaMeute-Server.zip           # Archive serveur
├── 🌐 index.html                   # Page web du modpack
│
├── 📁 overrides/                   # Fichiers client (remplacent le vanilla)
│   ├── 📁 kubejs/                  # Scripts et données KubeJS
│   │   ├── 📁 server_scripts/      # Scripts côté serveur
│   │   │   └── 🐺 loup_garou_roles.js  # Script principal (3400+ lignes)
│   │   ├── 📁 client_scripts/      # Scripts côté client
│   │   │   └── 🎨 loup_garou_ui.js     # Interface utilisateur
│   │   ├── 📁 startup_scripts/     # Scripts de démarrage
│   │   │   └── ⚙️ loup_garou_items.js  # Items personnalisés
│   │   └── 📁 data/                # Données sauvegardées (gitignore)
│   │       ├── player_titles.json  # Titres/grades des joueurs
│   │       └── lameute_config.json # Configuration du jeu
│   │
│   ├── 📁 config/                  # Configuration des mods
│   │   ├── dynamicsurroundings-common.toml
│   │   ├── werewolves-common.toml
│   │   ├── minecolonies-common.toml
│   │   ├── origins-common.toml
│   │   ├── sereneseasons-common.toml
│   │   └── toughasnails-common.toml
│   │
│   ├── 📁 mods/                    # Fichiers JAR des mods
│   │   ├── .gitkeep
│   │   ├── kubejs-forge-2001.6.5-build.16.jar
│   │   ├── embeddium-0.3.31+mc1.20.1.jar
│   │   ├── werewolves-[version].jar
│   │   └── ... (50+ mods)
│   │
│   ├── 📁 resourcepacks/           # Packs de ressources
│   │   └── README.txt
│   │
│   └── 📁 shaderpacks/             # Packs de shaders
│       └── README.txt
│
├── 📁 server/                      # Fichiers serveur dédiés
│   ├── server.properties           # Configuration serveur
│   ├── start.sh                    # Script de démarrage Linux
│   ├── start.bat                   # Script de démarrage Windows
│   └── README.md                   # Instructions serveur
└── 📁 .git/                        # Historique Git (gitignore)
```

---

## 📋 Description des dossiers

### 📁 `/overrides/kubejs/`

**Rôle** : Scripts JavaScript pour le mod KubeJS

#### 🐺 `server_scripts/loup_garou_roles.js`

**Fichier principal du jeu (3400+ lignes)**

**Sections :**
1. **Configuration** (lignes 1-150)
   - Constantes `CONFIG`, `SOUNDS`, `COLORS`
   - Variables globales (titres, rôles, état du jeu)
   - Fonctions de sauvegarde/chargement

2. **Fonctions utilitaires** (lignes 150-300)
   - `playSound()` - Jouer des sons
   - `showTitle()` - Afficher des titres
   - `broadcast()` - Messages globaux
   - `createMessageBox()` - Boîtes stylisées
   - `countAlivePlayers()` - Statistiques
   - `isMJ()` - Vérification MJ

3. **Système de titres** (lignes 300-450)
   - `updatePlayerDisplayName()` - MAJ des noms
   - `getFormattedTitle()` - Formatage
   - Couleurs et grades

4. **Logique du jeu** (lignes 450-1500)
   - `teleportPlayersInCircle()` - Positionnement
   - `transitionToDay()` - Passage au jour
   - `transitionToNight()` - Passage à la nuit
   - `checkVictoryConditions()` - Détection victoire
   - `announceWolfVictory()` - Annonce loups
   - `announceVillageVictory()` - Annonce village
   - `endGame()` - Fin de partie

5. **Rôles et pouvoirs** (lignes 1500-2200)
   - `revealRoleToPlayer()` - Révélation du rôle
   - `giveRuleBook()` - Livre de règles
   - Distribution des items par rôle
   - Pouvoirs spéciaux de chaque rôle

6. **Événements** (lignes 2200-3000)
   - `ItemEvents.rightClicked` - Utilisation pouvoirs
   - `PlayerEvents.chat` - Chat des loups/morts
   - `PlayerEvents.tick` - Mise à jour continue
   - `ServerEvents.tick` - Timer du jeu

7. **Commandes** (lignes 3000-3400)
   - `/lameute start` - Lancer partie
   - `/lameute help` - Aide
   - `/lameute timer` - Gestion timer
   - `/lameute role` - Attribution rôles
   - `/tab` - Gestion titres
   - `/fly` - Vol VIP

#### 🎨 `client_scripts/loup_garou_ui.js`

**Interface utilisateur côté client**
- Overlays personnalisés
- Affichage du rôle
- Indicateurs visuels

#### ⚙️ `startup_scripts/loup_garou_items.js`

**Items personnalisés**
- Items spéciaux pour les rôles
- Textures et comportements

---

### 📁 `/overrides/config/`

**Configuration des mods**

| Fichier | Mod | Description |
|---------|-----|-------------|
| `werewolves-common.toml` | Werewolves | Configuration lycanthropie |
| `minecolonies-common.toml` | MineColonies | Villages et PNJ |
| `sereneseasons-common.toml` | Serene Seasons | Saisons |
| `toughasnails-common.toml` | Tough As Nails | Survie (soif, température) |
| `dynamicsurroundings-common.toml` | Dynamic Surroundings | Sons d'ambiance |

---

### 📁 `/overrides/mods/`

**Mods du modpack (50+)**

**Catégories :**
- 🐺 **Thème** : Werewolves, Epic Fight
- 🏘️ **Villages** : MineColonies, Guard Villagers
- 🌲 **Génération** : Terralith, YUNG's mods
- 🎨 **Graphismes** : Embeddium, Oculus, Entity Culling
- ⚔️ **Combat** : Spartan Weaponry, Better Combat
- 🔧 **QoL** : JEI, JourneyMap, Jade
- 📚 **Libs** : KubeJS, Architectury, GeckoLib

**Note** : Les fichiers .jar sont gitignorés (trop volumineux).
Utilisez `manifest.json` pour télécharger les mods.

---

### 📁 `/server/`

**Fichiers pour serveur dédié**

```
server/
├── server.properties       # Configuration du serveur
├── start.sh               # Démarrage Linux/Mac
├── start.bat              # Démarrage Windows
├── eula.txt               # Acceptation EULA Mojang
└── README.md              # Instructions

# Dossiers générés (gitignore)
├── world/                 # Monde du serveur
├── logs/                  # Logs
├── crash-reports/         # Rapports de crash
└── backups/               # Sauvegardes
```

---

## 🎮 Flux de données

### Cycle de jeu

```
Lancement partie (/lameute start)
         ↓
Distribution des rôles
         ↓
Téléportation en cercle
         ↓
Immobilisation des joueurs
         ↓
┌────────────────────────────┐
│   PHASE JOUR (5 min)       │
│   - Discussion             │
│   - Vote pour éliminer     │
└────────────────────────────┘
         ↓
    Élimination
         ↓
  Vérification victoire ──┐
         ↓                 │
┌────────────────────────────┐   │
│   PHASE NUIT (6 min)       │   │
│   - Loups votent           │   │
│   - Rôles agissent         │   │
└────────────────────────────┘   │
         ↓                 │
    Mort de nuit           │
         ↓                 │
  Vérification victoire ──┘
         ↓
    Retour au jour
```

### Sauvegarde des données

```javascript
// Au démarrage du serveur
ServerEvents.loaded → loadPlayerTitles()
                    → loadGameConfig()

// Pendant le jeu
Changement de titre → savePlayerTitles()
Configuration → saveGameConfig()

// À l'arrêt
ServerEvents.unloaded → savePlayerTitles()
                      → saveGameConfig()
```

**Fichiers JSON :**
- `kubejs/data/player_titles.json` - Titres des joueurs
- `kubejs/data/lameute_config.json` - Point de spawn, config

---

## 🔧 Configuration

### Variables configurables

**`CONFIG` object (loup_garou_roles.js:15-30)**

```javascript
const CONFIG = {
    DEFAULT_DAY_DURATION: 5,        // Minutes
    DEFAULT_NIGHT_DURATION: 6,      // Minutes
    CHASSEUR_SHOOT_TIME: 30,        // Secondes
    DEFAULT_SPAWN_RADIUS: 5,        // Blocs
    FREEZE_PLAYERS: true,           // Immobiliser joueurs
    USE_PARTICLES: true,            // Particules
    USE_SOUNDS: true,               // Sons
    SLOWNESS_LEVEL: 255,            // Niveau slowness
    JUMP_BOOST_LEVEL: 250,          // Niveau jump boost
    AUTO_REVEAL_DELAY: 10           // Secondes
};
```

**Modifier la configuration :**
1. Ouvrir `loup_garou_roles.js`
2. Modifier les valeurs dans `CONFIG`
3. Sauvegarder et redémarrer le serveur

---

## 📊 Statistiques du projet

| Métrique | Valeur |
|----------|--------|
| **Lignes de code JavaScript** | ~3400 |
| **Nombre de rôles** | 20 |
| **Nombre de mods** | 50+ |
| **Commandes** | 15+ |
| **Événements** | 25+ |
| **Fonctions** | 80+ |

---

## 🚀 Build et déploiement

### Créer le ZIP client

```bash
# Inclure :
- manifest.json
- modrinth.index.json
- overrides/
```

### Créer le ZIP serveur

```bash
# Inclure :
- server/
- overrides/kubejs/
- overrides/config/
- overrides/mods/
```

---

## 📝 Nomenclature

### Fichiers

- **Scripts** : `snake_case.js`
- **Config** : `kebab-case.toml`
- **Docs** : `SCREAMING_SNAKE.md`

### Code

- **Constantes** : `SCREAMING_SNAKE_CASE`
- **Variables** : `camelCase`
- **Fonctions** : `camelCase`
- **Événements** : `PascalCase.camelCase`

---

## 🔗 Liens utiles

- [KubeJS Wiki](https://wiki.latvian.dev/books/kubejs)
- [Forge Documentation](https://docs.minecraftforge.net/)
- [CurseForge](https://www.curseforge.com/)
- [Modrinth](https://modrinth.com/)

---

**🐺 Structure mise à jour le 2026-02-14**
**Développé par w9n0**
