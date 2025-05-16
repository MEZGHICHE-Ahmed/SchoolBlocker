export async function checkCurrentDomain() {
    try {
        // Récupérer la configuration des domaines
        const domains = await fetch(chrome.runtime.getURL('Data/domain.json'))
            .then(response => response.json());

        // Obtenir l'URL actuelle
        const currentUrl = window.location.hostname;

        // Vérifier si le domaine actuel est dans notre configuration
        for (const [domain, config] of Object.entries(domains)) {
            if (currentUrl.includes(domain)) {
                return config;
            }
        }

        return null;
    } catch (error) {
        console.error('[DomainChecker] Erreur lors de la vérification du domaine:', error);
        return null;
    }
} 