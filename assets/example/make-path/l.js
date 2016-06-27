cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        var path = this.addComponent('R.path');
        
        path.selected = true;
        
        path.M(-50, -100);
        path.L(50, -100);
        path.L(0, 100);
        path.Z();

        path.makePath();
    },
});
