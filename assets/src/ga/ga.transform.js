
function Transform () {
    this._scale = cc.v2(1, 1);
    this._position = cc.v2(0,0);
    this._rotation = 0;
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._transformDirty = false;
}

cc.js.mixin(Transform.prototype, {
    getPosition: function () {
        return this._position;
    },
    setPosition: function (value) {
        if (this._position.equals(value)) {
            return;
        }
        this._position = value;
        this._transformDirty = true;
    },

    getScale: function () {
        return this._scale;
    },
    setScale: function (value) {
        if (this._scale.equals(value)) {
            return;
        }
        this._scale = value;
        this._transformDirty = true;
    },

    getRotation: function () {
        return this._rotation;
    },
    setRotation: function (value) {
        if (this._rotation === value) {
            return;
        }
        this._rotation = value;
        this._transformDirty = true;
    },

    upateTransform: function () {

    }
});


module.exports = Transform;
