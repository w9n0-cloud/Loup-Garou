StartupEvents.registry('item', event => {
    event.create('lameute:carte_loup_garou')
        .displayName('§c§lCarte Loup-Garou')
        .tooltip('§7Vous êtes un §cLoup-Garou§7.')
        .tooltip('§7Chaque nuit, dévorez un villageois.')
        .tooltip('')
        .tooltip('§c🐺 ÉLIMINEZ TOUS LES VILLAGEOIS')
        .maxStackSize(1)
        .rarity('epic');
    
    event.create('lameute:carte_villageois')
        .displayName('§a§lCarte Villageois')
        .tooltip('§7Vous êtes un simple §aVillageois§7.')
        .tooltip('§7Votez le jour pour éliminer les loups.')
        .tooltip('')
        .tooltip('§a🏠 IDENTIFIEZ LES LOUPS-GAROUS')
        .maxStackSize(1)
        .rarity('common');
    
    event.create('lameute:carte_voyante')
        .displayName('§b§lCarte Voyante')
        .tooltip('§7Vous êtes la §bVoyante§7.')
        .tooltip('§7Chaque nuit, découvrez le rôle d\'un joueur.')
        .tooltip('')
        .tooltip('§b👁 GUIDEZ LE VILLAGE')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_sorciere')
        .displayName('§d§lCarte Sorcière')
        .tooltip('§7Vous êtes la §dSorcière§7.')
        .tooltip('§7Vous avez une potion de vie et une de mort.')
        .tooltip('')
        .tooltip('§d⚗ SAUVEZ OU TUEZ')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_chasseur')
        .displayName('§6§lCarte Chasseur')
        .tooltip('§7Vous êtes le §6Chasseur§7.')
        .tooltip('§7Si vous mourrez, vous emportez quelqu\'un.')
        .tooltip('')
        .tooltip('§6🏹 VENGEANCE ASSURÉE')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_cupidon')
        .displayName('§e§lCarte Cupidon')
        .tooltip('§7Vous êtes §eCupidon§7.')
        .tooltip('§7Liez deux joueurs par l\'amour.')
        .tooltip('§7S\'il l\'un meurt, l\'autre aussi.')
        .tooltip('')
        .tooltip('§e💕 CRÉEZ LE COUPLE')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_salvateur')
        .displayName('§f§lCarte Salvateur')
        .tooltip('§7Vous êtes le §fSalvateur§7.')
        .tooltip('§7Chaque nuit, protégez un joueur.')
        .tooltip('')
        .tooltip('§f🛡 PROTÉGEZ LE VILLAGE')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_petite_fille')
        .displayName('§e§lCarte Petite Fille')
        .tooltip('§7Vous êtes la §ePetite Fille§7.')
        .tooltip('§7Vous pouvez espionner les loups la nuit.')
        .tooltip('§cMais attention à ne pas vous faire repérer !')
        .tooltip('')
        .tooltip('§e👀 ESPIONNEZ LES LOUPS')
        .maxStackSize(1)
        .rarity('rare');
    
    event.create('lameute:carte_ancien')
        .displayName('§2§lCarte Ancien')
        .tooltip('§7Vous êtes l\'§2Ancien§7.')
        .tooltip('§7Vous résistez à la première attaque des loups.')
        .tooltip('')
        .tooltip('§2🛡 SURVIVANT')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:carte_idiot')
        .displayName('§e§lCarte Idiot du Village')
        .tooltip('§7Vous êtes l\'§eIdiot du Village§7.')
        .tooltip('§7Si le village vous élimine, vous survivez.')
        .tooltip('§7Mais vous perdez votre droit de vote.')
        .tooltip('')
        .tooltip('§e🤡 GRACIÉ')
        .maxStackSize(1)
        .rarity('common');

    event.create('lameute:carte_loup_blanc')
        .displayName('§f§lCarte Loup Blanc')
        .tooltip('§7Vous êtes le §fLoup Blanc§7.')
        .tooltip('§7Vous êtes un loup solitaire.')
        .tooltip('§7Une nuit sur deux, tuez aussi un loup.')
        .tooltip('')
        .tooltip('§f🐺 SEUL CONTRE TOUS')
        .maxStackSize(1)
        .rarity('epic');

    event.create('lameute:carte_ange')
        .displayName('§f§lCarte Ange')
        .tooltip('§7Vous êtes l\'§fAnge§7.')
        .tooltip('§7Faites-vous éliminer au premier vote.')
        .tooltip('§cSi vous réussissez, vous gagnez seul !')
        .tooltip('')
        .tooltip('§f👼 MARTYR')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:carte_joueur_flute')
        .displayName('§5§lCarte Joueur de Flûte')
        .tooltip('§7Vous êtes le §5Joueur de Flûte§7.')
        .tooltip('§7Chaque nuit, enchantez 2 joueurs.')
        .tooltip('§7Gagnez quand tous sont enchantés.')
        .tooltip('')
        .tooltip('§5🎵 HYPNOTISEUR')
        .maxStackSize(1)
        .rarity('epic');

    event.create('lameute:carte_corbeau')
        .displayName('§8§lCarte Corbeau')
        .tooltip('§7Vous êtes le §8Corbeau§7.')
        .tooltip('§7Chaque nuit, désignez un joueur.')
        .tooltip('§7Il aura 2 votes contre lui le lendemain.')
        .tooltip('')
        .tooltip('§8🐦 ACCUSATEUR')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:carte_renard')
        .displayName('§6§lCarte Renard')
        .tooltip('§7Vous êtes le §6Renard§7.')
        .tooltip('§7Flairez un groupe de 3 joueurs.')
        .tooltip('§7Découvrez s\'il y a un loup parmi eux.')
        .tooltip('')
        .tooltip('§6🦊 DÉTECTIVE')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:carte_bouc')
        .displayName('§7§lCarte Bouc Émissaire')
        .tooltip('§7Vous êtes le §7Bouc Émissaire§7.')
        .tooltip('§7En cas d\'égalité au vote,')
        .tooltip('§7c\'est vous qui êtes éliminé.')
        .tooltip('')
        .tooltip('§7🐐 SACRIFIÉ')
        .maxStackSize(1)
        .rarity('common');

    event.create('lameute:carte_loup_alpha')
        .displayName('§4§lCarte Loup Alpha')
        .tooltip('§7Vous êtes le §4Loup Alpha§7.')
        .tooltip('§7Chef de la meute.')
        .tooltip('§7Une fois par partie, infectez un villageois.')
        .tooltip('')
        .tooltip('§4🐺 CHEF DE MEUTE')
        .maxStackSize(1)
        .rarity('epic');

    event.create('lameute:carte_infect')
        .displayName('§4§lCarte Infecté')
        .tooltip('§7Vous êtes §4Infecté§7.')
        .tooltip('§7Vous étiez villageois...')
        .tooltip('§7Mais maintenant vous êtes un loup.')
        .tooltip('')
        .tooltip('§4🦠 CONVERTI')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:carte_sorciere_noire')
        .displayName('§5§lCarte Sorcière Noire')
        .tooltip('§7Vous êtes la §5Sorcière Noire§7.')
        .tooltip('§7Chaque nuit, maudissez un joueur.')
        .tooltip('§7Il mourra dans 2 tours.')
        .tooltip('')
        .tooltip('§5☠ MALÉDICTION')
        .maxStackSize(1)
        .rarity('epic');

    event.create('lameute:carte_chevalier')
        .displayName('§e§lCarte Chevalier')
        .tooltip('§7Vous êtes le §eChevalier§7.')
        .tooltip('§7Si les loups vous attaquent,')
        .tooltip('§7l\'un d\'eux meurt à votre place.')
        .tooltip('')
        .tooltip('§e⚔ VENGEANCE')
        .maxStackSize(1)
        .rarity('rare');

    event.create('lameute:amulette_lune')
        .displayName('§9§lAmulette de Pleine Lune')
        .tooltip('§7Une amulette mystérieuse...')
        .tooltip('§7Elle brille intensément les nuits de pleine lune.')
        .tooltip('')
        .tooltip('§9🌕 Résistance à la lycanthropie')
        .maxStackSize(1)
        .rarity('epic');
    
    event.create('lameute:croc_loup')
        .displayName('§c§lCroc de Loup-Garou')
        .tooltip('§7Un croc arraché à un loup-garou.')
        .tooltip('§7Preuve irréfutable de leur existence.')
        .tooltip('')
        .tooltip('§c🦷 Ingrédient pour antidote')
        .maxStackSize(16)
        .rarity('uncommon');
});
