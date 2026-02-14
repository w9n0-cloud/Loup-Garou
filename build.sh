#!/bin/bash
# ════════════════════════════════════════════════════════════
# 🐺 LA MEUTE - Script de Build
# ════════════════════════════════════════════════════════════
# Crée les archives client et serveur du modpack
# Usage: ./build.sh [client|server|all]
# ════════════════════════════════════════════════════════════

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION=$(grep "VERSION:" VERSION.txt | awk '{print $2}')
DATE=$(date +%Y-%m-%d)
CLIENT_NAME="LaMeute-Client-${VERSION}.zip"
SERVER_NAME="LaMeute-Server-${VERSION}.zip"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🐺 LA MEUTE - Build Script v${VERSION}${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# Fonction pour créer le ZIP client
build_client() {
    echo -e "${YELLOW}📦 Construction du client...${NC}"

    # Créer un dossier temporaire
    rm -rf build/client
    mkdir -p build/client

    # Copier les fichiers nécessaires
    echo "  ├─ Copie de manifest.json..."
    cp manifest.json build/client/

    echo "  ├─ Copie de modrinth.index.json..."
    cp modrinth.index.json build/client/

    echo "  ├─ Copie du dossier overrides/..."
    cp -r overrides build/client/

    # Créer l'archive
    echo "  ├─ Création de l'archive ZIP..."
    cd build/client
    zip -r "../../${CLIENT_NAME}" * > /dev/null
    cd ../..

    # Nettoyage
    echo "  └─ Nettoyage..."
    rm -rf build/client

    echo -e "${GREEN}✅ Client construit : ${CLIENT_NAME}${NC}"
    echo ""
}

# Fonction pour créer le ZIP serveur
build_server() {
    echo -e "${YELLOW}🖥️  Construction du serveur...${NC}"

    # Créer un dossier temporaire
    rm -rf build/server
    mkdir -p build/server

    # Copier les fichiers serveur
    echo "  ├─ Copie des fichiers serveur..."
    cp -r server/* build/server/ 2>/dev/null || true

    # Copier les overrides nécessaires
    echo "  ├─ Copie de kubejs..."
    mkdir -p build/server/kubejs
    cp -r overrides/kubejs/server_scripts build/server/kubejs/
    cp -r overrides/kubejs/startup_scripts build/server/kubejs/ 2>/dev/null || true

    echo "  ├─ Copie des configs..."
    mkdir -p build/server/config
    cp -r overrides/config/* build/server/config/

    echo "  ├─ Copie des mods..."
    mkdir -p build/server/mods
    cp overrides/mods/*.jar build/server/mods/ 2>/dev/null || true

    # Créer README serveur
    echo "  ├─ Création du README..."
    cat > build/server/README.md << 'EOF'
# 🐺 LA MEUTE - Serveur

## Installation

1. Installez Forge 47.2.0 pour Minecraft 1.20.1
2. Copiez tous les fichiers dans le dossier du serveur
3. Acceptez l'EULA (éditez eula.txt)
4. Lancez avec start.sh (Linux/Mac) ou start.bat (Windows)

## Configuration

- Éditez server.properties pour la configuration
- RAM recommandée : 4-8 GB
- Ports : 25565 (TCP)

## Support

Voir le CHANGELOG.md principal pour les updates.
EOF

    # Créer l'archive
    echo "  ├─ Création de l'archive ZIP..."
    cd build/server
    zip -r "../../${SERVER_NAME}" * > /dev/null
    cd ../..

    # Nettoyage
    echo "  └─ Nettoyage..."
    rm -rf build/server

    echo -e "${GREEN}✅ Serveur construit : ${SERVER_NAME}${NC}"
    echo ""
}

# Menu principal
case "${1:-all}" in
    client)
        build_client
        ;;
    server)
        build_server
        ;;
    all)
        build_client
        build_server
        ;;
    *)
        echo -e "${RED}❌ Usage: $0 [client|server|all]${NC}"
        exit 1
        ;;
esac

# Afficher les résultats
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Build terminé !${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
echo "📦 Fichiers créés :"
ls -lh *.zip 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo -e "${YELLOW}💡 Prochaines étapes :${NC}"
echo "  1. Testez les archives"
echo "  2. Upload sur CurseForge/Modrinth"
echo "  3. Mettez à jour le CHANGELOG.md"
echo "  4. Créez un tag git: git tag v${VERSION}"
echo ""
echo -e "${BLUE}🐺 Que la chasse commence ! 🌕${NC}"
