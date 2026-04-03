// ════════════════════════════════════════════════════════════════════════════════
// 🐺 LOUP-GAROU - JEU DE SOCIÉTÉ MINECRAFT
// ════════════════════════════════════════════════════════════════════════════════
// Version: 2.0 - Optimisée et Améliorée
// Développé par: w9n0
// Type: Jeu de société multijoueur (8-20 joueurs)
// ════════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════════
// 📋 CONSTANTES DE CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Durées des phases (en minutes)
    DEFAULT_DAY_DURATION: 5,
    DEFAULT_NIGHT_DURATION: 6,

    // Timer du chasseur (en secondes)
    CHASSEUR_SHOOT_TIME: 30,

    // Spawn et téléportation
    DEFAULT_SPAWN_RADIUS: 5,
    DEFAULT_SPAWN_Y: 100,

    // Gameplay
    MAIRE_ELECTION_DAY: 2,
    PETITE_FILLE_SCRAMBLE_PERCENT: 0.3,
    ANCIEN_EXTRA_LIVES: 1,

    // Particules et effets
    USE_PARTICLES: true,
    USE_SOUNDS: true,

    // Immobilisation des joueurs (jeu de société)
    FREEZE_PLAYERS: true,
    SLOWNESS_LEVEL: 255,
    JUMP_BOOST_LEVEL: 250,

    // Auto-révélation des cartes (en secondes)
    AUTO_REVEAL_DELAY: 10
};

// Sons du jeu
const SOUNDS = {
    WOLF_HOWL: 'minecraft:entity.wolf.howl',
    THUNDER: 'minecraft:entity.lightning_bolt.thunder',
    LEVELUP: 'minecraft:entity.player.levelup',
    CHICKEN: 'minecraft:entity.chicken.ambient',
    ENDER_DRAGON: 'minecraft:entity.ender_dragon.growl',
    TELEPORT: 'minecraft:entity.enderman.teleport',
    CHALLENGE: 'minecraft:ui.toast.challenge_complete',
    ENCHANT: 'minecraft:block.enchantment_table.use',
    WITHER: 'minecraft:entity.wither.spawn'
};

// Couleurs pour les messages
const COLORS = {
    LOUP: '§c',
    VILLAGE: '§a',
    NEUTRE: '§e',
    MORT: '§7',
    ERREUR: '§c',
    SUCCESS: '§a',
    INFO: '§b',
    WARNING: '§6'
};

// ════════════════════════════════════════════════════════════════════════════════
// 📊 VARIABLES GLOBALES
// ════════════════════════════════════════════════════════════════════════════════

// Système de titres/grades
let playerTitles = {};
let ancienLives = {};
let idiotRevealed = {};

// Charger les titres sauvegardés au démarrage
function loadPlayerTitles() {
    try {
        const file = java.io.File('kubejs/data/player_titles.json');
        if (file.exists()) {
            const content = java.nio.file.Files.readString(file.toPath());
            playerTitles = JSON.parse(content);
            console.log('[Tab] Titres chargés: ' + Object.keys(playerTitles).length + ' joueurs');
        }
    } catch (e) {
        console.log('[Tab] Erreur lors du chargement des titres: ' + e);
        playerTitles = {};
    }
}

// Sauvegarder les titres
function savePlayerTitles() {
    try {
        const file = java.io.File('kubejs/data/player_titles.json');
        file.getParentFile().mkdirs();
        java.nio.file.Files.writeString(file.toPath(), JSON.stringify(playerTitles, null, 2));
        console.log('[Tab] Titres sauvegardés: ' + Object.keys(playerTitles).length + ' joueurs');
    } catch (e) {
        console.log('[Tab] Erreur lors de la sauvegarde des titres: ' + e);
    }
}

// Configuration du jeu (Spawn, etc.)
let gameConfig = {
    spawnPoint: {
        x: 0,
        y: 100,
        z: 0,
        set: false,
        radius: 5,
        dimension: 'minecraft:overworld'
    }
};

function loadGameConfig() {
    try {
        const file = java.io.File('kubejs/data/lameute_config.json');
        if (file.exists()) {
            const content = java.nio.file.Files.readString(file.toPath());
            gameConfig = JSON.parse(content);
            console.log('[La Meute] Configuration chargée');
        }
    } catch (e) {
        console.log('[La Meute] Erreur chargement config: ' + e);
    }
}

function saveGameConfig() {
    try {
        const file = java.io.File('kubejs/data/lameute_config.json');
        file.getParentFile().mkdirs();
        java.nio.file.Files.writeString(file.toPath(), JSON.stringify(gameConfig, null, 2));
    } catch (e) {
        console.log('[La Meute] Erreur sauvegarde config: ' + e);
    }
}

// Charger les titres au démarrage
ServerEvents.loaded(event => {
    loadPlayerTitles();
    loadGameConfig();
});

// Sauvegarder les titres quand le serveur s'arrête
ServerEvents.unloaded(event => {
    savePlayerTitles();
    saveGameConfig();
});

// Sauvegarder aussi quand un joueur se déconnecte
PlayerEvents.loggedOut(event => {
    savePlayerTitles();
});

// ════════════════════════════════════════════════════════════════════════════════
// 🛠️ FONCTIONS UTILITAIRES
// ════════════════════════════════════════════════════════════════════════════════

// Jouer un son pour un joueur ou tous les joueurs
function playSound(playerOrServer, sound, volume, pitch) {
    if (!CONFIG.USE_SOUNDS) return;
    volume = volume || 1.0;
    pitch = pitch || 1.0;

    if (playerOrServer.players) {
        // C'est un serveur, jouer pour tout le monde
        playerOrServer.getPlayers().forEach(p => {
            p.level.playSound(null, p.blockPosition(), sound, 'players', volume, pitch);
        });
    } else {
        // C'est un joueur spécifique
        playerOrServer.level.playSound(null, playerOrServer.blockPosition(), sound, 'players', volume, pitch);
    }
}

// Afficher un titre à un joueur ou tous les joueurs
function showTitle(playerOrServer, title, subtitle, fadeIn, stay, fadeOut) {
    fadeIn = fadeIn || 10;
    stay = stay || 70;
    fadeOut = fadeOut || 20;

    if (playerOrServer.players) {
        // C'est un serveur
        playerOrServer.getPlayers().forEach(p => {
            p.server.runCommandSilent('title ' + p.name.string + ' times ' + fadeIn + ' ' + stay + ' ' + fadeOut);
            if (subtitle) p.server.runCommandSilent('title ' + p.name.string + ' subtitle ' + JSON.stringify({"text":subtitle}));
            p.server.runCommandSilent('title ' + p.name.string + ' title ' + JSON.stringify({"text":title}));
        });
    } else {
        // C'est un joueur
        playerOrServer.server.runCommandSilent('title ' + playerOrServer.name.string + ' times ' + fadeIn + ' ' + stay + ' ' + fadeOut);
        if (subtitle) playerOrServer.server.runCommandSilent('title ' + playerOrServer.name.string + ' subtitle ' + JSON.stringify({"text":subtitle}));
        playerOrServer.server.runCommandSilent('title ' + playerOrServer.name.string + ' title ' + JSON.stringify({"text":title}));
    }
}

// Envoyer un message brodcast formaté
function broadcast(server, message, color) {
    color = color || COLORS.INFO;
    server.getPlayers().forEach(p => {
        p.tell(color + message);
    });
}

// Créer une boîte de message stylisée
function createMessageBox(title, lines, color) {
    color = color || '§6';
    let message = [];
    message.push('');
    message.push(color + '§l═══════════════════════════════════════════════════');
    if (title) {
        message.push(color + '§l   ' + title);
        message.push(color + '§l═══════════════════════════════════════════════════');
    }
    lines.forEach(line => message.push(line));
    message.push(color + '§l═══════════════════════════════════════════════════');
    message.push('');
    return message;
}

// Compter les joueurs vivants par camp
function countAlivePlayers(server) {
    let wolves = 0;
    let loupBlanc = 0;
    let villagers = 0;
    let infected = 0;
    let neutral = 0;

    server.getPlayers().forEach(p => {
        if (deadPlayers[p.name.string]) return;
        if (isMJ(p.name.string)) return;

        if (p.hasTag('loup_blanc')) loupBlanc++; // Loup Blanc = SOLO
        else if (p.hasTag('loup_garou') || p.hasTag('loup_alpha')) wolves++;
        else if (p.hasTag('infect')) infected++;
        else if (p.hasTag('ange') || p.hasTag('joueur_flute') || p.hasTag('sorciere_noire') || p.hasTag('pyromane')) neutral++;
        else villagers++;
    });

    return { wolves, loupBlanc, villagers, infected, neutral, totalLoups: wolves + infected };
}

// Vérifier si un joueur est MJ
function isMJ(playerName) {
    const title = playerTitles[playerName] || '';
    return title.toLowerCase().includes('mj') || title.toLowerCase().includes('maitre');
}

// ════════════════════════════════════════════════════════════════════════════════
// 🎨 SYSTÈME DE TITRES ET GRADES
// ════════════════════════════════════════════════════════════════════════════════

const titleColors = {
    'dev': '§b§l[DEV] ',
    'maitre du jeu': '§6§l[MJ] ',
    'mj': '§6§l[MJ] ',
    'owner': '§4§l[OWNER] ',
    'admin': '§c§l[ADMIN] ',
    'modo': '§e§l[MODO] ',
    'vip': '§a§l[VIP] ',
    'tasty crousty': '§d§l[Tasty Crousty] ',
    'chicken street': '§6§l[Chicken Street] ',
    'joueur': '§7[Joueur] '
};

// Fonction pour obtenir le titre formaté
function getFormattedTitle(title) {
    const lowerTitle = title.toLowerCase();
    if (titleColors[lowerTitle]) {
        return titleColors[lowerTitle];
    }
    return '§e§l[' + title + '] ';
}

function updatePlayerDisplayName(player) {
    const playerName = player.name.string;
    const title = playerTitles[playerName] || 'Joueur';
    const formattedTitle = getFormattedTitle(title);
    const teamName = 'title_' + playerName.replace(/[^a-zA-Z0-9]/g, '');

    try {
        player.server.runCommandSilent('team add ' + teamName);
        player.server.runCommandSilent('team join ' + teamName + ' ' + playerName);
        player.server.runCommandSilent('team modify ' + teamName + ' prefix ' + JSON.stringify({"text":formattedTitle.replace(/§/g, '\u00A7')}));
    } catch (e) {
        console.log('[Tab] Erreur updatePlayerDisplayName: ' + e);
    }
}

function teleportPlayersInCircle(server) {
    if (!gameConfig.spawnPoint.set) return 0;

    let players = [];
    server.players.forEach(p => {
        if (p.hasTag('loupgarou_playing')) {
            players.push(p);
        }
    });

    if (players.length === 0) {
        server.players.forEach(p => players.push(p));
    }

    const count = players.length;
    const angleStep = (2 * Math.PI) / count;
    const center = gameConfig.spawnPoint;

    players.forEach((player, index) => {
        const angle = angleStep * index;
        const x = center.x + Math.cos(angle) * center.radius;
        const z = center.z + Math.sin(angle) * center.radius;
        const y = center.y;

        // Stocker la position assignée au joueur
        playerPositions[player.name.string] = {
            x: x.toFixed(1),
            y: y,
            z: z.toFixed(1),
            dimension: center.dimension
        };

        // Téléportation avec regard vers le centre
        player.server.runCommandSilent('execute in ' + center.dimension + ' run tp ' + player.name.string + ' ' + x.toFixed(1) + ' ' + y + ' ' + z.toFixed(1) + ' facing ' + center.x + ' ' + y + ' ' + center.z);

        // Immobiliser le joueur (jeu de société - tout le monde reste à sa place)
        player.server.runCommandSilent('effect give ' + player.name.string + ' minecraft:slowness infinite 255 true');
        player.server.runCommandSilent('effect give ' + player.name.string + ' minecraft:jump_boost infinite 250 true');
    });

    return count;
}

let timerConfig = {
    dayDuration: 5,
    nightDuration: 6,
    currentPhase: 'none',
    timerStartTime: 0,
    timerRunning: false,
    autoMode: false,
    dayCount: 0
};

let maire = null;
let maireVoteActive = false;
let maireVotes = {};
let maireDeceased = null; // Stocke le pseudo du maire qui vient de mourir

let deadPlayers = {};
let playerPositions = {}; // Stocke les positions assignées aux joueurs pour le jeu de société

let sorciereNoireCurse = null; // Joueur maudit par la Sorcière Noire
let sorciereSaveTarget = null; // Joueur sauvé par la potion de vie cette nuit
let sorciereKillTarget = null; // Joueur tué par la potion de mort cette nuit
let corbeauTarget = null; // Cible du Corbeau (+2 votes)
let loupAlphaUsed = false; // Pouvoir infection utilisé
let renardPowerUsed = {}; // Si false, le renard a perdu son flair
let fluteCharmed = {}; // Joueurs charmés par la flûte
let fluteDailyCharm = {}; // Compteur journalier pour la flûte

let nightActionsCompleted = {
    loups: false,
    voyante: false,
    sorciere_checked: false,
    salvateur: false
};

// ════════════════════════════════════════════════════════════════════════════════
// 💀 SYSTÈME CENTRALISÉ DE MORT (Amoureux, Chasseur, Chevalier, Ancien)
// ════════════════════════════════════════════════════════════════════════════════

// Variable pour tracker si l'Ancien a été tué par le village (perte des pouvoirs)
let ancienKilledByVillage = false;

// Fonction centralisée pour gérer la mort d'un joueur
// Gère : Amoureux, Chasseur, Chevalier, succession du Maire
function handlePlayerDeath(server, victimName, cause, killerName) {
    // cause: 'loup', 'vote', 'sorciere', 'chasseur', 'amoureux', 'chevalier', 'pyromane'
    if (deadPlayers[victimName]) return; // Déjà mort

    deadPlayers[victimName] = true;
    lastDeadPlayer = victimName; // Pour le Médium

    let victimPlayer = null;
    server.getPlayers().forEach(p => {
        if (p.name.string === victimName) victimPlayer = p;
    });

    if (!victimPlayer) return;

    // === ANCIEN tué par le VILLAGE (vote, sorcière, chasseur) ===
    if (victimPlayer.hasTag('ancien') && (cause === 'vote' || cause === 'sorciere' || cause === 'chasseur')) {
        ancienKilledByVillage = true;
        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§4§l⚠ L\'ANCIEN A ÉTÉ TUÉ PAR LE VILLAGE ! ⚠');
            p.tell('§c  Les pouvoirs spéciaux du village sont perdus...');
            p.tell('§7  (Voyante, Sorcière, Salvateur ne peuvent plus agir)');
            p.tell('');
        });
    }

    // === Succession du MAIRE ===
    if (victimName === maire) {
        maireDeceased = maire;
        maire = null;
        server.runCommandSilent('tellraw @a ["",{"text":"[Maire] ","color":"gold","bold":true},{"text":"Le Maire est mort ! Il doit désigner son successeur !","color":"red"}]');
        victimPlayer.tell('§e§l[Maire] §fUtilisez §6/lameute successeur <joueur> §fpour nommer le nouveau Maire.');
    }

    // === CHASSEUR - 30s pour tirer (on lui donne son arc à ce moment) ===
    if (victimPlayer.hasTag('chasseur') && cause !== 'amoureux') {
        victimPlayer.addTag('chasseur_mort');
        chasseurCanShoot[victimName] = true;
        victimPlayer.server.runCommandSilent('gamemode adventure ' + victimName);
        victimPlayer.give('minecraft:bow');
        victimPlayer.give('minecraft:arrow');
        victimPlayer.tell('§6§l[Chasseur] §cVous êtes mort... Mais vous avez 30 secondes pour tirer une dernière flèche !');

        server.scheduleInTicks(600, () => {
            if (victimPlayer.hasTag('chasseur_mort')) {
                victimPlayer.removeTag('chasseur_mort');
                chasseurCanShoot[victimName] = false;
                victimPlayer.server.runCommandSilent('gamemode spectator ' + victimName);
                victimPlayer.tell('§c[Chasseur] §7Le temps est écoulé. Vous rejoignez les esprits.');
            }
        });
    } else {
        victimPlayer.server.runCommandSilent('gamemode spectator ' + victimName);
    }

    // Message de mort au joueur
    victimPlayer.tell('');
    victimPlayer.tell('§4§l════════════════════════════════════════════════');
    victimPlayer.tell('§c§l           ☠ VOUS ÊTES MORT(E) ☠');
    victimPlayer.tell('§4§l════════════════════════════════════════════════');
    victimPlayer.tell('');
    victimPlayer.tell('§7  Vous êtes maintenant en mode §8SPECTATEUR');
    victimPlayer.tell('§7  Vos messages seront vus uniquement par le §6MJ');
    victimPlayer.tell('');

    // === AMOUREUX - Si un amoureux meurt, l'autre meurt aussi ===
    if (cupidonLinks[victimName] && cause !== 'amoureux') {
        const loverName = cupidonLinks[victimName];
        if (!deadPlayers[loverName]) {
            server.scheduleInTicks(40, () => {
                server.getPlayers().forEach(p => {
                    p.tell('§d§l💔 ' + loverName + ' §7meurt de chagrin... Son amour ' + victimName + ' est parti.');
                    p.level.playSound(null, p.blockPosition(), 'minecraft:entity.player.levelup', 'players', 0.5, 0.3);
                });
                handlePlayerDeath(server, loverName, 'amoureux', victimName);
            });
        }
    }
}

function resetNightActions() {
    nightActionsCompleted = {
        loups: false,
        voyante: false,
        sorciere_checked: false,
        salvateur: false
    };
}

// Fonction pour vérifier si toutes les actions de nuit sont terminées
function allNightActionsComplete(level) {
    let hasVoyante = false;
    let hasSorciere = false;
    let hasSalvateur = false;
    let hasLoups = false;
    
    level.players.forEach(p => {
        if (deadPlayers[p.name.string]) return; // Ignorer les morts pour le calcul

        if (p.hasTag('voyante')) hasVoyante = true;
        if (p.hasTag('sorciere')) hasSorciere = true;
        if (p.hasTag('salvateur')) hasSalvateur = true;
        if (p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) hasLoups = true;
    });
    
    // Vérifier que chaque rôle présent a agi
    if (hasLoups && !nightActionsCompleted.loups) return false;
    if (hasVoyante && !nightActionsCompleted.voyante) return false;
    if (hasSalvateur && !nightActionsCompleted.salvateur) return false;
    // La sorcière n'est pas obligée d'agir
    
    return true;
}

// Fonction pour vérifier les conditions de victoire
function checkVictoryConditions(server) {
    if (!gameStarted) return false;

    let aliveWolves = 0;       // Loups classiques + Alpha
    let aliveLoupBlanc = 0;    // Loup Blanc (solo !)
    let aliveVillagers = 0;
    let aliveInfected = 0;
    let aliveNeutral = 0;
    let alivePlayers = [];
    let aliveAmoureux = [];

    // Compter les joueurs vivants par camp
    server.getPlayers().forEach(p => {
        const pName = p.name.string;
        if (deadPlayers[pName]) return;

        // Exclure le MJ
        if (isMJ(pName)) return;

        alivePlayers.push(p);

        // Loup Blanc = SOLO (ne compte pas avec les loups pour la victoire)
        if (p.hasTag('loup_blanc')) {
            aliveLoupBlanc++;
        }
        // Loups classiques
        else if (p.hasTag('loup_garou') || p.hasTag('loup_alpha')) {
            aliveWolves++;
        }
        // Infectés (jouent avec les loups)
        else if (p.hasTag('infect')) {
            aliveInfected++;
        }
        // Rôles solo/neutres
        else if (p.hasTag('ange') || p.hasTag('joueur_flute') || p.hasTag('sorciere_noire') || p.hasTag('pyromane')) {
            aliveNeutral++;
        }
        // Tous les autres sont villageois
        else {
            aliveVillagers++;
        }

        // Tracker les amoureux vivants
        if (p.hasTag('amoureux')) aliveAmoureux.push(p);
    });

    const totalLoups = aliveWolves + aliveInfected; // Sans le Loup Blanc !
    const totalVillage = aliveVillagers + aliveNeutral; // Neutres comptés côté village pour le ratio

    // === VICTOIRE DES AMOUREUX (couple mixte loup/village) ===
    if (aliveAmoureux.length === 2 && alivePlayers.length === 2) {
        // Les deux derniers vivants sont les amoureux
        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§d§l════════════════════════════════════════════════════════');
            p.tell('');
            p.tell('§d§l          💕 LES AMOUREUX ONT GAGNÉ ! 💕');
            p.tell('');
            p.tell('§7  ' + aliveAmoureux[0].name.string + ' §d❤ §7' + aliveAmoureux[1].name.string);
            p.tell('§7  Leur amour a triomphé de tous les obstacles...');
            p.tell('');
            p.tell('§d§l════════════════════════════════════════════════════════');
            p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 20');
            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"💕 VICTOIRE DES AMOUREUX 💕","color":"light_purple","bold":true}');
            p.level.playSound(null, p.blockPosition(), 'minecraft:entity.player.levelup', 'players', 1.0, 1.2);
        });
        endGame(server);
        return true;
    }

    // === VICTOIRE DU LOUP BLANC (dernier survivant) ===
    if (aliveLoupBlanc > 0 && alivePlayers.length === 1) {
        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§f§l════════════════════════════════════════════════════════');
            p.tell('');
            p.tell('§f§l          🐺 LE LOUP BLANC A GAGNÉ ! 🐺');
            p.tell('');
            p.tell('§7  Seul contre tous, il a éliminé loups et villageois...');
            p.tell('§7  Le prédateur ultime règne sur les ruines du village.');
            p.tell('');
            p.tell('§f§l════════════════════════════════════════════════════════');
            p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 20');
            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🐺 LOUP BLANC GAGNE 🐺","color":"white","bold":true}');
            p.level.playSound(null, p.blockPosition(), 'minecraft:entity.wolf.howl', 'players', 2.0, 1.5);
        });
        endGame(server);
        return true;
    }

    // === VICTOIRE DU JOUEUR DE FLÛTE (tous les vivants charmés) ===
    let fluteAlive = false;
    let allCharmed = true;
    server.getPlayers().forEach(p => {
        if (deadPlayers[p.name.string] || isMJ(p.name.string)) return;
        if (p.hasTag('joueur_flute')) { fluteAlive = true; return; }
        if (!fluteCharmed[p.name.string]) allCharmed = false;
    });
    if (fluteAlive && allCharmed && alivePlayers.length > 1) {
        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§d§l════════════════════════════════════════════════════════');
            p.tell('§d§l       🎵 LE JOUEUR DE FLÛTE A GAGNÉ ! 🎵');
            p.tell('§7  Tout le village danse sous son emprise...');
            p.tell('§d§l════════════════════════════════════════════════════════');
            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🎵 VICTOIRE FLÛTE 🎵","color":"light_purple","bold":true}');
            p.level.playSound(null, p.blockPosition(), 'minecraft:block.note_block.flute', 'players', 1.0, 1.0);
        });
        endGame(server);
        return true;
    }

    // === VICTOIRE DES LOUPS : égalité ou supériorité numérique ===
    // Le Loup Blanc compte comme "non-village" pour ce calcul
    if (totalLoups > 0 && totalLoups >= totalVillage && totalVillage > 0) {
        announceWolfVictory(server);
        endGame(server);
        return true;
    }

    // === VICTOIRE DU VILLAGE : tous les loups sont morts ===
    if (aliveWolves === 0 && aliveInfected === 0 && aliveLoupBlanc === 0) {
        announceVillageVictory(server);
        endGame(server);
        return true;
    }

    return false;
}

