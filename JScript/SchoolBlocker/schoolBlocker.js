import { checkCurrentDomain } from './domainChecker.js';
import { matchSchools } from './schoolMatcher.js';
import { blockOffers } from './offerBlocker.js';

let domainConfig = null;
let schools = null;
let observer = null;
let isSchoolBlockerEnabled = false;

/**
 * Applique le blocage des écoles
 */
async function applyBlocker() {
    if (!isSchoolBlockerEnabled) {
        return;
    }

    try {
        // Trouver les offres correspondant aux écoles
        const matchingOffers = await matchSchools(domainConfig, schools);

        // Bloquer les offres correspondantes
        if (matchingOffers.length > 0) {
            blockOffers(matchingOffers, domainConfig);
        } else {
        }
    } catch (error) {
        console.error('[SchoolBlocker] Erreur lors de l\'application du blocage:', error);
    }
}

/**
 * Configure l'observateur de mutations
 */
function setupObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    if (!isSchoolBlockerEnabled) {
        return;
    }

    
    // Créer l'observateur
    observer = new MutationObserver((mutations) => {
        if (!isSchoolBlockerEnabled) {
            observer.disconnect();
            observer = null;
            return;
        }

        
        // Vérifier si les changements concernent des éléments pertinents
        const shouldReapply = mutations.some(mutation => {
            // Vérifier les nœuds ajoutés
            const addedNodes = Array.from(mutation.addedNodes);
            return addedNodes.some(node => {
                // Vérifier si le nœud est un élément et s'il correspond à nos sélecteurs
                if (node.nodeType === Node.ELEMENT_NODE) {
                    return node.matches(domainConfig.namediv) || 
                           node.querySelector(domainConfig.namediv) ||
                           node.matches(domainConfig.offerdiv) ||
                           node.querySelector(domainConfig.offerdiv);
                }
                return false;
            });
        });

        if (shouldReapply) {
            applyBlocker();
        }
    });

    // Configurer l'observateur
    const config = {
        childList: true,    // Observer les ajouts/suppressions d'enfants
        subtree: true,      // Observer tout le sous-arbre
        attributes: false,  // Ne pas observer les changements d'attributs
        characterData: false // Ne pas observer les changements de texte
    };

    // Démarrer l'observation
    observer.observe(document.body, config);
}

/**
 * Démarre le School Blocker
 */
export async function startSchoolBlocker() {
    isSchoolBlockerEnabled = true;
    
    try {
        // Vérifier si le domaine actuel est dans notre liste
        domainConfig = await checkCurrentDomain();
        if (!domainConfig) {
            isSchoolBlockerEnabled = false;
            return;
        }

        // Récupérer la liste des écoles à bloquer
        schools = await fetch(chrome.runtime.getURL('Data/schools.json'))
            .then(response => response.json());

        // Appliquer le blocage initial
        await applyBlocker();

        // Configurer l'observateur pour les changements futurs
        setupObserver();
    } catch (error) {
        console.error('[SchoolBlocker] Erreur critique lors de l\'initialisation:', error);
        isSchoolBlockerEnabled = false;
    }
}

/**
 * Arrête le School Blocker
 */
export function stopSchoolBlocker() {
    isSchoolBlockerEnabled = false;
    
    // Arrêter l'observateur
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    
    // Réinitialiser les offres bloquées
    const blockedOffers = document.querySelectorAll('.blocked-school');
    blockedOffers.forEach(offer => {
        offer.classList.remove('blocked-school');
        offer.style = ''; // Réinitialiser les styles
    });
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleSchoolBlocker') {
        if (message.enabled) {
            startSchoolBlocker();
        } else {
            stopSchoolBlocker();
        }
    }
});

// Charger l'état initial au démarrage
chrome.storage.local.get(['schoolBlockerEnabled'], (result) => {
    if (result.schoolBlockerEnabled) {
        startSchoolBlocker();
    }
}); 