
var Transform = {

    properties: {
        _scale: {
            default: cc.v2(1, 1),
            type: cc.Vec2
        },
        _position: {
            default: cc.v2(0,0),
            type: cc.Vec2
        },
        _rotation: 0,
        
        _flipX: false,
        _flipY: false,

        _transform: {
            default: function () {
                return {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
            },
            serializable: false
        },

        _worldTransform: {
            default: function () {
                return {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
            },
            serializable: false
        },

        _transformDirty: {
            default: true,
            serializable: false,

            notify: function () {
                if (this._transformDirty) {
                    if (this.parent) {
                        this.parent._transformDirty = true;
                    }

                    this._dirty = true;
                }
            }
        },

        scale: {
            get: function () {
                return this._scale;
            },
            set: function (value) {
                if (this._scale.equals(value)) {
                    return;
                }
                this._scale = value;
                this._transformDirty = true;
            }
        },

        position: {
            get: function () {
                return this._position;
            },
            set: function (value) {
                if (this._position.equals(value)) {
                    return;
                }
                this._position = value;
                this._transformDirty = true;
            }
        },

        rotation: {
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                if (this._rotation === value) {
                    return;
                }
                this._rotation = value;
                this._transformDirty = true;
            }
        },


        flipX: {
            get: function () {
                return this._flipX;
            },
            set: function (value) {
                if (this._flipX === value) {
                    return;
                }
                this._flipX = value;
                this._transformDirty = true;
            }
        },

        flipY: {
            get: function () {
                return this._flipY;
            },
            set: function (value) {
                if (this._flipY === value) {
                    return;
                }
                this._flipY = value;
                this._transformDirty = true;
            }
        },
    },

    _transformCommand: function (cmd, t) {
        if (cmd.length <= 1) {
            return cmd;
        }
        
        cmd = cmd.slice(1, cmd.length);

        if (t.a === 1 && t.d === 1 &&
            t.b === 0 && t.c === 0 &&
            t.tx === 0 && t.ty === 0) {
            return cmd;
        }

        var tempPoint = cc.v2();

        for (var i = 0, ii = cmd.length / 2; i < ii; i++) {
            var j = i*2;
            tempPoint.x = cmd[j];
            tempPoint.y = cmd[j + 1];

            tempPoint = cc.pointApplyAffineTransform(tempPoint, t);

            cmd[j] = tempPoint.x;
            cmd[j+1] = tempPoint.y;
        }

        return cmd;
    },

    getTransform: function () {
        if (this._transformDirty) {
            var scaleX = this.flipX ? -this._scale.x : this._scale.x;
            var scaleY = this.flipY ? -this._scale.y : this._scale.y;
            var positionX = this._position.x;
            var positionY = this._position.y;
            var rotation = this._rotation;

            var t = this._transform;
            t.tx = positionX;
            t.ty = positionY;
            t.a = t.d = 1;
            t.b = t.c = 0;

            // rotation Cos and Sin
            if (rotation) {
                var rotationRadians = rotation * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                t.c = Math.sin(rotationRadians);
                t.d = Math.cos(rotationRadians);
                t.a = t.d;
                t.b = -t.c;
            }

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (scaleX < 0.000001 && scaleX > -0.000001) ? 0.000001 : scaleX,
                sy = (scaleY < 0.000001 && scaleY > -0.000001) ? 0.000001 : scaleY;

            // scale
            if (scaleX !== 1 || scaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }

            this._transformDirty = false;
        }

        return this._transform;
    },

    getWorldTransform: function () {
        if (this.parent) {
            return cc.affineTransformConcat(this.parent.getWorldTransform(), this.getTransform());
        }

        return this.getTransform();
    },

    updateTransform: function (parentTransformDirty) {
        if (this._transformDirty || parentTransformDirty) {
            var scaleX = this.flipX ? -this._scale.x : this._scale.x;
            var scaleY = this.flipY ? -this._scale.y : this._scale.y;
            var positionX = this._position.x;
            var positionY = this._position.y;
            var rotation = this._rotation;

            var t = this._transform;
            t.tx = positionX;
            t.ty = positionY;
            t.a = t.d = 1;
            t.b = t.c = 0;

            // rotation Cos and Sin
            if (rotation) {
                var rotationRadians = rotation * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                t.c = Math.sin(rotationRadians);
                t.d = Math.cos(rotationRadians);
                t.a = t.d;
                t.b = -t.c;
            }

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (scaleX < 0.000001 && scaleX > -0.000001) ? 0.000001 : scaleX,
                sy = (scaleY < 0.000001 && scaleY > -0.000001) ? 0.000001 : scaleY;

            // scale
            if (scaleX !== 1 || scaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }
        }

        if (this.parent) {
            this._worldTransform = cc.affineTransformConcat(this.parent._worldTransform, this._transform);
        }
        else {
            this._worldTransform = this._transform;
        }

        var children = this.children;
        if (children) {
            for (var i = 0, ii = children.length; i < ii; i++) {
                var child = children[i];
                child.updateTransform(parentTransformDirty || this._transformDirty);
            }
        }        

        this._transformDirty = false;
    }
};

module.exports = Transform;
