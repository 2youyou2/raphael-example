module.exports = {

    ////////////////////////////////////////////////////
    animate: function (pathString, pathString2, duration, animating) {
        var pathes = R.utils.path2curve(pathString, pathString2),
            fromPath = pathes[0],
            toPath = pathes[1];

        var diff = [];
        for (var i = 0, ii = fromPath.length; i < ii; i++) {
            diff[i] = [0];
            for (var j = 1, jj = fromPath[i].length; j < jj; j++) {
                diff[i][j] = (toPath[i][j] - fromPath[i][j]) / duration;
            }
        }

        this._time = 0;
        this._duration = duration;

        this._animateDiff = diff;
        this._animating = typeof animating === 'undefined' ? true : animating;

        this._fromPath = fromPath;
        this._toPath = toPath;

        return diff;
    },

    _stepAnimate: function (time) {
        var diff = this._animateDiff;
        var duration = this._duration;
        var fromPath = this._fromPath;

        var pos = time / duration;

        if (pos > 1) pos = 1;

        var now = [];
        for (var i = 0, ii = fromPath.length; i < ii; i++) {
            now[i] = [fromPath[i][0]];
            for (var j = 1, jj = fromPath[i].length; j < jj; j++) {
                now[i][j] = +fromPath[i][j] + pos * duration * diff[i][j];
            }
        }

        this._dirty = true;
        this._commands = now;

        if (pos >= 1) {
            this._animating = false;
            this._fromPath = null;
            this._toPath = null;
        }
    },

    _updateAnimate: function (dt) {
        if (this._animating) {
            this._time += dt;
            this._stepAnimate(this._time);
        }
    }
};
