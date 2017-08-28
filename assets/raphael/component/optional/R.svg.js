var cheerio = require('cheerio');

function trim (s) { 
    return s.replace(/^\s+|\s+$/g, ''); 
}

function compressSpaces (s) { 
    return s.replace(/[\s\r\t\n]+/gm,' '); 
}

function toNumberArray (s) {
    var a = trim(compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
    for (var i=0; i<a.length; i++) {
        a[i] = parseFloat(a[i]);
    }
    return a;
}

function parseStyle (current, name, value) {
    if (name === 'fill') {
        current.fillColor = value === 'none' ? null : cc.hexToColor(value);
    } else if (name === 'stroke') {
        current.strokeColor = value === 'none' ? null : cc.hexToColor(value);
    } else if (name === 'stroke-width') {
        current.lineWidth = parseFloat(value);
    } else if (name === 'stroke-linejoin') {
        current.lineJoin = cc.Graphics.LineJoin[value.toUpperCase()];
    } else if (name === 'stroke-linecap') {
        current.lineCap = cc.Graphics.LineCap[value.toUpperCase()];
    } else if (name === 'stroke-dasharray') {
        current.dashArray = toNumberArray[value];
    } else if (name === 'stroke-dashoffset') {
        current.dashOffset = parseFloat(value);
    } /* else {
        cc.log("Unhandled style: " + name + " -- " + value);
    } */
}

function parseNode (node, parent) {
    var current;

    var tagName = node.tagName;
    if (tagName === 'g') {
        current = parent.addGroup();
    }
    else if (tagName === 'path') {
        current = parent.addPath();
        current.path(node.attribs.d);
    }

    if (current && node.attribs) {
        // transform
        var transform = node.attribs.transform;
        if (transform) {
            var data = trim(compressSpaces(transform)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g,') ').split(/\s(?=[a-z])/);
            for (var i=0; i<data.length; i++) {
                var type = trim(data[i].split('(')[0]);
                var s = data[i].split('(')[1].replace(')','');
                var a = toNumberArray(s);
                
                if (type === 'translate') {
                    current.position = cc.v2(a[0], a[1]);
                }
                else if (type === 'rotate') {
                    current.rotation = a[0];
                }
                else if (type === 'scale') {
                    current.scale = cc.v2(a[0], a[1]);
                }
            }
        }

        var styles = node.attribs.style;
        if (styles) {
            styles = styles.split(';');
            for (var i=0; i<styles.length; i++) {
                if (trim(styles[i]) !== '') {
                    var style = styles[i].split(':');
                    var name = trim(style[0]);
                    var value = trim(style[1]);

                    parseStyle(current, name, value);
                }
            }
        }

        for (var property in node.attribs) {
            if (node.attribs.hasOwnProperty(property)) {
                parseStyle(current, property, node.attribs[property]);
            }
        }
    }

    var children = node.children;
    if (children) {
        for (var i = 0, ii = children.length; i < ii; i++) {
            var child = children[i];
            parseNode(child, current || parent);
        }
    }
}

var Svg = {
    loadSvg: function (string) {
        if (typeof string !== 'string') {
            return;
        }

        var $;
        try {
            $ = cheerio.load(string);
        }
        catch (err) {
            cc.error(err.toString());
            return;
        }

        var svg = $('svg')[0];
        parseNode(svg, this);

        this.flipY = true;
    },
};


// hack for jsb, not use __proto__
var DomHandler = require('domhandler');
var NodePrototype = require("domhandler/lib/node");
var ElementPrototype = require("domhandler/lib/element");

DomHandler.prototype._addDomElement = function(element){
    var parent = this._tagStack[this._tagStack.length - 1];
    var siblings = parent ? parent.children : this.dom;
    var previousSibling = siblings[siblings.length - 1];

    element.next = null;

    if(this._options.withStartIndices){
        element.startIndex = this._parser.startIndex;
    }

    if (this._options.withDomLvl1) {

        var originElement = element;
        element = Object.create(element.type === "tag" ? ElementPrototype : NodePrototype);
        for (var k in originElement) {
            element[k] = originElement[k];
        }

        // element.__proto__ = element.type === "tag" ? ElementPrototype : NodePrototype;
    }

    if(previousSibling){
        element.prev = previousSibling;
        previousSibling.next = element;
    } else {
        element.prev = null;
    }

    siblings.push(element);
    element.parent = parent || null;
};

module.exports = Svg;