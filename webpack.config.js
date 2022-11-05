let path = require("path")
module.exports ={
    watch:true,
    mode:'development',
    entry:"./js/index.js",
    output:{
        filename:'solar.min.js',
    },
    devServer:{
        static:__dirname,
        port:4000,
        open:true
    }
}