// 🐺 LA MEUTE - Scripts KubeJS pour les rôles du Loup-Garou
// ==========================================================
// Développé par w9n0
// ==========================================================

// Ce script ajoute des fonctionnalités de jeu Loup-Garou

// ============================================
// 🏷️ SYSTÈME DE TITRES (TAB & CHAT)
// ============================================

// Stockage des titres personnalisés des joueurs
let playerTitles = {};

// Titres prédéfinis avec leurs couleurs
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
    // Titre personnalisé avec couleur dorée par défaut
    return '§e§l[' + title + '] ';
}

// Fonction pour mettre à jour le display name d'un joueur
function updatePlayerDisplayName(player) {
    const playerName = player.name.string;
    const title = playerTitles[playerName] || 'Joueur';
    const formattedTitle = getFormattedTitle(title);
    
    // Mettre à jour le nom dans le TAB et au-dessus de la tête
    const displayName = formattedTitle + '§f' + playerName;
    player.displayName = displayName;
    
    // Mettre à jour via la commande team pour le TAB
    player.server.runCommandSilent('team add title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' ""');
    player.server.runCommandSilent('team join title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' ' + playerName);
    player.server.runCommandSilent('team modify title_' + playerName.replace(/[^a-zA-Z0-9]/g, '') + ' prefix ' + JSON.stringify({"text":formattedTitle.replace(/§/g, '\u00A7')}));
}

// ============================================
// 📍 SYSTÈME D'ARÈNE ET TÉLÉPORTATION
// ============================================

// Position de l'arène (centre du cercle)
let arenaCenter = {
    x: 0,
    y: 100,
    z: 0,
    set: false,
    radius: 5  // Rayon du cercle en blocs
};

// Fonction pour TP tous les joueurs en cercle autour du centre
function teleportPlayersInCircle(server) {
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
    
    players.forEach((player, index) => {
        const angle = angleStep * index;
        const x = arenaCenter.x + Math.cos(angle) * arenaCenter.radius;
        const z = arenaCenter.z + Math.sin(angle) * arenaCenter.radius;
        const y = arenaCenter.y;
        
        // TP le joueur
        player.server.runCommandSilent('tp ' + player.name.string + ' ' + x.toFixed(1) + ' ' + y + ' ' + z.toFixed(1));
        
        // Faire regarder le joueur vers le centre
        const lookX = arenaCenter.x;
        const lookZ = arenaCenter.z;
        player.server.runCommandSilent('tp ' + player.name.string + ' ' + x.toFixed(1) + ' ' + y + ' ' + z.toFixed(1) + ' facing ' + lookX + ' ' + y + ' ' + lookZ);
    });
    
    return count;
}

// ============================================
// ⏰ SYSTÈME DE TIMER AUTOMATIQUE (XP BAR)
// ============================================

// Configuration du timer
let timerConfig = {
    dayDuration: 5,      // Durée du jour en minutes (3, 5 ou 7)
    nightDuration: 6,    // Durée de la nuit en minutes (max)
    currentPhase: 'none', // 'day', 'night', 'none'
    timerStartTime: 0,   // Timestamp de début de phase
    timerRunning: false,
    autoMode: false      // Mode automatique activé
};

// Stockage des actions de nuit effectuées
let nightActionsCompleted = {
    loups: false,
    voyante: false,
    sorciere_checked: false,
    salvateur: false
};

// Fonction pour réinitialiser les actions de nuit
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
        if (p.hasTag('voyante')) hasVoyante = true;
        if (p.hasTag('sorciere')) hasSorciere = true;
        if (p.hasTag('salvateur')) hasSalvateur = true;
        if (p.hasTag('loup_garou')) hasLoups = true;
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
    timerConfig.currentPhase = 'day';
    timerConfig.timerStartTime = Date.now();
    votePhaseActive = true;
    nightPhaseActive = false;
    votes = {};
    
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
    
    server.getPlayers().forEach(p => {
        if (loupTarget && p.name.string === loupTarget) {
            victimPlayer = p;
            if (p.hasTag('protected_tonight')) {
                victimProtected = true;
            }
        }
    });
    
    server.getPlayers().forEach(p => {
        p.tell('');
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
        p.tell('§a   📊 La barre d\'XP = temps restant pour voter');
        p.tell('§a   👆 CLIC DROIT sur un joueur pour VOTER !');
        p.tell('§7      Clic gauche pour retirer votre vote.');
        p.tell('§6§l═══════════════════════════════════════════════════');
        p.tell('');
        
        // Mettre le temps du jour
        p.level.setDayTime(1000);
        
        // Jouer le son
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.chicken.ambient', 'ambient', 2.0, 0.8);
    });
    
    // Tuer la victime
    if (victimPlayer && !victimProtected) {
        victimPlayer.kill();
    }
}

// Fonction pour passer à la nuit (utilisée par le timer)
function transitionToNight(server) {
    timerConfig.currentPhase = 'night';
    timerConfig.timerStartTime = Date.now();
    votePhaseActive = false;
    nightPhaseActive = true;
    
    // Réinitialiser les actions de nuit
    resetNightActions();
    voyantePowerUsed = {};
    loupVotes = {};
    
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
        p.tell('');
        
        // Mettre le temps de nuit
        p.level.setDayTime(13000);
        
        // Jouer le son
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.wolf.howl', 'ambient', 1.0, 0.6);
    });
}

