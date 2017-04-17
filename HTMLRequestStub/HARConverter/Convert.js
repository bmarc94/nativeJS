/**
 * Script Node JS:
 *
 * Permet d'extraire et réduire un (ou plusieurs) JSON de type HAR en un fichier JS nommé 'har.js'
 *
 * Exemple de commande :
 * node.exe Convert.js dummy1.har dummy2.har ...
 */

var fs = require("fs");
var objectCloner = require("./objectCloner.js");


var harFilePaths = process.argv.slice(2);

function concatHARsEntries(harFilePaths){
    var harEntries = [];
    for (var i = 0, l = harFilePaths.length; i < l; i++) {
        var harFilePath = harFilePaths[i];
        var harJson = JSON.parse(fs.readFileSync(harFilePath, "UTF-8"));
        harEntries = harEntries.concat(harJson.log.entries);
    }
    return harEntries;
}

var harEntries = concatHARsEntries(harFilePaths);

var harCloneStructureDefinition = {
    __arrayElementFilterPredicate__: function (harEntry) {
		/*filtre les headers n'étant pas des XMLHttpRequests
        Certains scripts ont besoin d'aller chercher des fichiers pour continuer leurs éxecutions
        décommenter le return true si trop destructeur
        */
    	/*return true; */
    	
        var headers = harEntry.request.headers;
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            if (header.value == "XMLHttpRequest") {
                return true;
            }
        }
        return false;
    },

    "request": {
        "method": {},
        "url": {},
        "queryString": {
            "name": {},
            "value": {}
        },
        "postData": {
            __isMandatory__: false,
            mimeType: {},
            text: {}
        }
    },
    "response": {
        "content": {
            "mimeType": {},
            "text": {}
        }
    }

};


var clonedHar = objectCloner.clone(harEntries, harCloneStructureDefinition);

var result = "/*File generated with HAR Conversion Tool*/\n" +
    "var HAR = " + JSON.stringify(clonedHar) + ";";

fs.writeFileSync("HAR.js", result);
