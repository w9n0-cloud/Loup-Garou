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
    // On ne touche plus à player.displayName (inexistant côté serveur)
    // On gère uniquement le préfixe via les teams pour le TAB
    player.server.runCommandSilent('team add title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' ""');
    player.server.runCommandSilent('team join title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' ' + playerName);
    player.server.runCommandSilent('team modify title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' prefix ' + JSON.stringify({"text":formattedTitle.replace(/§/g, '\u00A7')}));
    
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
        
        // Téléportation avec regard vers le centre
        player.server.runCommandSilent('execute in ' + center.dimension + ' run tp ' + player.name.string + ' ' + x.toFixed(1) + ' ' + y + ' ' + z.toFixed(1) + ' facing ' + center.x + ' ' + y + ' ' + center.z);
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

let sorciereNoireCurse = null; // Joueur maudit par la Sorcière Noire
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
    
    // Étape 2 : Annonce de la victime (après 2 secondes)
    server.scheduleInTicks(40, () => {
        if (loupTarget && !victimProtected) {
            // Annonce dramatique de la mort
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 80 20');
                p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"a été dévoré(e) par les loups...","color":"gray","italic":true}');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"☠ ' + loupTarget + ' ☠","color":"dark_red","bold":true}');
                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.lightning_bolt.thunder', 'players', 0.8, 0.5);
            });
            
            // Mettre le mort en spectateur
            if (victimPlayer) {
                // Gestion de la succession du Maire (Mort de nuit)
                if (loupTarget === maire) {
                    maireDeceased = maire;
                    maire = null;
                    server.runCommandSilent('tellraw @a ["",{"text":"[Maire] ","color":"gold","bold":true},{"text":"Le Maire est mort ! Il doit désigner son successeur !","color":"red"}]');
                    victimPlayer.tell('§e§l[Maire] §fUtilisez §6/lameute successeur <joueur> §fpour nommer le nouveau Maire.');
                }

                // Gestion du Chevalier (Mort de nuit)
                if (victimPlayer.hasTag('chevalier') && !victimProtected) {
                    const wolves = server.getPlayers().filter(p => (p.hasTag('loup_garou') || p.hasTag('loup_blanc') || p.hasTag('loup_alpha')) && !deadPlayers[p.name.string]);
                    if (wolves.length > 0) {
                        const randomWolf = wolves[Math.floor(Math.random() * wolves.length)];
                        randomWolf.kill();
                        deadPlayers[randomWolf.name.string] = true;
                        randomWolf.server.runCommandSilent('gamemode spectator ' + randomWolf.name.string);
                        server.runCommandSilent('tellraw @a ["",{"text":"⚔ Le Chevalier a emporté ","color":"blue"},{"text":"' + randomWolf.name.string + '","color":"red","bold":true},{"text":" dans sa tombe !","color":"blue"}]');
                    }
                }

                deadPlayers[loupTarget] = true;
                
                // Gestion du Chasseur (Mort de nuit - 30s pour tirer)
                if (victimPlayer.hasTag('chasseur')) {
                    victimPlayer.addTag('chasseur_mort');
                    chasseurCanShoot[loupTarget] = true;
                    victimPlayer.server.runCommandSilent('gamemode adventure ' + loupTarget);
                    victimPlayer.tell('§6§l[Chasseur] §cVous êtes mort... Mais vous avez 30 secondes pour tirer une dernière flèche !');
                    
                    // Timer 30s
                    server.scheduleInTicks(600, () => {
                        if (victimPlayer.hasTag('chasseur_mort')) {
                            victimPlayer.removeTag('chasseur_mort');
                            chasseurCanShoot[loupTarget] = false;
                            victimPlayer.server.runCommandSilent('gamemode spectator ' + loupTarget);
                            victimPlayer.tell('§c[Chasseur] §7Le temps est écoulé. Vous rejoignez les esprits.');
                        }
                    });
                } else {
                    victimPlayer.server.runCommandSilent('gamemode spectator ' + loupTarget);
                }
                
                victimPlayer.tell('');
                victimPlayer.tell('§4§l════════════════════════════════════════════════');
                victimPlayer.tell('§c§l           ☠ VOUS ÊTES MORT(E) ☠');
                victimPlayer.tell('§4§l════════════════════════════════════════════════');
                victimPlayer.tell('');
                victimPlayer.tell('§7  Vous êtes maintenant en mode §8SPECTATEUR');
                victimPlayer.tell('§7  Vos messages dans le chat ne seront vus que par le §6MJ');
                victimPlayer.tell('§7  Observez la partie en silence...');
                victimPlayer.tell('');
            }
        } else if (loupTarget && victimProtected) {
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 20');
                if (protectionSource === 'ancien') {
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🛡 L\'Ancien a survécu !","color":"green","bold":true}');
                } else {
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"✨ Personne n\'est mort !","color":"green","bold":true}');
                }
                p.level.playSound(null, p.blockPosition(), 'minecraft:entity.player.levelup', 'players', 1.0, 1.2);
            });
        } else {
            server.getPlayers().forEach(p => {
                p.server.runCommandSilent('title ' + p.name.string + ' times 10 60 20');
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🌅 Nuit paisible","color":"green"}');
            });
        }
    });
    
    // Étape 3 : Instructions de vote (après 5 secondes)
    server.scheduleInTicks(100, () => {
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
    }
}