// Fonction pour exécuter le résultat du vote
function executeVoteResult(server) {
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
    
    server.getPlayers().forEach(p => {
        p.tell('');
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
            
            // Révéler le rôle
            server.getPlayers().forEach(target => {
                if (target.name.string === eliminated) {
                    let role = 'Villageois';
                    if (target.hasTag('loup_garou')) role = '§cLOUP-GAROU 🐺';
                    else if (target.hasTag('voyante')) role = '§bVoyante';
                    else if (target.hasTag('sorciere')) role = '§dSorcière';
                    else if (target.hasTag('chasseur')) role = '§6Chasseur';
                    else if (target.hasTag('cupidon')) role = '§eCupidon';
                    else if (target.hasTag('salvateur')) role = '§fSalvateur';
                    else if (target.hasTag('petite_fille')) role = '§ePetite Fille';
                    else role = '§aVillageois';
                    
                    p.tell('§7  Son rôle était : ' + role);
                    target.kill();
                }
            });
        } else {
            p.tell('§7  Aucun vote enregistré. Personne n\'est éliminé.');
        }
        p.tell('§6§l═══════════════════════════════════════════════════');
        p.tell('');
        
        // Son dramatique
        p.level.playSound(null, p.blockPosition(),
            'minecraft:entity.lightning_bolt.thunder', 'players', 0.5, 0.8);
    });
    
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

// ============================================
// 🎴 SYSTÈME DE DISTRIBUTION DES CARTES
// ============================================

// Fonction pour mélanger un tableau
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
                     'chasseur', 'cupidon', 'salvateur', 'petite_fille'];
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
    }
}

