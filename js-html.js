var fs = require ("fs");
// var data = fs.readFileSync('widget/html/**.html');

fs.readdir('widget/html/', function (err,data) {
    if (err) return console.error(err);
    console.log(data)
    for(var i = 0; i <data.length ; i++ )
    {
        if(/\.html$/.test(data[i]))
        {
            (function (datas) {  
                fs.readFile('widget/html/'+datas,function(err,data){
                    if (err) return console.error(err);
                    var dataInfo = data.toString();
                    console.log(dataInfo.length)
                    // dataInfo = dataInfo.replace(/\\/,'');
                    // console.log(dataInfo)
                    fs.writeFile('widget/html/new/'+datas,dataInfo,function () {
                    
                    })
                })
            }(data[i]))
            
            
        }
    }
})