// Annonce de la victoire des Loups
function announceWolfVictory(server) {
    server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§4§l═══════════════════════════════════════════════════');
        p.tell('§c§l             🐺 LES LOUPS-GAROUS GAGNENT ! 🐺');
        p.tell('§4§l═══════════════════════════════════════════════════');
        p.tell('');
        p.tell('§7  Les loups ont dévoré tout le village...');
        p.tell('§7  La meute règne désormais sur Thiercelieux !');
        p.tell('');

        p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 40');
        p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🐺 VICTOIRE DES LOUPS 🐺","color":"dark_red","bold":true}');
        p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"La meute a triomphé !","color":"red"}');
        p.level.playSound(null, p.blockPosition(), 'minecraft:entity.wolf.howl', 'players', 2.0, 0.8);
    });
}

// Annonce de la victoire du Village
function announceVillageVictory(server) {
    server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§a§l═══════════════════════════════════════════════════');
        p.tell('§e§l             ✨ LE VILLAGE GAGNE ! ✨');
        p.tell('§a§l═══════════════════════════════════════════════════');
        p.tell('');
        p.tell('§7  Tous les loups-garous ont été éliminés !');
        p.tell('§7  La paix revient sur Thiercelieux !');
        p.tell('');

        p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 40');
        p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"✨ VICTOIRE DU VILLAGE ✨","color":"gold","bold":true}');
        p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Les loups sont vaincus !","color":"green"}');
        p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.2);
    });
}

// Fonction pour terminer la partie
function endGame(server) {
    gameStarted = false;
    timerConfig.timerRunning = false;
    timerConfig.currentPhase = 'none';
    nightPhaseActive = false;
    votePhaseActive = false;
    mediumChannelActive = false;
    playerPositions = {};

    // Retirer tous les items de rôle immédiatement
    removeAllPlayersRoleItems(server);

    // Révéler tous les rôles à la fin de la partie
    server.scheduleInTicks(100, () => {
        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§6§l═══════════════════════════════════════════════════');
            p.tell('§e§l              📋 RÉCAPITULATIF DES RÔLES');
            p.tell('§6§l═══════════════════════════════════════════════════');
        });
        server.getPlayers().forEach(target => {
            if (!isMJ(target.name.string)) {
                const role = getRevealedRole(target);
                const status = deadPlayers[target.name.string] ? '§c☠' : '§a✓';
                server.getPlayers().forEach(p => {
                    p.tell('§7  ' + status + ' §f' + target.name.string + ' §8→ ' + role);
                });
            }
        });
        server.getPlayers().forEach(p => {
            p.tell('§6§l═══════════════════════════════════════════════════');
            p.tell('');
        });
    });

    // Remettre tout le monde en mode survie après 10 secondes
    server.scheduleInTicks(200, () => {
        server.getPlayers().forEach(p => {
            p.server.runCommandSilent('gamemode survival ' + p.name.string);
            p.server.runCommandSilent('effect clear ' + p.name.string + ' minecraft:slowness');
            p.server.runCommandSilent('effect clear ' + p.name.string + ' minecraft:jump_boost');
            p.tell('§7La partie est terminée. Merci d\'avoir joué !');
        });
    });
}

// Fonction pour passer au jour (utilisée par le timer)
function transitionToDay(server) {
    timerConfig.dayCount++;
    timerConfig.currentPhase = 'day';
    timerConfig.timerStartTime = Date.now();
    votePhaseActive = true;
    nightPhaseActive = false;
    votes = {};
    updateVoteScoreboard(server);
    
    // Exécuter l'attaque des loups-garous
    let loupTarget = null;
    let loupVoteCount = {};
    
    for (let loup in loupVotes) {
        let target = loupVotes[loup];
        loupVoteCount[target] = (loupVoteCount[target] || 0) + 1;
    }
    
    let maxLoupVotes = 0;
    for (let target in loupVoteCount) {
        if (loupVoteCount[target] > maxLoupVotes) {
            maxLoupVotes = loupVoteCount[target];
            loupTarget = target;
        }
    }
    
    // Vérifier si la victime était protégée
    let victimProtected = false;
    let victimPlayer = null;
    let protectionSource = 'none';
    
    server.getPlayers().forEach(p => {
        if (loupTarget && p.name.string === loupTarget) {
            victimPlayer = p;
            if (p.hasTag('protected_tonight')) {
                victimProtected = true;
                protectionSource = 'salvateur';
            } else if (p.hasTag('ancien')) {
                if (ancienLives[p.name.string] === undefined) ancienLives[p.name.string] = 1;
                
                if (ancienLives[p.name.string] > 0) {
                    victimProtected = true;
                    protectionSource = 'ancien';
                    ancienLives[p.name.string]--;
                }
            }
        }
    });
    
    // Retirer tous les items de rôle au lever du jour
    removeAllPlayersRoleItems(server);

    // Mettre le temps du jour
    server.runCommandSilent('time set day');
    
    // ════════════════════════════════════════════
    // 🎭 ANNONCE DRAMATIQUE DU LEVER DU JOUR
    // ════════════════════════════════════════════
    
    // Étape 1 : Écran noir et suspense
    server.getPlayers().forEach(p => {
        p.server.runCommandSilent('title ' + p.name.string + ' times 20 60 20');
        p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"☀️ JOUR ' + timerConfig.dayCount + '","color":"gold","bold":true}');
        p.level.playSound(null, p.blockPosition(), 'minecraft:entity.chicken.ambient', 'ambient', 2.0, 0.8);
    });
    
    // === Résolution de la Sorcière à l'aube ===
    // La Sorcière peut sauver la victime des loups
    if (sorciereSaveTarget && loupTarget) {
        victimProtected = true;
        protectionSource = 'sorciere';
    }

    // Étape 2 : Annonce de la victime (après 2 secondes)
    server.scheduleInTicks(40, () => {
        if (loupTarget && !victimProtected) {
            // Annonce dramatique de la mort des loups
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 80 20');
                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"a été dévoré(e) par les loups...","color":"gray","italic":true}');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"☠ ' + loupTarget + ' ☠","color":"dark_red","bold":true}');
                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.lightning_bolt.thunder', 'players', 0.8, 0.5);
            });

            // Gestion du Chevalier (si un loup l'attaque, un loup meurt aussi)
            if (victimPlayer && victimPlayer.hasTag('chevalier')) {
                let wolves = [];
                server.getPlayers().forEach(p => {
                    if ((p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && !deadPlayers[p.name.string]) {
                        wolves.push(p);
                    }
                });
                if (wolves.length > 0) {
                    const randomWolf = wolves[Math.floor(Math.random() * wolves.length)];
                    server.runCommandSilent('tellraw @a ["",{"text":"⚔ Le Chevalier a emporté ","color":"blue"},{"text":"' + randomWolf.name.string + '","color":"red","bold":true},{"text":" dans sa tombe !","color":"blue"}]');
                    handlePlayerDeath(server, randomWolf.name.string, 'chevalier', loupTarget);
                }
            }

            // Mort de la victime des loups via système centralisé
            handlePlayerDeath(server, loupTarget, 'loup', null);

        } else if (loupTarget && victimProtected) {
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 20');
                if (protectionSource === 'ancien') {
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🛡 L\'Ancien a survécu !","color":"green","bold":true}');
                    p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Son expérience l\'a sauvé...","color":"gray","italic":true}');
                } else if (protectionSource === 'sorciere') {
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"✨ Personne n\'est mort !","color":"green","bold":true}');
                    p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Une force mystérieuse a protégé la victime...","color":"gray","italic":true}');
                } else {
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"✨ Personne n\'est mort !","color":"green","bold":true}');
                    p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Le Salvateur veillait...","color":"gray","italic":true}');
                }
                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.player.levelup', 'players', 1.0, 1.2);
            });
        } else {
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 20');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🌅 Nuit paisible","color":"green"}');
            });
        }

        // === Mort de la potion de mort de la Sorcière (après la victime des loups) ===
        if (sorciereKillTarget && !deadPlayers[sorciereKillTarget]) {
            server.scheduleInTicks(60, () => {
                server.getPlayers().forEach(p => {
                    p.tell('§d§l  ☠ ' + sorciereKillTarget + ' §7a été trouvé(e) empoisonné(e) à l\'aube...');
                    p.level.playSound(null, p.blockPosition(), 'minecraft:entity.wither.spawn', 'players', 0.3, 1.5);
                });
                handlePlayerDeath(server, sorciereKillTarget, 'sorciere', null);
                sorciereKillTarget = null;
            });
        }
    });

    // Reset les saves de la sorcière pour la prochaine nuit
    sorciereSaveTarget = null;
    
    // Étape 3 : Vérification de victoire et instructions de vote (après 5 secondes)
    server.scheduleInTicks(100, () => {
        // Vérifier les conditions de victoire après les morts de la nuit
        if (checkVictoryConditions(server)) {
            return; // Partie terminée
        }

        server.getPlayers().forEach(p => {
            p.tell('');
            p.tell('§6§l═══════════════════════════════════════════════════');
            p.tell('§e§l              ☀️ JOUR ' + timerConfig.dayCount + ' ☀️');
            p.tell('§6§l═══════════════════════════════════════════════════');
            p.tell('');
            p.tell('§a   👆 CLIC DROIT sur un joueur pour VOTER');
            p.tell('§7   Clic gauche pour annuler votre vote');
            p.tell('§7   📊 Barre XP = temps restant');
            p.tell('');
        });
        
        // Vote du Maire au Jour 2
        if (timerConfig.dayCount === 2 && !maire) {
            maireVoteActive = true;
            maireVotes = {};
            server.getPlayers().forEach(p => {
                p.tell('§6§l═══════════════════════════════════════════════════');
                p.tell('§e§l        👑 ÉLECTION DU MAIRE 👑');
                p.tell('§6§l═══════════════════════════════════════════════════');
                p.tell('');
                p.tell('§7  Votez pour élire le Maire du village !');
                p.tell('§e  Le vote du Maire compte §l§6DOUBLE §r§7!');
                p.tell('');
                p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
            });
        }
    });
}

// Fonction pour passer à la nuit (utilisée par le timer)
function transitionToNight(server) {
    timerConfig.currentPhase = 'night';
    timerConfig.timerStartTime = Date.now();
    votePhaseActive = false;
    nightPhaseActive = true;
    clearVoteScoreboard(server);
    
    // Réinitialiser les actions de nuit
    resetNightActions();
    voyantePowerUsed = {};
    loupVotes = {};
    corbeauTarget = null;
    fluteDailyCharm = {};
    sorciereSaveTarget = null;
    sorciereKillTarget = null;
    mediumUsedThisNight = {};
    mediumChannelActive = false;
    mediumPlayerName = null;
    mediumGhostName = null;
    pyromaneDailyUse = {};
    
    // Retirer les protections de la nuit dernière
    server.getPlayers().forEach(p => {
        p.removeTag('protected_tonight');
    });
    
    server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§8§l═══════════════════════════════════════════════════');
        p.tell('§c§l              🌙 LA NUIT TOMBE 🌙');
        p.tell('§7     Le village s\'endort... Les loups se réveillent.');
        p.tell('');
        p.tell('§7   📊 La barre d\'XP = temps restant');
        p.tell('§7   ⚡ Si tout le monde joue vite, la nuit passe plus vite !');
        p.tell('');
        p.tell('§8§l═══════════════════════════════════════════════════');
        p.tell('');
        
        // Mettre le temps de nuit
        p.level.setDayTime(13000);
        
        // Jouer le son
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.wolf.howl', 'ambient', 1.0, 0.6);
    });
    
    // Si pas de MJ, lancer les annonces automatiques
    if (!hasMJ) {
        autoNightPhase = 1;
        runAutoNightSequence(server);
    }
}

function runAutoNightSequence(server) {
    // Phase 1 : Cupidon (première nuit seulement)
    if (timerConfig.dayCount === 0) {
        server.scheduleInTicks(40, () => {
            autoCallRole(server, 'cupidon', '💕 CUPIDON', 'Liez deux joueurs par l\'amour !', 'light_purple');
        });
        
        // Phase 2 : Voyante après 15 secondes
        server.scheduleInTicks(340, () => {
            autoCallRole(server, 'voyante', '👁 VOYANTE', 'Sondez le rôle d\'un joueur.', 'aqua');
        });
        
        // Phase 3 : Loups après 30 secondes
        server.scheduleInTicks(640, () => {
            autoCallLoups(server);
        });
        
        // Phase 4 : Sorcière après 50 secondes
        server.scheduleInTicks(1040, () => {
            autoCallRole(server, 'sorciere', '⚗ SORCIÈRE', 'Utilisez vos potions si vous le souhaitez.', 'light_purple');
        });
        
        // Phase 5 : Salvateur après 60 secondes
        server.scheduleInTicks(1240, () => {
            autoCallRole(server, 'salvateur', '🛡 SALVATEUR', 'Protégez un joueur cette nuit.', 'white');
        });
    } else {
        // Nuits suivantes (pas de Cupidon)
        
        // Voyante
        server.scheduleInTicks(40, () => {
            autoCallRole(server, 'voyante', '👁 VOYANTE', 'Sondez le rôle d\'un joueur.', 'aqua');
        });
        
        // Loups
        server.scheduleInTicks(340, () => {
            autoCallLoups(server);
        });
        
        // Sorcière
        server.scheduleInTicks(740, () => {
            autoCallRole(server, 'sorciere', '⚗ SORCIÈRE', 'Utilisez vos potions si vous le souhaitez.', 'light_purple');
        });
        
        // Salvateur
        server.scheduleInTicks(940, () => {
            autoCallRole(server, 'salvateur', '🛡 SALVATEUR', 'Protégez un joueur cette nuit.', 'white');
        });
        
        // Renard
        server.scheduleInTicks(1040, () => {
            autoCallRole(server, 'renard', '🦊 RENARD', 'Flairez si un loup est parmi 3 joueurs.', 'gold');
        });
        
        // Joueur de Flûte
        server.scheduleInTicks(1140, () => {
            autoCallRole(server, 'joueur_flute', '🎵 JOUEUR DE FLÛTE', 'Charmez 2 joueurs cette nuit.', 'light_purple');
        });
        
        // Corbeau
        server.scheduleInTicks(1240, () => {
            autoCallRole(server, 'corbeau', '🐦 CORBEAU', 'Accusez un joueur (+2 votes demain).', 'dark_gray');
        });

        // Médium
        server.scheduleInTicks(1340, () => {
            autoCallRole(server, 'medium', '🔮 MÉDIUM', 'Contactez l\'esprit du dernier mort.', 'dark_purple');
        });

        // Pyromane
        server.scheduleInTicks(1440, () => {
            autoCallRole(server, 'pyromane', '🔥 PYROMANE', 'Aspergez 2 joueurs cette nuit.', 'gold');
        });
    }
}

// Appeler un rôle automatiquement (+ donner les items)
function autoCallRole(server, roleTag, roleName, instruction, color) {
    let hasRole = false;

    // Donner les items au rôle appelé
    giveItemsToRole(server, roleTag);

    server.getPlayers().forEach(p => {
        if (p.hasTag(roleTag) && !deadPlayers[p.name.string]) {
            hasRole = true;

            // Titre dramatique
            p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
            p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"' + instruction + '","color":"gray"}');
            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"' + roleName + ', réveillez-vous !","color":"' + color + '","bold":true}');

            p.tell('');
            p.tell('§6§l════════════════════════════════════════════════');
            p.tell('§e§l   ' + roleName + ', C\'EST VOTRE TOUR !');
            p.tell('§6§l════════════════════════════════════════════════');
            p.tell('');
            p.tell('§7   ' + instruction);
            p.tell('§7   Utilisez votre item sur un joueur.');
            p.tell('');

            p.level.playSound(null, p.blockPosition(), 'minecraft:block.note_block.chime', 'players', 1.0, 1.2);
        }
    });
    
    // Message global dans le chat
    if (hasRole) {
        server.getPlayers().forEach(p => {
            if (!p.hasTag(roleTag)) {
                p.tell('§8[🌙] §7' + roleName + ' se réveille...');
            }
        });
    }
}

