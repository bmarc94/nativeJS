/**
 * Concentrateur de toutes les requêtes AJAX interceptée par les Stubs AJAX
 */
var ajaxRequestsHub = new (function () {

    var _ajaxResponseProviders = [];

    /**
     * @param {HookedRequest} hookedRequest
     * @return {EmulatedResponse}
     */
    function _tryGetResponseFromResponders(hookedRequest) {
        var emulatedResponse = null;

        for (var i = 0; i < _ajaxResponseProviders.length; i++) {
            var xhrRequestResponder = _ajaxResponseProviders[i];
            var emulatedResponseTmp = xhrRequestResponder(hookedRequest);
            if (emulatedResponseTmp instanceof EmulatedResponse) {
                emulatedResponse = emulatedResponseTmp;
                break;
            }
        }
        return emulatedResponse;
    }

    /**
     * @callback AjaxResponseProvider
     * @param {HookedRequest} hookedRequest
     * @return {EmulatedResponse}
     */

    /**
     * Permet d'enregistrer un callback qui sera notifié pour chaque requête AJAX envoyée.
     * @param {AjaxResponseProvider} ajaxResponseProvider
     */
    this.registerAjaxResponseProvider = function (ajaxResponseProvider) {
        _ajaxResponseProviders.push(ajaxResponseProvider);
    };

    /**
     * @param {HookedRequest} hookedRequest
     * @return {EmulatedResponse}
     */
    this.getRequestAnswer = function (hookedRequest) {
        var emulatedResponse = _tryGetResponseFromResponders(hookedRequest);

        //décommenter les lignes ci-dessous pour débogger les requêtes sans réponses
        //if (typeof console != "undefined") {
        //    if (emulatedResponse == null) {
        //        console.warn("NO RESPONSE FOUND FOR HOOKED XHR :");
        //        console.log(hookedRequest);
        //    } else {
        //        console.info("Hooked XHR emulated response OK");
        //    }
        //}

        return emulatedResponse;
    }

})();


function EmulatedResponse() {

    /**
     * @type {number}
     */
    this.status = 200;

    /**
     * @type {string}
     */
    this.statusText = "";
    /**
     * @type {string|Object}
     */
    this.response = "";

    /**
     @type {string}
     @const
     */
    this.responseText = "";

    /**
     @type {Document}
     */
    this.responseXML = 0;

    /**
     * @type {{}}
     */
    this.responseHeaders = {};
}

function HookedRequest() {

    /**
     * L'url complète de la requête (avec potentiellement des arguments)
     * @type {string}
     */
    this.url;

    /**
     * La méthode (POST , GET, ...)
     * @type {string}
     */
    this.method;

    /**
     * Les données émises (argument de la méthode send)
     * @type {String|ArrayBuffer|Blob|Document|FormData}
     */
    this.data;

    /**
     * @type {string}
     */
    this.user;

    /**
     * @type {string}
     */
    this.password;

    /**
     * @type {{}}
     */
    this.requestHeaders;
}
