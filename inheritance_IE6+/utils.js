
/**************
 * HIERARCHY  *
 **************/

var BaseClass = function () {
    this.init && this.init.apply(this, arguments);
};

BaseClass.extend = function (childPrototype) {
    var parent = this;
    var child = function () {
        return parent.apply(this, arguments);
    };

    child.extend = parent.extend;

    var ProtoSubstitute = function () { };
    ProtoSubstitute.prototype = parent.prototype;
    child.prototype = new ProtoSubstitute;
    child.prototype.base = new ProtoSubstitute;


    for (var key in childPrototype) {
        child.prototype[key] = childPrototype[key];
    }

    return child;
};





