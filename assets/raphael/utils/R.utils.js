function mixin (dst, src, addon) {
    for (let key in src) {
        if (!addon || (addon && !dst[key])) {
            if (typeof src[key] === 'object') {
                dst[key] = {};
                for (let subKey in src[key]) {
                    dst[key][subKey] = src[key][subKey];
                }
            }
            else {
                dst[key] = src[key];
            }
        }
    }
}

module.exports = {
    defineClass: function () {
        var defines = {
            properties: {},
            statics: {}
        };

        for (var i = 0, ii = arguments.length; i < ii; i++) {
            var d = arguments[i];

            mixin(defines.properties, d.properties);
            mixin(defines.statics, d.statics);
            mixin(defines, d, true);
        }

        return defines;
    },

    tesselateBezier: require('./R.tesselateBezier'),
    path2curve: require('R.curve').path2curve,
    drawDashPoints: require('R.dash').drawDashPoints
};
