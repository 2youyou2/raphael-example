var Jelly = require('./jelly');

cc.Class({
    extends: cc.Component,

    properties: {
        addJellyTimer: 5,
        jellyCounter: 0,
        numJellies: 7,
    },

    // use this for initialization
    onLoad: function () {
        this.jellies = [];

        this.time = this.addJellyTimer;
        this.count = 0;

        this.group = this.addComponent('R.group');
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.time += dt;
        this.count ++;

        if (this.time >= this.addJellyTimer && this.jellyCounter < this.numJellies) {

            var jelly = new Jelly();
            jelly.init(this.group, this.jellyCounter);
            this.jellies.push(jelly);

            this.jellyCounter ++;
            this.time = 0;
        }

        for (var i = 0, ii = this.jellies.length; i < ii; i++) {
            var jelly = this.jellies[i];
            jelly.update(this.time, this.count);
        }
    },
});
