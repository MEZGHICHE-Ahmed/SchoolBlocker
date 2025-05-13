import { saveFormData } from './formData.js';

// Observer pour détecter quand le formulaire est soumis
export function setupFormSubmissionObserver() {
    console.log('[AutoApply] Configuration de l\'observateur de soumission de formulaire');
    
    // Observer pour la div formulaire-data-json
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                (mutation.target.id === 'formulaire-data-json' || mutation.target.id === 'global-formulaire-data')) {
                
                console.log('[AutoApply] Mutation détectée sur', mutation.target.id);
                
                const isSubmitted = mutation.target.getAttribute('data-is-submitted') === 'true';
                const hasContent = mutation.target.getAttribute('data-has-content') === 'true';
                
                console.log('[AutoApply] État du formulaire - Soumis:', isSubmitted, 'Contenu:', hasContent);
                
                if (isSubmitted && hasContent) {
                    console.log('[AutoApply] Formulaire soumis, données disponibles');
                    // Optionnel: sauvegarder automatiquement
                    // saveFormData();
                }
            }
        });
    });
    
    // Observer la div formulaire-data-json
    const jsonElement = document.getElementById('formulaire-data-json');
    if (jsonElement) {
        console.log('[AutoApply] Observateur attaché à formulaire-data-json');
        observer.observe(jsonElement, { attributes: true });
    } else {
        console.log('[AutoApply] Div formulaire-data-json non trouvée pour l\'observateur');
    }
    
    // Observer la div global-formulaire-data
    const globalElement = document.getElementById('global-formulaire-data');
    if (globalElement) {
        console.log('[AutoApply] Observateur attaché à global-formulaire-data');
        observer.observe(globalElement, { attributes: true });
    } else {
        console.log('[AutoApply] Div global-formulaire-data non trouvée pour l\'observateur');
    }
} 