// Appeler les loups (groupe) (+ donner les items)
function autoCallLoups(server) {
    // Donner les items aux loups
    giveItemsToWolves(server);

    let loupsList = [];

    server.getPlayers().forEach(p => {
        if ((p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && !deadPlayers[p.name.string]) {
            loupsList.push(p.name.string);
            
            p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
            p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Choisissez votre victime !","color":"gray"}');
            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🐺 LOUPS, RÉVEILLEZ-VOUS !","color":"red","bold":true}');
            
            p.tell('');
            p.tell('§c§l🐺 ════════════════════════════════════════ 🐺');
            p.tell('§c§l         LES LOUPS SE RÉVEILLENT !');
            p.tell('§c§l🐺 ════════════════════════════════════════ 🐺');
            p.tell('');
            if (loupsList.length > 1) {
                p.tell('§7   Vos alliés loups : §c' + loupsList.filter(n => n !== p.name.string).join(', '));
            }
            p.tell('§7   Cliquez droit avec un §cOS §7sur votre victime.');
            p.tell('');
            
            p.level.playSound(null, p.blockPosition(), 'minecraft:entity.wolf.growl', 'players', 1.0, 0.8);
        }
    });
    
    // Message pour les autres
    server.getPlayers().forEach(p => {
        if (!p.hasTag('loup_garou') && !p.hasTag('loup_blanc') && !p.hasTag('loup_alpha')) {
            p.tell('§8[🌙] §c🐺 Les loups-garous se réveillent...');
        }
    });
}

// Fonction utilitaire pour révéler le rôle d'un joueur mort
function getRevealedRole(player) {
    if (!player) return '§aVillageois';
    if (player.hasTag('loup_garou')) return '§cLOUP-GAROU 🐺';
    if (player.hasTag('loup_blanc')) return '§fLOUP BLANC 🐺';
    if (player.hasTag('loup_alpha')) return '§4LOUP ALPHA 🐺';
    if (player.hasTag('infect')) return '§5INFECTÉ 🦠';
    if (player.hasTag('voyante')) return '§bVoyante 👁';
    if (player.hasTag('sorciere')) return '§dSorcière ⚗';
    if (player.hasTag('sorciere_noire')) return '§0Sorcière Noire 🖤';
    if (player.hasTag('chasseur')) return '§6Chasseur 🏹';
    if (player.hasTag('cupidon')) return '§eCupidon 💕';
    if (player.hasTag('salvateur')) return '§fSalvateur 🛡';
    if (player.hasTag('petite_fille')) return '§ePetite Fille 👀';
    if (player.hasTag('ancien')) return '§2Ancien 👴';
    if (player.hasTag('idiot')) return '§eIdiot du Village 🤡';
    if (player.hasTag('ange')) return '§bAnge 😇';
    if (player.hasTag('joueur_flute')) return '§dJoueur de Flûte 🎵';
    if (player.hasTag('corbeau')) return '§8Corbeau 🐦';
    if (player.hasTag('renard')) return '§6Renard 🦊';
    if (player.hasTag('bouc')) return '§cBouc Émissaire 🐐';
    if (player.hasTag('chevalier')) return '§9Chevalier ⚔';
    if (player.hasTag('medium')) return '§5Médium 🔮';
    if (player.hasTag('chien_loup')) return '§6Chien-Loup 🐕';
    if (player.hasTag('soeurs') || player.hasTag('soeur')) return '§dSœur 👯';
    if (player.hasTag('pyromane')) return '§6Pyromane 🔥';
    if (player.hasTag('voleur')) return '§eVoleur 🎭';
    return '§aVillageois 🏠';
}

// Fonction pour exécuter le résultat du vote
function executeVoteResult(server) {
    // Compter les votes (le maire compte double)
    // L'Idiot révélé ne peut plus voter
    let voteCount = {};
    for (let voter in votes) {
        // Bloquer le vote de l'Idiot révélé
        if (idiotRevealed[voter]) {
            server.getPlayers().forEach(p => {
                if (p.name.string === voter) {
                    p.tell('§e[Idiot] §cVotre vote ne compte pas... Vous avez perdu ce droit.');
                }
            });
            continue;
        }
        let target = votes[voter];
        let voteWeight = (voter === maire) ? 2 : 1; // Maire = vote double
        voteCount[target] = (voteCount[target] || 0) + voteWeight;
    }

    // Ajouter les votes du Corbeau
    if (corbeauTarget) {
        voteCount[corbeauTarget] = (voteCount[corbeauTarget] || 0) + 2;
        server.runCommandSilent('tellraw @a ["",{"text":"[Corbeau] ","color":"dark_gray","bold":true},{"text":"Une malédiction pèse sur ","color":"gray"},{"text":"' + corbeauTarget + '","color":"red"},{"text":" (+2 votes)","color":"gray"}]');
    }

    // Trouver le joueur le plus voté
    let maxVotes = 0;
    let eliminated = null;
    let isTie = false;
    let tiedPlayers = [];

    for (let player in voteCount) {
        if (voteCount[player] > maxVotes) {
            maxVotes = voteCount[player];
            eliminated = player;
            tiedPlayers = [player];
            isTie = false;
        } else if (voteCount[player] === maxVotes) {
            tiedPlayers.push(player);
            isTie = true;
        }
    }

    // En cas d'égalité, vérifier le Bouc Émissaire
    if (isTie && tiedPlayers.length > 1) {
        let boucFound = false;
        server.getPlayers().forEach(p => {
            if (p.hasTag('bouc') && !deadPlayers[p.name.string] && !boucFound) {
                eliminated = p.name.string;
                isTie = false;
                boucFound = true;
                server.runCommandSilent('tellraw @a ["",{"text":"🐐 ","color":"red"},{"text":"Égalité ! Le Bouc Émissaire paie de sa vie...","color":"gray"}]');
            }
        });
        // Si pas de bouc : personne ne meurt en cas d'égalité
        if (!boucFound) {
            eliminated = null;
        }
    }

    // Vérifier si c'est l'Idiot du Village
    let isIdiotSave = false;
    let eliminatedPlayer = null;

    if (eliminated) {
        server.getPlayers().forEach(p => {
            if (p.name.string === eliminated) eliminatedPlayer = p;
        });

        if (eliminatedPlayer && eliminatedPlayer.hasTag('idiot') && !idiotRevealed[eliminated]) {
            isIdiotSave = true;
        }
    }

    // === ANNONCE DU RÉSULTAT ===
    server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§6§l═══════════════════════════════════════════════════');

        if (maireVoteActive) {
            p.tell('§e§l              👑 ÉLECTION DU MAIRE 👑');
        } else {
            p.tell('§c§l              ⚖️ RÉSULTAT DU VOTE ⚖️');
        }
        p.tell('');

        // Afficher tous les votes
        for (let voter in votes) {
            let voteText = '§7  ' + voter;
            if (voter === maire) voteText += ' §6§l(x2)';
            if (idiotRevealed[voter]) voteText += ' §c§l(annulé)';
            voteText += ' → §c' + votes[voter];
            p.tell(voteText);
        }

        p.tell('');

        // Si c'est l'élection du maire
        if (maireVoteActive && eliminated) {
            p.tell('§e§l  👑 ' + eliminated + ' est élu(e) MAIRE !');
            p.tell('§7  Son vote comptera §6DOUBLE §7lors des prochains votes.');
            maire = eliminated;
            maireVoteActive = false;
        } else if (eliminated && isIdiotSave) {
            p.tell('§e§l  🤡 ' + eliminated + ' est l\'Idiot du Village !');
            p.tell('§7  Le village le gracie, mais il perd son droit de vote.');
            idiotRevealed[eliminated] = true;
        } else if (eliminated && !maireVoteActive) {
            p.tell('§4§l  ☠ ' + eliminated + ' est éliminé avec ' + maxVotes + ' vote(s) !');
            if (eliminatedPlayer) {
                p.tell('§7  Son rôle était : ' + getRevealedRole(eliminatedPlayer));
            }
        } else if (!eliminated) {
            if (isTie) {
                p.tell('§7  Égalité ! Personne n\'est éliminé.');
            } else {
                p.tell('§7  Aucun vote enregistré. Personne n\'est éliminé.');
            }
        }
        p.tell('§6§l═══════════════════════════════════════════════════');
        p.tell('');

        // Son dramatique
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.lightning_bolt.thunder', 'players', 0.5, 0.8);
    });

    // === VICTOIRE DE L'ANGE (éliminé au premier vote) ===
    if (eliminatedPlayer && eliminatedPlayer.hasTag('ange') && timerConfig.dayCount <= 1) {
        server.scheduleInTicks(60, () => {
            server.getPlayers().forEach(p => {
                p.tell('');
                p.tell('§b§l════════════════════════════════════════════════════════');
                p.tell('');
                p.tell('§b§l          😇 L\'ANGE A GAGNÉ ! 😇');
                p.tell('');
                p.tell('§7  Il a réussi à se faire éliminer au premier jour.');
                p.tell('§7  Son innocence feinte a trompé le village entier...');
                p.tell('');
                p.tell('§b§l════════════════════════════════════════════════════════');

                p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 20');
                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Son innocence était feinte...","color":"gray","italic":true}');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"😇 L\'ANGE GAGNE 😇","color":"aqua","bold":true}');
                p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
            });
            endGame(server);
        });
    }

    // === MORT DU JOUEUR ÉLIMINÉ (via système centralisé) ===
    if (eliminatedPlayer && !isIdiotSave && !maireVoteActive) {
        handlePlayerDeath(server, eliminated, 'vote', null);

        // Victoire de la Sorcière Noire (victime = joueur maudit, mort par vote)
        if (sorciereNoireCurse && eliminated === sorciereNoireCurse) {
            server.scheduleInTicks(60, () => {
                server.getPlayers().forEach(p => {
                    p.tell('');
                    p.tell('§0§l════════════════════════════════════════════════════════');
                    p.tell('');
                    p.tell('§0§l          🖤 LA SORCIÈRE NOIRE A GAGNÉ ! 🖤');
                    p.tell('');
                    p.tell('§7  §f' + eliminated + ' §7était §0§lMAUDIT§7.');
                    p.tell('§7  En mourant par le vote du village, la malédiction s\'accomplit.');
                    p.tell('');
                    p.tell('§0§l════════════════════════════════════════════════════════');
                    p.tell('');

                    p.server.runCommandSilent('title ' + p.name.string + ' times 20 100 20');
                    p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"La malédiction s\'accomplit...","color":"dark_gray","italic":true}');
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🖤 SORCIÈRE NOIRE GAGNE 🖤","color":"black","bold":true}');

                    p.level.playSound(null, p.blockPosition(),
                        'minecraft:entity.wither.spawn', 'players', 1.0, 0.5);
                });

                endGame(server);
                sorciereNoireCurse = null;
            });
        }

        // Vérifier les conditions de victoire (sauf si solo win déjà déclenché)
        if (!(sorciereNoireCurse && eliminated === sorciereNoireCurse)) {
            if (!(eliminatedPlayer.hasTag('ange') && timerConfig.dayCount <= 1)) {
                server.scheduleInTicks(80, () => {
                    checkVictoryConditions(server);
                });
            }
        }
    }

    votes = {};
}

// Timer principal - mise à jour de la barre d'XP
ServerEvents.tick(event => {
    if (!timerConfig.autoMode || !timerConfig.timerRunning) return;
    
    const server = event.server;
    const now = Date.now();
    let phaseDuration;
    
    if (timerConfig.currentPhase === 'day') {
        phaseDuration = timerConfig.dayDuration * 60 * 1000; // en ms
    } else if (timerConfig.currentPhase === 'night') {
        phaseDuration = timerConfig.nightDuration * 60 * 1000; // en ms
        
        // Vérifier si toutes les actions sont terminées
        let allComplete = true;
        server.getPlayers().forEach(p => {
            if (!allNightActionsComplete(p.level)) {
                allComplete = false;
            }
        });
        
        if (allComplete && (now - timerConfig.timerStartTime) > 10000) {
            // Attendre au moins 10 secondes puis passer au jour
            server.getPlayers().forEach(p => {
                p.tell('§a§l⚡ Tous les rôles ont joué ! Passage au jour dans 5 secondes...');
            });
            
            server.scheduleInTicks(100, () => {
                if (timerConfig.currentPhase === 'night') {
                    executeVoteResult(server); // Pas de vote la nuit, mais on skip
                    transitionToDay(server);
                }
            });
            return;
        }
    } else {
        return;
    }
    
    const elapsed = now - timerConfig.timerStartTime;
    const remaining = Math.max(0, phaseDuration - elapsed);
    const progress = remaining / phaseDuration;
    
    // Mettre à jour la barre d'XP de tous les joueurs
    // XP va de 1.0 (plein) à 0.0 (vide)
    server.getPlayers().forEach(p => {
        // Niveau = minutes restantes
        const minutesLeft = Math.ceil(remaining / 60000);
        p.setExperienceLevel(minutesLeft);
        
        // Barre de progression
        p.setExperienceProgress(progress);
        
        // Avertissements
        if (remaining <= 30000 && remaining > 29000) {
            p.tell('§c§l⚠ 30 SECONDES RESTANTES !');
            p.level.playSound(null, p.blockPosition(),
                'minecraft:block.note_block.pling', 'players', 1.0, 0.5);
        }
        if (remaining <= 10000 && remaining > 9000) {
            p.tell('§4§l⚠ 10 SECONDES !');
            p.level.playSound(null, p.blockPosition(),
                'minecraft:block.note_block.pling', 'players', 1.0, 1.0);
        }
    });
    
    // Fin de phase
    if (remaining <= 0) {
        if (timerConfig.currentPhase === 'day') {
            executeVoteResult(server);
            transitionToNight(server);
        } else if (timerConfig.currentPhase === 'night') {
            transitionToDay(server);
        }
    }
});

