(async () => {
    try {
        console.log('[AutoApply] Chargement du content script...');
        const src = chrome.runtime.getURL("JScript/content_main.js");
        const schoolBlockerSrc = chrome.runtime.getURL("JScript/SchoolBlocker/schoolBlocker.js");
        
        console.log('[AutoApply] URL du module principal:', src);
        
        try {
            const contentMain = await import(src);
            const schoolBlocker = await import(schoolBlockerSrc);
            
            console.log('[AutoApply] Modules importés avec succès');
            
            if (typeof contentMain.main === 'function') {
                console.log('[AutoApply] Démarrage de la fonction principale');
                contentMain.main();
                console.log('[AutoApply] Fonction principale exécutée avec succès');
            } else {
                console.error('[AutoApply] La fonction main() n\'a pas été trouvée dans le module');
            }

            // Initialiser le school blocker
            await schoolBlocker.initSchoolBlocker();
            
        } catch (importError) {
            console.error('[AutoApply] Erreur lors de l\'import des modules:', importError);
        }
    } catch (error) {
        console.error('[AutoApply] Erreur critique dans le content script:', error);
    }
})();
