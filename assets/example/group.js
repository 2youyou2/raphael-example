cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var group = this.addComponent('ga.group');

        var path = group.addPath();
        path.rect(-100, -100, 100, 100);
        path.makePath();

        path = group.addPath();
        path.circle(50, 50, 50, 50);
        path.makePath();
    },
});
