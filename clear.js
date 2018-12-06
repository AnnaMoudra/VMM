const fs = require('fs');

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

var samples = './../samples_lib';
var res = './../result_lib';
var imgs = './../img_lib';
var temp= './../temp';

deleteFolderRecursive(samples);
deleteFolderRecursive(res);
deleteFolderRecursive(imgs);
deleteFolderRecursive(temp);


fs.unlinkSync('./../order.txt');
fs.mkdirSync(samples, 0744);
fs.mkdirSync(res, 0744);
fs.mkdirSync(temp, 0744);
fs.mkdirSync(imgs, 0744);
