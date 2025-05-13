import { askMistral } from "../AI Agent/agent.js";
import { getSavedUserData, getCurrentPageHTML, getUserKeys } from "../DataSaver/dataRetriever.js";
import { 
    showAiAnalysisNotification, 
    showFillingNotification, 
    showSuccessNotification, 
    showAlternativeFillingNotification, 
    showAlternativeResultNotification, 
    showErrorNotification, 
    removePageNotifications 
} from "./notification.js";

/**
 * Vérifie si une chaîne est une date et la formate correctement selon le type de champ
 * @param {string} value - La valeur à vérifier
 * @param {HTMLElement} element - L'élément de formulaire
 * @return {string} - La valeur formatée
 */
function formatValueIfDate(value, element) {
    // Ignore les valeurs vides ou non définies
    if (!value || value === " ") return value;
    
    // Regex pour détecter les formats de date courants (YYYY-MM-DD, DD/MM/YYYY, etc.)
    const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{4}\/\d{2}\/\d{2})(?:T|\s|$)/;
    
    // Vérifier si la valeur ressemble à une date
    if (dateRegex.test(value)) {
        try {
            const date = new Date(value);
            
            // Vérifier si la date est valide (pas NaN)
            if (!isNaN(date.getTime())) {
                // Adapter le format selon le type d'input
                if (element.type === 'date') {
                    // Format YYYY-MM-DD pour les champs date
                    return date.toISOString().split('T')[0];
                } else if (element.type === 'datetime-local') {
                    // Format YYYY-MM-DDThh:mm pour les champs datetime-local
                    return date.toISOString().slice(0, 16);
                } else if (element.type === 'month') {
                    // Format YYYY-MM pour les champs month
                    return date.toISOString().slice(0, 7);
                }
            }
        } catch (e) {
            console.warn('[AutoApply] Erreur lors du formatage de la date:', e);
        }
    }
    
    // Retourner la valeur originale si ce n'est pas une date ou si le format n'est pas reconnu
    return value;
}

export async function fillFormInputs() {
    try {
        console.log('[AutoApply] Début du remplissage des formulaires');
        const html = getCurrentPageHTML();
        const keys = await getUserKeys();
        const userData = await getSavedUserData();
        
        let filledCount = 0;
        let errors = [];

        // Afficher une notification d'attente pendant l'analyse de l'IA
        showAiAnalysisNotification();

        try {
            const aiResponse = await askMistral(keys, html);
            console.log('[AutoApply] Réponse de l\'IA:', aiResponse);
            
            // Supprimer la notification de chargement
            removePageNotifications('loading');

            if (aiResponse && aiResponse.success && aiResponse.fields) {
                // Afficher une notification pour le début du remplissage
                showFillingNotification();
                
                aiResponse.fields.forEach(field => {
                    try {
                        const element = document.querySelector(field.selector);
                        if (element) {
                            // Formater la valeur si c'est une date
                            const valueToFill = formatValueIfDate(userData[field.value] || " ", element);
                            element.value = valueToFill;
                            
                            // Déclencher un événement de changement pour activer les listeners
                            const event = new Event('input', { bubbles: true });
                            element.dispatchEvent(event);
                            
                            filledCount++;
                            console.log(`[AutoApply] Champ rempli: ${field.selector} avec ${field.value} (valeur: ${valueToFill})`);
                        } else {
                            console.warn(`[AutoApply] Élément non trouvé: ${field.selector}`);
                            errors.push(`Élément non trouvé: ${field.selector}`);
                        }
                    } catch (fieldError) {
                        console.error(`[AutoApply] Erreur lors du remplissage du champ ${field.selector}:`, fieldError);
                        errors.push(`Erreur sur ${field.selector}: ${fieldError.message}`);
                    }
                });
                
                // Supprimer les notifications de chargement
                removePageNotifications('loading');
                
                // Afficher une notification de succès avec le nombre de champs remplis
                showSuccessNotification(filledCount, errors.length);
            } else {
                // Fallback: essayons de remplir les champs en utilisant les noms/ids
                console.log('[AutoApply] Utilisation de la méthode fallback pour remplir les champs');
                showAlternativeFillingNotification();
                
                const inputFields = document.querySelectorAll('input, textarea, select');
                inputFields.forEach(field => {
                    const fieldName = field.name || field.id;
                    if (fieldName && userData[fieldName]) {
                        // Formater la valeur si c'est une date
                        const valueToFill = formatValueIfDate(userData[fieldName], field);
                        field.value = valueToFill;
                        
                        // Déclencher un événement de changement
                        const event = new Event('input', { bubbles: true });
                        field.dispatchEvent(event);
                        
                        filledCount++;
                        console.log(`[AutoApply] Champ rempli (fallback): ${fieldName} (valeur: ${valueToFill})`);
                    }
                });
                
                // Supprimer les notifications de chargement
                removePageNotifications('loading');
                
                // Afficher une notification de résultat
                showAlternativeResultNotification(filledCount);
            }
            
        } catch (aiError) {
            console.error('[AutoApply] Erreur avec l\'agent IA:', aiError);
            errors.push(`Erreur IA: ${aiError.message}`);
            
            // Supprimer les notifications de chargement
            removePageNotifications('loading');
            
            // Afficher une notification d'erreur
            showErrorNotification(`Erreur lors de l'analyse du formulaire: ${aiError.message}`);
        }

        return {
            success: true,
            message: `${filledCount} champs remplis`,
            filledCount: filledCount,
            errors: errors.length > 0 ? errors : null
        };
        
    } catch (error) {
        console.error('[AutoApply] Erreur lors du remplissage des formulaires:', error);
        
        // Supprimer les notifications de chargement
        removePageNotifications('loading');
        
        // Afficher une notification d'erreur
        showErrorNotification(error.message);
        
        return {
            success: false,
            message: "Erreur lors du remplissage",
            error: error.message,
            filledCount: 0
        };
    }
}