# 🤝 CONTRIBUER À LA MEUTE

Merci de ton intérêt pour contribuer au modpack **La Meute** ! 🐺

---

## 📋 Table des matières

1. [Code de conduite](#code-de-conduite)
2. [Comment puis-je contribuer ?](#comment-puis-je-contribuer)
3. [Structure du projet](#structure-du-projet)
4. [Guide de développement](#guide-de-développement)
5. [Conventions de code](#conventions-de-code)
6. [Processus de Pull Request](#processus-de-pull-request)

---

## 🤗 Code de conduite

### Nos engagements

- ✅ Soyez respectueux et inclusif
- ✅ Acceptez les critiques constructives
- ✅ Concentrez-vous sur ce qui est le mieux pour la communauté
- ❌ Pas de harcèlement, d'insultes ou de comportement inapproprié

---

## 💡 Comment puis-je contribuer ?

### 🐛 Signaler un bug

1. Vérifiez que le bug n'est pas déjà signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Logs (`kubejs/server.log` ou `latest.log`)
   - Version du modpack et de Minecraft

### ✨ Proposer une fonctionnalité

1. Vérifiez que la fonctionnalité n'est pas déjà proposée
2. Créez une issue avec le template "Feature Request"
3. Expliquez :
   - Quel problème cela résout
   - Comment cela améliore l'expérience
   - Des exemples de mise en œuvre

### 🔧 Contribuer au code

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## 📁 Structure du projet

```
modpack/
├── overrides/                 # Fichiers client
│   ├── kubejs/               # Scripts KubeJS
│   │   ├── server_scripts/  # Scripts serveur (loup_garou_roles.js)
│   │   ├── client_scripts/  # Scripts client (UI)
│   │   └── startup_scripts/  # Scripts de démarrage
│   ├── config/               # Fichiers de configuration des mods
│   ├── mods/                 # Fichiers .jar des mods
│   ├── resourcepacks/        # Packs de ressources
│   └── shaderpacks/          # Packs de shaders
├── server/                    # Fichiers serveur
├── docs/                      # Documentation
├── README.md                  # Documentation principale
├── CHANGELOG.md               # Historique des versions
├── INSTALLATION.md            # Guide d'installation
├── REGLES_DU_JEU.md          # Règles du jeu Loup-Garou
└── manifest.json              # Manifeste du modpack
```

---

## 🛠️ Guide de développement

### Prérequis

- Minecraft 1.20.1
- Forge 47.2.0+
- Java 17+
- Git
- Un éditeur de code (VS Code recommandé)

### Installation en mode développement

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/la-meute.git
cd la-meute

# 2. Installer les dépendances (si applicable)
# ...

# 3. Tester en local
# Importer dans Prism Launcher ou MultiMC
```

### Scripts KubeJS

Le script principal est `overrides/kubejs/server_scripts/loup_garou_roles.js`.

**Structure du code :**
```javascript
// ════════════════════════════════════════════════════════════
// 📋 CONSTANTES DE CONFIGURATION
// ════════════════════════════════════════════════════════════
const CONFIG = { ... };
const SOUNDS = { ... };
const COLORS = { ... };

// ════════════════════════════════════════════════════════════
// 📊 VARIABLES GLOBALES
// ════════════════════════════════════════════════════════════
let playerTitles = {};
let gameStarted = false;
// ...

// ════════════════════════════════════════════════════════════
// 🛠️ FONCTIONS UTILITAIRES
// ════════════════════════════════════════════════════════════
function playSound(player, sound) { ... }
function showTitle(player, title) { ... }
// ...

// ════════════════════════════════════════════════════════════
// 🎮 LOGIQUE DE JEU
// ════════════════════════════════════════════════════════════
function checkVictoryConditions(server) { ... }
function transitionToDay(server) { ... }
// ...

// ════════════════════════════════════════════════════════════
// 🎪 ÉVÉNEMENTS
// ════════════════════════════════════════════════════════════
PlayerEvents.chat(event => { ... });
ServerEvents.tick(event => { ... });
// ...

// ════════════════════════════════════════════════════════════
// ⌨️ COMMANDES
// ════════════════════════════════════════════════════════════
ServerEvents.commandRegistry(event => { ... });
```

---

## 📐 Conventions de code

### JavaScript/KubeJS

```javascript
// ✅ BONNES PRATIQUES

// 1. Utiliser les constantes
playSound(player, SOUNDS.WOLF_HOWL);
broadcast(server, message, COLORS.SUCCESS);

// 2. Noms de variables clairs
let aliveWolves = 0;
let eliminatedPlayer = null;

// 3. Commentaires descriptifs
// Vérifier les conditions de victoire après élimination
checkVictoryConditions(server);

// 4. Fonctions modulaires
function createMessageBox(title, lines, color) {
    // ...
}

// ❌ MAUVAISES PRATIQUES

// 1. Magic numbers
player.level.playSound(null, pos, sound, 'players', 1.0, 0.8);

// 2. Noms vagues
let x = 0;
let temp = null;

// 3. Code dupliqué
server.getPlayers().forEach(...);
server.getPlayers().forEach(...);
```

### Formatage

- **Indentation** : 4 espaces
- **Lignes** : Max 120 caractères
- **Accolades** : Style K&R (même ligne)
- **Guillemets** : Simples `'string'`

---

## 🔄 Processus de Pull Request

### Checklist avant de soumettre

- [ ] Le code suit les conventions du projet
- [ ] Les fonctions sont documentées avec des commentaires
- [ ] Aucune erreur de syntaxe (`node --check fichier.js`)
- [ ] Testé en jeu (client et serveur si applicable)
- [ ] CHANGELOG.md mis à jour
- [ ] Commit messages clairs et descriptifs

### Format des commits

```
type(scope): description courte

Description détaillée (optionnelle)

Closes #123
```

**Types :**
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, style
- `refactor:` - Refactoring du code
- `perf:` - Amélioration de performance
- `test:` - Tests
- `chore:` - Maintenance, build

**Exemples :**
```
feat(roles): ajoute le rôle Sorcière Noire
fix(chat): corrige le chat des loups la nuit
docs(readme): met à jour la liste des mods
```

### Processus de review

1. Création de la PR
2. Review automatique (CI/CD si configuré)
3. Review manuelle par un mainteneur
4. Demandes de modifications si nécessaire
5. Approbation et merge

---

## 🧪 Tests

### Tester manuellement

1. Lancer un serveur local
2. Connecter 4+ joueurs (ou utiliser des alt accounts)
3. Exécuter `/lameute start`
4. Tester le scénario affecté par tes changements
5. Vérifier les logs pour les erreurs

### Scénarios de test critiques

- [ ] Distribution des rôles (4, 8, 12, 16 joueurs)
- [ ] Transition jour/nuit automatique
- [ ] Vote et élimination
- [ ] Détection de victoire (loups et village)
- [ ] Chat des loups la nuit
- [ ] Pouvoirs de chaque rôle
- [ ] Commandes admin (/lameute, /tab)

---

## 📞 Questions ?

- 💬 **Discord** : [Lien du serveur Discord]
- 📧 **Email** : w9n0@example.com
- 🐛 **Issues** : [GitHub Issues](../../issues)

---

## 🎉 Merci !

Chaque contribution, aussi petite soit-elle, est appréciée ! 🐺✨

**Que la chasse commence !** 🌕
