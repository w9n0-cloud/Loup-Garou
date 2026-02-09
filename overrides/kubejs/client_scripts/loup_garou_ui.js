// 🐺 LA MEUTE - Client Scripts
// Développé par w9n0

ClientEvents.tick(event => {
});

ItemEvents.tooltip(event => {
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

    // Livre = Ancien
    event.add('minecraft:book', [
        '',
        '§2👴 Savoir de l\'Ancien',
        '§7§oVotre expérience vous protège...'
    ]);

    // Plume = Idiot / Corbeau
    event.add('minecraft:feather', [
        '',
        '§e🤡 Folie de l\'Idiot §8| §8🐦 Plume du Corbeau',
        '§7§oAccusez ou faites le fou !'
    ]);

    // Os avec poudre = Loup Blanc
    event.add('minecraft:bone_meal', [
        '',
        '§f🐺 Marque du Loup Blanc',
        '§7§oTuez un loup une nuit sur deux...'
    ]);

    // Teinture blanche = Ange
    event.add('minecraft:white_dye', [
        '',
        '§b😇 Ailes de l\'Ange',
        '§7§oFaites-vous éliminer au premier vote !'
    ]);

    // Bâton = Flûte
    event.add('minecraft:stick', [
        '',
        '§d🎵 Flûte Enchanteresse',
        '§7§oCharmez 2 joueurs par nuit...'
    ]);

    // Carotte = Renard
    event.add('minecraft:carrot', [
        '',
        '§6🦊 Flair du Renard',
        '§7§oFlairez si un loup est parmi 3 joueurs'
    ]);

    // Blé = Bouc Émissaire
    event.add('minecraft:wheat', [
        '',
        '§c🐐 Malédiction du Bouc',
        '§7§oEn cas d\'égalité, vous mourrez...'
    ]);

    // Patate empoisonnée = Loup Alpha
    event.add('minecraft:poisonous_potato', [
        '',
        '§4🐺 Infection du Loup Alpha',
        '§7§oTransformez un villageois en Infecté'
    ]);

    // Œil d'araignée fermenté = Infecté
    event.add('minecraft:fermented_spider_eye', [
        '',
        '§5🦠 Secret de l\'Infecté',
        '§7§oVous semblez villageois mais...'
    ]);

    // Sac d'encre = Sorcière Noire
    event.add('minecraft:ink_sac', [
        '',
        '§0🖤 Malédiction de la Sorcière Noire',
        '§7§oLe prochain votant mourra...'
    ]);

    // Épée = Chevalier
    event.add('minecraft:iron_sword', [
        '',
        '§9⚔ Épée du Chevalier',
        '§7§oSi un loup vous tue, il meurt aussi !'
    ]);
});
