
const inputToRGB = require('../lib/tinycolor').inputToRGB;

cc.Class({
    extends: cc.Component,

    onLoad: function () {
        var path = this.addComponent('R.path');
        path.strokeColor = cc.Color.WHITE;
        path.lineWidth = 4;
        path.fillColor = null;

        path.offset = cc.v2(-25, -30);
        path.scale = cc.v2(4, -4);

        var pathStrings = _Demo.paths;

        var i = 0;
        var duration = 2;

        function animate () {
            var pathString1 = pathStrings[i];
            i = (i + 1) >= pathStrings.length ? 0 : (i + 1);
            var pathString2 = pathStrings[i];

            path.animate(pathString1, pathString2, duration);
        }
        
        animate();
        setInterval(animate, duration * 1.5 * 1000);
    }
});
