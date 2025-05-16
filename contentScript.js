(async () => {
    try {
        const schoolBlockerSrc = chrome.runtime.getURL("JScript/SchoolBlocker/schoolBlocker.js");
        
        try {
            const schoolBlocker = await import(schoolBlockerSrc);
            
            
            // Vérifier l'état du toggle avant de démarrer
            chrome.storage.local.get(['schoolBlockerEnabled'], (result) => {
                if (result.schoolBlockerEnabled) {
                    if (typeof schoolBlocker.startSchoolBlocker === 'function') {
                        schoolBlocker.startSchoolBlocker();
                    } else {
                        console.error('[AutoApply] La fonction startSchoolBlocker() n\'a pas été trouvée dans le module');
                    }
                } else {
                }
            });
            
        } catch (importError) {
            console.error('[AutoApply] Erreur lors de l\'import du module SchoolBlocker:', importError);
        }
    } catch (error) {
        console.error('[AutoApply] Erreur critique dans le content script:', error);
    }
})();
