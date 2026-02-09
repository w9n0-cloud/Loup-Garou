# 🐺 GUIDE D'INSTALLATION - LA MEUTE 🌕

## 📋 PRÉREQUIS

- **Minecraft Java Edition** (version 1.20.1)
- **Java 17** ou supérieur
- **8 GB de RAM** minimum alloués
- Un launcher compatible (Prism, CurseForge, MultiMC)

---

## 🚀 MÉTHODE 1 : PRISM LAUNCHER (Recommandé)

### Étape 1 : Télécharger Prism Launcher
1. Allez sur https://prismlauncher.org
2. Téléchargez et installez

### Étape 2 : Importer le modpack
1. Ouvrez Prism Launcher
2. Cliquez sur **"Add Instance"** (Ajouter une instance)
3. Sélectionnez **"Import from zip"**
4. Choisissez le fichier du modpack
5. Cliquez sur **OK**

### Étape 3 : Configurer la RAM
1. Clic droit sur l'instance → **Edit**
2. Allez dans **Settings** → **Java**
3. Cochez **Memory**
4. Mettez **Minimum: 4096 MB** et **Maximum: 8192 MB**

### Étape 4 : Lancer !
1. Double-cliquez sur l'instance
2. Attendez le chargement des mods
3. Profitez ! 🐺

---

## 🟠 MÉTHODE 2 : CURSEFORGE APP

### Étape 1 : Installer CurseForge
1. Téléchargez depuis https://curseforge.overwolf.com
2. Installez et ouvrez l'application

### Étape 2 : Créer le profil
1. Allez dans **Minecraft**
2. Cliquez sur **"Create Custom Profile"**
3. Nommez-le "La Meute"
4. Version : **1.20.1**
5. Mod Loader : **Forge 47.2.0**

### Étape 3 : Installer les mods
Installez chaque mod listé dans `modlist.html` via la recherche CurseForge

### Étape 4 : Copier les configurations
1. Copiez le dossier `overrides` dans le dossier du profil
2. Le chemin est généralement : 
   `C:\Users\[VotreNom]\curseforge\minecraft\Instances\La Meute`

---

## 🔧 MÉTHODE 3 : INSTALLATION MANUELLE

### Étape 1 : Installer Forge
1. Téléchargez Forge 1.20.1 - 47.2.0 depuis https://files.minecraftforge.net
2. Exécutez l'installateur
3. Sélectionnez **"Install Client"**

### Étape 2 : Télécharger les mods
1. Créez le dossier `mods` dans `.minecraft`
2. Téléchargez chaque mod depuis CurseForge ou Modrinth
3. Placez les fichiers `.jar` dans le dossier `mods`

### Étape 3 : Copier les configurations
1. Copiez le contenu de `overrides/config` vers `.minecraft/config`
2. Copiez le contenu de `overrides/kubejs` vers `.minecraft/kubejs`

### Étape 4 : Configurer le launcher vanilla
1. Ouvrez le Minecraft Launcher
2. Allez dans **Installations**
3. Modifiez le profil Forge
4. Cliquez sur **"More Options"**
5. Dans **JVM Arguments**, changez `-Xmx2G` en `-Xmx8G`

---

## 📦 LISTE DES MODS À TÉLÉCHARGER

### Obligatoires (Core)
- [ ] Howling Moon (ou Werewolves)
- [ ] Origins
- [ ] MineColonies
- [ ] Guard Villagers
- [ ] Terralith
- [ ] YUNG's Better Villages
- [ ] Serene Seasons
- [ ] Dynamic Surroundings
- [ ] Sound Physics Remastered
- [ ] Epic Fight Mod
- [ ] Better Combat
- [ ] Spartan Weaponry
- [ ] JEI
- [ ] JourneyMap
- [ ] Jade
- [ ] KubeJS

### Graphismes
- [ ] Rubidium
- [ ] Oculus
- [ ] Distant Horizons
- [ ] Entity Culling

### Bibliothèques
- [ ] Architectury API
- [ ] Cloth Config
- [ ] GeckoLib
- [ ] Moonlight Lib
- [ ] Collective

---

## 🎨 INSTALLATION DES SHADERS

1. Téléchargez **Complementary Reimagined** :
   https://modrinth.com/shader/complementary-reimagined
   
2. Placez le `.zip` dans :
   `.minecraft/shaderpacks/`
   
3. En jeu : **Options → Video Settings → Shaders**

4. Sélectionnez le shader

---

## ❓ RÉSOLUTION DES PROBLÈMES

### Le jeu crash au lancement
- Vérifiez que vous avez Java 17+
- Allouez plus de RAM (minimum 6GB)
- Vérifiez la compatibilité des mods

### Lag / FPS bas
- Réduisez la distance de rendu
- Désactivez les shaders
- Vérifiez les paramètres de Rubidium

### Mods manquants
- Vérifiez que toutes les bibliothèques sont installées
- Les dépendances sont listées sur chaque page de mod

### Sons ne fonctionnent pas
- Vérifiez le volume dans les options
- Réinstallez Dynamic Surroundings

---

## 🎮 PREMIER LANCEMENT

1. **Créez un nouveau monde**
2. **Type de monde** : Normal ou Large Biomes
3. **Difficulté** : Difficile (pour l'immersion)
4. **Générez des structures** : OUI

### Commandes utiles :
```
/lameute role [joueur] [role] - Assigner un rôle
/lameute nuit - Déclencher la nuit
/lameute jour - Déclencher le jour
/lameute vote [joueur] - Voter contre quelqu'un
/lameute hurlement - Hurler comme un loup
```

---

## 🌙 CONSEILS POUR JOUER

1. **Construisez un village** avec MineColonies
2. **Préparez-vous** avant la première pleine lune
3. **Stockez de l'argent** (fer) pour forger des armes
4. **Restez groupés** la nuit
5. **Observez** le comportement des autres joueurs
6. **Votez avec sagesse** le jour

---

**🐺 Bonne chasse et que le meilleur camp gagne ! 🌕**
