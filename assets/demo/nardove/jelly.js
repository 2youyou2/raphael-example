
var Tentacle = require('./tentacle');

// Colours courtesy of deliquescence:
// http://www.colourlovers.com/palette/38473/boy_meets_girl
var colours = [{s:'#1C4347', f:'#49ACBB'},
               {s:'#1b3b3a', f:'#61cac8'},
               {s:'#2d393f', f:'#88a5b3'},
               {s:'#422b3a', f:'#b0809e'},
               {s:'#5b263a', f:'#d85c8a'},
               {s:'#580c23', f:'#ff3775'},
               {s:'#681635', f:'#EB1962'}];

cc.Class({
    extends: cc.Component,

    properties: {
        pathSides: 14,
    },

    // use this for initialization
    onLoad: function () {
    },

    init: function (group, id) {

        this.group = group;
        this.path = group.addPath();
        this.pathRadius = Math.random() * 10 + 40;
        this.pathPoints = [this.pathSides];
        this.pathPointsNormals = [this.pathSides];

        this.location = cc.v2(cc.winSize.width/2, cc.winSize.height/2);//cc.v2(-50, Math.random() * cc.winSize.height);
        this.velocity = cc.v2(0, 0);
        this.acceleration = cc.v2(0, 0);
        
        this.maxSpeed = Math.random() * 0.1 + 0.15;
        this.maxTravelSpeed = this.maxSpeed * 3.5;
        this.maxForce = 0.2;
        this.wanderTheta = 0;
        this.numTentacles = 0;
        this.startTentacles = -1;

        var theta = (Math.PI * 2) / this.pathSides;

        for (var i = 0; i < this.pathSides; i++) {
            var angle = theta * i;
            var x = Math.cos(angle) * this.pathRadius * 0.7;
            var y = Math.sin(angle) * this.pathRadius;
            
            if (angle > Math.PI && angle < (Math.PI*2)) {
                y -= Math.sin(angle) * (this.pathRadius * 0.6);
                if (this.startTentacles === -1) {
                    this.startTentacles = i;
                }
                this.numTentacles++;
            }

            var point = cc.v2(x, y);

            this.pathPoints[i] = point;
            this.pathPointsNormals[i] = point.normalize();
        }

        this.originalPoints = this.pathPoints.map(function (point) {
            return point.clone();
        });
        this.path.points(this.pathPoints, true);
        this.path.smooth();

        this.path.lineWidth = 5;
        this.path.lineColor = cc.hexToColor(colours[id].s);
        this.path.fillColor = cc.hexToColor(colours[id].f);


        // Create tentacles
        this.tentacles = [];
        for (var t = 0; t < this.numTentacles; t++) {
            this.tentacles[t] = new Tentacle();
            this.tentacles[t].init(group, 7, 4);
            this.tentacles[t].path.lineColor = this.path.lineColor;
            this.tentacles[t].path.lineWidth = this.path.lineWidth;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (time, count) {
        this.lastLocation = this.location.clone();

        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        
        var sep = this.velocity.mag() / this.maxTravelSpeed;
        if (sep > 1) {
            this.velocity.x /= sep;
            this.velocity.y /= sep;
        }

        this.location.x += this.velocity.x;
        this.location.y += this.velocity.y;

        this.acceleration.x = this.acceleration.y = 0;

        this.path.position = this.location.clone();

        // Rotation alignment
        var orientation = -(Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2);
        this.path.rotation = cc.radiansToDegrees(orientation);

        // Expansion Contraction
        for (var i = 0; i < this.pathSides; i++) {
            var segmentPoint = this.pathPoints[i];
            var sineSeed = -((count * this.maxSpeed) + (this.originalPoints[i].y * 0.0375));
            var normalRotatedPoint = this.pathPointsNormals[i];
            
            segmentPoint.x += normalRotatedPoint.x * Math.sin(sineSeed);
            segmentPoint.y += normalRotatedPoint.y * Math.sin(sineSeed);
        }

        this.path.points(this.pathPoints, true);
        this.path.smooth();

        this.wander();
        this.checkBounds();

        for (var t = 0; t < this.numTentacles; t++) {
            this.tentacles[t].anchor.x = this.pathPoints[this.startTentacles+t].x;
            this.tentacles[t].anchor.y = this.pathPoints[this.startTentacles+t].y;
            this.tentacles[t].path.position = this.path.position;
            this.tentacles[t].path.rotation = this.path.rotation;
            this.tentacles[t].update();
        }

    },

    steer: function(target, slowdown) {
        var steer;
        var desired = cc.v2(target.x - this.location.x, target.y - this.location.y);
        var dist = desired.mag();
        
        if (dist > 0) {
            if (slowdown && dist < 100) {
                desired.divSelf((this.maxTravelSpeed) * (dist / 100) / dist);
            }
            else {
                desired.length = this.maxTravelSpeed;
                desired.divSelf(this.maxTravelSpeed / dist);
            }
            
            steer = cc.v2(desired.x - this.velocity.x, desired.y - this.velocity.y);
            steer.length = Math.min(this.maxForce, steer.length);
        }
        else {
            steer = cc.v2(0, 0);
        }
        return steer;
    },


    seek: function(target) {
        var steer = this.steer(target, false);
        this.acceleration.x += steer.x;
        this.acceleration.y += steer.y;
    },


    wander: function() {
        var wanderR = 5;
        var wanderD = 100;
        var change = 0.05;
        
        this.wanderTheta += Math.random() * (change * 2) - change;
        
        var circleLocation = this.velocity.clone();
        if (circleLocation.x !== 0 && circleLocation.y !== 0) {
            circleLocation = circleLocation.normalize();
        }
        circleLocation.x *= wanderD;
        circleLocation.y *= wanderD;
        circleLocation.x += this.location.x;
        circleLocation.y += this.location.y;
        
        var circleOffset = cc.v2(wanderR * Math.cos(this.wanderTheta), wanderR * Math.sin(this.wanderTheta));
        
        var target = cc.v2(circleLocation.x + circleOffset.x, circleLocation.y + circleOffset.y);
        
        this.seek(target);
    },


    checkBounds: function() {
        var offset = 60;

        if (this.location.x < -offset) {
            this.location.x = cc.winSize.width + offset;
        }
        if (this.location.x > cc.winSize.width + offset) {
            this.location.x = -offset;
        }
        if (this.location.y < -offset) {
            this.location.y = cc.winSize.height + offset;
        }
        if (this.location.y > cc.winSize.height + offset) {
            this.location.y = -offset;
        }
    }
});
