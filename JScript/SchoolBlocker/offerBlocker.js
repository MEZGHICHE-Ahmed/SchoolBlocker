export function blockOffers(matchingOffers, domainConfig) {
    try {
        matchingOffers.forEach((offer, index) => {
            
            // Sauvegarder la position et les dimensions originales
            const originalRect = offer.element.getBoundingClientRect();
            const originalPosition = offer.element.style.position;
            const originalZIndex = offer.element.style.zIndex;
            
            // Vider le contenu original
            offer.element.innerHTML = '';
            
            // Appliquer le style directement
            offer.element.style.backgroundColor = '#ff0000';
            offer.element.style.border = '3px solid #cc0000';
            offer.element.style.padding = '20px';
            offer.element.style.margin = '10px 0';
            offer.element.style.borderRadius = '8px';
            offer.element.style.position = 'relative';
            offer.element.style.zIndex = '9999';
            offer.element.style.width = '100%';
            offer.element.style.minHeight = '100px';
            offer.element.style.display = 'flex';
            offer.element.style.flexDirection = 'column';
            offer.element.style.justifyContent = 'center';
            offer.element.style.alignItems = 'center';
            offer.element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            // Créer le contenu du blocage
            const warningContainer = document.createElement('div');
            warningContainer.style.textAlign = 'center';
            warningContainer.style.color = '#ffffff';
            
            // Ajouter l'icône d'avertissement
            const warningIcon = document.createElement('div');
            warningIcon.style.fontSize = '32px';
            warningIcon.style.marginBottom = '10px';
            warningIcon.textContent = '⚠️';
            
            // Ajouter le titre
            const title = document.createElement('h3');
            title.style.margin = '0 0 10px 0';
            title.style.fontSize = '20px';
            title.style.fontWeight = 'bold';
            title.textContent = 'OFFRE BLOQUÉE';
            
            // Ajouter le message
            const message = document.createElement('p');
            message.style.margin = '0';
            message.style.fontSize = '16px';
            message.textContent = 'Cette offre provient d\'une École Privée';
            
            // Assembler le contenu
            warningContainer.appendChild(warningIcon);
            warningContainer.appendChild(title);
            warningContainer.appendChild(message);
            offer.element.appendChild(warningContainer);
            
            // Désactiver les interactions
            offer.element.style.pointerEvents = 'none';
            offer.element.style.opacity = '1';
            
        });
        
    } catch (error) {
        console.error('[OfferBlocker] Erreur lors du blocage des offres:', error);
    }
} 