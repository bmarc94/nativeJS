function ParsedUrl() {
    /**
     * @type {string}
     */
    this.rawUrl = "";
    /**
     * @type {string}
     */
    this.urlWithoutArgs = "";
    /**
     * @type {{}}
     */
    this.urlArgs = {};
}

var urlHelper = new (function () {

    var _self = this;
    var _absoluteUrlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

    /**
     * @param {string} url
     * @return {boolean}
     */
    this.isAbsolute = function (url) {
        return _absoluteUrlRegex.test(url);
    };

    /**
     * @param {string} url
     * @return {ParsedUrl}
     */
    this.parse = function (url) {
        var parsedUrl = new ParsedUrl();
        parsedUrl.rawUrl = url;

        var splitUrl = _self.splitUrl(url);
        parsedUrl.urlWithoutArgs = splitUrl.urlWithoutArgs;

        if (splitUrl.urlArgsRaw != null) {
            var urlArgs = splitUrl.urlArgsRaw.split("&");
            for (var i = 0; i < urlArgs.length; i++) {
                var urlArgRaw = urlArgs[i];
                var argParts = urlArgRaw.split("=");
                parsedUrl.urlArgs[argParts[0]] = decodeURIComponent(argParts[1]);
            }
        }

        return parsedUrl;
    };

    /**
     * Split l'URL en deux parties
     * @param url
     * @return {{urlWithoutArgs: string, urlArgsRaw: string|null}}
     */
    this.splitUrl = function (url) {
        var splitUrl = {
            urlWithoutArgs: "",
            urlArgsRaw: null
        };

        var argsStartIndex = url.indexOf("?");
        if (argsStartIndex >= 0) {
            splitUrl.urlWithoutArgs = url.substring(0, argsStartIndex);
            splitUrl.urlArgsRaw = url.substring(argsStartIndex + 1);
        } else {
            splitUrl.urlWithoutArgs = url;
            splitUrl.urlArgsRaw = null;
        }

        return splitUrl;
    }

})();

function CapturedExchange() {

    /**
     * @type {ParsedUrl}
     * @public
     */
    this.parsedUrl = null;

    /**
     * @type {string}
     */
    this.method = "";

    /**
     * @type {string}
     */
    this.responseText = "";

    /**
     * @type {string}
     */
    this.responseMimeType = "";

    /**
     *
     * @type {null|{}}
     */
    this.postData = null;

}

function AverageComputer() {
    var _nbValues = 0;
    var _accumulator = 0;

    this.add = function (value) {
        _accumulator += value;
        _nbValues++;
    };

    this.getResult = function (noEntryReturnedValue) {
        return _nbValues > 0 ? _accumulator / _nbValues : noEntryReturnedValue | NaN;
    };
}

function JSONDiffResult() {
    var _self = this;

    this.diffInfos = [];
    this.numberOfDifferences = 0;
    this.numberOfAnalyzedElements = 0;
    this.numberOfEqualities = 0;

    this.addTestResult = function (comparedElementWasEqual, diffInfo) {
        _self.numberOfAnalyzedElements++;
        if (comparedElementWasEqual) {
            _self.numberOfEqualities++;
        } else {
            _self.numberOfDifferences++;
            _self.diffInfos.push(diffInfo);
        }
        return comparedElementWasEqual;
    }
}

/**
 * Classe permettant de comparer des objets JSON
 * @constructor
 */
