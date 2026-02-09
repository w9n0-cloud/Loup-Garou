// 🐺 LA MEUTE - Items personnalisés
// ==================================

// Enregistrement d'items thématiques
StartupEvents.registry('item', event => {
    // Carte de rôle - Loup-Garou
    event.create('lameute:carte_loup_garou')
        .displayName('§c§lCarte Loup-Garou')
        .tooltip('§7Vous êtes un §cLoup-Garou§7.')
        .tooltip('§7Chaque nuit, dévorez un villageois.')
        .tooltip('')
        .tooltip('§c🐺 ÉLIMINEZ TOUS LES VILLAGEOIS')
        .maxStackSize(1)
        .rarity('epic');
    
    // Carte de rôle - Villageois
    event.create('lameute:carte_villageois')
        .displayName('§a§lCarte Villageois')
        .tooltip('§7Vous êtes un simple §aVillageois§7.')
        .tooltip('§7Votez le jour pour éliminer les loups.')
        .tooltip('')
        .tooltip('§a🏠 IDENTIFIEZ LES LOUPS-GAROUS')
        .maxStackSize(1)
        .rarity('common');
    
    // Carte de rôle - Voyante
    event.create('lameute:carte_voyante')
        .displayName('§b§lCarte Voyante')
        .tooltip('§7Vous êtes la §bVoyante§7.')
        .tooltip('§7Chaque nuit, découvrez le rôle d\'un joueur.')
        .tooltip('')
        .tooltip('§b👁 GUIDEZ LE VILLAGE')
        .maxStackSize(1)
        .rarity('rare');
    
    // Carte de rôle - Sorcière
    event.create('lameute:carte_sorciere')
        .displayName('§d§lCarte Sorcière')
        .tooltip('§7Vous êtes la §dSorcière§7.')
        .tooltip('§7Vous avez une potion de vie et une de mort.')
        .tooltip('')
        .tooltip('§d⚗ SAUVEZ OU TUEZ')
        .maxStackSize(1)
        .rarity('rare');
    
    // Carte de rôle - Chasseur
    event.create('lameute:carte_chasseur')
        .displayName('§6§lCarte Chasseur')
        .tooltip('§7Vous êtes le §6Chasseur§7.')
        .tooltip('§7Si vous mourrez, vous emportez quelqu\'un.')
        .tooltip('')
        .tooltip('§6🏹 VENGEANCE ASSURÉE')
        .maxStackSize(1)
        .rarity('rare');
    
    // Carte de rôle - Cupidon
    event.create('lameute:carte_cupidon')
        .displayName('§e§lCarte Cupidon')
        .tooltip('§7Vous êtes §eCupidon§7.')
        .tooltip('§7Liez deux joueurs par l\'amour.')
        .tooltip('§7S\'il l\'un meurt, l\'autre aussi.')
        .tooltip('')
        .tooltip('§e💕 CRÉEZ LE COUPLE')
        .maxStackSize(1)
        .rarity('rare');
    
    // Carte de rôle - Salvateur
    event.create('lameute:carte_salvateur')
        .displayName('§f§lCarte Salvateur')
        .tooltip('§7Vous êtes le §fSalvateur§7.')
        .tooltip('§7Chaque nuit, protégez un joueur.')
        .tooltip('')
        .tooltip('§f🛡 PROTÉGEZ LE VILLAGE')
        .maxStackSize(1)
        .rarity('rare');
    
    // Carte de rôle - Petite Fille
    event.create('lameute:carte_petite_fille')
        .displayName('§e§lCarte Petite Fille')
        .tooltip('§7Vous êtes la §ePetite Fille§7.')
        .tooltip('§7Vous pouvez espionner les loups la nuit.')
        .tooltip('§cMais attention à ne pas vous faire repérer !')
        .tooltip('')
        .tooltip('§e👀 ESPIONNEZ LES LOUPS')
        .maxStackSize(1)
        .rarity('rare');
    
    // Amulette de pleine lune
    event.create('lameute:amulette_lune')
        .displayName('§9§lAmulette de Pleine Lune')
        .tooltip('§7Une amulette mystérieuse...')
        .tooltip('§7Elle brille intensément les nuits de pleine lune.')
        .tooltip('')
        .tooltip('§9🌕 Résistance à la lycanthropie')
        .maxStackSize(1)
        .rarity('epic');
    
    // Croc de loup-garou
    event.create('lameute:croc_loup')
        .displayName('§c§lCroc de Loup-Garou')
        .tooltip('§7Un croc arraché à un loup-garou.')
        .tooltip('§7Preuve irréfutable de leur existence.')
        .tooltip('')
        .tooltip('§c🦷 Ingrédient pour antidote')
        .maxStackSize(16)
        .rarity('uncommon');
});
