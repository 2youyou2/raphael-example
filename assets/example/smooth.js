cc.Class({
    extends: cc.Component,

    onLoad: function () {
        var path = this.addComponent('ga.path');

        path.lineWidth = 4;
        path.selected = true;

        path.rect(-100, -100, 200, 200);

        path.makePath();

        path.smooth();
    }
});
