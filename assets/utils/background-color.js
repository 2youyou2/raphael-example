// cc.Class({
//     extends: cc.Component,

//     properties: {
//         color: cc.Color.WHITE
//     },

//     onLoad: function () {
//         if (cc.director.setClearColor) {
//             cc.director.setClearColor( this.color );
//         }
//     }
// });

if (cc.director.setClearColor && !CC_EDITOR) {
    cc.director.setClearColor( cc.color(216, 216, 216, 255) );
}
