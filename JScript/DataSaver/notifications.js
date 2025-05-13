// Fonction pour afficher une notification dans la page
export function showPageNotification(message, isSuccess = true) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `auto-fill-notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    
    // Ajouter des styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '9999';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.fontSize = '14px';
    notification.style.transition = 'opacity 0.5s ease-in-out';
    notification.style.opacity = '1';
    
    // Styles spécifiques selon le type de notification
    if (isSuccess) {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
    }
    
    // Ajouter à la page
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
} 