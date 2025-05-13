/**
 * Récupère les données sauvegardées de l'utilisateur depuis le stockage local de Chrome
 * @returns {Promise<Object>} Les données sauvegardées ou null si aucune donnée n'est trouvée
 */
export async function getSavedUserData() {
    try {
        console.log('[AutoApply] Récupération des données sauvegardées...');
        const result = await chrome.storage.local.get(['formData']);
        
        if (result.formData) {
            console.log('[AutoApply] Données sauvegardées trouvées:', result.formData);
            return result.formData;
        } else {
            console.log('[AutoApply] Aucune donnée sauvegardée trouvée');
            return null;
        }
    } catch (error) {
        console.error('[AutoApply] Erreur lors de la récupération des données:', error);
        return null;
    }
}

/**
 * Récupère les clés des données utilisateur
 * @returns {Promise<string[]>} Les clés des données utilisateur
 */
export async function getUserKeys() {
    try {
        console.log('[AutoApply] Récupération des clés utilisateur...');
        const userData = await getSavedUserData();
        
        if (!userData) {
            console.log('[AutoApply] Aucune donnée utilisateur trouvée pour récupérer les clés');
            return [];
        }
        
        const keys = Object.keys(userData);
        console.log('[AutoApply] Clés utilisateur récupérées:', keys);
        return keys;
    } catch (error) {
        console.error('[AutoApply] Erreur lors de la récupération des clés:', error);
        return [];
    }
}

/**
 * Récupère les éléments de formulaire intéressants de la page
 * @returns {string} Le HTML des éléments de formulaire intéressants
 */
export function getCurrentPageHTML() {
    try {
        // Créer un conteneur temporaire
        const container = document.createElement('div');
        
        // Sélectionner tous les formulaires
        const forms = document.querySelectorAll('form');
        
        if (forms.length > 0) {
            // Cloner chaque formulaire dans le conteneur
            forms.forEach((form) => {
                const clonedForm = form.cloneNode(true);
                // Supprimer tous les scripts à l'intérieur du formulaire
                const scripts = clonedForm.querySelectorAll('script');
                scripts.forEach(script => script.remove());
                container.appendChild(clonedForm);
            });
        } else {
            // Si aucun formulaire n'est trouvé, récupérer tous les éléments de formulaire
            const formElements = document.querySelectorAll('input, select, textarea, button[type="submit"]');
            
            if (formElements.length > 0) {
                // Récupérer les parents des éléments (pour obtenir les labels et la structure)
                const parents = new Set();
                formElements.forEach(el => {
                    // Remonter jusqu'à 3 niveaux pour capturer la structure
                    let parent = el.parentElement;
                    for (let i = 0; i < 3 && parent; i++) {
                        parents.add(parent);
                        parent = parent.parentElement;
                    }
                });
                
                // Ajouter les parents au conteneur
                parents.forEach(parent => {
                    const clonedParent = parent.cloneNode(true);
                    // Supprimer tous les scripts
                    const scripts = clonedParent.querySelectorAll('script');
                    scripts.forEach(script => script.remove());
                    container.appendChild(clonedParent);
                });
            } else {
                // Récupérer les sections et les divs qui pourraient contenir des formulaires
                const containers = document.querySelectorAll('section, div.form, div.container, div.content');
                containers.forEach(el => {
                    const clonedContainer = el.cloneNode(true);
                    // Supprimer tous les scripts
                    const scripts = clonedContainer.querySelectorAll('script');
                    scripts.forEach(script => script.remove());
                    container.appendChild(clonedContainer);
                });
            }
        }
        
        const html = container.innerHTML;
        
        // Si le conteneur est vide, revenir à l'approche originale
        if (!html.trim()) {
            // Créer un clone du body pour supprimer les scripts
            const bodyClone = document.body.cloneNode(true);
            const scripts = bodyClone.querySelectorAll('script');
            scripts.forEach(script => script.remove());
            
            return bodyClone.innerHTML;
        }
        
        return html;
    } catch (error) {
        // En cas d'erreur, retourner le body sans les scripts
        const bodyClone = document.body.cloneNode(true);
        const scripts = bodyClone.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        return bodyClone.innerHTML;
    }
}