// Événement pour cliquer et révéler la carte
PlayerEvents.rightClickedBlock(event => {
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

// Alternative : clic droit dans le vide
PlayerEvents.rightClickedEmpty(event => {
    const player = event.player;
    const playerName = player.name.string;
    
    // Vérifier si ce joueur a une carte en attente
    if (pendingCardReveal[playerName]) {
        const role = pendingCardReveal[playerName];
        delete pendingCardReveal[playerName];
        
        revealRoleToPlayer(player, role);
    }
});

// Stockage des votes
let votes = {};
let votePhaseActive = false;

// Stockage des pouvoirs utilisés
let voyantePowerUsed = {};      // {joueur: true} si déjà utilisé cette nuit
let sorcierePotionVie = {};     // {joueur: true} si potion encore dispo
let sorcierePotionMort = {};    // {joueur: true} si potion encore dispo
let salvateurProtection = {};   // {joueur: "cible"} dernière protection
let cupidonLinks = {};          // {joueur1: joueur2, joueur2: joueur1}
let chasseurCanShoot = {};      // {joueur: true} si peut encore tirer
let loupVotes = {};             // {loup: "cible"} vote des loups
let nightPhaseActive = false;

// ============================================
// 🔮 VOYANTE - Clic droit avec Œil d'araignée
// ============================================
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
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
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

// ============================================
// ⚗️ SORCIÈRE - Potion de Vie (Pomme dorée)
// ============================================
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
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
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

// ============================================
// ⚗️ SORCIÈRE - Potion de Mort (Wither Rose)
// ============================================
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
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
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

// ============================================
// 🛡️ SALVATEUR - Protection (Bouclier)
// ============================================
ItemEvents.rightClicked('minecraft:shield', event => {
    const player = event.player;
    
    if (!player.hasTag('salvateur')) return;
    
    if (!nightPhaseActive) {
        player.tell('§f[Salvateur] §7Vous ne pouvez protéger que la nuit.');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
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

// ============================================
// 💕 CUPIDON - Lier par l'amour (Rose)
// ============================================
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
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
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

// ============================================
// 🐺 LOUP-GAROU - Désigner victime (Os)
// ============================================
ItemEvents.rightClicked('minecraft:bone', event => {
    const player = event.player;
    
    if (!player.hasTag('loup_garou')) return;
    
    if (!nightPhaseActive) {
        player.tell('§c[Loup-Garou] §7Les loups ne chassent que la nuit...');
        return;
    }
    
    const lookingAt = player.rayTrace(5, true);
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
        const target = lookingAt.entity;
        const targetName = target.name.string;
        
        // Ne peut pas cibler un autre loup
        if (target.hasTag('loup_garou')) {
            player.tell('§c[Loup-Garou] §7Vous ne pouvez pas dévorer un membre de la meute !');
            return;
        }
        
        loupVotes[player.name.string] = targetName;
        
        // Vérifier si tous les loups ont voté
        let allLoupsVoted = true;
        let nbLoups = 0;
        let nbLoupsVoted = Object.keys(loupVotes).length;
        
        player.level.players.forEach(p => {
            if (p.hasTag('loup_garou')) nbLoups++;
        });
        
        if (nbLoupsVoted >= nbLoups) {
            nightActionsCompleted.loups = true; // Tous les loups ont voté
        }
        
        // Notifier les autres loups
        player.level.players.forEach(p => {
            if (p.hasTag('loup_garou')) {
                p.tell('§c[Meute] §e' + player.name.string + ' §7veut dévorer §c' + targetName);
            }
        });
        
        player.level.playSound(null, player.blockPosition(), 
            'minecraft:entity.wolf.growl', 'players', 1.0, 0.8);
    } else {
        player.tell('§c[Loup-Garou] §7Regardez un joueur et cliquez avec l\'os pour le désigner.');
    }
});

// ============================================
// 🏹 CHASSEUR - Tirer (Arc)
// ============================================
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
    if (lookingAt && lookingAt.entity && lookingAt.entity.type === 'minecraft:player') {
        const target = lookingAt.entity;
        
        target.kill();
        chasseurCanShoot[player.name.string] = false;
        
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

// ============================================
// ❓ VOIR SON RÔLE - S'accroupir + regarder en l'air
// ============================================

// Variable pour limiter les updates du scoreboard
let lastScoreboardUpdate = {};

PlayerEvents.tick(event => {
    const player = event.player;
    const playerName = player.name.string;
    
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
        else if (player.hasTag('villageois')) { role = 'Villageois 🏠'; color = '§a'; }
        
        // Afficher dans l'action bar
        player.displayClientMessage(color + 'Votre rôle : ' + role, true);
    }
});

// Système de vote par clic droit sur un joueur
PlayerEvents.entityInteracted(event => {
    const player = event.player;
    const target = event.target;
    
    // Vérifier que c'est un clic droit sur un autre joueur
    if (target.type === 'minecraft:player' && votePhaseActive) {
        const voterName = player.name.string;
        const targetName = target.name.string;
        
        // Enregistrer le vote
        votes[voterName] = targetName;
        
        // Notifier le votant
        player.tell('§6[Vote] §aVous avez voté contre §c' + targetName);
        
        // Annoncer à tout le monde
        player.level.players.forEach(p => {
            if (p.name.string !== voterName) {
                p.tell('§6[Vote] §e' + voterName + ' §7a voté !');
            }
        });
        
        // Son de vote
        player.level.playSound(null, player.blockPosition(), 
            'minecraft:block.note_block.pling', 'players', 1.0, 1.5);
    }
});

// Retirer son vote par clic gauche sur un joueur
PlayerEvents.attack(event => {
    const player = event.player;
    const target = event.target;
    
    // Vérifier que c'est un clic gauche sur un autre joueur pendant le vote
    if (target.type === 'minecraft:player' && votePhaseActive) {
        const voterName = player.name.string;
        
        // Vérifier si le joueur a déjà voté
        if (votes[voterName]) {
            delete votes[voterName];
            
            // Notifier le votant
            player.tell('§6[Vote] §eVous avez retiré votre vote.');
            
            // Annoncer à tout le monde
            player.level.players.forEach(p => {
                if (p.name.string !== voterName) {
                    p.tell('§6[Vote] §e' + voterName + ' §7a retiré son vote.');
                }
            });
            
            // Son d'annulation
            player.level.playSound(null, player.blockPosition(), 
                'minecraft:block.note_block.bass', 'players', 1.0, 0.8);
            
            // Annuler l'attaque (ne pas faire de dégâts)
            event.cancel();
        } else {
            player.tell('§6[Vote] §7Vous n\'avez pas encore voté.');
            event.cancel();
        }
    }
});

// Événement quand la nuit tombe
PlayerEvents.tick(event => {
    const player = event.player;
    const level = player.level;
    
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

// Commandes personnalisées pour le maître du jeu
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    // Fonction pour vérifier si le joueur est OP (niveau 2+)
    const requiresOP = (source) => source.hasPermission(2);
    
    // Commande pour démarrer une partie avec distribution automatique
    event.register(
        Commands.literal('lameute')
            .requires(requiresOP)
            .then(Commands.literal('start')
                .then(Commands.argument('loups', Arguments.INTEGER.create(event))
                    .executes(ctx => {
                        const nbLoups = Arguments.INTEGER.getResult(ctx, 'loups');
                        const players = [];
                        
                        ctx.source.level.players.forEach(p => {
                            players.push(p);
                        });
                        
                        if (players.length < 4) {
                            ctx.source.player.tell('§c[La Meute] §7Il faut au moins 4 joueurs pour commencer !');
                            return 0;
                        }
                        
                        if (nbLoups >= players.length / 2) {
                            ctx.source.player.tell('§c[La Meute] §7Trop de loups-garous ! Maximum : ' + Math.floor(players.length / 2 - 1));
                            return 0;
                        }
                        
                        // Créer la liste des rôles
                        let roles = [];
                        
                        // Ajouter les loups-garous
                        for (let i = 0; i < nbLoups; i++) {
                            roles.push('loup_garou');
                        }
                        
                        // Ajouter les rôles spéciaux selon le nombre de joueurs
                        if (players.length >= 6) roles.push('voyante');
                        if (players.length >= 7) roles.push('sorciere');
                        if (players.length >= 8) roles.push('chasseur');
                        if (players.length >= 10) roles.push('cupidon');
                        if (players.length >= 12) roles.push('salvateur');
                        if (players.length >= 14) roles.push('petite_fille');
                        
                        // Compléter avec des villageois
                        while (roles.length < players.length) {
                            roles.push('villageois');
                        }
                        
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
                        
                        // Distribution des cartes avec délai
                        gameStarted = true;
                        
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
                    return 1;
                })
            )
    );
    
    // Commandes d'arène
    event.register(
        Commands.literal('lameute')
            .requires(requiresOP)
            .then(Commands.literal('arene')
                .then(Commands.literal('set')
                    .executes(ctx => {
                        const player = ctx.source.player;
                        arenaCenter.x = Math.floor(player.x);
                        arenaCenter.y = Math.floor(player.y);
                        arenaCenter.z = Math.floor(player.z);
                        arenaCenter.set = true;
                        
                        player.tell('§a[Arène] §7Centre défini à §e' + arenaCenter.x + ' ' + arenaCenter.y + ' ' + arenaCenter.z);
                        player.tell('§7Utilisez §e/lameute arene rayon <nombre> §7pour modifier le rayon (défaut: 5)');
                        return 1;
                    })
                )
                .then(Commands.literal('rayon')
                    .then(Commands.argument('size', Arguments.INTEGER.create(event))
                        .executes(ctx => {
                            const size = Arguments.INTEGER.getResult(ctx, 'size');
                            arenaCenter.radius = Math.max(2, Math.min(size, 20));
                            ctx.source.player.tell('§a[Arène] §7Rayon du cercle : §e' + arenaCenter.radius + ' blocs');
                            return 1;
                        })
                    )
                )
                .then(Commands.literal('tp')
                    .executes(ctx => {
                        if (!arenaCenter.set) {
                            ctx.source.player.tell('§c[Arène] §7Aucune arène définie ! Utilisez §e/lameute arene set');
                            return 0;
                        }
                        
                        const count = teleportPlayersInCircle(ctx.source.server);
                        
                        ctx.source.level.players.forEach(p => {
                            p.tell('§a[Arène] §7Téléportation en cercle ! §e' + count + ' joueurs');
                            p.level.playSound(null, p.blockPosition(), 
                                'minecraft:entity.enderman.teleport', 'players', 1.0, 1.0);
                        });
                        
                        return 1;
                    })
                )
                .then(Commands.literal('info')
                    .executes(ctx => {
                        if (!arenaCenter.set) {
                            ctx.source.player.tell('§c[Arène] §7Aucune arène définie !');
                            return 0;
                        }
                        ctx.source.player.tell('§6§l=== ARÈNE ===');
                        ctx.source.player.tell('§7Centre : §e' + arenaCenter.x + ' ' + arenaCenter.y + ' ' + arenaCenter.z);
                        ctx.source.player.tell('§7Rayon : §e' + arenaCenter.radius + ' blocs');
                        return 1;
                    })
                )
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
                                         'ancien', 'idiot'];
                            roles.forEach(r => targetPlayer.removeTag(r));
                            
                            // Ajouter le nouveau rôle
                            targetPlayer.addTag(role);
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
                        const targetName = Arguments.STRING.getResult(ctx, 'joueur');
                        const titre = Arguments.GREEDY_STRING.getResult(ctx, 'titre');
                        
                        // Chercher le joueur
                        let targetPlayer = null;
                        ctx.source.level.players.forEach(p => {
                            if (p.name.string.toLowerCase() === targetName.toLowerCase()) {
                                targetPlayer = p;
                            }
                        });
                        
                        if (!targetPlayer) {
                            ctx.source.player.tell('§c[Tab] §7Joueur "' + targetName + '" non trouvé !');
                            return 0;
                        }
                        
                        // Sauvegarder le titre
                        playerTitles[targetPlayer.name.string] = titre;
                        
                        // Mettre à jour l'affichage
                        updatePlayerDisplayName(targetPlayer);
                        
                        const formattedTitle = getFormattedTitle(titre);
                        ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7changé en : ' + formattedTitle);
                        targetPlayer.tell('§a[Tab] §7Votre titre a été changé en : ' + formattedTitle);
                        
                        // Annoncer à tous
                        ctx.source.level.players.forEach(p => {
                            p.tell('§8[Tab] §f' + targetPlayer.name.string + ' §7est maintenant : ' + formattedTitle.trim());
                        });
                        
                        return 1;
                    })
                )
            )
            .then(Commands.literal('remove')
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
                            ctx.source.player.tell('§c[Tab] §7Joueur "' + targetName + '" non trouvé !');
                            return 0;
                        }
                        
                        // Supprimer le titre
                        delete playerTitles[targetPlayer.name.string];
                        
                        // Remettre à Joueur par défaut
                        updatePlayerDisplayName(targetPlayer);
                        
                        ctx.source.player.tell('§a[Tab] §7Titre de §f' + targetPlayer.name.string + ' §7retiré.');
                        return 1;
                    })
                )
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
    );
});

