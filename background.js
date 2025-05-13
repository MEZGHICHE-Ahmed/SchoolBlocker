// Écouteur pour les raccourcis clavier
chrome.commands.onCommand.addListener(async (command) => {
  // Récupérer l'onglet actif
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;
  
  switch (command) {
    case "save-inputs":
      // Envoyer un message au content script pour sauvegarder les inputs
      chrome.tabs.sendMessage(tab.id, { action: "saveInputs" }, (response) => {
        if (response && response.success) {
          // Afficher une notification
          chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon-128.png",
            title: "Form Auto-Fill",
            message: `${response.savedCount} champs sauvegardés avec succès!`
          });
        }
      });
      break;
      
    case "fill-inputs":
      // Envoyer un message au content script pour remplir les inputs
      chrome.tabs.sendMessage(tab.id, { action: "fillInputs" }, (response) => {
        if (response && response.success) {
          // Afficher une notification
          let message = `${response.filledCount} champs remplis`;
          if (response.errors && response.errors.length > 0) {
            message += ` (${response.errors.length} erreurs)`;
          }
          
          chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon-128.png",
            title: "Form Auto-Fill",
            message: message
          });
        }
      });
      break;
  }
});
