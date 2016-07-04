cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function(group, numSegments, length) {
        this.path = group.addPath();
        this.path.fillColor = 'none';
        this.numSegments = numSegments;
        this.segmentLength = Math.random() * 1 + length - 1;
        
        this.points = [];
        for (var i = 0; i < this.numSegments; i++) {
            this.points.push(cc.v2(0, i * this.segmentLength));
        }
        
        this.path.lineCap = cc.Graphics.LineCap.ROUND;
        
        this.anchor = this.points[0];
    },

    // called every frame, uncomment this function to activate update callback
    update: function () {
        this.points[1].x = this.anchor.x;
        this.points[1].y = this.anchor.y - 1;
        
        for (var i = 2; i < this.numSegments; i++) {
            var px = this.points[i].x - this.points[i-2].x;
            var py = this.points[i].y - this.points[i-2].y;
            var pt = cc.v2(px, py);
            var len = pt.mag();
            
            if (len > 0.0) {
                this.points[i].x = this.points[i-1].x + (pt.x * this.segmentLength) / len;
                this.points[i].y = this.points[i-1].y + (pt.y * this.segmentLength) / len;
            }
        }

        this.path.points(this.points);
    },
});