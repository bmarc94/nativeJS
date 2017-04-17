var OriginalXMLHttpRequest = XMLHttpRequest;
function XMLHttpRequest() {
    var _self = this;

    var _hookedEventListeners = {
        loadCallbacks: [],
        errorCallbacks: [],
        loadendCallbacks: []
    };

    var _requestHeaders = {};
    var _responseHeaders = {};
    var _openMethodHookedArguments = {
        /**
         * @type {string}
         */
        method: null,
        /**
         * @type {string}
         */
        url: null,
        /**
         * @type {boolean}
         */
        async: null,
        /**
         * @type {string}
         */
        user: null,
        /**
         * @type {string}
         */
        password: null
    };

    this.readyState = 0;
    this.status = 0;
    this.statusText = "";
    this.response = "";
    this.responseText = "";
    this.responseXML = null;

    /**
     * @param {string} eventName
     * @param {function} callback
     * @param {boolean} useCapture
     */
    this.addEventListener = function (eventName, callback, useCapture) {
        if (eventName == "load") {
            _hookedEventListeners.loadCallbacks.push(callback);
        } else if (eventName == "error") {
            _hookedEventListeners.errorCallbacks.push(callback);
        } else if (eventName == "loadend") {
            _hookedEventListeners.loadendCallbacks.push(callback);
        } else {
            throw new Error("Unsupported event \"" + eventName + "\" in fake XMLHttpRequest");
        }
    };

    /**
     * @param {string} method
     * @param {string} url
     * @param {boolean} [async]
     * @param {string} [user]
     * @param {string} [password]
     */
    this.open = function (method, url, async, user, password) {
        _openMethodHookedArguments.method = method;
        _openMethodHookedArguments.url = url;
        _openMethodHookedArguments.async = async;
        _openMethodHookedArguments.user = user;
        _openMethodHookedArguments.password = password;
    };

    /**
     * @param {String|ArrayBuffer|Blob|Document|FormData} data
     */
    this.send = function (data) {
        if (_openMethodHookedArguments.async) {
            setTimeout(function () {
                _emulateResponse(data);
            }, 100);
        } else {
            _emulateResponse(data);
        }
    };

    /**
     * @param {string} header
     * @param {string} value
     */
    this.setRequestHeader = function (header, value) {
        _requestHeaders[header] = value;
    };

    /**
     * @param {string} headerName
     * @return {string}
     */
    this.getResponseHeader = function (headerName) {
        return _responseHeaders[headerName];
    };

    /**
     * @return {{}}
     */
    this.getAllResponseHeaders = function () {
    	var output = "";
    	for(var fieldName in _responseHeaders){
    		if(_responseHeaders.hasOwnProperty(fieldName)){
    			output += fieldName + ": " + _responseHeaders[fieldName] + "\n";
    		}
    	}
    	 return output;
    };

    function _notifyListeners(eventListenerCallbacks) {
        for (var i = 0; i < eventListenerCallbacks.length; i++) {
            eventListenerCallbacks[i].call(_self);
        }
    }

    function _emulateResponse(sentData) {

        var hookedRequest = new HookedRequest();
        hookedRequest.url = _openMethodHookedArguments.url;
        hookedRequest.method = _openMethodHookedArguments.method;
        hookedRequest.user = _openMethodHookedArguments.user;
        hookedRequest.password = _openMethodHookedArguments.password;
        hookedRequest.requestHeaders = _requestHeaders;
        hookedRequest.data = sentData;

        var emulatedResponse = ajaxRequestsHub.getRequestAnswer(hookedRequest);

        _self.readyState = 4;

        if (emulatedResponse != null) {
            _self.status = emulatedResponse.status;
            _self.statusText = emulatedResponse.statusText;
            _self.responseText = emulatedResponse.responseText;
            _self.responseXML = emulatedResponse.responseXML;
            _self.response = emulatedResponse.response;
            _responseHeaders = emulatedResponse.responseHeaders;
            _notifyListeners(_hookedEventListeners.loadCallbacks);
        } else {
            _self.status = 404;
            _self.statusText = "No emulated response";
            _self.responseText = "";
            _self.responseXML = null;
            _self.response = "";
            _notifyListeners(_hookedEventListeners.errorCallbacks);
        }

        if (_self.onreadystatechange) {
            _self.onreadystatechange();
        }

        _notifyListeners(_hookedEventListeners.loadendCallbacks);
    }
}