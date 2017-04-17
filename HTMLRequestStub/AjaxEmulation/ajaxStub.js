
/*Argument 1 :
Tableau des noms d'arguments d'URL à ignorer lors de la recherche du match 

Arguments 2 : 
Tableau des chemins des objets JSON postés à ignorer lors de la recherche du match*/

var harMatcher = new HARMatcher(["_", "load_time", "total_rendering_time", "window_load_event_time", "STATUS_CURRENT_IND"], ["token"]);

harMatcher.initialize(HAR);
harMatcher.minimumMatchThreshold = 95;

var emulatedResponseResourcePathFixer = new EmulatedResponseResourcePathFixer("appli");

ajaxRequestsHub.registerAjaxResponseProvider(function (hookedRequest) {

    var emulatedResponse = harMatcher.createResponseOnMatch(hookedRequest);

    emulatedResponseResourcePathFixer.fix(emulatedResponse);

    return emulatedResponse;

});
