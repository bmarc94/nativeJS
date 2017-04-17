window.onload = function () {

    var commonTF = new TextField({
        label:"commun : "
    });

    commonTF.renderIn('common');

    var mandatoryTF = new TextField({
        label:"common required : ",
        mandatory: true
    });

    mandatoryTF.renderIn('mandatory');

    var currencyTF = new CurrencyTextField({
        label:"Currency : "
    });

    currencyTF.renderIn('currency');

    var mandatoryCurrencyTF = new CurrencyTextField({
        label:"Required Currency : ",
        mandatory: true
    });

    mandatoryCurrencyTF.renderIn('currencyMandatory');
	
	console.log (mandatoryCurrencyTF instanceof TextField);
	console.log (mandatoryCurrencyTF instanceof HTMLComponent);
}
