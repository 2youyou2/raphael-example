cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');

        path.selected = true;
        path.fillColor = 'none';

        path.M(-100, 0);
        path.C(-100, -100, 50,-100, 50,0);
        path.S(200,100, 200,0);

        path.makePath();
    },
});
