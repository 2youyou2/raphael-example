
cc.Class({
    extends: cc.Component,

    properties: {
        duration: 2
    },

    onLoad: function () {
        let path = this.addComponent('R.path');
        path.strokeColor = cc.Color.WHITE;
        path.lineWidth = 4;
        path.fillColor = 'none';

        path.scale = cc.v2(4, -4);

        this.path = path;

        let pathStrings = _Demo.paths;

        let i = 0;
        let self = this;

        function animate () {
            let pathString = pathStrings[i];
            path.path(pathString);

            path.center(0, 0);

            i = ++i % pathStrings.length;

            self.time = 0;
            self.pathLength = path.getTotalLength();

            path.dashOffset = self.pathLength;
            path.dashArray = [self.pathLength];
        }
        
        animate();
        setInterval(animate, this.duration * 1.5 * 1000);
    },

    update: function (dt) {
        this.time += dt;

        let percent = this.time / this.duration;

        if (percent > 1) {
            return;
        }

        this.path.dashOffset = this.pathLength * (1 - percent);
        this.path._dirty = true;
    }
});