// Appeler un rôle automatiquement
function autoCallRole(server, roleTag, roleName, instruction, color) {
    let hasRole = false;
    
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

// Appeler les loups (groupe)
function autoCallLoups(server) {
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

// Fonction pour exécuter le résultat du vote
function executeVoteResult(server) {
    // Compter les votes (le maire compte double)
    let voteCount = {};
    for (let voter in votes) {
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
        } else if (voteCount[player] === maxVotes) {
            tiedPlayers.push(player);
            isTie = true;
        }
    }
    
    // En cas d'égalité, vérifier le Bouc Émissaire
    if (isTie && tiedPlayers.length > 1) {
        server.getPlayers().forEach(p => {
            if (p.hasTag('bouc') && !deadPlayers[p.name.string]) {
                eliminated = p.name.string;
                isTie = false;
            }
        });
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

    server.getPlayers().forEach(p => {
        p.tell('');
        p.tell('§6§l═══════════════════════════════════════════════════');
        
        // Si c'est un vote du maire
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
            
            // Gestion de la succession du Maire (Mort de jour)
            if (eliminated === maire) {
                maireDeceased = maire;
                maire = null;
                p.tell('§6§l[Maire] §cLe Maire est mort ! Il doit désigner son successeur !');
                if (eliminatedPlayer) {
                    eliminatedPlayer.tell('§e§l[Maire] §fUtilisez §6/lameute successeur <joueur> §fpour nommer le nouveau Maire.');
                }
            }

            // Révéler le rôle
            let role = 'Villageois';
            if (eliminatedPlayer) {
                if (eliminatedPlayer.hasTag('loup_garou')) role = '§cLOUP-GAROU 🐺';
                else if (eliminatedPlayer.hasTag('loup_blanc')) role = '§fLOUP BLANC 🐺';
                else if (eliminatedPlayer.hasTag('loup_alpha')) role = '§4LOUP ALPHA 🐺';
                else if (eliminatedPlayer.hasTag('infect')) role = '§5INFECTÉ 🦠';
                else if (eliminatedPlayer.hasTag('voyante')) role = '§bVoyante';
                else if (eliminatedPlayer.hasTag('sorciere')) role = '§dSorcière';
                else if (eliminatedPlayer.hasTag('sorciere_noire')) role = '§0Sorcière Noire';
                else if (eliminatedPlayer.hasTag('chasseur')) role = '§6Chasseur';
                else if (eliminatedPlayer.hasTag('cupidon')) role = '§eCupidon';
                else if (eliminatedPlayer.hasTag('salvateur')) role = '§fSalvateur';
                else if (eliminatedPlayer.hasTag('petite_fille')) role = '§ePetite Fille';
                else if (eliminatedPlayer.hasTag('ancien')) role = '§2Ancien';
                else if (eliminatedPlayer.hasTag('idiot')) role = '§eIdiot du Village';
                else if (eliminatedPlayer.hasTag('ange')) role = '§bAnge 😇';
                else if (eliminatedPlayer.hasTag('joueur_flute')) role = '§dJoueur de Flûte 🎵';
                else if (eliminatedPlayer.hasTag('corbeau')) role = '§8Corbeau';
                else if (eliminatedPlayer.hasTag('renard')) role = '§6Renard';
                else if (eliminatedPlayer.hasTag('bouc')) role = '§cBouc Émissaire';
                else if (eliminatedPlayer.hasTag('chevalier')) role = '§9Chevalier';
                else role = '§aVillageois';
            }
            
            p.tell('§7  Son rôle était : ' + role);
        } else if (!eliminated) {
            p.tell('§7  Aucun vote enregistré. Personne n\'est éliminé.');
        }
        p.tell('§6§l═══════════════════════════════════════════════════');
        p.tell('');
        
        // Son dramatique
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.lightning_bolt.thunder', 'players', 0.5, 0.8);
    });

    // Vérifier victoire de l'Ange
    if (eliminatedPlayer && eliminatedPlayer.hasTag('ange') && timerConfig.dayCount <= 1) {
        server.scheduleInTicks(60, () => {
            server.getPlayers().forEach(p => {
                p.tell('');
                p.tell('§b§l════════════════════════════════════════════════════════');
                p.tell('');
                p.tell('§b§l          😇 L\'ANGE A GAGNÉ ! 😇');
                p.tell('');
                p.tell('§7  Il a réussi à se faire éliminer au premier jour.');
                p.tell('');
                p.tell('§b§l════════════════════════════════════════════════════════');
                
                p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"😇 L\'ANGE GAGNE 😇","color":"aqua","bold":true}');
                p.level.playSound(null, p.blockPosition(), 'minecraft:ui.toast.challenge_complete', 'players', 1.0, 1.0);
            });
            gameStarted = false;
        });
        // L'ange ne meurt pas vraiment (il gagne), mais on le laisse en spectateur pour la fin
    }
    
    // Mettre en spectateur si ce n'est pas l'idiot et pas l'élection du maire
    if (eliminatedPlayer && !isIdiotSave && !maireVoteActive) {
        deadPlayers[eliminated] = true;
        
        // Gestion du Chasseur (Mort de jour - 30s pour tirer)
        if (eliminatedPlayer.hasTag('chasseur')) {
            eliminatedPlayer.addTag('chasseur_mort');
            chasseurCanShoot[eliminated] = true;
            server.runCommandSilent('gamemode adventure ' + eliminated);
            eliminatedPlayer.tell('§6§l[Chasseur] §cVous êtes mort... Mais vous avez 30 secondes pour tirer une dernière flèche !');
            
            // Timer 30s
            server.scheduleInTicks(600, () => {
                if (eliminatedPlayer.hasTag('chasseur_mort')) {
                    eliminatedPlayer.removeTag('chasseur_mort');
                    chasseurCanShoot[eliminated] = false;
                    server.runCommandSilent('gamemode spectator ' + eliminated);
                    eliminatedPlayer.tell('§c[Chasseur] §7Le temps est écoulé. Vous rejoignez les esprits.');
                }
            });
        } else {
            server.runCommandSilent('gamemode spectator ' + eliminated);
        }
        
        // Vérifier si la Sorcière Noire gagne (victime = joueur maudit)
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
                    p.server.runCommandSilent('title ' + p.name.string + ' subtitle {"text":"La malédiction s\'accomplit...","color":"dark_gray"}');
                    p.server.runCommandSilent('title ' + p.name.string + ' title {"text":"🖤 SORCIÈRE NOIRE GAGNE 🖤","color":"black","bold":true}');
                    
                    p.level.playSound(null, p.blockPosition(),
                        'minecraft:entity.wither.spawn', 'players', 1.0, 0.5);
                });
                
                gameStarted = false;
                sorciereNoireCurse = null;
            });
        }
        
        eliminatedPlayer.tell('');
        eliminatedPlayer.tell('§4§l════════════════════════════════════════════════');
        eliminatedPlayer.tell('§c§l           ☠ VOUS ÊTES MORT(E) ☠');
        eliminatedPlayer.tell('§4§l════════════════════════════════════════════════');
        eliminatedPlayer.tell('');
        eliminatedPlayer.tell('§7  Vous êtes maintenant en mode §8SPECTATEUR');
        eliminatedPlayer.tell('§7  Vos messages seront vus uniquement par le §6MJ');
        eliminatedPlayer.tell('');
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
                     'loup_alpha', 'infect', 'sorciere_noire', 'chevalier'];
    allRoles.forEach(r => player.removeTag(r));
    player.addTag(role);
    
    // Donner l'item correspondant
    switch(role) {
        case 'loup_garou':
            player.give('minecraft:bone');
            break;
        case 'voyante':
            player.give('minecraft:spider_eye');
            break;
        case 'sorciere':
            player.give('minecraft:golden_apple');
            player.give('minecraft:wither_rose');
            break;
        case 'chasseur':
            player.give('minecraft:bow');
            player.give('minecraft:arrow');
            break;
        case 'cupidon':
            player.give('minecraft:poppy');
            break;
        case 'salvateur':
            player.give('minecraft:shield');
            break;
        case 'ancien':
            player.give('minecraft:book');
            break;
        case 'idiot':
            player.give('minecraft:feather');
            break;
        case 'loup_blanc':
            player.give('minecraft:bone');
            player.give('minecraft:bone_meal');
            break;
        case 'ange':
            player.give('minecraft:white_dye');
            break;
        case 'joueur_flute':
            player.give('minecraft:stick');
            break;
        case 'corbeau':
            player.give('minecraft:feather');
            break;
        case 'renard':
            player.give('minecraft:carrot');
            break;
        case 'bouc':
            player.give('minecraft:wheat');
            break;
        case 'loup_alpha':
            player.give('minecraft:bone');
            player.give('minecraft:poisonous_potato');
            break;
        case 'infect':
            player.give('minecraft:fermented_spider_eye');
            break;
        case 'sorciere_noire':
            player.give('minecraft:ink_sac');
            break;
        case 'chevalier':
            player.give('minecraft:iron_sword');
            break;
    }
    
    // Donner le livre des règles personnalisé
    giveRuleBook(player, role, roleName, roleDescription);
}

