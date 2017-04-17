/**
 * Classe permettant de corriger le chemin des ressources référencées dans les réponses AJAX émulées
 * @param {string} environmentName
 * @constructor
 */
function EmulatedResponseResourcePathFixer(environmentName) {

    var _self = this;

    /**
     * Nom de l'environnement courant (utiliser pour définir le chemin des ressources)
     * @type {string}
     */
    this.environmentName = environmentName || "appli";

    /**
     * Chemin relatif vers les répertoire de tous les environnements
     * @type {string}
     */
    this.environmentsRelativePath = "../../../environnements";

    /**
     * Nom du répertoire contenant les ressources de l'environnement
     * @type {string}
     */
    this.resourcesDirectoryName = "Resources";

    /**
     * Liste de clé/valeur permettant de mapper les noms de ressources brutes vers les ressources existantes de l'environnement
     * @type {{}}
     */
    this.resourceNamesMapping = {};


    //TODO: supporter le cas <img src=img.png > c'est à dire sans quote ou double quote
    var _findImgPathRegex = /(<img.*?src=)(['"])(.*?)\2(.*?>)/gi;

    /**
     * Permet de corriger le chemin de la ressource identifiée.
     * Cette méthode peut être surchargée pour redéfinir le comportement
     * @param {string} resourcePath
     */
    this.fixResourcePath = function (resourcePath) {
        var lastResourcePathSlash = resourcePath.lastIndexOf("/");
        var rawResourceName = lastResourcePathSlash >= 0 ? resourcePath.substring(lastResourcePathSlash + 1) : resourcePath;

        var resourceName = (rawResourceName in _self.resourceNamesMapping) ? _self.resourceNamesMapping[rawResourceName] : rawResourceName;

        var newResourcePath = _self.environmentsRelativePath + "/" + _self.environmentName + "/" + this.resourcesDirectoryName + "/" + resourceName;

        return newResourcePath;
    };

    /**
     * @param {EmulatedResponse} emulatedResponse
     */
    this.fix = function (emulatedResponse) {
        if (emulatedResponse) {
            var responseText = emulatedResponse.responseText;

            var modifiedResponse = "";
            var result;
            var lastIndex = 0;
            while ((result = _findImgPathRegex.exec(responseText)) !== null) {
                modifiedResponse += responseText.substr(lastIndex, result.index - lastIndex) + result[1] + result[2] + _self.fixResourcePath(result[3]) + result[2] + result[4];
                lastIndex = result.index + result[0].length;
            }

            modifiedResponse += responseText.substr(lastIndex, responseText.length - lastIndex);
            emulatedResponse.responseText = modifiedResponse;
        }
    }

}