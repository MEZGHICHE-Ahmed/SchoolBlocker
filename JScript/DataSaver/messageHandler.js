import { saveFormData } from './formData.js';
import { fillFormInputs } from '../DataFiller/formFiller.js';

// Écouteur pour les messages du popup
export function setupMessageHandler() {
    console.log('[AutoApply] Configuration du gestionnaire de messages');
    
    // Vérifier si l'écouteur de messages est déjà défini
    if (chrome.runtime.onMessage.hasListeners()) {
        console.log('[AutoApply] Des écouteurs de messages sont déjà configurés');
    }
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('[AutoApply] Message reçu:', request);
        console.log('[AutoApply] Expéditeur:', sender);
        
        if (request.action === "saveFormData") {
            console.log('[AutoApply] Action saveFormData reçue');
            saveFormData().then(result => {
                console.log('[AutoApply] Résultat de la sauvegarde:', result);
                sendResponse(result);
            }).catch(error => {
                console.error('[AutoApply] Erreur lors de la sauvegarde:', error);
                sendResponse({ success: false, message: "Erreur: " + error.message });
            });
            return true; // Indique qu'on répondra de manière asynchrone
        }
        
        if (request.action === "fillInputs") {
            console.log('[AutoApply] Action fillInputs reçue');
            fillFormInputs().then(result => {
                console.log('[AutoApply] Résultat du remplissage:', result);
                sendResponse(result);
            }).catch(error => {
                console.error('[AutoApply] Erreur lors du remplissage:', error);
                sendResponse({ success: false, message: "Erreur: " + error.message });
            });
            return true; // Indique qu'on répondra de manière asynchrone
        }
        
        // Si aucune action correspondante n'est trouvée
        console.warn('[AutoApply] Action non reconnue:', request.action);
    });
    
    console.log('[AutoApply] Gestionnaire de messages configuré avec succès');
} 