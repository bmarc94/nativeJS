- AJouter AjaxEmulation dans le dossier commun
- D�clarer  la totalit� des fichiers en premier + le HAR.js converti
NB AjaxStub.js et HAR.js sont diff�rent en fonction de la page. (Peut �tre moins vrai pour ajaxStub)

exemple:
<SCRIPT type="text/javascript" src="HAR.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/HARMatcher.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/ajaxRequestsHub.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/EmulatedResponseResourcePathFixer.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/XMLHttpRequestStub.js"></SCRIPT>

<SCRIPT type="text/javascript" src="ajaxStub.js"></SCRIPT>