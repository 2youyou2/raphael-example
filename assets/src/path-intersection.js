'use strict';

var bezlen = require('./path-length').bezlen;

var mmax = Math.max;
var mmin = Math.min;
var PI   = Math.PI;
var abs  = Math.abs;
var math = Math;
var pow  = Math.pow;

function findDotAtSegment  (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
    var t1 = 1 - t;
    return {
        x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
        y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
    };
}

function findDotsAtSegment (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
    var t1 = 1 - t,
        t13 = pow(t1, 3),
        t12 = pow(t1, 2),
        t2 = t * t,
        t3 = t2 * t,
        x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
        y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
        mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
        my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
        nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
        ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
        ax = t1 * p1x + t * c1x,
        ay = t1 * p1y + t * c1y,
        cx = t1 * c2x + t * p2x,
        cy = t1 * c2y + t * p2y,
        alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
    (mx > nx || my < ny) && (alpha += 180);
    return {
        x: x,
        y: y,
        m: {x: mx, y: my},
        n: {x: nx, y: ny},
        start: {x: ax, y: ay},
        end: {x: cx, y: cy},
        alpha: alpha
    };
}

function curveDim (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
    var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
        b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
        c = p1x - c1x,
        t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
        t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
        y = [p1y, p2y],
        x = [p1x, p2x],
        dot;
    abs(t1) > '1e12' && (t1 = .5);
    abs(t2) > '1e12' && (t2 = .5);
    if (t1 > 0 && t1 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
        x.push(dot.x);
        y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
        x.push(dot.x);
        y.push(dot.y);
    }
    a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
    b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
    c = p1y - c1y;
    t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
    t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
    abs(t1) > '1e12' && (t1 = .5);
    abs(t2) > '1e12' && (t2 = .5);
    if (t1 > 0 && t1 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
        x.push(dot.x);
        y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
        dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
        x.push(dot.x);
        y.push(dot.y);
    }
    return {
        min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
        max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
    };
}

function isPointInsideBBox (bbox, x, y) {
    return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
}

function isBBoxIntersect (bbox1, bbox2) {
    var i = isPointInsideBBox;
    return i(bbox2, bbox1.x, bbox1.y)
        || i(bbox2, bbox1.x2, bbox1.y)
        || i(bbox2, bbox1.x, bbox1.y2)
        || i(bbox2, bbox1.x2, bbox1.y2)
        || i(bbox1, bbox2.x, bbox2.y)
        || i(bbox1, bbox2.x2, bbox2.y)
        || i(bbox1, bbox2.x, bbox2.y2)
        || i(bbox1, bbox2.x2, bbox2.y2)
        || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
        && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
};

function bezierBBox (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
    if (!Array.isArray(p1x)) {
        p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
    }
    var bbox = curveDim.apply(null, p1x);
    return {
        x: bbox.min.x,
        y: bbox.min.y,
        x2: bbox.max.x,
        y2: bbox.max.y,
        width: bbox.max.x - bbox.min.x,
        height: bbox.max.y - bbox.min.y
    };
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    if (
        mmax(x1, x2) < mmin(x3, x4) ||
        mmin(x1, x2) > mmax(x3, x4) ||
        mmax(y1, y2) < mmin(y3, y4) ||
        mmin(y1, y2) > mmax(y3, y4)
    ) {
        return;
    }
    var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
        ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (!denominator) {
        return;
    }
    var px = nx / denominator,
        py = ny / denominator,
        px2 = +px.toFixed(2),
        py2 = +py.toFixed(2);
    if (
        px2 < +mmin(x1, x2).toFixed(2) ||
        px2 > +mmax(x1, x2).toFixed(2) ||
        px2 < +mmin(x3, x4).toFixed(2) ||
        px2 > +mmax(x3, x4).toFixed(2) ||
        py2 < +mmin(y1, y2).toFixed(2) ||
        py2 > +mmax(y1, y2).toFixed(2) ||
        py2 < +mmin(y3, y4).toFixed(2) ||
        py2 > +mmax(y3, y4).toFixed(2)
    ) {
        return;
    }
    return {x: px, y: py};
}

function base3(t, p1, p2, p3, p4) {
    var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
        t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
    return t * t2 - 3 * p1 + 3 * p2;
}
function interHelper(bez1, bez2, justCheck) {
    var bbox1 = bezierBBox(bez1),
        bbox2 = bezierBBox(bez2);
    if (!isBBoxIntersect(bbox1, bbox2)) {
        return justCheck ? false : [];
    }

    var l1 = bezlen.apply(0, bez1),
        l2 = bezlen.apply(0, bez2),
        n1 = mmax(~~(l1 / 5), 1),
        n2 = mmax(~~(l2 / 5), 1),
        dots1 = [],
        dots2 = [],
        xy = {},
        res = [];
    for (var i = 0; i < n1 + 1; i++) {
        var p = findDotsAtSegment.apply(this, bez1.concat(i / n1));
        dots1.push({x: p.x, y: p.y, t: i / n1});
    }
    for (i = 0; i < n2 + 1; i++) {
        p = findDotsAtSegment.apply(this, bez2.concat(i / n2));
        dots2.push({x: p.x, y: p.y, t: i / n2});
    }
    for (i = 0; i < n1; i++) {
        for (var j = 0; j < n2; j++) {
            var di = dots1[i],
                di1 = dots1[i + 1],
                dj = dots2[j],
                dj1 = dots2[j + 1],
                ci = abs(di1.x - di.x) < .001 ? 'y' : 'x',
                cj = abs(dj1.x - dj.x) < .001 ? 'y' : 'x',
                is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
            if (is) {
                if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                    continue;
                }
                xy[is.x.toFixed(4)] = is.y.toFixed(4);
                var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                    t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                    if (justCheck) {
                        return true;
                    } else {
                        res.push({
                            x: is.x,
                            y: is.y,
                            t1: mmin(t1, 1),
                            t2: mmin(t2, 1)
                        });
                    }
                }
            }
        }
    }
    return justCheck ? false : res;
}

module.exports = {
    findDotAtSegment: findDotAtSegment,
    findDotsAtSegment: findDotsAtSegment
};
