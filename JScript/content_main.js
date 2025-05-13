import { setupFormSubmissionObserver } from './DataSaver/observers.js';
import { setupMessageHandler } from './DataSaver/messageHandler.js';

export function main() {
    console.log('[AutoApply] Content main chargé');
    
    try {
        console.log('[AutoApply] Configuration de l\'observateur de formulaires...');
        setupFormSubmissionObserver();
        console.log('[AutoApply] Observateur de formulaires configuré avec succès');
        
        console.log('[AutoApply] Configuration du gestionnaire de messages...');
        setupMessageHandler();
        console.log('[AutoApply] Gestionnaire de messages configuré avec succès');
        
        // Vérifier que tout est bien configuré
        console.log('[AutoApply] Vérification de la configuration:');
        console.log('[AutoApply] - chrome.runtime disponible:', !!chrome.runtime);
        console.log('[AutoApply] - chrome.runtime.onMessage disponible:', !!chrome.runtime.onMessage);
        
        // Indiquer que l'initialisation est terminée
        console.log('[AutoApply] Initialisation terminée avec succès');
    } catch (error) {
        console.error('[AutoApply] Erreur lors de l\'initialisation:', error);
    }
} 