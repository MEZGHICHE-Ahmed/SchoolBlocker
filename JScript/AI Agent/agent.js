// Au lieu d'utiliser dotenv, on va utiliser le stockage de l'extension
export async function askMistral(list, html) {
    try {
        // Utiliser fetch pour charger le contenu du fichier de prompt
        
        let promptTemplate = `Tu es un expert en développement web. Ta mission est de trouver, à partir d'une page HTML, les champs de formulaire permettant à l'utilisateur de postuler pour une offre de travail.
                            À partir de la liste d'informations que l'utilisateur possède, associe les sélecteurs CSS des champs du formulaire à l'information correspondante dans la liste de l'utilisateur.

                             IMPORTANT: 
                             - MET LE CHAMP LE PLUS PLAUSIBLE PAR RAPPORT A L'UTILISATEUR,
                             - SI TU NE TROUVE PAS CERTAINS CHAMPS CORRESPONDANT PAR RAPPORT A L'UTILISATEUR, NE PAS LE METTRE DANS LE JSON,
                             - Generate a valid JSON response with no additional text or commentary
                             - L'UTILISATEUR NE PEUX PAS LIRE DU TEXTE IL VEUT QUE DU JSON DONC ECRIT PAS DE TEXTE DANS TA REPONSE , Ta réponse doit être EXACTEMENT structurée EXACTEMENT comme ceci :
                            "
                            <json>
                            {
                            "success": true,
                            "fields": [
                                {"selector": "input#nom", "value": "nom"},
                                {"selector": "input[name='email']", "value": "email"}
                            ]
                            }
                            </json>
                            "

                            Pour chaque champ:
                            - "selector" doit être un sélecteur CSS valide qui identifie l'élément de formulaire
                            - "value" doit être l'information de la liste de l'utilisateur qui correspond à ce champ

                            Liste des informations disponibles:
                            <liste>

                            Code HTML:
                            <html>`;
        let prompt = promptTemplate.replace('<liste>', list).replace('<html>', html);
        


        const { MISTRAL_API_KEY } = await chrome.storage.local.get('MISTRAL_API_KEY');
        if (!MISTRAL_API_KEY) {
            throw new Error('La clé API Mistral n\'est pas configurée');
        }
        
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-medium",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })
        });
        
        const data = await response.json();
        console.log(parseJsonResponse(data.choices[0].message.content));
        return parseJsonResponse(data.choices[0].message.content);
    } catch (error) {
        console.error('[AutoApply] Erreur dans askMistral:', error);
        throw error;
    }
}

/**
 * Fonction pour nettoyer et parser correctement la réponse JSON de l'API Mistral
 * @param {string} jsonString - La chaîne JSON à parser
 * @return {object} - L'objet JSON parsé
 */
export function parseJsonResponse(jsonString) {
    try {
        // Si la réponse est déjà un objet, on la retourne telle quelle
        if (typeof jsonString === 'object' && jsonString !== null) {
            return jsonString;
        }
        
        // 1. Vérifier si le json contient des balises <json>
        let cleaned = jsonString.trim();
        const jsonTagMatch = cleaned.match(/<json>([\s\S]*?)<\/json>/);
        if (jsonTagMatch && jsonTagMatch[1]) {
            cleaned = jsonTagMatch[1].trim();
        }
        
        // 2. Supprimer les guillemets au début et à la fin s'ils existent
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
        }
        
        // 3. Supprimer les sauts de ligne et les espaces supplémentaires
        cleaned = cleaned.replace(/\n\s*/g, ' ').trim();
        
        // 4. Gérer les caractères d'échappement problématiques
        // Remplacer les séquences comme "experience1\_poste" par "experience1_poste"
        cleaned = cleaned.replace(/\\\_/g, '_');
        cleaned = cleaned.replace(/\\_/g, '_');
        
        // 5. Essai direct de parsing JSON
        try {
            return JSON.parse(cleaned);
        } catch (firstError) {
            // Si le parsing échoue, on essaie différentes approches
            console.log('[AutoApply] Premier essai de parsing échoué:', firstError.message);
            
            // 6. Essayer en remplaçant les séquences d'échappement courantes
            let cleanedRetry = cleaned.replace(/\\"/g, '"')
                                      .replace(/\\\\"/g, '"')
                                      .replace(/\\\\/g, '\\');
            
            try {
                return JSON.parse(cleanedRetry);
            } catch (secondError) {
                console.log('[AutoApply] Deuxième essai de parsing échoué:', secondError.message);
                
                // 7. Dernière tentative: extraire un objet JSON valide
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        // Nettoyage avancé des caractères d'échappement
                        let extractedJson = jsonMatch[0];
                        
                        // Correction manuelle des problèmes courants
                        extractedJson = extractedJson.replace(/([a-zA-Z0-9]+)\\+_([a-zA-Z0-9]+)/g, '$1_$2');
                        
                        console.log('[AutoApply] Tentative avec JSON extrait:', extractedJson);
                        return JSON.parse(extractedJson);
                    } catch (finalError) {
                        console.error('[AutoApply] Échec de tous les essais de parsing:', finalError);
                        throw finalError;
                    }
                }
                
                throw new Error('Format JSON invalide: impossible d\'extraire un objet JSON valide');
            }
        }
    } catch (error) {
        console.error('[AutoApply] Erreur lors du parsing JSON:', error, 'String originale:', jsonString);
        
        // Si tout échoue mais que la chaîne semble être un JSON valide (commence par { et finit par })
        if (typeof jsonString === 'string' && jsonString.trim().startsWith('{') && jsonString.trim().endsWith('}')) {
            console.log('[AutoApply] Tentative de correction manuelle du JSON...');
            
            try {
                // Tenter une approche de correction manuelle en remplaçant les valeurs problématiques
                const correctedJson = jsonString.replace(/\\_/g, '_').replace(/\\\_/g, '_');
                
                // Remplacer les valeurs échappées connues par leurs versions non-échappées
                const knownFields = [
                    "experience1_poste", "experience1_entreprise", "experience1_lieu", 
                    "experience1_dateDebut", "experience1_dateFin", "experience1_description",
                    "formation1_etablissement", "formation1_diplome", "formation1_description",
                    "linkedIn"
                ];
                
                let manuallyFixed = correctedJson;
                knownFields.forEach(field => {
                    // Remplacer toutes les occurrences des champs avec des barres obliques échappées
                    const escapedField = field.replace(/_/g, '\\_');
                    manuallyFixed = manuallyFixed.replace(new RegExp(escapedField, 'g'), field);
                });
                
                return JSON.parse(manuallyFixed);
            } catch (finalError) {
                console.error('[AutoApply] Échec de la correction manuelle:', finalError);
            }
        }
        
        // Retourner un objet d'erreur
        return {
            success: false,
            error: 'Erreur lors du parsing de la réponse: ' + error.message,
            rawResponse: jsonString
        };
    }
}