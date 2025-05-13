export async function checkCurrentDomain() {
    console.log('[DomainChecker] Début de la vérification du domaine...');
    try {
        // Récupérer la configuration des domaines
        console.log('[DomainChecker] Chargement de la configuration des domaines...');
        const domains = await fetch(chrome.runtime.getURL('Data/domain.json'))
            .then(response => response.json());
        console.log('[DomainChecker] Domaines configurés:', Object.keys(domains));

        // Obtenir l'URL actuelle
        const currentUrl = window.location.hostname;
        console.log('[DomainChecker] URL actuelle:', currentUrl);

        // Vérifier si le domaine actuel est dans notre configuration
        for (const [domain, config] of Object.entries(domains)) {
            console.log(`[DomainChecker] Vérification du domaine: ${domain}`);
            if (currentUrl.includes(domain)) {
                console.log(`[DomainChecker] Domaine trouvé: ${domain}`);
                console.log('[DomainChecker] Configuration:', config);
                return config;
            }
        }

        console.log('[DomainChecker] Aucun domaine correspondant trouvé');
        return null;
    } catch (error) {
        console.error('[DomainChecker] Erreur lors de la vérification du domaine:', error);
        return null;
    }
} 