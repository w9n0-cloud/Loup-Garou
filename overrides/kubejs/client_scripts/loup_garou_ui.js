// 🐺 LA MEUTE - Scripts Client KubeJS
// ====================================

// Affichage de la phase lunaire
ClientEvents.tick(event => {
    // Ce script peut être étendu pour afficher la phase de lune
    // et d'autres éléments d'interface thématiques
});

// Tooltip personnalisé pour les objets du modpack
ItemEvents.tooltip(event => {
    // Épée en fer = Épée en argent dans notre contexte
    event.add('minecraft:iron_sword', [
        '',
        '§7§o"L\'argent est la seule faiblesse des loups..."',
        '§c⚔ Dégâts bonus contre les Loups-Garous'
    ]);
    
    // Lait = Antidote
    event.add('minecraft:milk_bucket', [
        '',
        '§a☤ Peut soigner une morsure de loup-garou',
        '§7§oBuvez avant la première pleine lune...'
    ]);
    
    // Pomme dorée = Potion de vie de la sorcière
    event.add('minecraft:golden_apple', [
        '',
        '§d✦ Potion de Vie de la Sorcière',
        '§7§oRessuscite un joueur éliminé cette nuit'
    ]);
    
    // Rose des ténèbres = Poison de la sorcière
    event.add('minecraft:wither_rose', [
        '',
        '§4☠ Poison de la Sorcière',
        '§7§oÉlimine silencieusement une cible'
    ]);
    
    // Œil d'araignée = Œil de la voyante
    event.add('minecraft:spider_eye', [
        '',
        '§b👁 Œil de la Voyante',
        '§7§oRévèle le véritable rôle d\'un joueur'
    ]);
    
    // Plume = Flèche du chasseur
    event.add('minecraft:arrow', [
        '',
        '§6🏹 Flèche du Chasseur',
        '§7§oEmportez quelqu\'un dans la tombe...'
    ]);
});
