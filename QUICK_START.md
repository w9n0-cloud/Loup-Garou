# ⚡ DÉMARRAGE RAPIDE - LA MEUTE

Guide ultra-rapide pour jouer en 5 minutes ! 🐺

---

## 🎯 EN BREF

**La Meute** = Loup-Garou de Thiercelieux version Minecraft
- **8-20 joueurs** recommandés
- **Rôles** assignés automatiquement
- **Phases** jour/nuit avec timer
- **Victoire** automatique (loups ou village)

---

## 🚀 INSTALLATION (2 minutes)

### Option 1 : Prism Launcher (RECOMMANDÉ)

1. Télécharge `LaMeute-Client.zip`
2. Ouvre Prism Launcher
3. Clique "Add Instance" → "Import from zip"
4. Sélectionne le fichier
5. Alloue **6-8 GB de RAM** (Edit Instance → Settings → Java)
6. Lance !

### Option 2 : CurseForge / Modrinth

1. Cherche "La Meute" sur la plateforme
2. Installe le modpack
3. Configure la RAM (6-8 GB)
4. Lance !

---

## 🎮 JOUER (1 minute)

### Rejoindre un serveur

```
IP du serveur : [À définir]
Version : 1.20.1
```

### Lancer un serveur local

```bash
# Windows
cd server
start.bat

# Linux/Mac
cd server
./start.sh
```

---

## 🐺 COMMANDES ESSENTIELLES

```bash
/lameute help           # Aide complète
/lameute start          # Lancer une partie (OP uniquement)
/lameute timer auto     # Activer le timer automatique
```

### Pendant la partie

- **Clic droit** sur un joueur → Voter pour l'éliminer
- **Clic gauche** sur un joueur → Annuler le vote
- **Shift + Regarder le ciel** → Revoir son rôle

---

## 🎭 RÔLES PRINCIPAUX

| Rôle | Équipe | Pouvoir |
|------|--------|---------|
| 🐺 **Loup-Garou** | Loups | Vote pour tuer la nuit |
| 🏠 **Villageois** | Village | Vote pour éliminer le jour |
| 👁 **Voyante** | Village | Découvre un rôle par nuit |
| ⚗ **Sorcière** | Village | Potions de vie et mort |
| 🏹 **Chasseur** | Village | Tire en mourant |
| 💕 **Cupidon** | Village | Lie deux amoureux |

**20 rôles au total !** Tape `/lameute help` en jeu pour la liste complète.

---

## ⚙️ CONFIGURATION MINIMALE

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| **RAM** | 6 GB | 8 GB |
| **CPU** | 4 cœurs | 6+ cœurs |
| **GPU** | GTX 1050 | RTX 2060+ |
| **Stockage** | 5 GB (SSD) | 10 GB (SSD) |

---

## 🎯 DÉROULEMENT D'UNE PARTIE

```
1. Le MJ tape /lameute start
   ↓
2. Les rôles sont distribués automatiquement
   ↓
3. Les joueurs sont téléportés en cercle
   ↓
4. JOUR (5 min) : Discussion + Vote
   ↓
5. Élimination du joueur le plus voté
   ↓
6. NUIT (6 min) : Loups votent + Rôles agissent
   ↓
7. Mort de la victime des loups
   ↓
8. Vérification automatique de victoire
   ↓
9. Retour au JOUR si partie non finie
```

**Victoire :**
- **Loups** : Quand loups ≥ villageois
- **Village** : Quand tous les loups sont morts

---

## 🐛 PROBLÈMES FRÉQUENTS

### Le jeu crash au lancement

```bash
Solution :
1. Alloue plus de RAM (8 GB recommandé)
2. Mets à jour tes drivers GPU
3. Vérifie que Java 17+ est installé
```

### Les commandes ne marchent pas

```bash
Solution :
1. Vérifie que tu es OP sur le serveur
2. Tape /op <ton_pseudo> depuis la console
```

### Le timer ne démarre pas

```bash
Solution :
1. Tape /lameute timer auto
2. Vérifie que la partie est lancée (/lameute start)
```

### Je ne vois pas mon rôle

```bash
Solution :
1. Shift + Regarde vers le ciel
2. Regarde le scoreboard à droite
3. Tape /lameute help pour plus d'infos
```

---

## 📚 DOCUMENTATION COMPLÈTE

- **README.md** - Documentation complète
- **INSTALLATION.md** - Guide d'installation détaillé
- **REGLES_DU_JEU.md** - Règles du Loup-Garou
- **COMMANDES.md** - Toutes les commandes
- **CHANGELOG.md** - Historique des versions

---

## 🎵 AMÉLIORER L'IMMERSION

### Shaders (optionnel)

1. Installe Oculus (déjà dans le modpack)
2. Télécharge Complementary Shaders
3. Place dans `shaderpacks/`
4. Active dans Options → Video Settings → Shader Packs

### Resource Packs (optionnel)

Voir `resourcepacks/README.txt` pour des recommandations.

### Voice Chat (TRÈS RECOMMANDÉ)

1. Installe le mod "Simple Voice Chat"
2. Recommande à tous les joueurs de l'installer
3. Activer le proximity chat (entendre seulement les joueurs proches)

---

## 🤝 SUPPORT

**Problème non résolu ?**

1. Vérifie les logs : `.minecraft/logs/latest.log`
2. Crée une issue sur GitHub
3. Rejoins le Discord : [Lien]

---

## 🎉 C'EST PARTI !

Tu es prêt ! Lance le jeu et profite !

**Rappel :** Il faut **minimum 8 joueurs** pour une vraie partie de Loup-Garou.

---

**🐺 Que la chasse commence ! 🌕**

*"La nuit tombe sur Thiercelieux... Qui sera la prochaine victime ?"*
