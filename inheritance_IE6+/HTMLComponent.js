var HTMLComponent = BaseClass.extend({
	init: function(tagName){
		this.createEl(tagName);
	},
    
	createEl: function(tagName){
		this.el = document.createElement(tagName);
	},

    initOptions: function (options) {
        for (var i in options) {
            this[i] = options[i];
        }
    },

    renderIn: function(idString){
        var parentEl = document.getElementById(idString);
        parentEl.appendChild(this.el);
    },
    
    buildNode: function (tagName) {
        throw new Error('_buildNode needs to be implemented')
    },

    append: function (child) {
        this.el.appendChild(child.el);
    },

    addEventListener: (function () {
        if (document.all) {
            return function (eventString, callback, capture) {
                this.el.attachEvent('on' + eventString, callback, callback)
            }
        } else {
            return function (eventString, callback, capture) {
                this.el.addEventListener(eventString, callback, capture || false)
            }
        }
    })()
})