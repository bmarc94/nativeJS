var CurrencyTextField = TextField.extend({
    init: function (options) {
        this.base.init.call(this, options);
        this.decimalLength = isNaN(this.decimalLength) ? 2 : Math.abs(this.decimalLength);
        this.decimalMark = this.decimalMark ? this.decimalMark : ",";
        this.thousandsMark = this.thousandsMark ? this.thousandsMark : " ";
    },

    onBlur: function () {
        if (this.input.value != "") {
            this.value = this.input.value.replace(/\s/g, "").replace(",", ".");
            if (isNaN(this.value)) {
                this.input.value = "";
            } else {
                this._format();
                this.input.value = this.formatedValue;
            }
        }

        this.base.onBlur.apply(this);
    },

    _format: function () {
        this.formatedValue = this.value < 0 ? "-" : "";
        var interger = parseInt(Math.abs(this.value)) + "";
        var thLength = (thLength = interger.length) > 3 ? thLength % 3 : 0;

        this.formatedValue += thLength ? interger.substr(0, thLength) + this.thousandsMark : "";
        this.formatedValue += interger.substr(thLength).replace(/(\d{3})(?=\d)/g, "$1" + this.thousandsMark);
        this.formatedValue += this.decimalLength ? this.decimalMark + Math.abs(this.value - interger).toFixed(this.decimalLength).slice(2) : "";
    }
})