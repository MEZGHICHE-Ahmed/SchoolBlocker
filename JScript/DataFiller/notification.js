/**
 * Module de gestion des notifications pour AutoApply
 * Ce module fournit des fonctions pour afficher des notifications visuelles
 * dans la page web pendant le processus de remplissage automatique.
 */

/**
 * Crée et affiche une notification dans la page web
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification ('loading', 'success', 'error')
 * @param {number} duration - Durée d'affichage en ms (0 pour permanent)
 * @return {HTMLElement} - L'élément de notification créé
 */
export function showPageNotification(message, type = 'loading', duration = 0) {
    // Supprimer toute notification existante avec la même classe
    removePageNotifications(type);
    
    // Créer le conteneur de notification s'il n'existe pas
    let notifContainer = document.getElementById('autoapply-notifications');
    if (!notifContainer) {
        notifContainer = document.createElement('div');
        notifContainer.id = 'autoapply-notifications';
        notifContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(notifContainer);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `autoapply-notification autoapply-${type}`;
    notification.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: autoapply-fadein 0.3s;
        transition: all 0.3s ease;
        background-color: ${
            type === 'loading' ? '#3498db' :
            type === 'success' ? '#2ecc71' :
            type === 'error' ? '#e74c3c' : '#333'
        };
        color: white;
    `;
    
    // Ajouter une icône selon le type
    let icon = '';
    if (type === 'loading') {
        icon = '<div class="autoapply-spinner"></div>';
    } else if (type === 'success') {
        icon = '✓';
    } else if (type === 'error') {
        icon = '✗';
    }
    
    // Ajouter un style pour l'animation de spinner si c'est un loading
    if (type === 'loading') {
        const styleId = 'autoapply-spinner-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes autoapply-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes autoapply-fadein {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .autoapply-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: autoapply-spin 1s linear infinite;
                    margin-right: 10px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Construire le contenu
    notification.innerHTML = `
        ${icon ? `<span style="margin-right: 10px;">${icon}</span>` : ''}
        <span>${message}</span>
    `;
    
    // Ajouter un bouton de fermeture
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        margin-left: 10px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
    `;
    closeBtn.onclick = () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 300);
    };
    notification.appendChild(closeBtn);
    
    // Ajouter la notification au conteneur
    notifContainer.appendChild(notification);
    
    // Auto-fermeture après la durée spécifiée
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-10px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    return notification;
}

/**
 * Supprime toutes les notifications d'un type spécifique
 * @param {string} type - Le type de notification à supprimer ('loading', 'success', 'error', ou null pour toutes)
 */
export function removePageNotifications(type = null) {
    const container = document.getElementById('autoapply-notifications');
    if (container) {
        if (type) {
            const notifications = container.querySelectorAll(`.autoapply-${type}`);
            notifications.forEach(notif => notif.remove());
        } else {
            container.innerHTML = '';
        }
    }
}

/**
 * Affiche une notification de chargement pendant l'analyse de l'IA
 * @return {HTMLElement} - L'élément de notification créé
 */
export function showAiAnalysisNotification() {
    return showPageNotification("Analyse du formulaire en cours par l'IA...", 'loading');
}

/**
 * Affiche une notification de chargement pendant le remplissage des champs
 * @return {HTMLElement} - L'élément de notification créé
 */
export function showFillingNotification() {
    return showPageNotification("Remplissage des champs en cours...", 'loading');
}

/**
 * Affiche une notification de succès avec le nombre de champs remplis
 * @param {number} filledCount - Nombre de champs remplis
 * @param {number} errorsCount - Nombre d'erreurs rencontrées
 */
export function showSuccessNotification(filledCount, errorsCount = 0) {
    const message = `${filledCount} champs remplis avec succès${errorsCount > 0 ? ` (${errorsCount} erreurs)` : ''}`;
    return showPageNotification(message, 'success', 5000);
}

/**
 * Affiche une notification pour le mode alternatif de remplissage
 * @return {HTMLElement} - L'élément de notification créé
 */
export function showAlternativeFillingNotification() {
    return showPageNotification("Méthode alternative de remplissage en cours...", 'loading');
}

/**
 * Affiche une notification de résultat pour le mode alternatif
 * @param {number} filledCount - Nombre de champs remplis
 */
export function showAlternativeResultNotification(filledCount) {
    if (filledCount > 0) {
        return showPageNotification(`${filledCount} champs remplis en mode alternatif`, 'success', 5000);
    } else {
        return showPageNotification("Aucun champ n'a pu être rempli automatiquement", 'error', 5000);
    }
}

/**
 * Affiche une notification d'erreur
 * @param {string} message - Message d'erreur
 */
export function showErrorNotification(message) {
    return showPageNotification(`Erreur: ${message}`, 'error', 8000);
} 