cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        var group = this.addComponent('R.group');

        // group.scale = cc.v2(5, 5);

        cc.loader.loadRes('svg/tiger', (err, txt) => {
            if (err) {
                cc.error(err.toString());
                return;
            }
            
            group.loadSvg(txt);
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