function giveRuleBook(player, role, roleName, roleDescription) {
    // Déterminer l'équipe du joueur
    let equipe = '§aVillage';
    let objectif = 'Éliminez tous les Loups-Garous !';
    
    if (role === 'loup_garou' || role === 'loup_blanc' || role === 'loup_alpha' || role === 'infect') {
        equipe = '§cLoups';
        objectif = 'Dévorez tous les Villageois !';
    } else if (role === 'ange' || role === 'joueur_flute' || role === 'sorciere_noire') {
        equipe = '§eSolitaire';
        if (role === 'ange') objectif = 'Faites-vous éliminer au premier vote !';
        if (role === 'joueur_flute') objectif = 'Charmez tous les joueurs vivants !';
        if (role === 'sorciere_noire') objectif = 'Faites mourir votre maudit par vote !';
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
    bookCommand += '{"text":"§lScoreboard:\\n","color":"aqua"},';
    bookCommand += '{"text":"Votre rôle à droite","color":"gray"}';
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

ItemEvents.rightClicked('minecraft:spider_eye', event => {
    const player = event.player;
    
    if (!nightPhaseActive) {
        player.tell('§c[Voyante] §7Vous ne pouvez utiliser ce pouvoir que la nuit.');
        return;
    }
    
    if (!player.hasTag('voyante')) {
        return; // Pas voyante, ne rien faire
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
        
        // Déterminer le rôle
        let role = '§aVillageois';
        if (target.hasTag('loup_garou')) role = '§c§lLOUP-GAROU 🐺';
        else if (target.hasTag('voyante')) role = '§bVoyante';
        else if (target.hasTag('sorciere')) role = '§dSorcière';
        else if (target.hasTag('chasseur')) role = '§6Chasseur';
        else if (target.hasTag('cupidon')) role = '§eCupidon';
        else if (target.hasTag('salvateur')) role = '§fSalvateur';
        else if (target.hasTag('petite_fille')) role = '§ePetite Fille';
        else if (target.hasTag('ancien')) role = '§2Ancien';
        else if (target.hasTag('idiot')) role = '§eIdiot du Village';
        
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
    
    if (sorcierePotionVie[player.name.string] === false) {
        player.tell('§d[Sorcière] §7Vous avez déjà utilisé votre potion de vie.');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        
        target.heal(20);
        target.tell('§a§l✨ La Sorcière vous a sauvé avec sa potion de vie ! ✨');
        player.tell('§d[Sorcière] §aVous avez utilisé la potion de vie sur §e' + target.name.string);
        
        sorcierePotionVie[player.name.string] = false;
        
        // Retirer la pomme
        event.item.count--;
        
        player.level.playSound(null, target.blockPosition(), 
            'minecraft:item.totem.use', 'players', 0.5, 1.2);
    } else {
        player.tell('§d[Sorcière] §7Regardez un joueur pour utiliser la potion de vie.');
    }
});

ItemEvents.rightClicked('minecraft:wither_rose', event => {
    const player = event.player;
    
    if (!player.hasTag('sorciere')) return;
    
    if (!nightPhaseActive) {
        player.tell('§d[Sorcière] §7Vous ne pouvez utiliser ce pouvoir que la nuit.');
        return;
    }
    
    if (sorcierePotionMort[player.name.string] === false) {
        player.tell('§d[Sorcière] §7Vous avez déjà utilisé votre potion de mort.');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        
        target.kill();
        player.tell('§d[Sorcière] §cVous avez empoisonné §e' + target.name.string);
        target.tell('§4§l☠ La Sorcière vous a empoisonné... Vous êtes mort. ☠');
        
        sorcierePotionMort[player.name.string] = false;
        
        // Retirer la rose
        event.item.count--;
        
        player.level.playSound(null, target.blockPosition(), 
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
        
        target.kill();
        chasseurCanShoot[player.name.string] = false;
        player.removeTag('chasseur_mort');
        player.server.runCommandSilent('gamemode spectator ' + player.name.string);
        
        player.level.players.forEach(p => {
            p.tell('§6§l═══════════════════════════════════════════');
            p.tell('§6§l       🏹 LE CHASSEUR A TIRÉ ! 🏹');
            p.tell('§7   ' + target.name.string + ' §7a été emporté dans la tombe.');
            p.tell('§6§l═══════════════════════════════════════════');
        });
        
        player.level.playSound(null, target.blockPosition(), 
            'minecraft:entity.arrow.hit_player', 'players', 1.0, 0.8);
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
            target.kill();
            player.tell('§f[Loup Blanc] §cVous avez éliminé le loup ' + target.name.string);
            event.item.count--;
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

// Pouvoir du Renard (Carotte)
ItemEvents.rightClicked('minecraft:carrot', event => {
    const player = event.player;
    if (!player.hasTag('renard')) return;
    if (!nightPhaseActive) return;
    if (renardPowerUsed[player.name.string] === false) {
        player.tell('§6[Renard] §7Vous avez perdu votre flair.');
        return;
    }

    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.isPlayer()) {
        const target = lookingAt.entity;
        // Trouver les voisins (simulé par proximité dans la liste des joueurs ou rayon)
        // Ici on prend le joueur visé + 2 aléatoires proches ou juste le visé pour simplifier
        // Simplification : Le Renard flaire le joueur visé. Si c'est un loup, il garde son pouvoir. Sinon il le perd.
        // Règle officielle : Le renard désigne 3 joueurs.
        
        let isWolfAround = false;
        if (target.hasTag('loup_garou') || target.hasTag('loup_blanc') || target.hasTag('loup_alpha')) isWolfAround = true;
        
        if (isWolfAround) {
            player.tell('§6[Renard] §aIl y a un loup parmi les joueurs ciblés ! (Flair conservé)');
            player.level.playSound(null, player.blockPosition(), 'minecraft:entity.fox.screech', 'players', 1.0, 1.0);
        } else {
            player.tell('§6[Renard] §cIl n\'y a aucun loup ici... Vous perdez votre flair.');
            renardPowerUsed[player.name.string] = false;
            event.item.count--; // Perd la carotte
        }
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
                gameStarted = false;
            });
        }
    }
});

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

    // Mettre à jour le scoreboard toutes les 2 secondes (40 ticks)
    const now = Date.now();
    if (!lastScoreboardUpdate[playerName] || now - lastScoreboardUpdate[playerName] > 2000) {
        lastScoreboardUpdate[playerName] = now;
        
        // Déterminer le rôle du joueur
        let role = '§7???';
        let roleEmoji = '❓';
        
        if (player.hasTag('loup_garou')) { role = '§c§lLOUP-GAROU'; roleEmoji = '🐺'; }
        else if (player.hasTag('voyante')) { role = '§bVoyante'; roleEmoji = '👁'; }
        else if (player.hasTag('sorciere')) { role = '§dSorcière'; roleEmoji = '⚗'; }
        else if (player.hasTag('chasseur')) { role = '§6Chasseur'; roleEmoji = '🏹'; }
        else if (player.hasTag('cupidon')) { role = '§eCupidon'; roleEmoji = '💕'; }
        else if (player.hasTag('salvateur')) { role = '§fSalvateur'; roleEmoji = '🛡'; }
        else if (player.hasTag('petite_fille')) { role = '§ePetite§eFille'; roleEmoji = '👀'; }
        else if (player.hasTag('ancien')) { role = '§2Ancien'; roleEmoji = '👴'; }
        else if (player.hasTag('idiot')) { role = '§eIdiot'; roleEmoji = '🤡'; }
        else if (player.hasTag('villageois')) { role = '§aVillageois'; roleEmoji = '🏠'; }
        
        // Déterminer la phase actuelle
        let phase = '§7En attente...';
        if (timerConfig.currentPhase === 'day') {
            phase = '§e☀ JOUR';
        } else if (timerConfig.currentPhase === 'night') {
            phase = '§8🌙 NUIT';
        }
        
        // Mettre à jour le scoreboard pour ce joueur
        player.server.runCommandSilent('scoreboard objectives add lameute dummy {"text":"§6§l🐺 LA MEUTE 🐺"}');
        player.server.runCommandSilent('scoreboard objectives setdisplay sidebar lameute');
        
        // Nettoyer les anciennes entrées
        player.server.runCommandSilent('scoreboard players reset * lameute');
        
        // Ajouter les nouvelles lignes
        player.server.runCommandSilent('scoreboard players set §8══════════ lameute 10');
        player.server.runCommandSilent('scoreboard players set §fVotre§frôle§f: lameute 9');
        player.server.runCommandSilent('scoreboard players set ' + roleEmoji + role + ' lameute 8');
        player.server.runCommandSilent('scoreboard players set §r lameute 7');
        player.server.runCommandSilent('scoreboard players set §fPhase§f: lameute 6');
        player.server.runCommandSilent('scoreboard players set ' + phase + ' lameute 5');
        player.server.runCommandSilent('scoreboard players set §r§r lameute 4');
        player.server.runCommandSilent('scoreboard players set §8═══════════ lameute 3');
        player.server.runCommandSilent('scoreboard players set §r§r§r lameute 2');
        player.server.runCommandSilent('scoreboard players set §7Dev:§6§lw9n0 lameute 1');
    }
    
    // Si le joueur est accroupi et regarde vers le haut
    if (player.crouching && player.pitch < -60) {
        // Afficher le rôle dans l'action bar
        let role = 'Villageois';
        let color = '§a';
        
        if (player.hasTag('loup_garou')) { role = 'LOUP-GAROU 🐺'; color = '§c§l'; }
        else if (player.hasTag('voyante')) { role = 'Voyante 👁'; color = '§b'; }
        else if (player.hasTag('sorciere')) { role = 'Sorcière ⚗'; color = '§d'; }
        else if (player.hasTag('chasseur')) { role = 'Chasseur 🏹'; color = '§6'; }
        else if (player.hasTag('cupidon')) { role = 'Cupidon 💕'; color = '§e'; }
        else if (player.hasTag('salvateur')) { role = 'Salvateur 🛡'; color = '§f'; }
        else if (player.hasTag('petite_fille')) { role = 'Petite Fille 👀'; color = '§e'; }
        else if (player.hasTag('ancien')) { role = 'Ancien 👴'; color = '§2'; }
        else if (player.hasTag('idiot')) { role = 'Idiot 🤡'; color = '§e'; }
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

// Chat privé des loups la nuit
PlayerEvents.chat(event => {
    const player = event.player;
    const playerName = player.name.string;
    
    // Chat des morts (Spectateurs)
    if (deadPlayers[playerName]) {
        event.cancel();
        const deadMessage = '§7[☠ Spectre] ' + playerName + ' §8» §7' + event.message;
        
        event.server.players.forEach(p => {
            const pName = p.name.string;
            const isMJ = playerTitles[pName] && (playerTitles[pName].toLowerCase().includes('mj') || playerTitles[pName].toLowerCase().includes('maitre'));
            
            // Envoyer aux morts et au MJ
            if (deadPlayers[pName] || isMJ) {
                p.tell(deadMessage);
            }
        });
        return;
    }
});
    
    // Si c'est la nuit, que le joueur est un loup et qu'il est vivant
    if (nightPhaseActive && !deadPlayers[playerName] && (player.tags.contains('loup_garou') || player.tags.contains('loup_blanc') || player.tags.contains('loup_alpha') || player.tags.contains('infect'))) {
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
    }

    // Formatage du chat normal (pour enlever les < >)
    if (!event.cancelled) {
        event.cancel();
        
        const title = playerTitles[playerName] || 'Joueur';
        const formattedTitle = getFormattedTitle(title);
        
        const chatMessage = formattedTitle + '§f' + playerName + ' §8» §f' + event.message;
        
        event.server.players.forEach(p => {
            p.tell(chatMessage);
        });
    }
};

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
        if (playerCount >= 14) specialRolesPool.push('ange');
        if (playerCount >= 15) specialRolesPool.push('joueur_flute');
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
                        
                        // Réinitialiser pour la nouvelle partie
                        timerConfig.dayCount = 0;
                        timerConfig.timerRunning = true;
                        timerConfig.autoMode = true;
                        deadPlayers = {};
                        maire = null;
                        maireVoteActive = false;
                        maireVotes = {};
                        votes = {};
                        publicVotes = false;
                        sorciereNoireCurse = null;
                        corbeauTarget = null;
                        loupAlphaUsed = false;
                        renardPowerUsed = {};
                        fluteCharmed = {};
                        
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
                    ctx.source.player.tell('§6§l=== RÔLES DISPONIBLES ===');
                    ctx.source.player.tell('§c• loup_garou §7- Dévore les villageois');
                    ctx.source.player.tell('§a• villageois §7- Simple villageois');
                    ctx.source.player.tell('§b• voyante §7- Voit les rôles');
                    ctx.source.player.tell('§d• sorciere §7- Potions vie/mort');
                    ctx.source.player.tell('§6• chasseur §7- Tire en mourant');
                    ctx.source.player.tell('§e• cupidon §7- Lie les amoureux');
                    ctx.source.player.tell('§f• salvateur §7- Protège la nuit');
                    ctx.source.player.tell('§e• petite_fille §7- Espionne');
                    ctx.source.player.tell('§2• ancien §7- Résiste aux loups');
                    ctx.source.player.tell('§e• idiot §7- Survit au vote');
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
                                         'sorciere_noire', 'chevalier'];
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
                            
                            // Tuer la victime
                            if (p.name.string === loupTarget) {
                                p.tell('§4§l   VOUS AVEZ ÉTÉ DÉVORÉ PAR LES LOUPS-GAROUS !');
                                p.kill();
                            }
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
                                if (ctx.source.player) ctx.source.player.tell('§c[Tab] §7Joueur "' + tabTargetName + '" non trouvé !');
                                return 0;
                            }
                            // Sauvegarder le titre
                            playerTitles[targetPlayer.name.string] = titre;
                            savePlayerTitles(); // Sauvegarder immédiatement
                            // Mettre à jour l'affichage
                            updatePlayerDisplayName(targetPlayer);
                            const titleDisplay = getFormattedTitle(titre);
                            ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7changé en : ' + titleDisplay);
                            
                            if (ctx.source.player) ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7changé en : ' + titleDisplay);
                            targetPlayer.tell('§a[Tab] §7Votre titre a été changé en : ' + titleDisplay);
                            // Annoncer à tous
                            ctx.source.level.players.forEach(p => {
                                p.tell('§8[Tab] §f' + targetPlayer.name.string + ' §7est maintenant : ' + titleDisplay.trim());
                            });
                            return 1;
                        } catch (e) {
                            ctx.source.player.tell('§c[Tab] §7Erreur: ' + e + (e && e.stack ? ('\n' + e.stack) : ''));
                            console.error('[Tab Error] ' + e);
                            if (ctx.source.player) ctx.source.player.tell('§c[Tab] §7Erreur: ' + e);
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
    player.tell('§e💡 Votre rôle s\'affiche dans le scoreboard à droite !');
    player.tell('');
    player.tell('§c§l              QUE LA CHASSE COMMENCE !');
    player.tell('');
    player.tell('§8              Développé par §6§lw9n0 §8🐺');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('');
});