function JSONDiff() {

    var _self = this;

    /**
     * @param {[]} array1
     * @param {[]} array2
     * @param {JSONDiffResult} jsonDiffResult
     * @param {string} path
     * @private
     */
    function _compareArrays(array1, array2, jsonDiffResult, path) {
        if (jsonDiffResult.addTestResult(array1.length == array2.length, "Array length mismatch at \"" + path + "\"")) {
            for (var i = 0; i < array1.length; i++) {
                var obj1 = array1[i];
                var obj2 = array2[i];
                _compareValues(obj1, obj2, jsonDiffResult, path);
            }
        }
    }

    /**
     *
     * @param {*} value1
     * @param {*} value2
     * @param {JSONDiffResult} jsonDiffResult
     * @param {string} path
     * @private
     */
    function _compareValues(value1, value2, jsonDiffResult, path) {
        if (_self.isArray(value1) && _self.isArray(value2)) {
            _compareArrays(value1, value2, jsonDiffResult, path);
        } else if (_self.isObjectOrArray(value1) && _self.isObjectOrArray(value2)) {
            _compareJSONs(value1, value2, jsonDiffResult, path);
        } else {
            jsonDiffResult.addTestResult(value1 === value2, "Field values not equals at \"" + path + "\"");
        }
    }

    /**
     * @param {{}} obj1
     * @param {{}} obj2
     * @return {{}}
     * @private
     */
    function _getAllFields(obj1, obj2) {
        var allFields = {};
        for (var f1 in obj1) {
            if (obj1.hasOwnProperty(f1)) {
                allFields[f1] = null;
            }
        }
        for (var f2 in obj2) {
            if (obj2.hasOwnProperty(f2)) {
                allFields[f2] = null;
            }
        }
        return allFields;
    }

    /**
     * @param {string} path
     * @private
     */
    function _isPathExcluded(path) {
        var excludedPaths = _self.excludedPaths;

        if (excludedPaths.indexOf) {
            return excludedPaths.indexOf(path) >= 0;
        }

        for (var i = 0; i < excludedPaths.length; i++) {
            if (excludedPaths[i] == path) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {{}} json1
     * @param {{}} json2
     * @param {JSONDiffResult} jsonDiffResult
     * @param {string} path
     * @private
     */
    function _compareJSONs(json1, json2, jsonDiffResult, path) {
        if (_self.isArray(json1) && _self.isArray(json2)) {
            _compareArrays(json1, json2, jsonDiffResult, path);
        }
        else {
            var allFields = _getAllFields(json1, json2);
            for (var fieldName in allFields) {
                var subPath = (path == "") ? fieldName : path + "." + fieldName;
                if (_isPathExcluded(subPath)) {
                    jsonDiffResult.addTestResult(true, "");
                    continue;
                }

                if (jsonDiffResult.addTestResult(fieldName in json1 && fieldName in json2, "Field \"" + fieldName + "\" is missing in one of compared jsons")) {
                    _compareValues(json1[fieldName], json2[fieldName], jsonDiffResult, subPath);
                }
            }
        }
    }

    /**
     * Tableau de chemins des propriétés à exclure lors de l'analyse différentielle
     * @type {Array}
     */
    this.excludedPaths = [];

    /**
     * @param {*} obj
     * @return {boolean}
     */
    this.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    /**
     * @param {*} obj
     * @return {boolean}
     */
    this.isObjectOrArray = function (obj) {
        return typeof (obj) === "object";
    };

    /**
     * Compare deux objets JSON à la recherche du nombre de différences
     * @param {{}|[]} json1
     * @param {{}|[]} json2
     * @return {JSONDiffResult}
     */
    this.compute = function (json1, json2) {
        var jsonDiffResult = new JSONDiffResult();
        _compareJSONs(json1, json2, jsonDiffResult, "");
        return jsonDiffResult;
    }

}

/**
 * Classe contenant les informations de resultat d'une comparaison
 * entre les similitudes d'une HookedRequest et d'un CapturedExchange
 *
 * @constructor
 */
function RequestMatchResult() {

    /**
     * @type {Number}
     */
    this.urlWithoutArgsMatch = NaN;

    /**
     * @type {Number}
     */
    this.requestMethodMatch = NaN;

    /**
     * @type {Number}
     */
    this.urlArgsMatch = NaN;

    /**
     * @type {Number}
     */
    this.dataMatch = NaN;

    /**
     * @type {Number}
     */
    this.result = NaN

}

/**
 * @constructor
 * @param {string[]} [urlArgNamesToIgnore]
 * @param {string[]} [jsonPostDataPathsToIgnore]
 */
function HARMatcher(urlArgNamesToIgnore, jsonPostDataPathsToIgnore) {

    var _self = this;

    /**
     * Tableau des noms d'arguments d'URL à ignorer lors de la recherche du match
     * @type {string[]}
     */
    this.urlArgNamesToIgnore = urlArgNamesToIgnore || [];

    /**
     * Tableau des chemins des objets JSON postés à ignorer lors de la recherche du match
     * @type {string[]}
     */
    this.jsonPostDataPathsToIgnore = jsonPostDataPathsToIgnore || [];

    /**
     * implémentation de l'algorithme de Levenshtein provenant de cette adresse
     * http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
     *
     * Compute the edit distance between the two given strings
     * @param {string} s1
     * @param {string} s2
     * @return {number} Le nombre de modifications qu'il faut faire pour
     */
    this.computeLevenshteinDistance = function (s1, s2) {
        if (s1.length === 0) return s2.length;
        if (s2.length === 0) return s1.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= s2.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= s1.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= s2.length; i++) {
            for (j = 1; j <= s1.length; j++) {
                if (s2.charAt(i - 1) == s1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[s2.length][s1.length];
    };

    /**
     * @type {CapturedExchange[]}
     * @private
     */
    var _capturedExchanges = [];

    this.secureLogger = new (function () {
        this.log = function (obj) {
            try {
                if (console && console.log) {
                    console.log(obj);
                }
            } catch (e) {

            }
        };
        this.warn = function (obj) {
            try {
                if (console && console.warn) {
                    console.warn(obj);
                }
            } catch (e) {

            }
        };
    });

    /**
     * This callback is displayed as a global member.
     * @callback HARMatcher~onCapturedExchangeAdded
     * @param {CapturedExchange} capturedExchange
     */

    /**
     * Si défini, ce callback est appelé à l'initialisation d'un HAR et est appelé
     * pour chaque entrée trouvée.
     * Utiliser ce callback pour modifier si besoin les données de l'échange capturé
     * @param {null|HARMatcher~onCapturedExchangeAdded}
     */
    this.onCapturedExchangeAdded = null;

    /**
     * Seuil de taux de similitude minimum à atteindre pour
     * considérer qu'un échange capturé match la requête en cours
     * La valeur doit être comprise entre 0 et 100
     * @type {number}
     */
    this.minimumMatchThreshold = 99;

    /**
     * Initialise le matcher avec l'ensemble des échanges contenus dans le HAR fourni
     * @param {Array} har
     */
    this.initialize = function (har) {
        for (var i = 0; i < har.length; i++) {
            var harEntry = har[i];
            var harRequest = harEntry.request;
            var harResponse = harEntry.response;

            var capturedExchange = new CapturedExchange();

            var parsedUrl = new ParsedUrl();
            parsedUrl.rawUrl = harRequest.url;

            for (var argIndex = 0; argIndex < harRequest.queryString.length; argIndex++) {
                var urlArg = harRequest.queryString[argIndex];
                parsedUrl.urlArgs[urlArg.name] = urlArg.value;
            }
            parsedUrl.urlWithoutArgs = urlHelper.splitUrl(harRequest.url).urlWithoutArgs;

            capturedExchange.parsedUrl = parsedUrl;

            capturedExchange.method = harRequest.method;
            capturedExchange.postData = harRequest.postData || null;

            capturedExchange.responseText = harResponse.content.text;
            capturedExchange.responseMimeType = harResponse.content.mimeType;

            _capturedExchanges.push(capturedExchange);

            if (_self.onCapturedExchangeAdded) {
                _self.onCapturedExchangeAdded(capturedExchange);
            }

        }
    };

    /**
     * Méthode permettant de comparer la valeur d'un argument d'une requête à la valeur d'un argument enregistré.
     * Cette fonction peut être surchargée afin de redéfinir une logique de comparaison personalisée.
     * Note : la méthode n'est pas appelée si l'argument fait parti de la liste d'exclusion
     *
     * @param {string} argName le nom d'un des arguments de la requête en cours
     * @param {string} hookedRequestArgValue la valeur de l'argument de la requête courante
     * @param {string|undefined} capturedRequestArgValue la valeur de argument capturé
     * @param {HookedRequest} hookedRequest rappel de la requête courante à traiter
     * @param {CapturedExchange} capturedExchange l'échange capturé contenant l'argument à comparer
     * @return {number} taux de correspondance entre 0 et 100
     */
    this.computeUrlArgMatch = function (argName, hookedRequestArgValue, capturedRequestArgValue, hookedRequest, capturedExchange) {
        return hookedRequestArgValue == capturedRequestArgValue ? 100 : 0;
    };

    /**
     * Méthode permettant de comparer la méthode de la requête courante avec la méthode d'une des requêtes enregistrées
     * Cette fonction peut être surchargée afin de redéfinir une logique de comparaison personalisée.
     *
     * @param {string} requestMethod
     * @param {string} capturedMethod
     * @param {HookedRequest} hookedRequest
     * @param {CapturedExchange} capturedExchange
     * @return {number} taux de correspondance entre 0 et 100
     */
    this.computeRequestMethodMatch = function (requestMethod, capturedMethod, hookedRequest, capturedExchange) {
        return (requestMethod == capturedMethod) ? 100 : 0;
    };

    /**
     * Calcul le taux de correspondance entre l'url de la requête courante et l'une des requêtes capturées
     * Cette fonction peut être surchargée afin de redéfinir une logique de comparaison personalisée.
     *
     * @param {ParsedUrl} parsedCapturedUrl
     * @param {ParsedUrl} parsedHookedRequestUrl
     * @param {HookedRequest} hookedRequest
     * @param {CapturedExchange} capturedExchange
     * @return {number} taux de correspondance entre 0 et 100
     */
    this.computeUrlWithoutArgsMatch = function (parsedCapturedUrl, parsedHookedRequestUrl, hookedRequest, capturedExchange) {
        if (urlHelper.isAbsolute(parsedHookedRequestUrl.urlWithoutArgs)) {
            return (parsedCapturedUrl.urlWithoutArgs == parsedHookedRequestUrl.urlWithoutArgs) ? 100 : 0;
        } else {
            var hookedUrl = parsedHookedRequestUrl.urlWithoutArgs;
            if (hookedUrl.indexOf("/") != 0) {
                hookedUrl = "/" + hookedUrl;
            }
            return parsedCapturedUrl.urlWithoutArgs.indexOf(hookedUrl) >= 0 ? 100 : 0;
        }
    };

    /**
     * @param {HookedRequest} hookedRequest
     * @private
     */
    function _isHookedRequestPostDataOfJsonType(hookedRequest) {
        if ("Content-Type" in hookedRequest.requestHeaders) {
            var contentType = hookedRequest.requestHeaders["Content-Type"];
            if (contentType == "application/json") {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {object} capturedPostData
     * @private
     */
    function _isCapturedExchangePostDataOfJsonType(capturedPostData) {
        return !!(capturedPostData && capturedPostData.mimeType == "application/json");
    }

    /**
     *
     * @param {Object} hookedPostData
     * @param {Object} capturedPostData
     * @param {HookedRequest} hookedRequest
     * @param {CapturedExchange} capturedExchange
     * @return {number} taux de correspondance entre 0 et 100
     * @private
     */
    this.computePostDataMatch = function (hookedPostData, capturedPostData, hookedRequest, capturedExchange) {
        if (hookedPostData) {
            _self.secureLogger.log(hookedPostData);
        }

        if (_isHookedRequestPostDataOfJsonType(hookedRequest) && _isCapturedExchangePostDataOfJsonType(capturedPostData)) {
            var hookedJson = JSON.parse(hookedPostData);
            var capturedJson = JSON.parse(capturedPostData.text);

            var jsonDiff = new JSONDiff();
            jsonDiff.excludedPaths = _self.jsonPostDataPathsToIgnore;
            var jsonDiffResult = jsonDiff.compute(hookedJson, capturedJson);

            return (jsonDiffResult.numberOfAnalyzedElements) > 0 ? (jsonDiffResult.numberOfEqualities / jsonDiffResult.numberOfAnalyzedElements) * 100 : 100;
        } else if (hookedPostData == null && capturedPostData == null) {
            return 100;
        } else if (hookedPostData == null ^ capturedPostData == null) {
            return 0;
        } else {
            var hookedPostString = hookedPostData.toString();
            var capturedPostString = (capturedPostData.text) ? capturedPostData.text : "";
            var numberOfModifications = _self.computeLevenshteinDistance(hookedPostString, capturedPostString);

            var maxStringLength = Math.max(hookedPostString.length, capturedPostString.length);

            var stringMatch = (maxStringLength == 0) ? 100 : (Math.max((maxStringLength - numberOfModifications), 0) / maxStringLength) * 100;
            return stringMatch;
        }
    };

    /**
     * @param {string} argName
     * @return {boolean}
     * @private
     */
    function _shouldUrlArgBeIgnored(argName) {
        for (var i = 0; i < _self.urlArgNamesToIgnore.length; i++) {
            if (_self.urlArgNamesToIgnore[i] == argName) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {ParsedUrl} parsedHookedRequestUrl
     * @param {ParsedUrl} parsedCapturedUrl
     * @param {HookedRequest} hookedRequest
     * @param {CapturedExchange} capturedExchange
     * @return {number} Pourcentage de correspondance
     * @private
     */
    function _computeUrlArgsMatch(parsedHookedRequestUrl, parsedCapturedUrl, hookedRequest, capturedExchange) {
        var capturedUrlArgs = parsedCapturedUrl.urlArgs;
        var hookedUrlArgs = parsedHookedRequestUrl.urlArgs;
        var averageComputer = new AverageComputer();

        for (var hookedRequestUrlArgName in hookedUrlArgs) {
            if (_shouldUrlArgBeIgnored(hookedRequestUrlArgName)) {
                averageComputer.add(100);
            }
            else {
                averageComputer.add(_self.computeUrlArgMatch(hookedRequestUrlArgName, hookedUrlArgs[hookedRequestUrlArgName], capturedUrlArgs[hookedRequestUrlArgName], hookedRequest, capturedExchange));
            }
        }

        return averageComputer.getResult(100);
    }

    /**
     * @param {HookedRequest} hookedRequest
     * @param {ParsedUrl} parsedHookedRequestUrl
     * @param {CapturedExchange} capturedExchange
     * @return {RequestMatchResult}
     * @private
     */
    function _computeCapturedExchangeMatchWithHookedRequest(hookedRequest, parsedHookedRequestUrl, capturedExchange) {

        var requestMatchResult = new RequestMatchResult();

        requestMatchResult.requestMethodMatch = _self.computeRequestMethodMatch(hookedRequest.method, capturedExchange.method, hookedRequest, capturedExchange);
        requestMatchResult.urlWithoutArgsMatch = _self.computeUrlWithoutArgsMatch(capturedExchange.parsedUrl, parsedHookedRequestUrl, hookedRequest, capturedExchange);
        requestMatchResult.urlArgsMatch = _computeUrlArgsMatch(parsedHookedRequestUrl, capturedExchange.parsedUrl, hookedRequest, capturedExchange);
        requestMatchResult.dataMatch = _self.computePostDataMatch(hookedRequest.data, capturedExchange.postData, hookedRequest, capturedExchange);

        var averageComputer = new AverageComputer();
        for (var fieldName in requestMatchResult) {
            if (!requestMatchResult.hasOwnProperty(fieldName)) {
                continue;
            }

            var fieldValue = requestMatchResult[fieldName];
            if (typeof( fieldValue) === "number" && !isNaN(fieldValue)) {
                averageComputer.add(fieldValue);
            }
        }
        requestMatchResult.result = averageComputer.getResult();
        return requestMatchResult;
    }

    /**
     * Tente de retrouver, parmi mes requêtes capturées, la réponse correspondante à la requête interceptée
     * @param {HookedRequest} hookedRequest
     * @return {EmulatedResponse}
     */
    this.createResponseOnMatch = function (hookedRequest) {
        var emulatedResponse = null;
        var parsedHookedRequestUrl = urlHelper.parse(hookedRequest.url);

        var finalMatchResult = {
            bestMatch: 0,
            minimumMatchThreshold: _self.minimumMatchThreshold,
            capturedExchangeResults: []
        };

        for (var i = 0; i < _capturedExchanges.length; i++) {
            var capturedExchange = _capturedExchanges[i];
            var requestMatchResult = _computeCapturedExchangeMatchWithHookedRequest(hookedRequest, parsedHookedRequestUrl, capturedExchange);

            if (requestMatchResult.result >= finalMatchResult.bestMatch) {
                var capturedExchangeResult = {
                    matchResult: requestMatchResult,
                    capturedExchange: capturedExchange
                };

                if (requestMatchResult.result > finalMatchResult.bestMatch) {
                    finalMatchResult.bestMatch = requestMatchResult.result;
                    finalMatchResult.capturedExchangeResults = [capturedExchangeResult];
                } else {
                    finalMatchResult.capturedExchangeResults.push(capturedExchangeResult);
                }
            }
        }

        if (finalMatchResult.capturedExchangeResults.length > 0 && finalMatchResult.bestMatch >= _self.minimumMatchThreshold) {
            var bestCapturedExchangeMatch = finalMatchResult.capturedExchangeResults[0].capturedExchange;
            emulatedResponse = new EmulatedResponse();
            emulatedResponse.responseText = bestCapturedExchangeMatch.responseText;
            emulatedResponse.response = bestCapturedExchangeMatch.responseText;
            emulatedResponse.responseHeaders['content-type'] = bestCapturedExchangeMatch.responseMimeType;

            if (finalMatchResult.capturedExchangeResults.length > 1) {
                _self.secureLogger.warn("-------SEVERAL XHR RESPONSE MATCH FOUND-------");
                _self.secureLogger.warn("More than one captured exchange found for request :");
                _self.secureLogger.warn(hookedRequest);
                _self.secureLogger.warn("Match result was :");
                _self.secureLogger.warn(finalMatchResult);
                _self.secureLogger.warn("-----------------------------------------");
            } else {
                /*décommenter ces lignes à des fins de débuggage des requêtes qui matchent*/
                /*_self.secureLogger.log("-------XHR RESPONSE MATCH FOUND-------");
                _self.secureLogger.log("Following match result :");
                _self.secureLogger.log(finalMatchResult);
                _self.secureLogger.log("found for request :");
                _self.secureLogger.log(hookedRequest);
                _self.secureLogger.log("--------------------------------------");*/
            }
        }

        if (emulatedResponse == null) {
            _self.secureLogger.warn("-------NO XHR RESPONSE MATCH FOUND-------");
            _self.secureLogger.warn("No matching captured exchange found for request :");
            _self.secureLogger.warn(hookedRequest);
            _self.secureLogger.warn("Match result was :");
            _self.secureLogger.warn(finalMatchResult);
            _self.secureLogger.warn("-----------------------------------------");
        }


        return emulatedResponse;
    }

}

