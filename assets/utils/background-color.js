// cc.Class({
//     extends: cc.Component,

//     properties: {
//         color: cc.Color.WHITE
//     },

//     onLoad: function () {
//         if (cc.director.setClearColor) {
//             var color = this.color;
//             if (!CC_JSB) {
//                 color.r /= 255;
//                 color.g /= 255;
//                 color.b /= 255;
//                 color.a /= 255;
//             }
//             cc.director.setClearColor( color );
//         }
//     }
// });

if (cc.director.setClearColor && !CC_EDITOR) {
    var color = cc.color(216, 216, 216, 255);
    if (!CC_JSB) {
        color.r /= 255;
        color.g /= 255;
        color.b /= 255;
        color.a /= 255;
    }
    cc.director.setClearColor( color );
}
