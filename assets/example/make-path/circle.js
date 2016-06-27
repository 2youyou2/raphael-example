cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');

        path.selected = true;

        path.circle(0, 0, 100);

        path.makePath();
    },
});
