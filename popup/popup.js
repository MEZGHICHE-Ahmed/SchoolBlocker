document.addEventListener('DOMContentLoaded', function() {
    console.log('[AutoApply Popup] Popup chargé');
    

    const statusDiv = document.getElementById('status');

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