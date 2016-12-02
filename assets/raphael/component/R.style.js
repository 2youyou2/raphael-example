
var LineJoin = cc.Graphics.LineJoin;
var LineCap = cc.Graphics.LineCap;

var Style = {
    properties: {
        _lineWidth: undefined,
        _strokeColor: undefined,
        _fillColor: undefined,
        _lineJoin: undefined,
        _lineCap: undefined,
        _miterLimit: undefined,

        _dashOffset: undefined,
        _dashArray: undefined,

        lineWidth: {
            get: function () {
                return this._lineWidth || 1;
            },
            set: function (value) {
                this._lineWidth = value;
                this._dirty = true;
            }
        },

        lineJoin: {
            get: function () {
                return this._lineJoin || LineJoin.MITER;
            },
            set: function (value) {
                this._lineJoin = value;
                this._dirty = true;
            },
            type: LineJoin
        },

        lineCap: {
            get: function () {
                return this._lineCap || LineCap.BUTT;
            },
            set: function (value) {
                this._lineCap = value;
                this._dirty = true;
            },
            type: LineCap
        },

        strokeColor: {
            get: function () {
                return this._strokeColor || cc.Color.BLACK;
            },
            set: function (value) {
                this._strokeColor = value;
                this._dirty = true;
            }
        },

        fillColor: {
            get: function () {
                return this._fillColor || cc.Color.WHITE;
            },
            set: function (value) {
                this._fillColor = value;
                this._dirty = true;
            }
        },

        miterLimit: {
            get: function () {
                return this._miterLimit || 10;
            },
            set: function (value) {
                this._miterLimit = value;
                this._dirty = true;
            }
        },

        dashOffset: {
            get: function () {
                return this._dashOffset || 0;
            },
            set: function (value) {
                if (this._dashOffset === value) {
                    return;
                }
                this._dashOffset = value;
                this._dirty = true;
            }
        },
        dashArray: {
            get: function () {
                return this._dashArray || [];
            },
            set: function (value) {
                if (!Array.isArray(value)) {
                    return;
                }
                this._dashArray = value;
                this._dirty = true;
            }
        },
    },

    getStyled: function (type) {
        var value = this['_' + type];
        
        if (value === 'inherit' || value === undefined) {
            if (this.parent) value = this.parent.getStyled(type);
            else value = this[type];
        }

        return value;
    },

    getStyledColor: function (type) {
        var value = this.getStyled(type);

        if (value === 'none' || !value) {
            value = null;
        }
        else if (typeof value === 'string') {
            value = cc.hexToColor(value);
        }

        return value;
    },

    _applyStyle: function () {
        var ctx = this.ctx;
        ctx.lineWidth = this.getStyled('lineWidth');
        ctx.lineJoin = this.getStyled('lineJoin');
        ctx.lineCap = this.getStyled('lineCap');

        var strokeColor = this.getStyledColor('strokeColor');
        var fillColor = this.getStyledColor('fillColor');

        if (strokeColor)
            ctx.strokeColor = strokeColor;
        if (fillColor)
            ctx.fillColor = fillColor;
    }
};

module.exports = Style;
