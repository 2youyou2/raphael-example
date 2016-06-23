var Path = require('./ga.path');

cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        this.paths = [];

        if (!this.ctx) {
            this.ctx = new cc.GraphicsNode();
            this.node._sgNode.addChild(this.ctx);
        }
    },

    addPath: function () {
        var path = new Path();
        path.init(this);

        this.paths.push(path);

        return path;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this._dirty) return;

        var paths = this.paths;
        for (var i = 0, ii = paths.length; i < ii; i++) {
            var path = paths[i];
            path.update(dt);
        }

        this._dirty = true;
    },
});
