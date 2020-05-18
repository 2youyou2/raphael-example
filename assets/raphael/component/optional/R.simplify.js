var EPSILON = 1e-12;
var TOLERANCE = 1e-6;

var Fitter = {
    fit: function (path, error) {
        this.commands = [];
        this.error = error || 10;

        var points = this.points = [];
        path._commands.forEach( function (cmd) {
            var c = cmd[0];

            if (c === 'M') {
                points.push( cc.v2(cmd[1], cmd[2]) );
            }
            else if(c === 'C') {
                points.push( cc.v2(cmd[5], cmd[6]) );
            }
        });


        var length = points.length;

        if (length > 1) {
            this.fitCubic(0, length - 1,
                // Left Tangent
                points[1].sub(points[0]).normalize(),
                // Right Tangent
                points[length - 2].sub(points[length - 1]).normalize());
        }

        return this.commands;
    },

    // Fit a Bezier curve to a (sub)set of digitized points
    fitCubic: function (first, last, tan1, tan2) {
        //  Use heuristic if region only has two points in it
        if (last - first === 1) {
            var pt1 = this.points[first],
                pt2 = this.points[last],
                dist = pt1.sub(pt2).mag() / 3;
            this.addCurve([pt1, pt1.add(tan1.normalize().mulSelf(dist)),
                    pt2.add(tan2.normalize().mulSelf(dist)), pt2]);
            return;
        }
        // Parameterize points, and attempt to fit curve
        var uPrime = this.chordLengthParameterize(first, last),
            maxError = Math.max(this.error, this.error * this.error),
            split,
            parametersInOrder = true;
        // Try 4 iterations
        for (var i = 0; i <= 4; i++) {
            var curve = this.generateBezier(first, last, uPrime, tan1, tan2);
            //  Find max deviation of points to fitted curve
            var max = this.findMaxError(first, last, curve, uPrime);
            if (max.error < this.error && parametersInOrder) {
                this.addCurve(curve);
                return;
            }
            split = max.index;
            // If error not too large, try reparameterization and iteration
            if (max.error >= maxError)
                break;
            parametersInOrder = this.reparameterize(first, last, uPrime, curve);
            maxError = max.error;
        }
        // Fitting failed -- split at max error point and fit recursively
        var V1 = this.points[split - 1].sub(this.points[split]),
            V2 = this.points[split].sub(this.points[split + 1]),
            tanCenter = V1.add(V2).div(2).normalize();
        this.fitCubic(first, split, tan1, tanCenter);
        this.fitCubic(split, last, tanCenter.mul(-1), tan2);
    },

    addCurve: function(curve) {
        if (this.commands.length === 0) {
            this.commands.push(['M', curve[0].x, curve[0].y]);
        }
        else {
            var cmd = this.commands[this.commands.length - 1];
            cmd[5] = curve[0].x;
            cmd[6] = curve[0].y;
        }

        this.commands.push(['C', curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y]);
    },

    // Use least-squares method to find Bezier control points for region.
    generateBezier: function(first, last, uPrime, tan1, tan2) {
        var epsilon = /*#=*/EPSILON,
            pt1 = this.points[first],
            pt2 = this.points[last],
            // Create the C and X matrices
            C = [[0, 0], [0, 0]],
            X = [0, 0];

        for (var i = 0, l = last - first + 1; i < l; i++) {
            var u = uPrime[i],
                t = 1 - u,
                b = 3 * u * t,
                b0 = t * t * t,
                b1 = b * t,
                b2 = b * u,
                b3 = u * u * u,
                a1 = tan1.normalize().mulSelf(b1),
                a2 = tan2.normalize().mulSelf(b2),
                tmp = this.points[first + i]
                    .sub(pt1.mul(b0 + b1))
                    .sub(pt2.mul(b2 + b3));
            C[0][0] += a1.dot(a1);
            C[0][1] += a1.dot(a2);
            // C[1][0] += a1.dot(a2);
            C[1][0] = C[0][1];
            C[1][1] += a2.dot(a2);
            X[0] += a1.dot(tmp);
            X[1] += a2.dot(tmp);
        }

        // Compute the determinants of C and X
        var detC0C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1],
            alpha1, alpha2;
        if (Math.abs(detC0C1) > epsilon) {
            // Kramer's rule
            var detC0X  = C[0][0] * X[1]    - C[1][0] * X[0],
                detXC1  = X[0]    * C[1][1] - X[1]    * C[0][1];
            // Derive alpha values
            alpha1 = detXC1 / detC0C1;
            alpha2 = detC0X / detC0C1;
        } else {
            // Matrix is under-determined, try assuming alpha1 == alpha2
            var c0 = C[0][0] + C[0][1],
                c1 = C[1][0] + C[1][1];
            if (Math.abs(c0) > epsilon) {
                alpha1 = alpha2 = X[0] / c0;
            } else if (Math.abs(c1) > epsilon) {
                alpha1 = alpha2 = X[1] / c1;
            } else {
                // Handle below
                alpha1 = alpha2 = 0;
            }
        }

        // If alpha negative, use the Wu/Barsky heuristic (see text)
        // (if alpha is 0, you get coincident control points that lead to
        // divide by zero in any subsequent NewtonRaphsonRootFind() call.
        var segLength = pt2.sub(pt1).mag(),
            eps = epsilon * segLength,
            handle1,
            handle2;
        if (alpha1 < eps || alpha2 < eps) {
            // fall back on standard (probably inaccurate) formula,
            // and subdivide further if needed.
            alpha1 = alpha2 = segLength / 3;
        } else {
            // Check if the found control points are in the right order when
            // projected onto the line through pt1 and pt2.
            var line = pt2.sub(pt1);
            // Control points 1 and 2 are positioned an alpha distance out
            // on the tangent vectors, left and right, respectively
            handle1 = tan1.normalize().mulSelf(alpha1);
            handle2 = tan2.normalize().mulSelf(alpha2);
            if (handle1.dot(line) - handle2.dot(line) > segLength * segLength) {
                // Fall back to the Wu/Barsky heuristic above.
                alpha1 = alpha2 = segLength / 3;
                handle1 = handle2 = null; // Force recalculation
            }
        }

        // First and last control points of the Bezier curve are
        // positioned exactly at the first and last data points
        return [pt1, pt1.add(handle1 || tan1.normalize().mulSelf(alpha1)),
                pt2.add(handle2 || tan2.normalize().mulSelf(alpha2)), pt2];
    },

    // Given set of points and their parameterization, try to find
    // a better parameterization.
    reparameterize: function(first, last, u, curve) {
        for (var i = first; i <= last; i++) {
            u[i - first] = this.findRoot(curve, this.points[i], u[i - first]);
        }
        // Detect if the new parameterization has reordered the points.
        // In that case, we would fit the points of the path in the wrong order.
        for (var i = 1, l = u.length; i < l; i++) {
            if (u[i] <= u[i - 1])
                return false;
        }
        return true;
    },

    // Use Newton-Raphson iteration to find better root.
    findRoot: function(curve, point, u) {
        var curve1 = [],
            curve2 = [];
        // Generate control vertices for Q'
        for (var i = 0; i <= 2; i++) {
            curve1[i] = curve[i + 1].sub(curve[i]).mul(3);
        }
        // Generate control vertices for Q''
        for (var i = 0; i <= 1; i++) {
            curve2[i] = curve1[i + 1].sub(curve1[i]).mul(2);
        }
        // Compute Q(u), Q'(u) and Q''(u)
        var pt = this.evaluate(3, curve, u),
            pt1 = this.evaluate(2, curve1, u),
            pt2 = this.evaluate(1, curve2, u),
            diff = pt.sub(point),
            df = pt1.dot(pt1) + diff.dot(pt2);
        // Compute f(u) / f'(u)
        if (Math.abs(df) < /*#=*/TOLERANCE)
            return u;
        // u = u - f(u) / f'(u)
        return u - diff.dot(pt1) / df;
    },

    // Evaluate a bezier curve at a particular parameter value
    evaluate: function(degree, curve, t) {
        // Copy array
        var tmp = curve.slice();
        // Triangle computation
        for (var i = 1; i <= degree; i++) {
            for (var j = 0; j <= degree - i; j++) {
                tmp[j] = tmp[j].mul(1 - t).add(tmp[j + 1].mul(t));
            }
        }
        return tmp[0];
    },

    // Assign parameter values to digitized points
    // using relative distances between points.
    chordLengthParameterize: function(first, last) {
        var u = [0];
        for (var i = first + 1; i <= last; i++) {
            u[i - first] = u[i - first - 1]
                    + this.points[i].sub(this.points[i - 1]).mag();
        }
        for (var i = 1, m = last - first; i <= m; i++) {
            u[i] /= u[m];
        }
        return u;
    },

    // Find the maximum squared distance of digitized points to fitted curve.
    findMaxError: function(first, last, curve, u) {
        var index = Math.floor((last - first + 1) / 2),
            maxDist = 0;
        for (var i = first + 1; i < last; i++) {
            var P = this.evaluate(3, curve, u[i - first]);
            var v = P.sub(this.points[i]);
            var dist = v.x * v.x + v.y * v.y; // squared
            if (dist >= maxDist) {
                maxDist = dist;
                index = i;
            }
        }
        return {
            error: maxDist,
            index: index
        };
    }
};

module.exports = {
    simplify: function () {
        this._commands = Fitter.fit(this);
    }
};