// Stockage pour la révélation des cartes
let pendingCardReveal = {}; // {joueur: role} en attente de clic
let gameStarted = false;
let hasMJ = false;
let autoNightPhase = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fonction pour révéler le rôle avec animation
function revealRoleToPlayer(player, role) {
    let roleName = '';
    let roleColor = '';
    let roleEmoji = '';
    let roleDescription = '';
    let roleItem = '';
    
    switch(role) {
        case 'loup_garou':
            roleName = 'LOUP-GAROU';
            roleColor = '§c';
            roleEmoji = '🐺';
            roleDescription = 'Dévorez les villageois chaque nuit !';
            roleItem = 'OS pour désigner votre victime';
            break;
        case 'voyante':
            roleName = 'VOYANTE';
            roleColor = '§b';
            roleEmoji = '👁';
            roleDescription = 'Découvrez le rôle d\'un joueur chaque nuit.';
            roleItem = 'ŒIL D\'ARAIGNÉE pour sonder';
            break;
        case 'sorciere':
            roleName = 'SORCIÈRE';
            roleColor = '§d';
            roleEmoji = '⚗';
            roleDescription = 'Vous avez une potion de vie et une de mort.';
            roleItem = 'POMME DORÉE (vie) | ROSE (mort)';
            break;
        case 'chasseur':
            roleName = 'CHASSEUR';
            roleColor = '§6';
            roleEmoji = '🏹';
            roleDescription = 'Si vous mourrez, vous emportez quelqu\'un !';
            roleItem = 'ARC pour tirer votre dernière flèche';
            break;
        case 'cupidon':
            roleName = 'CUPIDON';
            roleColor = '§e';
            roleEmoji = '💕';
            roleDescription = 'Liez deux joueurs par l\'amour éternel.';
            roleItem = 'COQUELICOT pour lier les amoureux';
            break;
        case 'salvateur':
            roleName = 'SALVATEUR';
            roleColor = '§f';
            roleEmoji = '🛡';
            roleDescription = 'Protégez un joueur chaque nuit.';
            roleItem = 'BOUCLIER pour protéger';
            break;
        case 'petite_fille':
            roleName = 'PETITE FILLE';
            roleColor = '§e';
            roleEmoji = '👀';
            roleDescription = 'Espionnez les loups... sans vous faire voir !';
            roleItem = 'Restez cachée et observez';
            break;
        case 'ancien':
            roleName = 'ANCIEN';
            roleColor = '§2';
            roleEmoji = '👴';
            roleDescription = 'Vous survivez à la première attaque des loups.';
            roleItem = 'Votre expérience et votre ténacité';
            break;
        case 'idiot':
            roleName = 'IDIOT DU VILLAGE';
            roleColor = '§e';
            roleEmoji = '🤡';
            roleDescription = 'Si le village vous vote, vous survivez mais ne votez plus.';
            roleItem = 'Votre folie douce';
            break;
        case 'loup_blanc':
            roleName = 'LOUP BLANC';
            roleColor = '§f';
            roleEmoji = '🐺';
            roleDescription = 'Loup solitaire : tuez aussi un loup une nuit sur deux !';
            roleItem = 'OS (victime) | POUDRE D\'OS (loup)';
            break;
        case 'ange':
            roleName = 'ANGE';
            roleColor = '§b';
            roleEmoji = '😇';
            roleDescription = 'Faites-vous éliminer au premier vote pour gagner !';
            roleItem = 'Votre innocence feinte';
            break;
        case 'joueur_flute':
            roleName = 'JOUEUR DE FLÛTE';
            roleColor = '§d';
            roleEmoji = '🎵';
            roleDescription = 'Charmez tous les joueurs pour gagner seul !';
            roleItem = 'FLÛTE pour charmer 2 joueurs/nuit';
            break;
        case 'corbeau':
            roleName = 'CORBEAU';
            roleColor = '§8';
            roleEmoji = '🐦';
            roleDescription = 'Accusez un joueur : il aura 2 votes contre lui.';
            roleItem = 'PLUME pour marquer votre cible';
            break;
        case 'renard':
            roleName = 'RENARD';
            roleColor = '§6';
            roleEmoji = '🦊';
            roleDescription = 'Flairez si un loup est parmi 3 joueurs.';
            roleItem = 'CAROTTE pour flairer';
            break;
        case 'bouc':
            roleName = 'BOUC ÉMISSAIRE';
            roleColor = '§c';
            roleEmoji = '🐐';
            roleDescription = 'En cas d\'égalité au vote, vous mourrez !';
            roleItem = 'Votre malchance légendaire';
            break;
        case 'loup_alpha':
            roleName = 'LOUP ALPHA';
            roleColor = '§4';
            roleEmoji = '🐺';
            roleDescription = 'Chef de meute : infectez un villageois !';
            roleItem = 'OS + POMME EMPOISONNÉE (infection)';
            break;
        case 'infect':
            roleName = 'INFECTÉ';
            roleColor = '§5';
            roleEmoji = '🦠';
            roleDescription = 'Vous semblez Villageois mais êtes avec les loups.';
            roleItem = 'Votre secret mortel';
            break;
        case 'sorciere_noire':
            roleName = 'SORCIÈRE NOIRE';
            roleColor = '§0';
            roleEmoji = '🖤';
            roleDescription = 'Maudissez un joueur au début. S\'il meurt par vote, vous gagnez !';
            roleItem = 'ENCRE pour maudire';
            break;
        case 'chevalier':
            roleName = 'CHEVALIER';
            roleColor = '§9';
            roleEmoji = '⚔';
            roleDescription = 'Protégez le village, si un loup vous tue il meurt aussi !';
            roleItem = 'ÉPÉE pour vous défendre';
            break;
        case 'medium':
            roleName = 'MÉDIUM';
            roleColor = '§5';
            roleEmoji = '🔮';
            roleDescription = 'Chaque nuit, communiquez avec le dernier mort pour obtenir des indices.';
            roleItem = 'CRYSTAL pour contacter les esprits';
            break;
        case 'soeurs':
        case 'soeur':
            roleName = 'SŒUR';
            roleColor = '§d';
            roleEmoji = '👯';
            roleDescription = 'Vous connaissez l\'identité de votre sœur. Travaillez ensemble !';
            roleItem = 'ROSE pour vous reconnaître';
            break;
        case 'chien_loup':
            roleName = 'CHIEN-LOUP';
            roleColor = '§6';
            roleEmoji = '🐕';
            roleDescription = 'Au début, choisissez : fidèle au village ou rejoindre la meute ?';
            roleItem = 'STEAK pour choisir votre camp';
            break;
        case 'pyromane':
            roleName = 'PYROMANE';
            roleColor = '§6';
            roleEmoji = '🔥';
            roleDescription = 'Aspergez 2 joueurs par nuit. Quand vous êtes prêt, tout brûle !';
            roleItem = 'SILEX pour asperger | TORCHE pour allumer';
            break;
        case 'voleur':
            roleName = 'VOLEUR';
            roleColor = '§e';
            roleEmoji = '🎭';
            roleDescription = 'Choisissez un des 2 rôles supplémentaires au début de la partie.';
            roleItem = 'Attendez le choix de vos cartes...';
            break;
        default:
            roleName = 'VILLAGEOIS';
            roleColor = '§a';
            roleEmoji = '🏠';
            roleDescription = 'Trouvez et éliminez les loups-garous !';
            roleItem = 'Votre voix et votre intuition';
    }
    
    // Animation de titre
    player.server.runCommandSilent('title ' + player.name.string + ' times 20 100 20');
    player.server.runCommandSilent('title ' + player.name.string + ' subtitle {"text":"' + roleDescription + '","color":"gray","italic":true}');
    player.server.runCommandSilent('title ' + player.name.string + ' title {"text":"' + roleEmoji + ' ' + roleName + ' ' + roleEmoji + '","color":"' + roleColor.replace('§', '') + '","bold":true}');
    
    // Message détaillé dans le chat (privé)
    player.tell('');
    player.tell(roleColor + '§l╔══════════════════════════════════════════╗');
    player.tell(roleColor + '§l║                                          ║');
    player.tell(roleColor + '§l║     ' + roleEmoji + ' VOTRE CARTE : ' + roleName + ' ' + roleEmoji + '     ');
    player.tell(roleColor + '§l║                                          ║');
    player.tell(roleColor + '§l╠══════════════════════════════════════════╣');
    player.tell('§7  ' + roleDescription);
    player.tell('');
    player.tell('§7  §lItem : §r§e' + roleItem);
    player.tell('');
    player.tell('§8  Shift + Regarder en l\'air = Revoir votre rôle');
    player.tell(roleColor + '§l╚══════════════════════════════════════════╝');
    player.tell('');
    
    // Son de révélation
    player.level.playSound(null, player.blockPosition(), 
        'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
    
    // Ajouter le tag du rôle
    const allRoles = ['loup_garou', 'villageois', 'voyante', 'sorciere',
                     'chasseur', 'cupidon', 'salvateur', 'petite_fille', 'ancien', 'idiot',
                     'loup_blanc', 'ange', 'joueur_flute', 'corbeau', 'renard', 'bouc',
                     'loup_alpha', 'infect', 'sorciere_noire', 'chevalier',
                     'medium', 'soeurs', 'soeur', 'chien_loup', 'pyromane', 'voleur'];
    allRoles.forEach(r => player.removeTag(r));
    player.addTag(role);
    
    // Les items ne sont PAS donnés à la révélation !
    // Ils seront donnés quand c'est le tour du joueur de jouer (la nuit).
    // Seuls les rôles "passifs dès le début" reçoivent leur item immédiatement :
    switch(role) {
        case 'chien_loup':
            // Doit choisir son camp dès le début
            player.give('minecraft:cooked_beef');
            break;
        case 'sorciere_noire':
            // Doit maudire dès le début
            player.give('minecraft:ink_sac');
            break;
    }

    // Donner le livre des règles personnalisé
    giveRuleBook(player, role, roleName, roleDescription);
}

function giveRuleBook(player, role, roleName, roleDescription) {
    // Déterminer l'équipe du joueur
    let equipe = '§aVillage';
    let objectif = 'Éliminez tous les Loups-Garous !';
    
    if (role === 'loup_garou' || role === 'loup_alpha' || role === 'infect') {
        equipe = '§cLoups';
        objectif = 'Dévorez tous les Villageois !';
    } else if (role === 'loup_blanc') {
        equipe = '§eSolitaire';
        objectif = 'Soyez le dernier survivant ! Éliminez loups ET villageois.';
    } else if (role === 'ange' || role === 'joueur_flute' || role === 'sorciere_noire' || role === 'pyromane') {
        equipe = '§eSolitaire';
        if (role === 'ange') objectif = 'Faites-vous éliminer au premier vote !';
        if (role === 'joueur_flute') objectif = 'Charmez tous les joueurs vivants !';
        if (role === 'sorciere_noire') objectif = 'Faites mourir votre maudit par vote !';
        if (role === 'pyromane') objectif = 'Aspergez puis brûlez tout le monde !';
    } else if (role === 'chien_loup') {
        equipe = '§6À choisir';
        objectif = 'Choisissez votre camp au début de la partie !';
    }
    
    // Créer le livre via commande
    let bookCommand = 'give ' + player.name.string + ' minecraft:written_book{';
    bookCommand += 'title:"Livre de ' + roleName + '",';
    bookCommand += 'author:"Maître du Jeu",';
    bookCommand += 'pages:[';
    
    // Page 1 : Votre rôle
    bookCommand += '\'{"text":"§l§6══ VOTRE RÔLE ══\\n\\n","extra":[';
    bookCommand += '{"text":"§l' + roleName + '\\n\\n","color":"gold"},';
    bookCommand += '{"text":"' + roleDescription + '\\n\\n","color":"gray"},';
    bookCommand += '{"text":"Équipe: ' + equipe + '\\n","color":"white"},';
    bookCommand += '{"text":"\\n§7Objectif:\\n","color":"white"},';
    bookCommand += '{"text":"' + objectif + '","color":"yellow"}';
    bookCommand += ']}\',';
    
    // Page 2 : Comment jouer
    bookCommand += '\'{"text":"§l§6══ COMMENT JOUER ══\\n\\n","extra":[';
    bookCommand += '{"text":"§lJour:\\n","color":"yellow"},';
    bookCommand += '{"text":"• Discutez avec les autres\\n• Clic droit = Voter\\n• Clic gauche = Annuler\\n\\n","color":"gray"},';
    bookCommand += '{"text":"§lNuit:\\n","color":"dark_purple"},';
    bookCommand += '{"text":"• Utilisez vos items\\n• Chat = Message au MJ\\n• Attendez votre tour\\n","color":"gray"}';
    bookCommand += ']}\',';
    
    // Page 3 : Commandes
    bookCommand += '\'{"text":"§l§6══ RACCOURCIS ══\\n\\n","extra":[';
    bookCommand += '{"text":"§lVoir votre rôle:\\n","color":"aqua"},';
    bookCommand += '{"text":"Shift + Regarder en l air\\n\\n","color":"gray"},';
    bookCommand += '{"text":"§lTimer:\\n","color":"aqua"},';
    bookCommand += '{"text":"Barre XP = Temps restant\\n\\n","color":"gray"},';
    bookCommand += '{"text":"§lVotre rôle:\\n","color":"aqua"},';
    bookCommand += '{"text":"Shift + Regarder en l air","color":"gray"}';
    bookCommand += ']}\'';
    
    bookCommand += ']}';
    
    player.server.runCommandSilent(bookCommand);
}

// Événement pour cliquer et révéler la carte (clic droit sur bloc ou item)
BlockEvents.rightClicked(event => {
    const player = event.player;
    const playerName = player.name.string;
    
    // Vérifier si ce joueur a une carte en attente
    if (pendingCardReveal[playerName]) {
        const role = pendingCardReveal[playerName];
        delete pendingCardReveal[playerName];
        
        revealRoleToPlayer(player, role);
        event.cancel();
    }
});

// Stockage des votes
let votes = {};
let votePhaseActive = false;
let publicVotes = false; // Si true, les votes sont annoncés publiquement

// Stockage des pouvoirs utilisés
let voyantePowerUsed = {};      // {joueur: true} si déjà utilisé cette nuit
let sorcierePotionVie = {};     // {joueur: true} si potion encore dispo
let sorcierePotionMort = {};    // {joueur: true} si potion encore dispo
let salvateurProtection = {};   // {joueur: "cible"} dernière protection
let cupidonLinks = {};          // {joueur1: joueur2, joueur2: joueur1}
let chasseurCanShoot = {};      // {joueur: true} si peut encore tirer
let loupVotes = {};
let nightPhaseActive = false;

// ════════════════════════════════════════════════════════════════════════════════
// 🎒 SYSTÈME D'ITEMS PAR TOUR - Donner/Retirer les items quand c'est le tour
// ════════════════════════════════════════════════════════════════════════════════

// Liste de TOUS les items de rôle (pour le nettoyage)
const ALL_ROLE_ITEMS = [
    'minecraft:bone', 'minecraft:bone_meal', 'minecraft:spider_eye',
    'minecraft:golden_apple', 'minecraft:wither_rose', 'minecraft:shield',
    'minecraft:poppy', 'minecraft:carrot', 'minecraft:feather',
    'minecraft:stick', 'minecraft:amethyst_shard', 'minecraft:flint_and_steel',
    'minecraft:torch', 'minecraft:poisonous_potato', 'minecraft:cooked_beef',
    'minecraft:ink_sac', 'minecraft:pink_tulip'
];

// Retirer TOUS les items de rôle d'un joueur
function removeRoleItems(player) {
    ALL_ROLE_ITEMS.forEach(item => {
        player.server.runCommandSilent('clear ' + player.name.string + ' ' + item);
    });
}

// Retirer les items de rôle de TOUS les joueurs vivants
function removeAllPlayersRoleItems(server) {
    server.getPlayers().forEach(p => {
        if (!isMJ(p.name.string)) {
            removeRoleItems(p);
        }
    });
}

// Donner les items d'un rôle spécifique quand c'est son tour
function giveRoleItems(player) {
    const pName = player.name.string;
    if (deadPlayers[pName]) return;

    // === LOUPS ===
    if (player.hasTag('loup_garou')) {
        player.give('minecraft:bone');
    }
    else if (player.hasTag('loup_blanc')) {
        player.give('minecraft:bone');
        // Poudre d'os seulement les nuits paires (pouvoir solo)
        if (timerConfig.dayCount % 2 !== 0) {
            player.give('minecraft:bone_meal');
        }
    }
    else if (player.hasTag('loup_alpha')) {
        player.give('minecraft:bone');
        if (!loupAlphaUsed) {
            player.give('minecraft:poisonous_potato');
        }
    }
    // === VILLAGE ===
    else if (player.hasTag('voyante')) {
        if (!ancienKilledByVillage) player.give('minecraft:spider_eye');
    }
    else if (player.hasTag('sorciere')) {
        if (!ancienKilledByVillage) {
            if (sorcierePotionVie[pName] !== false) player.give('minecraft:golden_apple');
            if (sorcierePotionMort[pName] !== false) player.give('minecraft:wither_rose');
        }
    }
    else if (player.hasTag('salvateur')) {
        if (!ancienKilledByVillage) player.give('minecraft:shield');
    }
    else if (player.hasTag('cupidon')) {
        if (Object.keys(cupidonLinks).length === 0) player.give('minecraft:poppy');
    }
    else if (player.hasTag('corbeau')) {
        if (!corbeauTarget) player.give('minecraft:feather');
    }
    else if (player.hasTag('renard')) {
        if (!ancienKilledByVillage && renardPowerUsed[pName] !== false) {
            player.give('minecraft:carrot');
        }
    }
    else if (player.hasTag('joueur_flute')) {
        player.give('minecraft:stick');
    }
    else if (player.hasTag('medium')) {
        if (!ancienKilledByVillage && lastDeadPlayer) player.give('minecraft:amethyst_shard');
    }
    else if (player.hasTag('pyromane')) {
        player.give('minecraft:flint_and_steel');
        player.give('minecraft:torch');
    }
}

// Donner les items à un groupe de joueurs ayant un tag spécifique
function giveItemsToRole(server, roleTag) {
    server.getPlayers().forEach(p => {
        if (p.hasTag(roleTag) && !deadPlayers[p.name.string]) {
            giveRoleItems(p);
        }
    });
}

// Donner les items à tous les loups
function giveItemsToWolves(server) {
    server.getPlayers().forEach(p => {
        if ((p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && !deadPlayers[p.name.string]) {
            giveRoleItems(p);
        }
    });
}

ItemEvents.rightClicked('minecraft:spider_eye', event => {
    const player = event.player;
    
    if (!nightPhaseActive) {
        player.tell('§c[Voyante] §7Vous ne pouvez utiliser ce pouvoir que la nuit.');
        return;
    }
    
    if (!player.hasTag('voyante')) {
        return; // Pas voyante, ne rien faire
    }

    // L'Ancien tué par le village = pouvoirs perdus
    if (ancienKilledByVillage) {
        player.tell('§b[Voyante] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }

    if (voyantePowerUsed[player.name.string]) {
        player.tell('§b[Voyante] §7Vous avez déjà utilisé votre pouvoir cette nuit.');
        return;
    }
    
    // Trouver le joueur regardé
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        // Déterminer le rôle - La Voyante voit le VRAI rôle (tous les rôles)
        let role = '§aVillageois';
        if (target.hasTag('loup_garou')) role = '§c§lLOUP-GAROU 🐺';
        else if (target.hasTag('loup_blanc')) role = '§f§lLOUP BLANC 🐺';
        else if (target.hasTag('loup_alpha')) role = '§4§lLOUP ALPHA 🐺';
        else if (target.hasTag('infect')) role = '§aVillageois'; // L'Infecté apparaît Villageois à la Voyante
        else if (target.hasTag('voyante')) role = '§bVoyante';
        else if (target.hasTag('sorciere')) role = '§dSorcière';
        else if (target.hasTag('sorciere_noire')) role = '§0Sorcière Noire';
        else if (target.hasTag('chasseur')) role = '§6Chasseur';
        else if (target.hasTag('cupidon')) role = '§eCupidon';
        else if (target.hasTag('salvateur')) role = '§fSalvateur';
        else if (target.hasTag('petite_fille')) role = '§ePetite Fille';
        else if (target.hasTag('ancien')) role = '§2Ancien';
        else if (target.hasTag('idiot')) role = '§eIdiot du Village';
        else if (target.hasTag('ange')) role = '§bAnge 😇';
        else if (target.hasTag('joueur_flute')) role = '§dJoueur de Flûte 🎵';
        else if (target.hasTag('corbeau')) role = '§8Corbeau';
        else if (target.hasTag('renard')) role = '§6Renard 🦊';
        else if (target.hasTag('bouc')) role = '§cBouc Émissaire 🐐';
        else if (target.hasTag('chevalier')) role = '§9Chevalier ⚔';
        else if (target.hasTag('medium')) role = '§5Médium 🔮';
        else if (target.hasTag('chien_loup')) role = '§6Chien-Loup 🐕';
        else if (target.hasTag('soeurs') || target.hasTag('soeur')) role = '§dSœur 👯';
        else if (target.hasTag('pyromane')) role = '§6Pyromane 🔥';
        else if (target.hasTag('voleur')) role = '§eVoleur 🎭';
        
        player.tell('§b§l══════════════════════════════');
        player.tell('§b      👁 VISION DE LA VOYANTE 👁');
        player.tell('');
        player.tell('§7      ' + targetName + ' est : ' + role);
        player.tell('§b§l══════════════════════════════');
        
        voyantePowerUsed[player.name.string] = true;
        nightActionsCompleted.voyante = true; // Marquer l'action comme complétée
        
        // Son mystique
        player.level.playSound(null, player.blockPosition(), 
            'minecraft:block.enchantment_table.use', 'players', 1.0, 1.2);
    } else {
        player.tell('§b[Voyante] §7Regardez un joueur et faites clic droit avec l\'œil.');
    }
});

ItemEvents.rightClicked('minecraft:golden_apple', event => {
    const player = event.player;

    if (!player.hasTag('sorciere')) return;

    if (!nightPhaseActive) {
        player.tell('§d[Sorcière] §7Vous ne pouvez utiliser ce pouvoir que la nuit.');
        return;
    }

    // L'Ancien tué par le village = pouvoirs perdus
    if (ancienKilledByVillage) {
        player.tell('§d[Sorcière] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }

    if (sorcierePotionVie[player.name.string] === false) {
        player.tell('§d[Sorcière] §7Vous avez déjà utilisé votre potion de vie.');
        return;
    }

    // La Sorcière sauve la victime des loups (résolu à l'aube)
    // Elle ne vise pas un joueur spécifique - elle sauve automatiquement la victime
    sorciereSaveTarget = true; // Marque que la sorcière veut sauver
    sorcierePotionVie[player.name.string] = false;
    nightActionsCompleted.sorciere_checked = true;

    player.tell('§d§l════════════════════════════════════════════════');
    player.tell('§d§l       ⚗ POTION DE VIE UTILISÉE ⚗');
    player.tell('§d§l════════════════════════════════════════════════');
    player.tell('');
    player.tell('§a  La victime des loups sera sauvée cette nuit !');
    player.tell('');

    event.item.count--;

    player.level.playSound(null, player.blockPosition(),
        'minecraft:item.totem.use', 'players', 0.5, 1.2);
});

ItemEvents.rightClicked('minecraft:wither_rose', event => {
    const player = event.player;

    if (!player.hasTag('sorciere')) return;

    if (!nightPhaseActive) {
        player.tell('§d[Sorcière] §7Vous ne pouvez utiliser ce pouvoir que la nuit.');
        return;
    }

    // L'Ancien tué par le village = pouvoirs perdus
    if (ancienKilledByVillage) {
        player.tell('§d[Sorcière] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }

    if (sorcierePotionMort[player.name.string] === false) {
        player.tell('§d[Sorcière] §7Vous avez déjà utilisé votre potion de mort.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;

        if (target.name.string === player.name.string) {
            player.tell('§d[Sorcière] §cVous ne pouvez pas vous empoisonner vous-même !');
            return;
        }

        // La mort sera résolue à l'aube (pas immédiatement)
        sorciereKillTarget = target.name.string;
        sorcierePotionMort[player.name.string] = false;
        nightActionsCompleted.sorciere_checked = true;

        player.tell('§d§l════════════════════════════════════════════════');
        player.tell('§d§l       ☠ POTION DE MORT UTILISÉE ☠');
        player.tell('§d§l════════════════════════════════════════════════');
        player.tell('');
        player.tell('§c  ' + target.name.string + ' §7mourra à l\'aube...');
        player.tell('');

        event.item.count--;

        player.level.playSound(null, player.blockPosition(),
            'minecraft:entity.wither.spawn', 'players', 0.3, 1.5);
    } else {
        player.tell('§d[Sorcière] §7Regardez un joueur pour utiliser la potion de mort.');
    }
});

ItemEvents.rightClicked('minecraft:shield', event => {
    const player = event.player;

    if (!player.hasTag('salvateur')) return;

    if (!nightPhaseActive) {
        player.tell('§f[Salvateur] §7Vous ne pouvez protéger que la nuit.');
        return;
    }

    // L'Ancien tué par le village = pouvoirs perdus
    if (ancienKilledByVillage) {
        player.tell('§f[Salvateur] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        // Vérifier si pas la même personne que la nuit dernière
        if (salvateurProtection[player.name.string] === targetName) {
            player.tell('§f[Salvateur] §cVous ne pouvez pas protéger la même personne deux nuits de suite !');
            return;
        }
        
        salvateurProtection[player.name.string] = targetName;
        target.addTag('protected_tonight');
        nightActionsCompleted.salvateur = true; // Marquer l'action comme complétée
        
        player.tell('§f[Salvateur] §aVous protégez §e' + targetName + ' §acette nuit.');
        
        player.level.playSound(null, target.blockPosition(), 
            'minecraft:item.shield.block', 'players', 1.0, 1.0);
    } else {
        player.tell('§f[Salvateur] §7Regardez un joueur pour le protéger.');
    }
});

let cupidonFirstChoice = {};

ItemEvents.rightClicked('minecraft:poppy', event => {
    const player = event.player;
    
    if (!player.hasTag('cupidon')) return;
    
    // Cupidon ne peut agir qu'au premier jour
    if (Object.keys(cupidonLinks).length > 0) {
        player.tell('§e[Cupidon] §7Vous avez déjà lié un couple.');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        if (!cupidonFirstChoice[player.name.string]) {
            // Premier choix
            cupidonFirstChoice[player.name.string] = targetName;
            player.tell('§e[Cupidon] §7Premier amoureux : §d' + targetName);
            player.tell('§e[Cupidon] §7Maintenant, cliquez sur le deuxième amoureux.');
            
            player.level.playSound(null, player.blockPosition(), 
                'minecraft:entity.experience_orb.pickup', 'players', 1.0, 1.5);
        } else {
            // Deuxième choix
            const firstLover = cupidonFirstChoice[player.name.string];
            
            if (firstLover === targetName) {
                player.tell('§e[Cupidon] §cVous ne pouvez pas lier quelqu\'un avec lui-même !');
                return;
            }
            
            // Créer le lien
            cupidonLinks[firstLover] = targetName;
            cupidonLinks[targetName] = firstLover;
            
            player.tell('§e§l═══════════════════════════════════');
            player.tell('§d§l       💕 COUPLE FORMÉ ! 💕');
            player.tell('§e  ' + firstLover + ' §d❤ §e' + targetName);
            player.tell('§e§l═══════════════════════════════════');
            
            // Notifier les amoureux
            player.level.players.forEach(p => {
                if (p.name.string === firstLover || p.name.string === targetName) {
                    p.tell('§d§l═══════════════════════════════════');
                    p.tell('§d§l       💕 VOUS ÊTES AMOUREUX ! 💕');
                    p.tell('§7 Si l\'un de vous meurt, l\'autre aussi...');
                    p.tell('§d§l═══════════════════════════════════');
                    p.addTag('amoureux');
                }
            });
            
            // Retirer la rose
            event.item.count--;
            
            player.level.playSound(null, player.blockPosition(), 
                'minecraft:entity.player.levelup', 'players', 1.0, 1.2);
            
            delete cupidonFirstChoice[player.name.string];
        }
    } else {
        player.tell('§e[Cupidon] §7Regardez un joueur pour le lier par l\'amour.');
    }
});

ItemEvents.rightClicked('minecraft:bone', event => {
    const player = event.player;
    
    // Correction : Autoriser tous les types de loups à voter
    if (!player.hasTag('loup_garou') && !player.hasTag('loup_blanc') && !player.hasTag('loup_alpha')) return;
    if (deadPlayers[player.name.string]) return; // Les loups morts ne votent pas
    
    if (!nightPhaseActive) {
        player.tell('§c[Loup-Garou] §7Les loups ne chassent que la nuit...');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        // Ne peut pas cibler un autre loup
        if (target.hasTag('loup_garou') || target.hasTag('loup_blanc') || target.hasTag('loup_alpha') || target.hasTag('infect')) {
            player.tell('§c[Loup-Garou] §7Vous ne pouvez pas dévorer un membre de la meute !');
            return;
        }
        
        loupVotes[player.name.string] = targetName;
        
        // Vérifier si tous les loups ont voté
        let allLoupsVoted = true;
        let nbLoups = 0;
        let nbLoupsVoted = Object.keys(loupVotes).length;
        
        player.level.players.forEach(p => {
            if ((p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && !deadPlayers[p.name.string]) nbLoups++;
        });
        
        if (nbLoupsVoted >= nbLoups) {
            nightActionsCompleted.loups = true; // Tous les loups ont voté
        }
        
        // Notifier les autres loups
        player.level.players.forEach(p => {
            if (p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) {
                p.tell('§c[Meute] §e' + player.name.string + ' §7veut dévorer §c' + targetName);
            }
        });
        
        player.level.playSound(null, player.blockPosition(), 
            'minecraft:entity.wolf.growl', 'players', 1.0, 0.8);
    } else {
        player.tell('§c[Loup-Garou] §7Regardez un joueur et cliquez avec l\'os pour le désigner.');
    }
});

ItemEvents.rightClicked('minecraft:bow', event => {
    const player = event.player;
    
    if (!player.hasTag('chasseur')) return;
    
    // Le chasseur ne peut tirer que s'il est mort
    if (!player.hasTag('chasseur_mort')) {
        player.tell('§6[Chasseur] §7Votre arc ne servira que lors de votre dernier souffle...');
        return;
    }
    
    if (chasseurCanShoot[player.name.string] === false) {
        player.tell('§6[Chasseur] §7Vous avez déjà tiré votre dernière flèche.');
        return;
    }
    
    const lookingAt = player.rayTrace(50, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;

        // Ne pas tirer sur un mort
        if (deadPlayers[targetName]) {
            player.tell('§6[Chasseur] §7Ce joueur est déjà mort !');
            return;
        }

        chasseurCanShoot[player.name.string] = false;
        player.removeTag('chasseur_mort');
        player.server.runCommandSilent('gamemode spectator ' + player.name.string);

        player.level.players.forEach(p => {
            p.tell('§6§l═══════════════════════════════════════════');
            p.tell('§6§l       🏹 LE CHASSEUR A TIRÉ ! 🏹');
            p.tell('§7   ' + targetName + ' §7a été emporté dans la tombe.');
            p.tell('§7   Son rôle était : ' + getRevealedRole(target));
            p.tell('§6§l═══════════════════════════════════════════');
        });

        player.level.playSound(null, target.blockPosition(),
            'minecraft:entity.arrow.hit_player', 'players', 1.0, 0.8);

        // Mort via système centralisé (gère amoureux, maire, etc.)
        handlePlayerDeath(player.server, targetName, 'chasseur', player.name.string);

        // Vérifier victoire après le tir
        player.server.scheduleInTicks(40, () => {
            checkVictoryConditions(player.server);
        });
    } else {
        player.tell('§6[Chasseur] §7Regardez un joueur pour tirer votre dernière flèche !');
    }
});

ItemEvents.rightClicked('minecraft:ink_sac', event => {
    const player = event.player;
    
    if (!player.hasTag('sorciere_noire')) return;
    
    if (sorciereNoireCurse) {
        player.tell('§0[Sorcière Noire] §7Vous avez déjà maudit §c' + sorciereNoireCurse + '§7.');
        return;
    }
    
    const lookingAt = player.rayTrace(10, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        if (targetName === player.name.string) {
            player.tell('§0[Sorcière Noire] §7Vous ne pouvez pas vous maudire vous-même !');
            return;
        }
        
        sorciereNoireCurse = targetName;
        
        player.tell('');
        player.tell('§0§l════════════════════════════════════════════════');
        player.tell('§0§l           🖤 MALÉDICTION LANCÉE 🖤');
        player.tell('§0§l════════════════════════════════════════════════');
        player.tell('');
        player.tell('§7  Vous avez maudit §f§l' + targetName + '§7.');
        player.tell('§7  S\'il meurt pendant un §evote de jour§7,');
        player.tell('§7  vous §0§lGAGNEZ LA PARTIE§7 !');
        player.tell('');
        
        // Retirer l'encre
        event.item.count--;
        
        player.level.playSound(null, player.blockPosition(), 
            'minecraft:entity.wither.ambient', 'players', 0.5, 0.5);
            
        player.server.runCommandSilent('title ' + player.name.string + ' times 10 40 10');
        player.server.runCommandSilent('title ' + player.name.string + ' subtitle {"text":"' + targetName + ' est maudit...","color":"dark_gray"}');
        player.server.runCommandSilent('title ' + player.name.string + ' title {"text":"🖤 MALÉDICTION 🖤","color":"black","bold":true}');
    } else {
        player.tell('§0[Sorcière Noire] §7Regardez un joueur pour le maudire.');
    }
});

// Pouvoir du Loup Blanc (Poudre d'os)
ItemEvents.rightClicked('minecraft:bone_meal', event => {
    const player = event.player;
    if (!player.hasTag('loup_blanc')) return;
    if (!nightPhaseActive) return;

    // Disponible une nuit sur deux (Nuit 2, 4, 6...) -> DayCount impair (car start=0, nuit 1=0)
    // DayCount 0 (Nuit 1) -> Non
    // DayCount 1 (Nuit 2) -> Oui
    if (timerConfig.dayCount % 2 === 0) {
        player.tell('§f[Loup Blanc] §7Vous ne pouvez tuer un loup qu\'une nuit sur deux (Nuits paires).');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        if (target.hasTag('loup_garou') || target.hasTag('loup_alpha')) {
            player.tell('§f[Loup Blanc] §cVous avez éliminé le loup §e' + target.name.string);
            event.item.count--;
            // Mort via système centralisé
            handlePlayerDeath(player.server, target.name.string, 'loup', player.name.string);
        } else {
            player.tell('§f[Loup Blanc] §7Ce n\'est pas un loup (ou c\'est un autre Loup Blanc).');
        }
    }
});

// Pouvoir du Loup Alpha (Infection)
ItemEvents.rightClicked('minecraft:poisonous_potato', event => {
    const player = event.player;
    if (!player.hasTag('loup_alpha')) return;
    if (!nightPhaseActive) return;
    if (loupAlphaUsed) {
        player.tell('§4[Loup Alpha] §7Vous avez déjà utilisé votre infection.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        if (target.hasTag('loup_garou') || target.hasTag('loup_blanc')) {
            player.tell('§4[Loup Alpha] §7C\'est déjà un loup.');
            return;
        }

        // Infecter
        target.addTag('infect');
        target.tell('§4§l☣ VOUS AVEZ ÉTÉ INFECTÉ ! ☣');
        target.tell('§cVous gardez votre rôle apparent, mais vous gagnez désormais avec les Loups.');
        player.tell('§4[Loup Alpha] §aVous avez infecté ' + target.name.string);
        
        loupAlphaUsed = true;
        event.item.count--;
    }
});

// Pouvoir du Renard (Carotte) - Règle officielle : flaire un groupe de 3 joueurs
ItemEvents.rightClicked('minecraft:carrot', event => {
    const player = event.player;
    if (!player.hasTag('renard')) return;
    if (!nightPhaseActive) return;

    // L'Ancien tué par le village = pouvoirs perdus
    if (ancienKilledByVillage) {
        player.tell('§6[Renard] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }

    if (renardPowerUsed[player.name.string] === false) {
        player.tell('§6[Renard] §7Vous avez perdu votre flair.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;

        // Règle officielle : Le renard désigne un joueur, et on vérifie
        // ce joueur + ses 2 voisins (dans l'ordre du cercle de jeu)
        let alivePlayers = [];
        player.server.getPlayers().forEach(p => {
            if (!deadPlayers[p.name.string] && !isMJ(p.name.string) && !p.hasTag('renard')) {
                alivePlayers.push(p);
            }
        });

        // Trouver l'index du joueur ciblé
        let targetIndex = -1;
        for (let i = 0; i < alivePlayers.length; i++) {
            if (alivePlayers[i].name.string === targetName) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex === -1) {
            player.tell('§6[Renard] §7Ce joueur n\'est pas valide.');
            return;
        }

        // Prendre le joueur + ses 2 voisins (circulaire)
        let groupOf3 = [];
        let groupNames = [];
        for (let offset = -1; offset <= 1; offset++) {
            let idx = (targetIndex + offset + alivePlayers.length) % alivePlayers.length;
            groupOf3.push(alivePlayers[idx]);
            groupNames.push(alivePlayers[idx].name.string);
        }

        // Vérifier si un loup est dans le groupe
        let isWolfAround = false;
        groupOf3.forEach(p => {
            if (p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha') || p.hasTag('infect')) {
                isWolfAround = true;
            }
        });

        player.tell('§6§l════════════════════════════════════════════════');
        player.tell('§6§l       🦊 FLAIR DU RENARD 🦊');
        player.tell('§6§l════════════════════════════════════════════════');
        player.tell('');
        player.tell('§7  Joueurs flairés : §e' + groupNames.join('§7, §e'));
        player.tell('');

        if (isWolfAround) {
            player.tell('§a  ✓ Il y a AU MOINS UN LOUP parmi eux !');
            player.tell('§7  (Flair conservé pour la prochaine nuit)');
            player.level.playSound(null, player.blockPosition(), 'minecraft:entity.fox.screech', 'players', 1.0, 1.0);
        } else {
            player.tell('§c  ✗ Aucun loup parmi eux...');
            player.tell('§7  (Vous perdez votre flair)');
            renardPowerUsed[player.name.string] = false;
            event.item.count--;
        }
        player.tell('');
    } else {
        player.tell('§6[Renard] §7Regardez un joueur et cliquez avec la carotte pour flairer son groupe.');
    }
});

// Pouvoir du Corbeau (Plume)
ItemEvents.rightClicked('minecraft:feather', event => {
    const player = event.player;
    if (!player.hasTag('corbeau')) return; // Attention : Idiot a aussi une plume
    if (!nightPhaseActive) return;
    
    if (corbeauTarget) {
        player.tell('§8[Corbeau] §7Vous avez déjà désigné votre cible.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        corbeauTarget = target.name.string;
        player.tell('§8[Corbeau] §7Vous avez maudit §c' + corbeauTarget + '§7 (+2 votes demain).');
        player.level.playSound(null, player.blockPosition(), 'minecraft:entity.phantom.flap', 'players', 1.0, 0.8);
    }
});

// Pouvoir du Joueur de Flûte (Bâton)
ItemEvents.rightClicked('minecraft:stick', event => {
    const player = event.player;
    if (!player.hasTag('joueur_flute')) return;
    if (!nightPhaseActive) return;

    const playerName = player.name.string;
    if (!fluteDailyCharm[playerName]) fluteDailyCharm[playerName] = 0;
    
    if (fluteDailyCharm[playerName] >= 2) {
        player.tell('§d[Flûte] §7Vous avez déjà charmé 2 personnes cette nuit.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;

        if (fluteCharmed[targetName]) {
            player.tell('§d[Flûte] §7Ce joueur est déjà charmé.');
            return;
        }

        fluteCharmed[targetName] = true;
        fluteDailyCharm[playerName]++;
        
        player.tell('§d[Flûte] §aVous avez charmé ' + targetName);
        target.tell('§d§l🎵 Une mélodie envoûtante résonne dans votre tête... Vous êtes charmé !');
        
        // Vérifier victoire
        let allCharmed = true;
        let alivePlayers = 0;
        player.server.players.forEach(p => {
            if (!deadPlayers[p.name.string] && !p.hasTag('joueur_flute')) {
                alivePlayers++;
                if (!fluteCharmed[p.name.string]) allCharmed = false;
            }
        });

        if (allCharmed && alivePlayers > 0) {
             player.server.scheduleInTicks(40, () => {
                player.server.players.forEach(p => {
                    p.tell('');
                    p.tell('§d§l════════════════════════════════════════════════════════');
                    p.tell('§d§l       🎵 LE JOUEUR DE FLÛTE A GAGNÉ ! 🎵');
                    p.tell('§7  Tout le village danse sous son emprise...');
                    p.tell('§d§l════════════════════════════════════════════════════════');

                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🎵 VICTOIRE FLÛTE 🎵","color":"light_purple","bold":true}');
                    p.level.playSound(null, p.blockPosition(), 'minecraft:block.note_block.flute', 'players', 1.0, 1.0);
                });
                endGame(player.server);
            });
        }
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// 🆕 NOUVEAUX RÔLES - MÉCANIQUES DE JEU
// ════════════════════════════════════════════════════════════════════════════════

// Variables pour les nouveaux rôles
let lastDeadPlayer = null; // Dernier joueur mort (pour le Médium)
let mediumUsedThisNight = {};
let pyromaneTargets = {}; // {joueur: true} = aspergé
let pyromaneDailyUse = {}; // Compteur journalier
let chienLoupChosen = {}; // {joueur: 'village' ou 'loup'}
let soeursList = []; // Liste des sœurs

// === MÉDIUM : Ouvre un canal de discussion temporaire avec le dernier mort ===
let mediumChannelActive = false; // true = le médium et le mort peuvent se parler
let mediumPlayerName = null;     // Nom du médium actif
let mediumGhostName = null;      // Nom du mort contacté

ItemEvents.rightClicked('minecraft:amethyst_shard', event => {
    const player = event.player;
    if (!player.hasTag('medium')) return;
    if (!nightPhaseActive) return;

    if (ancienKilledByVillage) {
        player.tell('§5[Médium] §cVos pouvoirs ont été perdus... L\'Ancien est mort par la faute du village.');
        return;
    }

    if (mediumUsedThisNight[player.name.string]) {
        player.tell('§5[Médium] §7Vous avez déjà contacté les esprits cette nuit.');
        return;
    }

    if (!lastDeadPlayer) {
        player.tell('§5[Médium] §7Aucun esprit à contacter... Personne n\'est mort récemment.');
        return;
    }

    mediumUsedThisNight[player.name.string] = true;

    // Ouvrir le canal de communication
    mediumChannelActive = true;
    mediumPlayerName = player.name.string;
    mediumGhostName = lastDeadPlayer;

    // Message au Médium
    player.tell('');
    player.tell('§5§l════════════════════════════════════════════════');
    player.tell('§5§l       🔮 SÉANCE SPIRITE 🔮');
    player.tell('§5§l════════════════════════════════════════════════');
    player.tell('');
    player.tell('§7  L\'esprit de §f§l' + lastDeadPlayer + ' §7se manifeste...');
    player.tell('§a  Vous pouvez lui parler dans le chat pendant §e30 secondes§a !');
    player.tell('§7  Posez vos questions, l\'esprit peut répondre.');
    player.tell('');

    player.level.playSound(null, player.blockPosition(),
        'minecraft:entity.vex.ambient', 'players', 1.0, 0.5);

    // Message au mort contacté
    player.server.getPlayers().forEach(p => {
        if (p.name.string === lastDeadPlayer) {
            p.tell('');
            p.tell('§5§l════════════════════════════════════════════════');
            p.tell('§5§l       🔮 LE MÉDIUM VOUS CONTACTE ! 🔮');
            p.tell('§5§l════════════════════════════════════════════════');
            p.tell('');
            p.tell('§a  Vous pouvez parler au Médium pendant §e30 secondes§a !');
            p.tell('§7  Écrivez dans le chat, seul le Médium vous entendra.');
            p.tell('§c  ⚠ Attention : vous ne pouvez PAS dire votre rôle directement !');
            p.tell('');
            p.level.playSound(null, p.blockPosition(),
                'minecraft:entity.vex.ambient', 'players', 1.0, 0.8);
        }
    });

    // Avertissement à 10 secondes
    player.server.scheduleInTicks(400, () => {
        if (mediumChannelActive) {
            player.server.getPlayers().forEach(p => {
                if (p.name.string === mediumPlayerName || p.name.string === mediumGhostName) {
                    p.tell('§5§l⚠ 10 SECONDES restantes pour la séance spirite...');
                    p.level.playSound(null, p.blockPosition(),
                        'minecraft:block.note_block.pling', 'players', 0.5, 0.5);
                }
            });
        }
    });

    // Fermer le canal après 30 secondes
    player.server.scheduleInTicks(600, () => {
        if (mediumChannelActive) {
            mediumChannelActive = false;

            player.server.getPlayers().forEach(p => {
                if (p.name.string === mediumPlayerName || p.name.string === mediumGhostName) {
                    p.tell('');
                    p.tell('§5§l════════════════════════════════════════════════');
                    p.tell('§8  L\'esprit s\'éloigne... La connexion est rompue.');
                    p.tell('§5§l════════════════════════════════════════════════');
                    p.tell('');
                    p.level.playSound(null, p.blockPosition(),
                        'minecraft:entity.enderman.teleport', 'players', 0.5, 0.5);
                }
            });

            mediumPlayerName = null;
            mediumGhostName = null;
        }
    });
});

// === CHIEN-LOUP : Choisit son camp au début ===
ItemEvents.rightClicked('minecraft:cooked_beef', event => {
    const player = event.player;
    if (!player.hasTag('chien_loup')) return;

    if (chienLoupChosen[player.name.string]) {
        player.tell('§6[Chien-Loup] §7Vous avez déjà choisi votre camp.');
        return;
    }

    // Regarder un joueur pour choisir : loup = rejoindre loups, autre = rester village
    const lookingAt = player.rayTrace(5, true);

    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;

        if (target.hasTag('loup_garou') || target.hasTag('loup_blanc') || target.hasTag('loup_alpha')) {
            // Rejoindre les loups
            chienLoupChosen[player.name.string] = 'loup';
            player.removeTag('chien_loup');
            player.addTag('loup_garou');
            player.give('minecraft:bone');
            event.item.count--;

            player.tell('');
            player.tell('§c§l════════════════════════════════════════════════');
            player.tell('§c§l       🐺 VOUS REJOIGNEZ LA MEUTE ! 🐺');
            player.tell('§c§l════════════════════════════════════════════════');
            player.tell('');
            player.tell('§7  Vous êtes maintenant un §cLoup-Garou§7.');
            player.tell('§7  Utilisez l\'§cOS §7pour dévorer les villageois.');
            player.tell('');

            // Prévenir les loups
            player.server.getPlayers().forEach(p => {
                if ((p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && p.name.string !== player.name.string) {
                    p.tell('§c[Meute] §e' + player.name.string + ' §7(Chien-Loup) a rejoint la meute !');
                }
            });

            player.level.playSound(null, player.blockPosition(),
                'minecraft:entity.wolf.growl', 'players', 1.0, 0.8);
        } else {
            // Rester village
            chienLoupChosen[player.name.string] = 'village';
            player.removeTag('chien_loup');
            player.addTag('villageois');
            event.item.count--;

            player.tell('');
            player.tell('§a§l════════════════════════════════════════════════');
            player.tell('§a§l       🏠 VOUS RESTEZ AU VILLAGE ! 🏠');
            player.tell('§a§l════════════════════════════════════════════════');
            player.tell('');
            player.tell('§7  Vous êtes fidèle au village.');
            player.tell('§7  Aidez à trouver les loups-garous !');
            player.tell('');

            player.level.playSound(null, player.blockPosition(),
                'minecraft:entity.player.levelup', 'players', 1.0, 1.2);
        }
    } else {
        player.tell('§6[Chien-Loup] §7Regardez un joueur :\n§c  → Un loup = rejoindre la meute\n§a  → Autre = rester au village');
    }
});

// === PYROMANE : Asperge avec silex, allume avec torche ===
ItemEvents.rightClicked('minecraft:flint_and_steel', event => {
    const player = event.player;
    if (!player.hasTag('pyromane')) return;
    if (!nightPhaseActive) return;

    const playerName = player.name.string;
    if (!pyromaneDailyUse[playerName]) pyromaneDailyUse[playerName] = 0;

    if (pyromaneDailyUse[playerName] >= 2) {
        player.tell('§6[Pyromane] §7Vous avez déjà aspergé 2 joueurs cette nuit.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        const targetName = target.name.string;

        if (pyromaneTargets[targetName]) {
            player.tell('§6[Pyromane] §7Ce joueur est déjà aspergé.');
            return;
        }

        pyromaneTargets[targetName] = true;
        pyromaneDailyUse[playerName]++;

        player.tell('§6[Pyromane] §aVous avez aspergé §e' + targetName + ' §7(' + pyromaneDailyUse[playerName] + '/2 cette nuit)');
        player.level.playSound(null, player.blockPosition(),
            'minecraft:item.firecharge.use', 'players', 0.5, 1.5);
    } else {
        player.tell('§6[Pyromane] §7Regardez un joueur pour l\'asperger d\'essence.');
    }
});

// Pyromane : Allumer la torche pour TOUT BRÛLER
ItemEvents.rightClicked('minecraft:torch', event => {
    const player = event.player;
    if (!player.hasTag('pyromane')) return;

    const aspergés = Object.keys(pyromaneTargets).filter(n => !deadPlayers[n]);
    if (aspergés.length === 0) {
        player.tell('§6[Pyromane] §7Personne n\'est aspergé... Aspergez d\'abord avec le SILEX.');
        return;
    }

    // Confirmer l'action
    if (!player.hasTag('pyromane_confirm')) {
        player.addTag('pyromane_confirm');
        player.tell('§6§l⚠ ATTENTION : §cClic droit ENCORE avec la torche pour TOUT BRÛLER !');
        player.tell('§7  Joueurs aspergés : §c' + aspergés.join(', '));

        // Reset la confirmation après 5 secondes
        player.server.scheduleInTicks(100, () => {
            player.removeTag('pyromane_confirm');
        });
        return;
    }

    player.removeTag('pyromane_confirm');
    event.item.count--;

    // BRÛLER TOUS LES ASPERGÉS
    player.server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§6§l════════════════════════════════════════════════════════');
        p.tell('§c§l          🔥 LE PYROMANE FRAPPE ! 🔥');
        p.tell('§6§l════════════════════════════════════════════════════════');
        p.tell('');
        p.level.playSound(null, p.blockPosition(), 'minecraft:entity.blaze.shoot', 'players', 1.0, 0.8);
    });

    aspergés.forEach(targetName => {
        player.server.getPlayers().forEach(p => {
            p.tell('§c  🔥 ' + targetName + ' §7a été brûlé vif...');
        });
        handlePlayerDeath(player.server, targetName, 'pyromane', player.name.string);
    });

    // Vérifier victoire : le pyromane gagne s'il ne reste que lui et les non-aspergés
    // Simplifié : le pyromane gagne si tous les autres meurent
    player.server.scheduleInTicks(60, () => {
        let aliveCount = 0;
        player.server.getPlayers().forEach(p => {
            if (!deadPlayers[p.name.string] && !isMJ(p.name.string)) aliveCount++;
        });
        if (aliveCount === 1) {
            player.server.getPlayers().forEach(p => {
                p.tell('§6§l          🔥 LE PYROMANE A GAGNÉ ! 🔥');
                p.tell('§7  Le village est en cendres...');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🔥 VICTOIRE PYROMANE 🔥","color":"gold","bold":true}');
            });
            endGame(player.server);
        } else {
            checkVictoryConditions(player.server);
        }
    });

    pyromaneTargets = {};
});

// === SŒURS : Se reconnaissent au début (géré à la distribution) ===
// Les sœurs utilisent la tulipe rose pour se signaler (cosmétique, pas de pouvoir actif)

// ============================================
// 🗳️ SYSTÈME DE VOTE PAR CLIC
// ============================================

// Fonction pour mettre à jour l'affichage des votes (Scoreboard sous le pseudo)
function updateVoteScoreboard(server) {
    // Créer l'objectif si nécessaire et l'afficher sous le pseudo
    server.runCommandSilent('scoreboard objectives add vote_count dummy {"text":"§cVotes"}');
    server.runCommandSilent('scoreboard objectives setdisplay belowName vote_count');
    
    // Reset des scores pour éviter les fantômes
    server.runCommandSilent('scoreboard players reset * vote_count');
    
    // Calculer les votes
    let counts = {};
    for (let voter in votes) {
        let target = votes[voter];
        let weight = (voter === maire) ? 2 : 1;
        counts[target] = (counts[target] || 0) + weight;
    }
    
    // Appliquer les scores
    for (let target in counts) {
        server.runCommandSilent('scoreboard players set ' + target + ' vote_count ' + counts[target]);
    }
}

function clearVoteScoreboard(server) {
    server.runCommandSilent('scoreboard objectives remove vote_count');
}

// Clic Droit = VOTER (Via RayTrace pour compatibilité 1.20.1)
ItemEvents.rightClicked(event => {
    if (event.hand !== 'MAIN_HAND') return;
    if (!votePhaseActive) return; // Optimisation

    const player = event.player;
    
    // Utiliser le RayTrace pour détecter le joueur visé (plus fiable que entityInteracted)
    const lookingAt = player.rayTrace(5, true);
    
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        
        // Vérifier si le joueur est vivant
        if (deadPlayers[player.name.string]) {
            // Exception pour le Chasseur mort qui tire (évite le message "Les morts ne votent pas")
            if (player.hasTag('chasseur_mort') && player.mainHandItem.id === 'minecraft:bow') {
                return;
            }

            player.tell('§c[Spectateur] §7Les morts ne votent pas !');
            event.cancel();
            return;
        }
        
        // Vérifier si la cible est vivante
        if (deadPlayers[target.name.string]) {
            player.tell('§cVous ne pouvez pas voter pour un mort.');
            event.cancel();
            return;
        }
        
        // Enregistrer le vote
        votes[player.name.string] = target.name.string;
        player.tell('§aA Voté pour : §e' + target.name.string);
        player.playSound('minecraft:ui.button.click');
        updateVoteScoreboard(event.server);
        
        // Annonce publique si activée
        if (publicVotes) {
            event.server.players.forEach(p => {
                p.tell('§7' + player.name.string + ' a voté pour §c' + target.name.string);
            });
        }
        
        // Empêcher l'utilisation de l'item en main
        event.cancel();
    }
});

 // Gestion des coups (PVP DÉSACTIVÉ + Annulation de vote)
EntityEvents.hurt(event => {
    // Vérifier si c'est un joueur qui tape un joueur
    if (event.entity.isPlayer() && event.source.actual && event.source.actual.isPlayer()) {
        const attacker = event.source.actual;
        
        // Si on est en phase de vote, le coup sert à annuler le vote
        if (votePhaseActive && votes[attacker.name.string]) {
            delete votes[attacker.name.string];
            attacker.tell('§eVote annulé.');
            attacker.playSound('minecraft:ui.button.click');
            updateVoteScoreboard(event.server);
        }
        
        // DANS TOUS LES CAS : Pas de dégâts entre joueurs (C'est un jeu de société !)
        event.cancel();
    }
});

// Désactiver la faim (Mode Plateau)
PlayerEvents.tick(event => {
    const player = event.player;
    if (player.foodLevel < 20) {
        player.foodLevel = 20;
        player.saturation = 20;
    }
});

let lastScoreboardUpdate = {};

PlayerEvents.tick(event => {
    const player = event.player;
    const playerName = player.name.string;
    
    // Animation Arc-en-ciel pour le grade DEV
    if (playerTitles[playerName] && playerTitles[playerName].toLowerCase() === 'dev') {
        // Mettre à jour toutes les 4 ticks (0.2s)
        if (player.age % 4 === 0) {
            const colors = ['§4', '§c', '§6', '§e', '§2', '§a', '§b', '§3', '§1', '§9', '§d', '§5'];
            const index = Math.floor((Date.now() / 150) % colors.length);
            const color = colors[index];
            const rainbowTitle = color + '§l[DEV] ';
            
            const teamName = 'title_' + playerName.replace(/[^a-zA-Z0-9]/g, '');
            player.server.runCommandSilent('team modify ' + teamName + ' prefix ' + JSON.stringify({"text":rainbowTitle.replace(/§/g, '\u00A7')}));
        }
    }

    // Animation OWNER (Rouge/Or clignotant)
    if (playerTitles[playerName] && playerTitles[playerName].toLowerCase() === 'owner') {
        // Mettre à jour toutes les 10 ticks (0.5s)
        if (player.age % 10 === 0) {
            const colors = ['§4', '§6']; // Rouge foncé et Or
            const index = Math.floor((Date.now() / 500) % colors.length);
            const color = colors[index];
            const ownerTitle = color + '§l[OWNER] ';
            
            const teamName = 'title_' + playerName.replace(/[^a-zA-Z0-9]/g, '');
            player.server.runCommandSilent('team modify ' + teamName + ' prefix ' + JSON.stringify({"text":ownerTitle.replace(/§/g, '\u00A7')}));
        }
    }

    // Particules VIP (Étoiles vertes)
    if (playerTitles[playerName] && playerTitles[playerName].toLowerCase() === 'vip') {
        if (player.age % 5 === 0) {
            level.spawnParticles('minecraft:happy_villager', player.x, player.y + 2.2, player.z, 1, 0.3, 0.1, 0.3, 0);
        }
    }

    // Afficher le rôle via action bar (privé à chaque joueur) toutes les 2 secondes
    const now = Date.now();
    if (!lastScoreboardUpdate[playerName] || now - lastScoreboardUpdate[playerName] > 2000) {
        lastScoreboardUpdate[playerName] = now;

        // Déterminer la phase actuelle
        let phase = '§7En attente...';
        if (timerConfig.currentPhase === 'day') {
            phase = '§e☀ JOUR ' + timerConfig.dayCount;
        } else if (timerConfig.currentPhase === 'night') {
            phase = '§8🌙 NUIT';
        }

        // Scoreboard global (infos publiques uniquement - PAS de rôle !)
        player.server.runCommandSilent('scoreboard objectives add lameute dummy {"text":"§6§l🐺 LA MEUTE 🐺"}');
        player.server.runCommandSilent('scoreboard objectives setdisplay sidebar lameute');

        // Compter joueurs vivants
        let aliveCount = 0;
        player.server.getPlayers().forEach(p => {
            if (!deadPlayers[p.name.string] && !isMJ(p.name.string)) aliveCount++;
        });

        player.server.runCommandSilent('scoreboard players reset * lameute');
        player.server.runCommandSilent('scoreboard players set §8══════════ lameute 10');
        player.server.runCommandSilent('scoreboard players set ' + phase + ' lameute 9');
        player.server.runCommandSilent('scoreboard players set §r lameute 8');
        player.server.runCommandSilent('scoreboard players set §fJoueurs§fvivants: lameute 7');
        player.server.runCommandSilent('scoreboard players set §a' + aliveCount + '§f§ljoueurs lameute 6');
        player.server.runCommandSilent('scoreboard players set §r§r lameute 5');
        if (maire) {
            player.server.runCommandSilent('scoreboard players set §6§l👑§fMaire: lameute 4');
            player.server.runCommandSilent('scoreboard players set §e' + maire + ' lameute 3');
        } else {
            player.server.runCommandSilent('scoreboard players set §7Pas§7de§7Maire lameute 4');
            player.server.runCommandSilent('scoreboard players set §r§r§r lameute 3');
        }
        player.server.runCommandSilent('scoreboard players set §8═══════════ lameute 2');
        player.server.runCommandSilent('scoreboard players set §7Dev:§6§lw9n0 lameute 1');
    }
    
    // Si le joueur est accroupi et regarde vers le haut
    if (player.crouching && player.pitch < -60) {
        // Afficher le rôle dans l'action bar (TOUS les rôles)
        let role = 'Villageois 🏠';
        let color = '§a';

        if (player.hasTag('loup_garou')) { role = 'LOUP-GAROU 🐺'; color = '§c§l'; }
        else if (player.hasTag('loup_blanc')) { role = 'LOUP BLANC 🐺'; color = '§f§l'; }
        else if (player.hasTag('loup_alpha')) { role = 'LOUP ALPHA 🐺'; color = '§4§l'; }
        else if (player.hasTag('infect')) { role = 'INFECTÉ 🦠'; color = '§5'; }
        else if (player.hasTag('voyante')) { role = 'Voyante 👁'; color = '§b'; }
        else if (player.hasTag('sorciere')) { role = 'Sorcière ⚗'; color = '§d'; }
        else if (player.hasTag('sorciere_noire')) { role = 'Sorcière Noire 🖤'; color = '§0'; }
        else if (player.hasTag('chasseur')) { role = 'Chasseur 🏹'; color = '§6'; }
        else if (player.hasTag('cupidon')) { role = 'Cupidon 💕'; color = '§e'; }
        else if (player.hasTag('salvateur')) { role = 'Salvateur 🛡'; color = '§f'; }
        else if (player.hasTag('petite_fille')) { role = 'Petite Fille 👀'; color = '§e'; }
        else if (player.hasTag('ancien')) { role = 'Ancien 👴'; color = '§2'; }
        else if (player.hasTag('idiot')) { role = 'Idiot du Village 🤡'; color = '§e'; }
        else if (player.hasTag('ange')) { role = 'Ange 😇'; color = '§b'; }
        else if (player.hasTag('joueur_flute')) { role = 'Joueur de Flûte 🎵'; color = '§d'; }
        else if (player.hasTag('corbeau')) { role = 'Corbeau 🐦'; color = '§8'; }
        else if (player.hasTag('renard')) { role = 'Renard 🦊'; color = '§6'; }
        else if (player.hasTag('bouc')) { role = 'Bouc Émissaire 🐐'; color = '§c'; }
        else if (player.hasTag('chevalier')) { role = 'Chevalier ⚔'; color = '§9'; }
        else if (player.hasTag('medium')) { role = 'Médium 🔮'; color = '§5'; }
        else if (player.hasTag('soeurs') || player.hasTag('soeur')) { role = 'Sœur 👯'; color = '§d'; }
        else if (player.hasTag('chien_loup')) { role = 'Chien-Loup 🐕'; color = '§6'; }
        else if (player.hasTag('pyromane')) { role = 'Pyromane 🔥'; color = '§6'; }
        else if (player.hasTag('voleur')) { role = 'Voleur 🎭'; color = '§e'; }
        else if (player.hasTag('villageois')) { role = 'Villageois 🏠'; color = '§a'; }

        // Afficher dans l'action bar
        player.displayClientMessage(color + 'Votre rôle : ' + role, true);
    }
});

// Événement quand la nuit tombe
PlayerEvents.tick(event => {
    const player = event.player;
    const level = player.level;
    
    // Particules de couronne pour le Maire
    if (maire && player.name.string === maire) {
        const now = Date.now();
        const radius = 0.35;
        const y = player.y + 2.2; // Au-dessus de la tête
        
        // 3 particules dorées qui tournent autour de la tête
        for (let i = 0; i < 3; i++) {
            const angle = ((now % 2000) / 2000.0) * Math.PI * 2 + (i * (Math.PI * 2 / 3));
            const x = player.x + Math.cos(angle) * radius;
            const z = player.z + Math.sin(angle) * radius;
            level.spawnParticles('minecraft:wax_on', x, y, z, 1, 0, 0, 0, 0);
        }
    }
    
    // Vérifier si c'est la nuit
    const timeOfDay = level.getDayTime() % 24000;
    const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
    
    // Vérifier la phase de lune (0 = pleine lune)
    const moonPhase = level.getMoonPhase();
    const isFullMoon = moonPhase === 0;
    
    // Appliquer des effets pendant la pleine lune
    if (isNight && isFullMoon) {
        // Les loups-garous sont plus forts
        if (player.hasTag('loup_garou')) {
            player.potionEffects.add('minecraft:strength', 200, 1, false, false);
            player.potionEffects.add('minecraft:speed', 200, 1, false, false);
            player.potionEffects.add('minecraft:night_vision', 400, 0, false, false);
        }
        
        // Les villageois ont peur
        if (player.hasTag('villageois')) {
            // Effet de peur léger
            if (Math.random() < 0.01) {
                player.tell('§c§oVous sentez une présence menaçante dans la nuit...');
            }
        }
    }
});

// Chat privé des loups la nuit et formatage du chat
PlayerEvents.chat(event => {
    const player = event.player;
    const playerName = player.name.string;

    // === CANAL MÉDIUM : Le mort contacté peut parler au Médium ===
    if (mediumChannelActive && deadPlayers[playerName] && playerName === mediumGhostName) {
        event.cancel();
        const spiritMessage = '§5[🔮 Esprit] §f' + playerName + ' §8» §d' + event.message;

        event.server.players.forEach(p => {
            // Le message va au Médium et au MJ
            if (p.name.string === mediumPlayerName || isMJ(p.name.string)) {
                p.tell(spiritMessage);
            }
            // Le mort voit aussi son propre message
            if (p.name.string === mediumGhostName) {
                p.tell(spiritMessage);
            }
        });
        return;
    }

    // === CANAL MÉDIUM : Le Médium parle au mort ===
    if (mediumChannelActive && playerName === mediumPlayerName && nightPhaseActive) {
        event.cancel();
        const mediumMessage = '§5[🔮 Médium] §f' + playerName + ' §8» §d' + event.message;

        event.server.players.forEach(p => {
            if (p.name.string === mediumPlayerName || p.name.string === mediumGhostName || isMJ(p.name.string)) {
                p.tell(mediumMessage);
            }
        });
        return;
    }

    // Chat des morts (Spectateurs)
    if (deadPlayers[playerName]) {
        event.cancel();
        const deadMessage = '§7[☠ Spectre] ' + playerName + ' §8» §7' + event.message;

        event.server.players.forEach(p => {
            const pName = p.name.string;
            const pIsMJ = playerTitles[pName] && (playerTitles[pName].toLowerCase().includes('mj') || playerTitles[pName].toLowerCase().includes('maitre'));

            // Envoyer aux morts et au MJ
            if (deadPlayers[pName] || pIsMJ) {
                p.tell(deadMessage);
            }
        });
        return;
    }

    // Si c'est la nuit, que le joueur est un loup et qu'il est vivant
    if (nightPhaseActive && !deadPlayers[playerName] && (player.hasTag('loup_garou') || player.hasTag('loup_blanc') || player.hasTag('loup_alpha') || player.hasTag('infect'))) {
        // Annuler le message public (personne d'autre ne le verra)
        event.cancel();

        const message = event.message;
        const wolfMessage = '§c[Meute] §7' + playerName + ' §8» §c' + message;

        // Brouillage pour la Petite Fille (remplace ~30% des lettres par des points)
        let scrambled = '';
        for (let i = 0; i < message.length; i++) {
            if (message[i] === ' ') scrambled += ' ';
            else scrambled += (Math.random() < 0.3) ? '.' : message[i];
        }
        const pfMessage = '§c[Meute] §7Loup-Garou §8» §c' + scrambled;

        // Envoyer à tous les loups, au MJ et à la Petite Fille
        event.server.players.forEach(p => {
            const pName = p.name.string;
            const isWolf = p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha') || p.hasTag('infect');
            const isMJ = playerTitles[pName] && (playerTitles[pName].toLowerCase().includes('mj') || playerTitles[pName].toLowerCase().includes('maitre'));
            const isPetiteFille = p.hasTag('petite_fille') && !deadPlayers[pName];

            if (isWolf || isMJ) {
                p.tell(wolfMessage);
            } else if (isPetiteFille) {
                p.tell(pfMessage);
            }
        });
        return;
    }

    // Formatage du chat normal (pour enlever les < >)
    event.cancel();
    const title = playerTitles[playerName] || 'Joueur';
    const formattedTitle = getFormattedTitle(title);
    const chatMessage = formattedTitle + '§f' + playerName + ' §8» §f' + event.message;

    event.server.players.forEach(p => {
        p.tell(chatMessage);
    });
});

// Commandes personnalisées pour le maître du jeu
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    // Fonction pour vérifier si le joueur est OP (niveau 2+)
    const requiresOP = (source) => source.hasPermission(2);
    
    // Commande /fly pour les VIPs
    event.register(
        Commands.literal('fly')
            .executes(ctx => {
                const player = ctx.source.player;
                const playerName = player.name.string;
                const title = playerTitles[playerName] || '';
                
                if (title.toLowerCase() !== 'vip' && !requiresOP(ctx.source)) {
                    player.tell('§cCette commande est réservée aux VIPs !');
                    return 0;
                }
                
                if (gameStarted && !deadPlayers[playerName] && !requiresOP(ctx.source)) {
                    player.tell('§cImpossible de voler pendant la partie !');
                    return 0;
                }
                
                player.abilities.mayfly = !player.abilities.mayfly;
                player.abilities.flying = player.abilities.mayfly;
                player.onUpdateAbilities();
                player.tell(player.abilities.mayfly ? '§aVol activé !' : '§cVol désactivé.');
                return 1;
            })
    );

    // Fonction pour calculer la distribution équitable des rôles
    function calculateRoleDistribution(playerCount) {
        // Calcul automatique du nombre de loups (environ 1 pour 4-5 joueurs)
        let nbLoups;
        if (playerCount <= 5) nbLoups = 1;
        else if (playerCount <= 8) nbLoups = 2;
        else if (playerCount <= 12) nbLoups = 3;
        else if (playerCount <= 16) nbLoups = 4;
        else nbLoups = Math.floor(playerCount / 4);
        
        let roles = [];
        let specialRolesPool = [];
        
        // === LOUPS-GAROUS ===
        // Pool de variantes de loups disponibles
        let loupVariants = ['loup_garou']; // Toujours au moins 1 loup normal
        if (playerCount >= 8) loupVariants.push('loup_blanc'); // Le loup blanc trahit
        if (playerCount >= 10) loupVariants.push('loup_alpha'); // Le loup alpha infecte
        
        // Distribuer les loups
        for (let i = 0; i < nbLoups; i++) {
            if (i === 0) {
                roles.push('loup_garou'); // Premier loup toujours normal
            } else if (i === 1 && loupVariants.includes('loup_blanc') && Math.random() > 0.5) {
                roles.push('loup_blanc');
            } else if (i === 2 && loupVariants.includes('loup_alpha') && Math.random() > 0.5) {
                roles.push('loup_alpha');
            } else {
                roles.push('loup_garou');
            }
        }
        
        // === ROLES SPECIAUX DU VILLAGE ===
        // Rôles prioritaires (toujours présents si assez de joueurs)
        if (playerCount >= 5) specialRolesPool.push('voyante');
        if (playerCount >= 6) specialRolesPool.push('sorciere');
        if (playerCount >= 7) specialRolesPool.push('chasseur');
        
        // Rôles secondaires
        if (playerCount >= 8) specialRolesPool.push('salvateur');
        if (playerCount >= 9) specialRolesPool.push('ancien');
        if (playerCount >= 10) specialRolesPool.push('cupidon');
        
        // Rôles avancés
        if (playerCount >= 11) specialRolesPool.push('petite_fille');
        if (playerCount >= 12) specialRolesPool.push('chevalier');
        if (playerCount >= 13) specialRolesPool.push('renard');
        
        // Rôles ambigus/spéciaux (ajoutés avec parcimonie)
        if (playerCount >= 10) specialRolesPool.push('idiot');
        if (playerCount >= 10) specialRolesPool.push('medium');        // Médium - contacte les morts
        if (playerCount >= 11) { specialRolesPool.push('soeurs'); specialRolesPool.push('soeurs'); } // 2 Sœurs
        if (playerCount >= 12) specialRolesPool.push('chien_loup');    // Chien-Loup - choisit son camp
        if (playerCount >= 14) specialRolesPool.push('ange');
        if (playerCount >= 14) specialRolesPool.push('pyromane');      // Pyromane - brûle tout
        if (playerCount >= 15) specialRolesPool.push('joueur_flute');
        if (playerCount >= 15) specialRolesPool.push('sorciere_noire');
        if (playerCount >= 16) specialRolesPool.push('corbeau');
        if (playerCount >= 18) specialRolesPool.push('bouc');
        
        // Limiter le nombre de rôles spéciaux (max 60% des joueurs non-loups)
        const maxSpecialRoles = Math.floor((playerCount - nbLoups) * 0.6);
        while (specialRolesPool.length > maxSpecialRoles) {
            specialRolesPool.pop();
        }
        
        // Ajouter les rôles spéciaux
        roles = roles.concat(specialRolesPool);
        
        // Compléter avec des villageois
        while (roles.length < playerCount) {
            roles.push('villageois');
        }
        
        return { roles: roles, nbLoups: nbLoups };
    }
    
    // Commande pour démarrer une partie avec distribution automatique
    event.register(
        Commands.literal('lameute')
            .requires(requiresOP)
            .then(Commands.literal('start')
                .executes(ctx => {
                    // Version sans argument - distribution automatique
                    const players = [];
                    let mjPlayer = null;
                    
                    // Détecter si un MJ est présent
                    ctx.source.level.players.forEach(p => {
                        const title = playerTitles[p.name.string] || '';
                        const isMJ = title.toLowerCase().includes('mj') || title.toLowerCase().includes('maitre');
                        
                        if (isMJ) {
                            mjPlayer = p;
                            hasMJ = true;
                        } else {
                            players.push(p);
                        }
                    });
                    
                    // Si pas de MJ, le jeu sera automatique
                    if (!mjPlayer) {
                        hasMJ = false;
                        ctx.source.player.tell('§6§l[La Meute] §a🤖 Mode automatique activé §7(pas de MJ détecté)');
                    } else {
                        ctx.source.player.tell('§6§l[La Meute] §e👑 ' + mjPlayer.name.string + ' §7est le Maître du Jeu');
                    }
                    
                    if (players.length < 4) {
                        ctx.source.player.tell('§c[La Meute] §7Il faut au moins 4 joueurs pour commencer !');
                        return 0;
                    }
                    
                    // Calculer la distribution automatique
                    const distribution = calculateRoleDistribution(players.length);
                    let roles = distribution.roles;
                    const nbLoups = distribution.nbLoups;
                    
                    // Afficher les stats de la partie
                    ctx.source.player.tell('§6§l[La Meute] §7Distribution automatique :');
                    ctx.source.player.tell('§7  • §c' + nbLoups + ' Loup(s)-Garou(s)');
                    ctx.source.player.tell('§7  • §a' + (players.length - nbLoups) + ' Villageois (dont rôles spéciaux)');
                    
                    // Mélanger les rôles
                    roles = shuffleArray(roles);
                        
                        // Annonce dramatique
                        ctx.source.level.players.forEach(p => {
                            p.tell('');
                            p.tell('§8§l═══════════════════════════════════════════════════════');
                            p.tell('');
                            p.tell('§6§l           🐺 LA MEUTE - NOUVELLE PARTIE 🐺');
                            p.tell('');
                            p.tell('§7         Le village de §eThiercelieux §7s\'endort...');
                            p.tell('§7         Mais des loups-garous rôdent parmi vous.');
                            p.tell('');
                            p.tell('§8§l═══════════════════════════════════════════════════════');
                            p.tell('');
                            
                            // Son dramatique
                            p.level.playSound(null, p.blockPosition(), 
                                'minecraft:entity.ender_dragon.growl', 'ambient', 0.3, 0.5);
                        });
                        
                        // Téléportation automatique au spawn si défini
                        if (gameConfig.spawnPoint.set) {
                            teleportPlayersInCircle(ctx.source.server);
                            ctx.source.player.tell('§a[La Meute] §7Téléportation des joueurs au point de spawn...');
                        }

                        // Distribution des cartes avec délai
                        gameStarted = true;
                        ancienLives = {};
                        idiotRevealed = {};
                        
                        // Réinitialiser TOUT pour la nouvelle partie
                        timerConfig.dayCount = 0;
                        timerConfig.timerRunning = true;
                        timerConfig.autoMode = true;
                        deadPlayers = {};
                        maire = null;
                        maireDeceased = null;
                        maireVoteActive = false;
                        maireVotes = {};
                        votes = {};
                        publicVotes = false;
                        sorciereNoireCurse = null;
                        sorciereSaveTarget = null;
                        sorciereKillTarget = null;
                        sorcierePotionVie = {};
                        sorcierePotionMort = {};
                        salvateurProtection = {};
                        cupidonLinks = {};
                        cupidonFirstChoice = {};
                        chasseurCanShoot = {};
                        voyantePowerUsed = {};
                        corbeauTarget = null;
                        loupAlphaUsed = false;
                        loupVotes = {};
                        renardPowerUsed = {};
                        fluteCharmed = {};
                        fluteDailyCharm = {};
                        ancienKilledByVillage = false;
                        pendingCardReveal = {};
                        lastDeadPlayer = null;
                        mediumUsedThisNight = {};
                        pyromaneTargets = {};
                        pyromaneDailyUse = {};
                        chienLoupChosen = {};
                        soeursList = [];
                        resetNightActions();
                        
                        // Mettre tout le monde en aventure (Mode Plateau)
                        ctx.source.level.players.forEach(p => {
                            ctx.source.server.runCommandSilent('gamemode adventure ' + p.name.string);
                        });
                        
                        // Distribuer les cartes à chaque joueur avec un délai
                        for (let i = 0; i < players.length; i++) {
                            const player = players[i];
                            const role = roles[i];
                            
                            // Stocker le rôle en attente
                            pendingCardReveal[player.name.string] = role;
                        }
                        
                        // Message pour cliquer
                        ctx.source.server.scheduleInTicks(40, () => {
                            ctx.source.level.players.forEach(p => {
                                p.tell('');
                                p.tell('§e§l   🎴 UNE CARTE MYSTÉRIEUSE APPARAÎT DEVANT VOUS... 🎴');
                                p.tell('');
                                p.tell('§a§l        ➤ FAITES UN CLIC DROIT POUR LA RETOURNER ! ➤');
                                p.tell('');
                                
                                // Effet visuel
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 20');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Clic droit pour révéler votre rôle...","color":"gray","italic":true}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🎴 VOTRE CARTE 🎴","color":"gold","bold":true}');
                                
                                // Son mystérieux
                                p.level.playSound(null, p.blockPosition(), 
                                    'minecraft:block.enchantment_table.use', 'players', 1.0, 0.8);
                            });
                        });
                        
                        // Notification des Sœurs (après que les cartes soient révélées)
                        ctx.source.server.scheduleInTicks(220, () => {
                            soeursList = [];
                            players.forEach(p => {
                                if (p.hasTag('soeurs') || p.hasTag('soeur')) {
                                    soeursList.push(p.name.string);
                                }
                            });
                            if (soeursList.length >= 2) {
                                players.forEach(p => {
                                    if (p.hasTag('soeurs') || p.hasTag('soeur')) {
                                        p.tell('');
                                        p.tell('§d§l════════════════════════════════════════════════');
                                        p.tell('§d§l       👯 VOS SŒURS 👯');
                                        p.tell('§d§l════════════════════════════════════════════════');
                                        p.tell('');
                                        const otherSisters = soeursList.filter(n => n !== p.name.string);
                                        p.tell('§7  Votre sœur est : §d§l' + otherSisters.join(', '));
                                        p.tell('§7  Vous êtes dans le même camp. Travaillez ensemble !');
                                        p.tell('');
                                        p.level.playSound(null, p.blockPosition(), 'minecraft:entity.experience_orb.pickup', 'players', 1.0, 1.5);
                                    }
                                });
                            }
                        });

                        // Révélation automatique après 10 secondes si pas cliqué
                        ctx.source.server.scheduleInTicks(200, () => {
                            for (let playerName in pendingCardReveal) {
                                ctx.source.level.players.forEach(p => {
                                    if (p.name.string === playerName && pendingCardReveal[playerName]) {
                                        const role = pendingCardReveal[playerName];
                                        delete pendingCardReveal[playerName];
                                        revealRoleToPlayer(p, role);
                                    }
                                });
                            }
                        });
                        
                        ctx.source.player.tell('§a[La Meute] §7Partie lancée avec §e' + players.length + ' joueurs §7et §c' + nbLoups + ' loup(s)-garou(s) §7!');
                        ctx.source.player.tell('§7Utilisez §e/lameute timer auto §7pour lancer le timer automatique !');
                        
                        return 1;
                    })
            )
            .then(Commands.literal('timer')
                .then(Commands.literal('auto')
                    .executes(ctx => {
                        timerConfig.autoMode = true;
                        timerConfig.timerRunning = true;
                        timerConfig.currentPhase = 'day';
                        timerConfig.timerStartTime = Date.now();
                        votePhaseActive = true;
                        nightPhaseActive = false;
                        votes = {};
                        
                        ctx.source.level.setDayTime(1000);
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('');
                            p.tell('§a§l⏰ MODE AUTOMATIQUE ACTIVÉ !');
                            p.tell('§7La barre d\'XP indique le temps restant.');
                            p.tell('§7Jour : §e' + timerConfig.dayDuration + ' min §7| Nuit : §e' + timerConfig.nightDuration + ' min');
                            p.tell('');
                        });
                        
                        return 1;
                    })
                )
                .then(Commands.literal('stop')
                    .executes(ctx => {
                        timerConfig.autoMode = false;
                        timerConfig.timerRunning = false;
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('§c[Timer] §7Mode automatique désactivé.');
                            p.setExperienceLevel(0);
                            p.setExperienceProgress(0);
                        });
                        
                        return 1;
                    })
                )
                .then(Commands.literal('jour')
                    .then(Commands.argument('minutes', Arguments.INTEGER.create(event))
                        .executes(ctx => {
                            const minutes = Arguments.INTEGER.getResult(ctx, 'minutes');
                            
                            if (minutes !== 3 && minutes !== 5 && minutes !== 7) {
                                ctx.source.player.tell('§c[Timer] §7Valeurs autorisées : 3, 5 ou 7 minutes');
                                return 0;
                            }
                            
                            timerConfig.dayDuration = minutes;
                            ctx.source.player.tell('§a[Timer] §7Durée du jour : §e' + minutes + ' minutes');
                            return 1;
                        })
                    )
                )
                .then(Commands.literal('nuit')
                    .then(Commands.argument('minutes', Arguments.INTEGER.create(event))
                        .executes(ctx => {
                            const minutes = Arguments.INTEGER.getResult(ctx, 'minutes');
                            
                            timerConfig.nightDuration = minutes;
                            ctx.source.player.tell('§a[Timer] §7Durée de la nuit : §e' + minutes + ' minutes (max)');
                            return 1;
                        })
                    )
                )
            )
            .then(Commands.literal('roles')
                .executes(ctx => {
                    // Afficher les rôles possibles
                    const p = ctx.source.player;
                    p.tell('§6§l═══════════════════════════════════════════════════');
                    p.tell('§c§l  🐺 CAMP DES LOUPS');
                    p.tell('§c  • loup_garou §7- Dévore les villageois chaque nuit');
                    p.tell('§f  • loup_blanc §7- Loup SOLO, tue aussi un loup 1 nuit/2');
                    p.tell('§4  • loup_alpha §7- Infecte un villageois (rejoint les loups)');
                    p.tell('');
                    p.tell('§a§l  🏠 CAMP DU VILLAGE');
                    p.tell('§a  • villageois §7- Vote pour éliminer les loups');
                    p.tell('§b  • voyante §7- Découvre le rôle d\'un joueur/nuit');
                    p.tell('§d  • sorciere §7- Potion de vie + potion de mort');
                    p.tell('§6  • chasseur §7- Tire sur quelqu\'un en mourant');
                    p.tell('§e  • cupidon §7- Lie 2 joueurs par l\'amour');
                    p.tell('§f  • salvateur §7- Protège un joueur chaque nuit');
                    p.tell('§e  • petite_fille §7- Espionne le chat des loups');
                    p.tell('§2  • ancien §7- Survit à 1 attaque de loup');
                    p.tell('§e  • idiot §7- Survit au vote mais ne peut plus voter');
                    p.tell('§8  • corbeau §7- Accuse un joueur (+2 votes)');
                    p.tell('§6  • renard §7- Flaire si un loup est parmi 3 joueurs');
                    p.tell('§c  • bouc §7- Meurt en cas d\'égalité au vote');
                    p.tell('§9  • chevalier §7- Si un loup le tue, le loup meurt aussi');
                    p.tell('§5  • medium §7- Contacte le dernier mort chaque nuit');
                    p.tell('§d  • soeurs §7- 2 sœurs qui se connaissent');
                    p.tell('');
                    p.tell('§e§l  ⚡ RÔLES SPÉCIAUX');
                    p.tell('§6  • chien_loup §7- Choisit de rejoindre loups ou village');
                    p.tell('§b  • ange §7- Gagne s\'il est éliminé au 1er vote');
                    p.tell('§d  • joueur_flute §7- Charme tout le monde pour gagner');
                    p.tell('§0  • sorciere_noire §7- Maudit un joueur, gagne s\'il meurt par vote');
                    p.tell('§6  • pyromane §7- Asperge des joueurs, peut tout brûler');
                    p.tell('§6§l═══════════════════════════════════════════════════');
                    return 1;
                })
            )
    );

    // Commande d'aide
    event.register(
        Commands.literal('lameute')
            .then(Commands.literal('help')
                .executes(ctx => {
                    const player = ctx.source.player;
                    const isOP = ctx.source.hasPermission(2);

                    const helpMessages = createMessageBox('🐺 LA MEUTE - AIDE', [
                        '§7═══ COMMANDES DISPONIBLES ═══',
                        '',
                        '§e/lameute help §7- Affiche cette aide',
                        '',
                        '§7═══ PENDANT LA PARTIE ═══',
                        '§aClic droit §7sur un joueur - §fVoter',
                        '§aClic gauche §7sur un joueur - §fAnnuler vote',
                        '§aShift + Regarder en l\'air §7- §fRevoir son rôle',
                        '',
                        '§7═══ RÔLES DISPONIBLES ═══',
                        '§c🐺 Loups-Garous §7- Dévorez les villageois',
                        '§b👁 Voyante §7- Découvrez les rôles',
                        '§d⚗ Sorcière §7- Potions de vie et mort',
                        '§6🏹 Chasseur §7- Tirez votre dernière flèche',
                        '§e💕 Cupidon §7- Liez deux amoureux',
                        '§f🛡 Salvateur §7- Protégez un joueur',
                        '§7... et bien d\'autres !',
                        '',
                        '§7Développé par §6§lw9n0'
                    ], '§6');

                    helpMessages.forEach(msg => player.tell(msg));

                    // Commandes admin (si OP)
                    if (isOP) {
                        const adminMessages = createMessageBox('⚙️ COMMANDES ADMIN', [
                            '§e/lameute start §7- Démarre une partie',
                            '§e/lameute timer auto §7- Timer automatique',
                            '§e/lameute timer jour [3/5/7] §7- Durée du jour',
                            '§e/lameute timer nuit [3/6/9] §7- Durée de la nuit',
                            '§e/lameute point §7- Définir le spawn',
                            '§e/lameute tp §7- Téléporter au spawn',
                            '§e/lameute role <joueur> <rôle> §7- Donner un rôle',
                            '§e/lameute successeur <joueur> §7- Nouveau maire',
                            '',
                            '§e/tab <joueur> <titre> §7- Changer le titre',
                            '§e/tab list §7- Liste des titres',
                            '§e/fly §7- Activer/désactiver le vol (VIP)'
                        ], '§c');

                        adminMessages.forEach(msg => player.tell(msg));
                    }

                    return 1;
                })
            )
    );

    // Commandes de Spawn / Point
    event.register(
        Commands.literal('lameute')
            .requires(requiresOP)
            .then(Commands.literal('point')
                .executes(ctx => {
                    const player = ctx.source.player;
                    gameConfig.spawnPoint = {
                        x: Math.floor(player.x),
                        y: Math.floor(player.y),
                        z: Math.floor(player.z),
                        set: true,
                        radius: gameConfig.spawnPoint.radius || 5,
                        dimension: player.level.dimension.toString()
                    };
                    saveGameConfig();
                    
                    player.tell('§a[La Meute] §7Point de spawn défini en §e' + gameConfig.spawnPoint.x + ' ' + gameConfig.spawnPoint.y + ' ' + gameConfig.spawnPoint.z);
                    return 1;
                })
                .then(Commands.literal('rayon')
                    .then(Commands.argument('size', Arguments.INTEGER.create(event))
                        .executes(ctx => {
                            const size = Arguments.INTEGER.getResult(ctx, 'size');
                            gameConfig.spawnPoint.radius = Math.max(2, Math.min(size, 20));
                            saveGameConfig();
                            ctx.source.player.tell('§a[La Meute] §7Rayon du spawn : §e' + gameConfig.spawnPoint.radius + ' blocs');
                            return 1;
                        })
                    )
                )
            )
            .then(Commands.literal('spawn')
                    .executes(ctx => {
                        if (!gameConfig.spawnPoint.set) {
                            ctx.source.player.tell('§c[La Meute] §7Aucun point de spawn défini ! Utilisez §e/lameute point');
                            return 0;
                        }
                        
                        const count = teleportPlayersInCircle(ctx.source.server);
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('§a[La Meute] §7Téléportation au spawn ! §e' + count + ' joueurs');
                            p.level.playSound(null, p.blockPosition(), 
                                'minecraft:entity.enderman.teleport', 'players', 1.0, 1.0);
                        });
                        
                        return 1;
                    })
            )
    );
    
    // Commande pour assigner un rôle manuellement
    event.register(
        Commands.literal('lameute')
            .requires(requiresOP)
            .then(Commands.literal('role')
                .then(Commands.argument('player', Arguments.PLAYER.create(event))
                    .then(Commands.argument('role', Arguments.STRING.create(event))
                        .executes(ctx => {
                            const targetPlayer = Arguments.PLAYER.getResult(ctx, 'player');
                            const role = Arguments.STRING.getResult(ctx, 'role');
                            
                            // Retirer les anciens rôles
                            const roles = ['loup_garou', 'villageois', 'voyante', 'sorciere',
                                         'chasseur', 'cupidon', 'salvateur', 'petite_fille',
                                         'ancien', 'idiot', 'loup_blanc', 'ange', 'joueur_flute',
                                         'corbeau', 'renard', 'bouc', 'loup_alpha', 'infect',
                                         'sorciere_noire', 'chevalier', 'medium', 'soeurs',
                                         'chien_loup', 'pyromane', 'voleur'];
                            roles.forEach(r => targetPlayer.removeTag(r));
                            
                            // Ajouter le nouveau rôle
                            targetPlayer.addTag(role);
                            
                            // Reset états spéciaux
                            if (role === 'ancien') ancienLives[targetPlayer.name.string] = 1;
                            
                            targetPlayer.tell('§6§l[La Meute] §rVotre rôle est maintenant : §e' + role);
                            
                            return 1;
                        })
                    )
                )
            )
            .then(Commands.literal('nuit')
                .executes(ctx => {
                    ctx.source.level.setDayTime(13000);
                    votePhaseActive = false; // Désactiver le vote la nuit
                    nightPhaseActive = true; // Activer la phase de nuit pour les pouvoirs
                    
                    clearVoteScoreboard(ctx.source.server);
                    // Réinitialiser les pouvoirs de nuit
                    voyantePowerUsed = {};
                    loupVotes = {};
                    
                    // Retirer les protections de la nuit dernière
                    ctx.source.level.players.forEach(p => {
                        p.removeTag('protected_tonight');
                    });
                    
                    ctx.source.level.players.forEach(p => {
                        p.tell('§8§l═══════════════════════════════════════════════════');
                        p.tell('§c§l              🌙 LA NUIT TOMBE 🌙');
                        p.tell('§7     Le village s\'endort... Les loups se réveillent.');
                        p.tell('');
                        if (p.hasTag('loup_garou')) {
                            p.tell('§c     🐺 Utilisez un OS sur un joueur pour le dévorer');
                        }
                        if (p.hasTag('voyante')) {
                            p.tell('§b     👁 Utilisez un ŒIL D\'ARAIGNÉE pour voir un rôle');
                        }
                        if (p.hasTag('sorciere')) {
                            p.tell('§d     ⚗ POMME DORÉE = vie | ROSE DES TÉNÈBRES = mort');
                        }
                        if (p.hasTag('salvateur')) {
                            p.tell('§f     🛡 Utilisez un BOUCLIER pour protéger quelqu\'un');
                        }
                        p.tell('§8§l═══════════════════════════════════════════════════');
                    });
                    
                    // Son de nuit
                    ctx.source.level.playSound(null, ctx.source.player.blockPosition(),
                        'minecraft:entity.wolf.howl', 'ambient', 1.0, 0.6);
                    
                    return 1;
                })
            )
            .then(Commands.literal('jour')
                .executes(ctx => {
                    removeAllPlayersRoleItems(ctx.source.server);
                    ctx.source.level.setDayTime(1000);
                    votePhaseActive = true; // Activer la phase de vote
                    nightPhaseActive = false; // Désactiver la phase de nuit
                    votes = {}; // Réinitialiser les votes
                    updateVoteScoreboard(ctx.source.server);
                    
                    // Exécuter l'attaque des loups-garous
                    let loupTarget = null;
                    let loupVoteCount = {};
                    
                    for (let loup in loupVotes) {
                        let target = loupVotes[loup];
                        loupVoteCount[target] = (loupVoteCount[target] || 0) + 1;
                    }
                    
                    let maxLoupVotes = 0;
                    for (let target in loupVoteCount) {
                        if (loupVoteCount[target] > maxLoupVotes) {
                            maxLoupVotes = loupVoteCount[target];
                            loupTarget = target;
                        }
                    }
                    
                    // Vérifier si la victime était protégée
                    let victimProtected = false;
                    if (loupTarget) {
                        ctx.source.level.players.forEach(p => {
                            if (p.name.string === loupTarget && p.hasTag('protected_tonight')) {
                                victimProtected = true;
                            }
                        });
                    }
                    
                    ctx.source.level.players.forEach(p => {
                        p.tell('§6§l═══════════════════════════════════════════════════');
                        p.tell('§e§l              ☀️ LE JOUR SE LÈVE ☀️');
                        p.tell('');

                        if (loupTarget && !victimProtected) {
                            p.tell('§c§l   ☠ ' + loupTarget + ' a été dévoré cette nuit... ☠');
                        } else if (loupTarget && victimProtected) {
                            p.tell('§a   ✨ Le Salvateur a protégé quelqu\'un cette nuit !');
                            p.tell('§7   Personne n\'est mort.');
                        } else {
                            p.tell('§7   Personne n\'est mort cette nuit.');
                        }

                        p.tell('');
                        p.tell('§a§l   👆 CLIC DROIT sur un joueur pour VOTER !');
                        p.tell('§7      Clic gauche pour retirer votre vote.');
                        p.tell('§6§l═══════════════════════════════════════════════════');
                    });

                    // Mort de la victime via système centralisé
                    if (loupTarget && !victimProtected) {
                        handlePlayerDeath(ctx.source.server, loupTarget, 'loup', null);
                    }

                    // Son de coq
                    ctx.source.level.playSound(null, ctx.source.player.blockPosition(),
                        'minecraft:entity.chicken.ambient', 'ambient', 2.0, 0.8);
                    
                    return 1;
                })
            )
            .then(Commands.literal('resultat')
                .executes(ctx => {
                    // Compter les votes
                    let voteCount = {};
                    for (let voter in votes) {
                        let target = votes[voter];
                        voteCount[target] = (voteCount[target] || 0) + 1;
                    }
                    
                    // Trouver le joueur le plus voté
                    let maxVotes = 0;
                    let eliminated = null;
                    for (let player in voteCount) {
                        if (voteCount[player] > maxVotes) {
                            maxVotes = voteCount[player];
                            eliminated = player;
                        }
                    }
                    
                    ctx.source.level.players.forEach(p => {
                        p.tell('§6§l═══════════════════════════════════════════════════');
                        p.tell('§c§l              ⚖️ RÉSULTAT DU VOTE ⚖️');
                        p.tell('');
                        
                        // Afficher tous les votes
                        for (let voter in votes) {
                            p.tell('§7  ' + voter + ' → §c' + votes[voter]);
                        }
                        
                        p.tell('');
                        if (eliminated) {
                            p.tell('§4§l  ☠ ' + eliminated + ' est éliminé avec ' + maxVotes + ' vote(s) !');
                        } else {
                            p.tell('§7  Aucun vote enregistré.');
                        }
                        p.tell('§6§l═══════════════════════════════════════════════════');
                    });
                    
                    // Son dramatique
                    ctx.source.level.playSound(null, ctx.source.player.blockPosition(),
                        'minecraft:entity.lightning_bolt.thunder', 'players', 0.5, 0.8);
                    
                    votes = {}; // Réinitialiser pour le prochain tour
                    return 1;
                })
            )
            .then(Commands.literal('votes')
                .then(Commands.literal('public')
                    .executes(ctx => {
                        publicVotes = true;
                        ctx.source.level.players.forEach(p => {
                            p.tell('§6§l[La Meute] §aLes votes sont maintenant §l§ePUBLICS');
                            p.tell('§7  → Tout le monde verra qui vote pour qui');
                        });
                        return 1;
                    })
                )
                .then(Commands.literal('anonyme')
                    .executes(ctx => {
                        publicVotes = false;
                        ctx.source.level.players.forEach(p => {
                            p.tell('§6§l[La Meute] §aLes votes sont maintenant §l§8ANONYMES');
                            p.tell('§7  → Personne ne verra les votes avant le décompte');
                        });
                        return 1;
                    })
                )
            )
            .then(Commands.literal('maire')
                .then(Commands.argument('joueur', Arguments.STRING.create(event))
                    .executes(ctx => {
                        const targetName = Arguments.STRING.getResult(ctx, 'joueur');
                        
                        let targetPlayer = null;
                        ctx.source.level.players.forEach(p => {
                            if (p.name.string.toLowerCase() === targetName.toLowerCase()) {
                                targetPlayer = p;
                            }
                        });
                        
                        if (!targetPlayer) {
                            ctx.source.player.tell('§c[Maire] §7Joueur "' + targetName + '" non trouvé !');
                            return 0;
                        }
                        
                        maire = targetPlayer.name.string;
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('');
                            p.tell('§6§l═══════════════════════════════════════════════════');
                            p.tell('§e§l             👑 NOUVEAU MAIRE 👑');
                            p.tell('');
                            p.tell('§f             ' + maire + ' §7est maintenant §eMaire !');
                            p.tell('§7             Son vote compte §6DOUBLE');
                            p.tell('§6§l═══════════════════════════════════════════════════');
                            p.tell('');
                            p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
                        });
                        
                        return 1;
                    })
                )
                .then(Commands.literal('remove')
                    .executes(ctx => {
                        if (!maire) {
                            ctx.source.player.tell('§c[Maire] §7Il n\'y a pas de maire actuellement.');
                            return 0;
                        }
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('§6§l[La Meute] §7' + maire + ' n\'est plus Maire.');
                        });
                        
                        maire = null;
                        return 1;
                    })
                )
            )
            .then(Commands.literal('successeur')
                .then(Commands.argument('joueur', Arguments.STRING.create(event))
                    .executes(ctx => {
                        const player = ctx.source.player;
                        const targetName = Arguments.STRING.getResult(ctx, 'joueur');
                        
                        // Vérifier si c'est bien l'ancien maire qui parle
                        if (player.name.string !== maireDeceased) {
                            player.tell('§cVous n\'êtes pas l\'ancien Maire ou vous n\'avez pas à désigner de successeur.');
                            return 0;
                        }
                        
                        // Vérifier que le joueur cible existe et est vivant
                        let targetFound = false;
                        ctx.source.level.players.forEach(p => {
                            if (p.name.string.toLowerCase() === targetName.toLowerCase() && !deadPlayers[p.name.string]) {
                                targetFound = true;
                                maire = p.name.string;
                                maireDeceased = null; // Reset
                                
                                ctx.source.server.runCommandSilent('tellraw @a ["",{"text":"[Maire] ","color":"gold","bold":true},{"text":"' + player.name.string + ' a nommé ","color":"yellow"},{"text":"' + p.name.string + '","color":"gold","bold":true},{"text":" comme nouveau Maire !","color":"yellow"}]');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
                            }
                        });
                        
                        if (!targetFound) player.tell('§cJoueur introuvable ou mort.');
                        return 1;
                    })
                )
            )
            .then(Commands.literal('hurlement')
                .executes(ctx => {
                    const player = ctx.source.player;
                    player.level.playSound(null, player.blockPosition(), 
                        'minecraft:entity.wolf.howl', 'players', 3.0, 0.5);
                    
                    ctx.source.level.players.forEach(p => {
                        p.tell('§8§o*Un hurlement sinistre résonne dans la nuit...*');
                    });
                    return 1;
                })
            )
            // ============================================
            // 📢 SYSTÈME D'APPEL DES RÔLES (NUIT)
            // ============================================
            .then(Commands.literal('appel')
                .then(Commands.literal('loups')
                    .executes(ctx => {
                        giveItemsToWolves(ctx.source.server);
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🐺 LOUPS, RÉVEILLEZ-VOUS !","color":"red","bold":true}');
                                p.tell('');
                                p.tell('§c§l🐺 ════════════════════════════════════════ 🐺');
                                p.tell('§c§l         LES LOUPS SE RÉVEILLENT !');
                                p.tell('§c§l🐺 ════════════════════════════════════════ 🐺');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fDésignez votre victime avec un §cOS');
                                p.tell('§7  → §fLes autres loups peuvent aussi parler');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.wolf.growl', 'players', 1.0, 0.8);
                            } else {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 40 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🌙 Dormez...","color":"gray"}');
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Les loups ont été appelés.');
                        return 1;
                    })
                )
                .then(Commands.literal('voyante')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'voyante');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('voyante')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"👁 VOYANTE, RÉVEILLEZ-VOUS !","color":"aqua","bold":true}');
                                p.tell('');
                                p.tell('§b§l👁 ════════════════════════════════════════ 👁');
                                p.tell('§b§l         LA VOYANTE SE RÉVEILLE !');
                                p.tell('§b§l👁 ════════════════════════════════════════ 👁');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fUtilisez un §bŒil d\'araignée §fpour sonder un joueur');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:block.enchantment_table.use', 'players', 1.0, 1.2);
                            } else if (!p.hasTag('loup_garou') && !p.hasTag('loup_blanc') && !p.hasTag('loup_alpha')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 40 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🌙 Dormez...","color":"gray"}');
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7La voyante a été appelée.');
                        return 1;
                    })
                )
                .then(Commands.literal('sorciere')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'sorciere');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('sorciere') || p.hasTag('sorciere_noire')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"⚗ SORCIÈRE, RÉVEILLEZ-VOUS !","color":"light_purple","bold":true}');
                                p.tell('');
                                p.tell('§d§l⚗ ════════════════════════════════════════ ⚗');
                                p.tell('§d§l         LA SORCIÈRE SE RÉVEILLE !');
                                p.tell('§d§l⚗ ════════════════════════════════════════ ⚗');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §aPomme dorée §f= Potion de vie');
                                p.tell('§7  → §4Rose des ténèbres §f= Potion de mort');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.witch.ambient', 'players', 1.0, 1.0);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7La sorcière a été appelée.');
                        return 1;
                    })
                )
                .then(Commands.literal('salvateur')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'salvateur');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('salvateur')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🛡 SALVATEUR, RÉVEILLEZ-VOUS !","color":"white","bold":true}');
                                p.tell('');
                                p.tell('§f§l🛡 ════════════════════════════════════════ 🛡');
                                p.tell('§f§l         LE SALVATEUR SE RÉVEILLE !');
                                p.tell('§f§l🛡 ════════════════════════════════════════ 🛡');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fUtilisez un §fBouclier §fpour protéger quelqu\'un');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:item.shield.block', 'players', 1.0, 1.0);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Le salvateur a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('cupidon')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'cupidon');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('cupidon')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"💕 CUPIDON, RÉVEILLEZ-VOUS !","color":"light_purple","bold":true}');
                                p.tell('');
                                p.tell('§d§l💕 ════════════════════════════════════════ 💕');
                                p.tell('§d§l         CUPIDON SE RÉVEILLE !');
                                p.tell('§d§l💕 ════════════════════════════════════════ 💕');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fUtilisez un §dCoquelicot §fpour lier deux amoureux');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.experience_orb.pickup', 'players', 1.0, 1.5);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Cupidon a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('chasseur')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'chasseur');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('chasseur')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🏹 CHASSEUR, RÉVEILLEZ-VOUS !","color":"gold","bold":true}');
                                p.tell('');
                                p.tell('§6§l🏹 ════════════════════════════════════════ 🏹');
                                p.tell('§6§l         LE CHASSEUR SE RÉVEILLE !');
                                p.tell('§6§l🏹 ════════════════════════════════════════ 🏹');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fUtilisez votre §6Arc §fpour emporter quelqu\'un');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.arrow.shoot', 'players', 1.0, 1.0);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Le chasseur a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('renard')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'renard');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('renard')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🦊 RENARD, RÉVEILLEZ-VOUS !","color":"gold","bold":true}');
                                p.tell('');
                                p.tell('§6§l🦊 ════════════════════════════════════════ 🦊');
                                p.tell('§6§l         LE RENARD SE RÉVEILLE !');
                                p.tell('§6§l🦊 ════════════════════════════════════════ 🦊');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fUtilisez une §6Carotte §fpour flairer 3 joueurs');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.fox.sniff', 'players', 1.0, 1.0);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Le renard a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('joueur_flute')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'joueur_flute');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('joueur_flute')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🎵 JOUEUR DE FLÛTE, RÉVEILLEZ-VOUS !","color":"light_purple","bold":true}');
                                p.tell('');
                                p.tell('§d§l🎵 ════════════════════════════════════════ 🎵');
                                p.tell('§d§l      LE JOUEUR DE FLÛTE SE RÉVEILLE !');
                                p.tell('§d§l🎵 ════════════════════════════════════════ 🎵');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fDesignez §d2 joueurs §fà charmer cette nuit');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:block.note_block.flute', 'players', 1.0, 1.0);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Le joueur de flûte a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('corbeau')
                    .executes(ctx => {
                        giveItemsToRole(ctx.source.server, 'corbeau');
                        ctx.source.level.players.forEach(p => {
                            if (p.hasTag('corbeau')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Vous pouvez parler au MJ","color":"gray"}');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🐦 CORBEAU, RÉVEILLEZ-VOUS !","color":"dark_gray","bold":true}');
                                p.tell('');
                                p.tell('§8§l🐦 ════════════════════════════════════════ 🐦');
                                p.tell('§8§l         LE CORBEAU SE RÉVEILLE !');
                                p.tell('§8§l🐦 ════════════════════════════════════════ 🐦');
                                p.tell('');
                                p.tell('§7  → §fVous pouvez maintenant parler au §6§lMaître du Jeu');
                                p.tell('§7  → §fDésignez qui recevra §c+2 votes §fdemain');
                                p.tell('');
                                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.parrot.ambient', 'players', 1.0, 0.5);
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Le corbeau a été appelé.');
                        return 1;
                    })
                )
                .then(Commands.literal('tous')
                    .executes(ctx => {
                        ctx.source.level.players.forEach(p => {
                            p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                            p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"Tout le monde peut parler","color":"gray"}');
                            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"☀️ TOUT LE MONDE SE RÉVEILLE !","color":"yellow","bold":true}');
                            p.tell('');
                            p.tell('§e§l☀️ ════════════════════════════════════════ ☀️');
                            p.tell('§e§l         TOUT LE MONDE SE RÉVEILLE !');
                            p.tell('§e§l☀️ ════════════════════════════════════════ ☀️');
                            p.tell('');
                            p.tell('§7  → §fTout le monde peut maintenant parler');
                            p.tell('');
                            p.level.playSound(null, p.blockPosition(), 'minecraft:entity.player.levelup', 'players', 1.0, 1.0);
                        });
                        ctx.source.player.tell('§a[MJ] §7Tout le monde a été réveillé.');
                        return 1;
                    })
                )
                .then(Commands.literal('silence')
                    .executes(ctx => {
                        ctx.source.level.players.forEach(p => {
                            p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 10');
                            p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🤫 SILENCE...","color":"gray","bold":true}');
                            p.tell('');
                            p.tell('§7§l🤫 ════════════════════════════════════════ 🤫');
                            p.tell('§7§l              SILENCE ABSOLU');
                            p.tell('§7§l🤫 ════════════════════════════════════════ 🤫');
                            p.tell('');
                            p.tell('§8  → Personne ne doit parler');
                            p.tell('');
                        });
                        ctx.source.player.tell('§a[MJ] §7Silence demandé.');
                        return 1;
                    })
                )
                .then(Commands.literal('dors')
                    .executes(ctx => {
                        ctx.source.level.players.forEach(p => {
                            if (!playerTitles[p.name.string] || !playerTitles[p.name.string].toLowerCase().includes('mj') && !playerTitles[p.name.string].toLowerCase().includes('maitre')) {
                                p.server.runCommandSilent('title ' + p.name.string + ' times 10 40 10');
                                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"💤 Rendormez-vous...","color":"dark_gray"}');
                                p.tell('§8  💤 Vous vous rendormez...');
                            }
                        });
                        ctx.source.player.tell('§a[MJ] §7Les joueurs se rendorment.');
                        return 1;
                    })
                )
            )
    );
    
    // ============================================
    // 🏷️ COMMANDE /tab POUR LES TITRES
    // ============================================
    event.register(
        Commands.literal('tab')
            .requires(source => source.hasPermission(2)) // OP seulement
            .then(Commands.argument('joueur', Arguments.STRING.create(event))
                .then(Commands.argument('titre', Arguments.GREEDY_STRING.create(event))
                    .executes(ctx => {
                        try {
                            let tabTargetName = Arguments.STRING.getResult(ctx, 'joueur');
                            let titre = Arguments.GREEDY_STRING.getResult(ctx, 'titre');
                            // Chercher le joueur
                            let targetPlayer = null;
                            ctx.source.level.players.forEach(p => {
                                if (p.name.string.toLowerCase() === tabTargetName.toLowerCase()) {
                                    targetPlayer = p;
                                }
                            });
                            if (!targetPlayer) {
                                ctx.source.player.tell('§c[Tab] §7Joueur "' + tabTargetName + '" non trouvé !');
                                return 0;
                            }
                            // Sauvegarder le titre
                            playerTitles[targetPlayer.name.string] = titre;
                            savePlayerTitles(); // Sauvegarder immédiatement
                            // Mettre à jour l'affichage
                            updatePlayerDisplayName(targetPlayer);
                            const titleDisplay = getFormattedTitle(titre);
                            ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7changé en : ' + titleDisplay);
                            targetPlayer.tell('§a[Tab] §7Votre titre a été changé en : ' + titleDisplay);
                            // Annoncer à tous
                            ctx.source.level.players.forEach(p => {
                                p.tell('§8[Tab] §f' + targetPlayer.name.string + ' §7est maintenant : ' + titleDisplay.trim());
                            });
                            return 1;
                        } catch (e) {
                            ctx.source.player.tell('§c[Tab] §7Erreur: ' + e);
                            console.error('[Tab Error] ' + e);
                            return 0;
                        }
                    })
                )
            )
            .then(Commands.literal('remove')
                .then(Commands.argument('joueur', Arguments.STRING.create(event))
                    .executes(ctx => {
                        const removeTargetName = Arguments.STRING.getResult(ctx, 'joueur');
                        let targetPlayer = null;
                        
                        // Chercher le joueur en ligne
                        ctx.source.level.players.forEach(p => {
                            if (p.name.string.toLowerCase() === removeTargetName.toLowerCase()) {
                                targetPlayer = p;
                            }
                        });
                        
                        if (targetPlayer) {
                            // Joueur en ligne : Mise à jour immédiate
                            delete playerTitles[targetPlayer.name.string];
                            savePlayerTitles();
                            updatePlayerDisplayName(targetPlayer);
                            ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7retiré (remis à Joueur).');
                        } else {
                            // Joueur hors ligne : Chercher dans la base de données
                            let foundKey = Object.keys(playerTitles).find(k => k.toLowerCase() === removeTargetName.toLowerCase());
                            
                            if (foundKey) {
                                delete playerTitles[foundKey];
                                savePlayerTitles();
                                ctx.source.player.tell('§a[Tab] §7Titre de §f' + foundKey + ' §7retiré (Joueur hors ligne).');
                            } else {
                                ctx.source.player.tell('§c[Tab] §7Joueur "' + removeTargetName + '" non trouvé (ni en ligne, ni dans les titres).');
                                return 0;
                            }
                        }
                        return 1;
                    })
                )
            )
            .then(Commands.literal('resetall')
                .executes(ctx => {
                    playerTitles = {};
                    savePlayerTitles();
                    
                    // Mettre à jour tous les joueurs connectés
                    ctx.source.server.players.forEach(p => {
                        updatePlayerDisplayName(p);
                    });
                    
                    ctx.source.player.tell('§a[Tab] §7Tous les titres ont été réinitialisés.');
                    return 1;
                })
            )
            .then(Commands.literal('list')
                .executes(ctx => {
                    ctx.source.player.tell('§6§l═══ TITRES DISPONIBLES ═══');
                    ctx.source.player.tell('§7• §b§l[DEV] §7- dev');
                    ctx.source.player.tell('§7• §6§l[MJ] §7- maitre du jeu / mj');
                    ctx.source.player.tell('§7• §4§l[OWNER] §7- owner');
                    ctx.source.player.tell('§7• §c§l[ADMIN] §7- admin');
                    ctx.source.player.tell('§7• §e§l[MODO] §7- modo');
                    ctx.source.player.tell('§7• §a§l[VIP] §7- vip');
                    ctx.source.player.tell('§7• §d§l[Tasty Crousty] §7- tasty crousty');
                    ctx.source.player.tell('§7• §6§l[Chicken Street] §7- chicken street');
                    ctx.source.player.tell('§7• §7[Joueur] §7- joueur (défaut)');
                    ctx.source.player.tell('§e§l═══════════════════════');
                    ctx.source.player.tell('§7Usage: §f/tab <joueur> <titre>');
                    return 1;
                })
            )
    )
});

// Message de bienvenue et application du titre
PlayerEvents.loggedIn(event => {
    const player = event.player;
    
    // Appliquer le titre sauvegardé
    updatePlayerDisplayName(player);
    
    player.tell('');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('§6§l              🐺 LOUP-GAROU 🐺');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('');
    player.tell('§aCommandes :');
    player.tell('§7  /lameute start [loups] §8- Lancer une partie');
    player.tell('§7  /lameute timer auto §8- Timer automatique');
    player.tell('§7  /lameute timer jour [3/5/7] §8- Durée du jour');
    player.tell('');
    player.tell('§7Bienvenue dans le village de §eThiercelieux§7.');
    player.tell('§7La nuit, les §cloups-garous §7chassent...');
    player.tell('§7Le jour, le village vote pour éliminer les suspects.');
    player.tell('');
    player.tell('§e💡 Shift + Regarder en l\'air pour voir votre rôle !');
    player.tell('');
    player.tell('§c§l              QUE LA CHASSE COMMENCE !');
    player.tell('');
    player.tell('§8              Développé par §6§lw9n0 §8🐺');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('');
});