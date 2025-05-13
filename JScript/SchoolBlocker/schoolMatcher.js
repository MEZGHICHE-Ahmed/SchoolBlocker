export async function matchSchools(domainConfig, schools) {
    console.log('[SchoolMatcher] Début de la recherche des correspondances...');
    try {
        const matchingOffers = [];
        
        // Récupérer tous les éléments de nom selon le sélecteur du domaine
        console.log('[SchoolMatcher] Recherche des éléments avec le sélecteur:', domainConfig.namediv);
        const nameElements = document.querySelectorAll(domainConfig.namediv);
        console.log('[SchoolMatcher] Nombre d\'éléments trouvés:', nameElements.length);
        
        // Pour chaque élément de nom
        nameElements.forEach((nameElement, index) => {
            const name = nameElement.textContent.trim().toLowerCase();
            console.log(`[SchoolMatcher] Analyse de l'élément ${index + 1}:`, name);
            
            // Vérifier si le nom correspond à une école à bloquer
            const isBlocked = schools.some(school => {
                const schoolName = school.toLowerCase();
                const matches = schoolName.includes(name);
                if (matches) {
                    console.log(`[SchoolMatcher] Correspondance trouvée: "${name}" est contenu dans "${school}"`);
                }
                return matches;
            });
            
            if (isBlocked) {
                console.log(`[SchoolMatcher] Élément ${index + 1} correspond à une école à bloquer`);
                // Trouver l'élément parent correspondant à l'offre
                const offerElement = nameElement.closest(domainConfig.offerdiv);
                if (offerElement) {
                    console.log(`[SchoolMatcher] Élément parent trouvé pour l'offre ${index + 1}`);
                    matchingOffers.push({
                        name: name,
                        element: offerElement
                    });
                } else {
                    console.log(`[SchoolMatcher] Aucun élément parent trouvé pour l'offre ${index + 1}`);
                }
            }
        });
        
        console.log(`[SchoolMatcher] Recherche terminée. ${matchingOffers.length} offres correspondantes trouvées`);
        return matchingOffers;
    } catch (error) {
        console.error('[SchoolMatcher] Erreur lors de la recherche des correspondances:', error);
        return [];
    }
} 