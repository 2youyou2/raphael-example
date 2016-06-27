cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');

        path.selected = true;
        path.fillColor = null;

        path.M(-200, 0);
        path.Q(-100, 200, 0,0);
        path.T(200,0);

        path.makePath();
    },
});
