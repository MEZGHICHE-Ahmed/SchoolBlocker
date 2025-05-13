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
        console.log('[SchoolBlocker] Blocage désactivé, arrêt de l\'application');
        return;
    }

    console.log('[SchoolBlocker] Application du blocage...');
    try {
        // Trouver les offres correspondant aux écoles
        console.log('[SchoolBlocker] Recherche des offres correspondantes...');
        const matchingOffers = await matchSchools(domainConfig, schools);
        console.log('[SchoolBlocker] Offres correspondantes trouvées:', matchingOffers.length);

        // Bloquer les offres correspondantes
        if (matchingOffers.length > 0) {
            console.log('[SchoolBlocker] Début du blocage des offres...');
            blockOffers(matchingOffers, domainConfig);
        } else {
            console.log('[SchoolBlocker] Aucune offre à bloquer');
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
        console.log('[SchoolBlocker] Arrêt de l\'observateur existant');
        observer.disconnect();
        observer = null;
    }

    if (!isSchoolBlockerEnabled) {
        console.log('[SchoolBlocker] Blocage désactivé, pas d\'observateur configuré');
        return;
    }

    console.log('[SchoolBlocker] Configuration de l\'observateur de mutations...');
    
    // Créer l'observateur
    observer = new MutationObserver((mutations) => {
        if (!isSchoolBlockerEnabled) {
            console.log('[SchoolBlocker] Blocage désactivé, arrêt de l\'observateur');
            observer.disconnect();
            observer = null;
            return;
        }

        console.log('[SchoolBlocker] Changements détectés dans le DOM');
        
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
            console.log('[SchoolBlocker] Changements pertinents détectés, réapplication du blocage...');
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
    console.log('[SchoolBlocker] Observateur de mutations configuré et actif');
}

async function startSchoolBlocker() {
    console.log('[SchoolBlocker] Démarrage du blocage des écoles...');
    isSchoolBlockerEnabled = true;
    
    try {
        // Vérifier si le domaine actuel est dans notre liste
        console.log('[SchoolBlocker] Vérification du domaine actuel...');
        domainConfig = await checkCurrentDomain();
        if (!domainConfig) {
            console.log('[SchoolBlocker] Domaine non supporté, arrêt du processus');
            isSchoolBlockerEnabled = false;
            return;
        }
        console.log('[SchoolBlocker] Configuration du domaine trouvée:', domainConfig);

        // Récupérer la liste des écoles à bloquer
        console.log('[SchoolBlocker] Chargement de la liste des écoles...');
        schools = await fetch(chrome.runtime.getURL('Data/schools.json'))
            .then(response => response.json());
        console.log('[SchoolBlocker] Nombre d\'écoles à bloquer:', schools.length);

        // Appliquer le blocage initial
        await applyBlocker();

        // Configurer l'observateur pour les changements futurs
        setupObserver();
    } catch (error) {
        console.error('[SchoolBlocker] Erreur critique lors de l\'initialisation:', error);
        isSchoolBlockerEnabled = false;
    }
}

function stopSchoolBlocker() {
    console.log('[SchoolBlocker] Arrêt du blocage des écoles...');
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