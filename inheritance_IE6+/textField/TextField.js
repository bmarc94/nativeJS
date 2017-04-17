var TextField = HTMLComponent.extend({
    init: function (options) {
        var self = this;

        this.createEl('SPAN');
        this.initOptions(options || {});
        this.buildNode();

        this.input = this.inputComponent.el; 

        this.inputComponent.addEventListener('blur', function(){
            self.onBlur();
        });
    },
    
    buildNode:function(){
        this.inputComponent = new HTMLComponent('input');
        this.labelComponent = new HTMLComponent('label');
        this.labelComponent.el.innerHTML = this.label || "";
        this.append(this.labelComponent);
        this.append(this.inputComponent);
    },
    
    onBlur: function () {
        if (this.mandatory) {
            if (!this.input.value) {
                this.input.style.background = "pink";
            } else {
                this.input.style.background = "white";
            }
        }
    }
})