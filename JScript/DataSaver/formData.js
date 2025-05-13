import { showPageNotification } from './notifications.js';

// Fonction pour récupérer les données du formulaire depuis les divs JSON
export function getFormData() {
    console.log('[AutoApply] Recherche des données du formulaire...');
    
    // Méthode 1 - Accès direct à la div
    const jsonElement = document.getElementById('formulaire-data-json');
    if (jsonElement && jsonElement.textContent) {
        console.log('[AutoApply] Div formulaire-data-json trouvée');
        try {
            const data = JSON.parse(jsonElement.textContent);
            console.log('[AutoApply] Données JSON parsées avec succès:', data);
            return data;
        } catch (error) {
            console.error('[AutoApply] Erreur lors du parsing des données du formulaire:', error);
        }
    } else {
        console.log('[AutoApply] Div formulaire-data-json non trouvée ou vide');
    }
    
    // Méthode 2 - Alternative via la div globale
    const globalElement = document.getElementById('global-formulaire-data');
    if (globalElement && globalElement.getAttribute('data-has-content') === 'true') {
        console.log('[AutoApply] Div global-formulaire-data trouvée avec contenu');
        try {
            const data = JSON.parse(globalElement.textContent);
            console.log('[AutoApply] Données JSON globales parsées avec succès:', data);
            return data;
        } catch (error) {
            console.error('[AutoApply] Erreur lors du parsing des données du formulaire global:', error);
        }
    } else {
        console.log('[AutoApply] Div global-formulaire-data non trouvée ou sans contenu');
    }
    
    console.log('[AutoApply] Aucune donnée JSON trouvée');
    return null;
}

// Fonction pour sauvegarder les données du formulaire
export async function saveFormData() {
    console.log('[AutoApply] Début de la sauvegarde des données du formulaire');
    const formData = getFormData();
    
    if (!formData) {
        console.log('[AutoApply] Aucune donnée à sauvegarder');
        showPageNotification("Aucune donnée de formulaire trouvée", false);
        return { success: false, message: "Aucune donnée de formulaire trouvée" };
    }
    
    try {
        // Ajouter la date de sauvegarde
        const savedData = {
            ...formData,
            dateSauvegarde: new Date().toISOString(),
            url: window.location.href
        };
        
        console.log('[AutoApply] Données à sauvegarder:', savedData);
        
        // Sauvegarder dans chrome.storage
        await chrome.storage.local.set({
            formData: savedData
        });
        
        console.log('[AutoApply] Données sauvegardées avec succès dans chrome.storage');
        
        // Vérifier que les données ont bien été sauvegardées
        chrome.storage.local.get(['formData'], function(result) {
            if (result.formData) {
                console.log('[AutoApply] Vérification des données sauvegardées:', result.formData);
            } else {
                console.error('[AutoApply] Erreur: Les données n\'ont pas été sauvegardées correctement');
            }
        });
        
        showPageNotification("Données du formulaire sauvegardées avec succès!", true);
        return { 
            success: true, 
            message: "Données du formulaire sauvegardées avec succès!",
            data: savedData
        };
    } catch (error) {
        console.error('[AutoApply] Erreur lors de la sauvegarde des données:', error);
        showPageNotification("Erreur lors de la sauvegarde des données", false);
        return { 
            success: false, 
            message: "Erreur lors de la sauvegarde des données",
            error: error.message
        };
    }
} 