// Crafting spécial - Armes en argent
ServerEvents.recipes(event => {
    // Épée en argent (très efficace contre les loups-garous)
    event.shaped('minecraft:iron_sword', [
        ' I ',
        ' I ',
        ' S '
    ], {
        I: 'minecraft:iron_ingot',
        S: 'minecraft:stick'
    }).id('lameute:silver_sword');
    
    // Potion de la Sorcière - Vie
    event.shapeless('minecraft:potion', [
        'minecraft:glass_bottle',
        'minecraft:glistering_melon_slice',
        'minecraft:golden_apple'
    ]).id('lameute:potion_vie');
    
    // Potion de la Sorcière - Mort
    event.shapeless('minecraft:splash_potion', [
        'minecraft:glass_bottle',
        'minecraft:wither_rose',
        'minecraft:spider_eye'
    ]).id('lameute:potion_mort');
});

// Message de bienvenue et application du titre
PlayerEvents.loggedIn(event => {
    const player = event.player;
    
    // Le scoreboard dynamique avec le rôle sera créé automatiquement via PlayerEvents.tick
    
    // Appliquer le titre du joueur (ou Joueur par défaut)
    player.server.scheduleInTicks(20, () => {
        updatePlayerDisplayName(player);
    });
    
    player.tell('');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('§6§l           🐺 BIENVENUE DANS LA MEUTE 🐺');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('');
    player.tell('§7Bienvenue dans le village de §eThiercelieux§7.');
    player.tell('§7La nuit, les §cloups-garous §7chassent...');
    player.tell('§7Le jour, le village vote pour éliminer les suspects.');
    player.tell('');
    player.tell('§aCommandes :');
    player.tell('§7  /lameute start [loups] §8- Lancer une partie');
    player.tell('§7  /lameute timer auto §8- Timer automatique');
    player.tell('§7  /lameute timer jour [3/5/7] §8- Durée du jour');
    player.tell('');
    player.tell('§e💡 Votre rôle s\'affiche dans le scoreboard à droite !');
    player.tell('');
    player.tell('§c§l              QUE LA CHASSE COMMENCE !');
    player.tell('');
    player.tell('§8              Développé par §6§lw9n0 §8🐺');
    player.tell('§8§l═══════════════════════════════════════════════');
    player.tell('');
});

// ============================================
// 💬 SYSTÈME DE CHAT AVEC TITRES
// ============================================
PlayerEvents.chat(event => {
    const player = event.player;
    const playerName = player.name.string;
    const message = event.message;
    
    // Obtenir le titre du joueur
    const title = playerTitles[playerName] || 'Joueur';
    const formattedTitle = getFormattedTitle(title);
    
    // Annuler le message original
    event.cancel();
    
    // Envoyer le message formaté à tous les joueurs
    const formattedMessage = formattedTitle + '§f' + playerName + ' §7» §f' + message;
    
    player.server.players.forEach(p => {
        p.tell(formattedMessage);
    });
    
    // Log dans la console
    console.log('[Chat] ' + title + ' ' + playerName + ': ' + message);
});
