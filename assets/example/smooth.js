cc.Class({
    extends: cc.Component,

    onLoad: function () {
        var path = this.addComponent('R.path');

        path.lineWidth = 4;
        path.showHandles = true;

        path.rect(-100, -100, 200, 200);

        path.makePath();

        path.smooth();
    }
});
