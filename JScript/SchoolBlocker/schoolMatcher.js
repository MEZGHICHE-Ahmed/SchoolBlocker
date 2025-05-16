export async function matchSchools(domainConfig, schools) {
    try {
        const matchingOffers = [];
        
        // Récupérer tous les éléments de nom selon le sélecteur du domaine
        const nameElements = document.querySelectorAll(domainConfig.namediv);
        
        // Pour chaque élément de nom
        nameElements.forEach((nameElement, index) => {
            const name = nameElement.textContent.trim().toLowerCase();
            
            // Vérifier si le nom correspond à une école à bloquer
            const isBlocked = schools.some(school => {
                const schoolName = school.toLowerCase();
                const matches = schoolName.includes(name);
                if (matches) {
                }
                return matches;
            });
            
            if (isBlocked) {
                // Trouver l'élément parent correspondant à l'offre
                const offerElement = nameElement.closest(domainConfig.offerdiv);
                if (offerElement) {
                    matchingOffers.push({
                        name: name,
                        element: offerElement
                    });
                } else {
                }
            }
        });
        
        return matchingOffers;
    } catch (error) {
        console.error('[SchoolMatcher] Erreur lors de la recherche des correspondances:', error);
        return [];
    }
} 