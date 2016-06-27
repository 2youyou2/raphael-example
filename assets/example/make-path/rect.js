cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');

        path.rect(-150, -150, 300, 200);

        path.makePath();
    },
});
