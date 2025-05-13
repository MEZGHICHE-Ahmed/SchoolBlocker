document.addEventListener('DOMContentLoaded', function() {
    console.log('[AutoApply Popup] Popup chargé');
    
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const clearButton = document.getElementById('clear');
    const saveJsonButton = document.getElementById('saveJson');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const mistralApiKeyInput = document.getElementById('mistral-api-key');
    const statusDiv = document.getElementById('status');

    // Charger la clé API si elle existe déjà
    chrome.storage.local.get(['MISTRAL_API_KEY'], function(result) {
        if (result.MISTRAL_API_KEY) {
            mistralApiKeyInput.value = result.MISTRAL_API_KEY;
            console.log('[AutoApply Popup] Clé API Mistral chargée');
        }
    });

    // Sauvegarder la clé API Mistral
    saveApiKeyButton.addEventListener('click', async function() {
        console.log('[AutoApply Popup] Bouton de sauvegarde de la clé API cliqué');
        const apiKey = mistralApiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus("La clé API ne peut pas être vide", false);
            return;
        }
        
        try {
            await chrome.storage.local.set({ 'MISTRAL_API_KEY': apiKey });
            console.log('[AutoApply Popup] Clé API Mistral sauvegardée');
            showStatus("Clé API sauvegardée avec succès", true);
        } catch (error) {
            console.error('[AutoApply Popup] Erreur lors de la sauvegarde de la clé API:', error);
            showStatus("Erreur lors de la sauvegarde de la clé API", false);
        }
    });

    // Afficher un message de statut
    function showStatus(message, isSuccess) {
        console.log(`[AutoApply Popup] Statut: ${message} (${isSuccess ? 'succès' : 'erreur'})`);
        statusDiv.textContent = message;
        statusDiv.className = isSuccess ? 'status success' : 'status error';
        statusDiv.style.display = 'block';
        setTimeout(() => statusDiv.style.display = 'none', 3000);
    }

    // Fonction pour injecter le content script
    async function injectContentScript(tabId) {
        console.log(`[AutoApply Popup] Injection du content script dans l'onglet ${tabId}`);
        try {
            await chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['contentScript.js']
            });
            console.log('[AutoApply Popup] Content script injecté avec succès');
            return true;
        } catch (error) {
            console.error('[AutoApply Popup] Erreur lors de l\'injection du content script:', error);
            return false;
        }
    }

    // Sauvegarder les données JSON du formulaire
    saveJsonButton.addEventListener('click', async function() {
        console.log('[AutoApply Popup] Bouton de sauvegarde des données JSON cliqué');
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            console.log(`[AutoApply Popup] Onglet actif: ${tab.id}`);
            
            try {
                console.log('[AutoApply Popup] Envoi du message saveFormData au content script');
                const response = await chrome.tabs.sendMessage(tab.id, {action: "saveFormData"});
                console.log('[AutoApply Popup] Réponse reçue:', response);
                if (response && response.success) {
                    showStatus(response.message, true);
                    
                    // Vérifier les données sauvegardées
                    chrome.storage.local.get(['formData'], function(result) {
                        console.log('[AutoApply Popup] Données sauvegardées:', result.formData);
                    });
                } else {
                    showStatus(response.message || "Aucune donnée JSON trouvée", false);
                }
            } catch (error) {
                console.log('[AutoApply Popup] Erreur lors de l\'envoi du message, tentative d\'injection du content script');
                // Si le content script n'est pas chargé, on l'injecte
                const injected = await injectContentScript(tab.id);
                if (injected) {
                    // Réessayer après l'injection
                    console.log('[AutoApply Popup] Réessai après injection');
                    const response = await chrome.tabs.sendMessage(tab.id, {action: "saveFormData"});
                    console.log('[AutoApply Popup] Réponse reçue après injection:', response);
                    if (response && response.success) {
                        showStatus(response.message, true);
                        
                        // Vérifier les données sauvegardées
                        chrome.storage.local.get(['formData'], function(result) {
                            console.log('[AutoApply Popup] Données sauvegardées:', result.formData);
                        });
                    } else {
                        showStatus(response.message || "Aucune donnée JSON trouvée", false);
                    }
                } else {
                    showStatus("Erreur lors de l'injection du script", false);
                }
            }
        } catch (error) {
            console.error('[AutoApply Popup] Erreur:', error);
            showStatus("Erreur: " + error.message, false);
        }
    });

    // Remplir automatiquement
    startButton.addEventListener('click', async function() {
        console.log('[AutoApply Popup] Bouton de remplissage automatique cliqué');
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            try {
                console.log('[AutoApply Popup] Envoi du message fillInputs au content script');
                const response = await chrome.tabs.sendMessage(tab.id, {action: "fillInputs"});
                console.log('[AutoApply Popup] Réponse reçue:', response);
                if (response && response.success) {
                    let message = `${response.filledCount} champs remplis`;
                    if (response.errors && response.errors.length > 0) {
                        message += ` (${response.errors.length} erreurs)`;
                    }
                    showStatus(message, true);
                    if (response.errors) {
                        console.log('[AutoApply Popup] Erreurs détaillées:', response.errors);
                    }
                } else {
                    showStatus("Erreur lors du remplissage", false);
                }
            } catch (error) {
                console.log('[AutoApply Popup] Erreur lors de l\'envoi du message, tentative d\'injection du content script');
                // Si le content script n'est pas chargé, on l'injecte
                const injected = await injectContentScript(tab.id);
                if (injected) {
                    // Attendre un court instant pour s'assurer que le script est bien chargé
                    await new Promise(resolve => setTimeout(resolve, 100));
                    // Réessayer après l'injection
                    console.log('[AutoApply Popup] Réessai après injection');
                    const response = await chrome.tabs.sendMessage(tab.id, {action: "fillInputs"});
                    console.log('[AutoApply Popup] Réponse reçue après injection:', response);
                    if (response && response.success) {
                        let message = `${response.filledCount} champs remplis`;
                        if (response.errors && response.errors.length > 0) {
                            message += ` (${response.errors.length} erreurs)`;
                        }
                        showStatus(message, true);
                        if (response.errors) {
                            console.log('[AutoApply Popup] Erreurs détaillées:', response.errors);
                        }
                    } else {
                        showStatus("Erreur lors du remplissage", false);
                    }
                } else {
                    showStatus("Erreur lors de l'injection du script", false);
                }
            }
        } catch (error) {
            console.error('[AutoApply Popup] Erreur:', error);
            showStatus("Erreur: " + error.message, false);
        }
    });

    // Supprimer les données sauvegardées
    clearButton.addEventListener('click', async function() {
        console.log('[AutoApply Popup] Bouton de suppression des données cliqué');
        try {
            console.log('[AutoApply Popup] Suppression des données sauvegardées');
            // Conserver la clé API Mistral lors de la suppression des autres données
            const { MISTRAL_API_KEY } = await chrome.storage.local.get('MISTRAL_API_KEY');
            await chrome.storage.local.clear();
            
            // Si une clé API existe, la restaurer
            if (MISTRAL_API_KEY) {
                await chrome.storage.local.set({ 'MISTRAL_API_KEY': MISTRAL_API_KEY });
                console.log('[AutoApply Popup] Clé API Mistral préservée');
            }
            
            console.log('[AutoApply Popup] Données supprimées avec succès');
            showStatus("Données de formulaire supprimées avec succès!", true);
        } catch (error) {
            console.error('[AutoApply Popup] Erreur:', error);
            showStatus("Erreur lors de la suppression des données", false);
        }
    });

    // Fonction pour injecter le School Blocker
    async function injectSchoolBlocker(tabId) {
        console.log('[AutoApply Popup] Injection du School Blocker dans l\'onglet', tabId);
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['JScript/SchoolBlocker/schoolBlocker.js']
            });
            console.log('[AutoApply Popup] School Blocker injecté avec succès');
            return true;
        } catch (error) {
            console.error('[AutoApply Popup] Erreur lors de l\'injection du School Blocker:', error);
            return false;
        }
    }

    // Gestion du School Blocker
    const schoolBlockerToggle = document.getElementById('schoolBlockerToggle');

    // Charger l'état initial du School Blocker
    chrome.storage.local.get(['schoolBlockerEnabled'], (result) => {
        schoolBlockerToggle.checked = result.schoolBlockerEnabled || false;
        updateSchoolBlockerState(result.schoolBlockerEnabled || false);
    });

    // Écouter les changements du toggle
    schoolBlockerToggle.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        console.log('[SchoolBlocker] État du toggle modifié:', isEnabled);
        
        try {
            // Sauvegarder l'état dans le stockage local
            await chrome.storage.local.set({ schoolBlockerEnabled: isEnabled });
            console.log('État du School Blocker sauvegardé:', isEnabled);
            
            // Obtenir l'onglet actif
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (isEnabled) {
                // Injecter le School Blocker si activé
                const injected = await injectSchoolBlocker(tab.id);
                if (injected) {
                    // Attendre un court instant pour s'assurer que le script est bien chargé
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            // Mettre à jour l'état dans l'onglet actif
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggleSchoolBlocker',
                enabled: isEnabled
            }).catch(() => {
                console.log('[AutoApply Popup] Impossible d\'envoyer le message à l\'onglet, le School Blocker n\'est peut-être pas injecté');
            });
            
        } catch (error) {
            console.error('[AutoApply Popup] Erreur lors de la mise à jour du School Blocker:', error);
            showStatus("Erreur lors de la mise à jour du School Blocker", false);
        }
    });

    // Fonction pour mettre à jour l'état du School Blocker dans tous les onglets
    async function updateSchoolBlockerState(isEnabled) {
        try {
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleSchoolBlocker',
                        enabled: isEnabled
                    });
                } catch (error) {
                    // Ignorer les erreurs pour les onglets qui ne peuvent pas recevoir de messages
                    console.log(`[AutoApply Popup] Impossible d'envoyer le message à l'onglet ${tab.id}`);
                }
            }
        } catch (error) {
            console.error('[AutoApply Popup] Erreur lors de la mise à jour des onglets:', error);
        }
    }
});