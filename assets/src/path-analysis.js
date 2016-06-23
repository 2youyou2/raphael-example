
var tessTol = 0.25;

var abs = Math.abs;
var sqrt = Math.sqrt;

function tesselateBezier (x1, y1, x2, y2, x3, y3, x4, y4, level, points) {
    var x12, y12, x23, y23, x34, y34, x123, y123, x234, y234, x1234, y1234;
    var dx, dy, d2, d3;

    if (level > 10) return;

    x12 = (x1 + x2) * 0.5;
    y12 = (y1 + y2) * 0.5;
    x23 = (x2 + x3) * 0.5;
    y23 = (y2 + y3) * 0.5;
    x34 = (x3 + x4) * 0.5;
    y34 = (y3 + y4) * 0.5;
    x123 = (x12 + x23) * 0.5;
    y123 = (y12 + y23) * 0.5;

    dx = x4 - x1;
    dy = y4 - y1;
    d2 = abs((x2 - x4) * dy - (y2 - y4) * dx);
    d3 = abs((x3 - x4) * dy - (y3 - y4) * dx);

    if ((d2 + d3) * (d2 + d3) < tessTol * (dx * dx + dy * dy)) {
        points.push(x4);
        points.push(y4);
        return;
    }

    x234 = (x23 + x34) * 0.5;
    y234 = (y23 + y34) * 0.5;
    x1234 = (x123 + x234) * 0.5;
    y1234 = (y123 + y234) * 0.5;

    tesselateBezier(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1, points);
    tesselateBezier(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1, points);
}


function analysisPath(path) {
    var cmds = path._commands;
    var points = [];
    var x, y;

    var subPoints;
    for (var i = 0, ii = cmds.length; i < ii; i++) {
        var cmd = cmds[i];
        var c = cmd[0];

        cmd = path.transformCommand(cmd);
        
        if (c === 'M') {
            subPoints = [];
            points.push(subPoints);

            x = cmd[0];
            y = cmd[1];

            subPoints.push(x);
            subPoints.push(y);
        }
        else if (c === 'C' && x !== undefined && y !== undefined) {
            tesselateBezier(x, y, cmd[0], cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], 0, subPoints);

            x = cmd[4];
            y = cmd[5];
        }
    }

    cmds.points = points;

    var totalLength = 0;
    var lastx, lasty;
    var dx, dy;

    for (var i = 0, ii = points.length / 2; i < ii; i++) {
        subPoints = points[i];

        for (var j = 0, jj = subPoints.length / 2; j < jj; j++) {
            x = subPoints[j*2];
            y = subPoints[j*2 + 1];

            if (j === 0) {
                lastx = x;
                lasty = y;
            }

            dx = x - lastx;
            dy = y - lasty;

            totalLength += sqrt(dx*dx + dy*dy);

            lastx = x;
            lasty = y;
        }
    }

    cmds.totalLength = totalLength;
}

module.exports = {
    analysisPath: analysisPath
};
