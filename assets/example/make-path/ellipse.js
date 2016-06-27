cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');

        path.selected = true;

        path.ellipse(0, 0, 100, 50);

        path.makePath();
    },
});
