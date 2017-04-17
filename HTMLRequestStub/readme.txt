- AJouter AjaxEmulation dans le dossier commun
- Déclarer  la totalité des fichiers en premier + le HAR.js converti
NB AjaxStub.js et HAR.js sont différent en fonction de la page. (Peut être moins vrai pour ajaxStub)

exemple:
<SCRIPT type="text/javascript" src="HAR.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/HARMatcher.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/ajaxRequestsHub.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/EmulatedResponseResourcePathFixer.js"></SCRIPT>
<SCRIPT type="text/javascript" src="../../../environnements/appli/common/AjaxEmulation/XMLHttpRequestStub.js"></SCRIPT>

<SCRIPT type="text/javascript" src="ajaxStub.js"></SCRIPT>