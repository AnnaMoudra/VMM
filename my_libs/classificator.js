const fs = require('fs');
const dir = './directory';
const dc = require('dominant-color');
const ct = require('colorthief');
const cp = require('./colorpicker.js');

const cv = require('opencv4nodejs');
var ColorThief = require('color-thief');


function GetCoef(color){
    var coords = cp.findMatch(color);
    console.log("comparing: ", color);
    console.log("row: ", coords.row);
    console.log("color: ", coords.color);
    return coords.row;
}


function getDominantColors(sample, i){
    //todo for each img in ring get dominant, if dark or white then throw away
    console.log("Sample: ", i);
    sample.cvtColor(cv.COLOR_BGR2RGB);
    var coef = 0;
    /*    */
    //const path = './../temp_draw/sample'+i+'.png'

    var res = cp.pick(sample);
    var c1 = res[0];
    var c2 = res[1];
    var r1 = res[2];
    var r2 = res[3];
    var sum1 = c1[0] + c1[1] + c1[2];
    var sum2 = c2[0] + c2[1] + c2[2];

    console.log("Color 1: ", res[0]);
    console.log("percent: ", res[2]);
    console.log("Color 2: ", res[1]);
    console.log("percent: ", res[3]);

    //get coefs on color scale
    if( (sum1 < 200 && r1 > 50) || (sum2 < 200 && r2 > 50) ){
        //todo
        //ulozit hodnotu se kterou se nebude pocitat
        coef = -1;
    }
    else{
        //todo
        var coef1 = GetCoef(c1);
        var coef2 = GetCoef(c2);

        coef = coef1*r1 + coef2*r2;
    }

    //save coeficients

    return coef;
}


function drawRings(image ,radius, count, size, offset, dim){
    var rect1 = {
        r: Math.floor(radius/1.08),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*1.2)
    }

    var rect2 = {
        r: Math.floor(radius/1.4),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: size
    }

    var rect3 = {
        r: Math.floor(radius/2.3),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*0.9)
    }

    console.log("Extracting2");
    var center = {
        x: Math.floor(dim.width/2-offset.xx),
        y: Math.floor(dim.height/2)
    }
    const center_pt = new cv.Point(center.x, center.y);

    var angle = Math.floor(360/count);
    console.log("Angle: "+angle );

    image.drawCircle ( center_pt, 10, new cv.Vec(0, 0, 255) , 8);

    image.drawCircle ( center_pt, radius , new cv.Vec(0, 255, 255) , 8);
    for(var i = 0; i < count; i++){
        var x = (rect1.r)*Math.sin(angle*i)+center.x-rect1.s/2;
        var y = (rect1.r)*Math.cos(angle*i)+center.y-rect1.s/2;
        var rect = new cv.Rect(x,y, rect1.s, rect1.s);
        //image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

        //test get dom color
        const test_sample = image.getRegion(rect);
        getDominantColors(test_sample, i,null);
    }

    image.drawCircle ( center_pt, rect2.r , new cv.Vec(255, 255, 255) , 8);

    for(var i = 0; i < count; i++){
        //                                    shift from 0,0 to the center of
        var x = (rect2.r)*Math.sin(angle*i) + center.x - rect2.s/2;
        var y = (rect2.r)*Math.cos(angle*i) + center.y - rect2.s/2;
        var rect = new cv.Rect(x,y, rect2.s, rect2.s);
        image.drawRectangle (rect , new cv.Vec(255, 0, 255) , 3);
    }


    image.drawCircle ( center_pt, rect3.r , new cv.Vec(255, 255, 255) , 8);

    for(var i = 0; i < count; i++){
        var x = (rect3.r)*Math.sin(angle*i)+center.x-rect3.s/2;
        var y = (rect3.r)*Math.cos(angle*i)+center.y-rect3.s/2;
        var rect = new cv.Rect(x,y, rect3.s, rect3.s);
        image.drawRectangle (rect , new cv.Vec(0, 0, 0) , 3);
    }
    //scale to show
    const scaled = image.resize(Math.floor(dim.width/2),Math.floor(dim.height/2));
    cv.imwrite('./../temp_draw/img.jpg', image);
}


function extractRing(image ,radius, count, size, offset, dim){

}

function extract(mat, id){
    //todo extract rings of samples

    //Image dimensions used for extractions
    var dim = {
        width: 1454,
        height: 1444
    };
    const scaled = mat.resize(dim.width, dim.height);

    //Sky area center offset
    var offset = {
        xx: 34,
        yy: 52
    };

    const base_radius = 1350;

    //const test1 = scaled.getRegion(roi1);
    drawRings(scaled, base_radius/2, 11, 60, offset, dim);

    //todo extractRing()
}

/*
*
* Classify image:
*               Extract features and compare them to up to date library.
*               Save image to folder img_lib.
*               Save annotation to folder anot_lib.
*               Save feature information to folder feat_lib.
*               Construct results from comparisons, add image to ordered list .
*
*/
function classify(m, a) {
    //TODO
    console.log("In CLASSIFY: ");
    var results = {};
    //create FILE unique ID
    var dir = "./../../img_lib";
    /*
    fs.readdir(dir, function(err, files){
        console.log("number of files saved: ");
        console.log(files.length);
    });
    */
    //extract features
    extract(m);
    //return to results


    return results;
}




module.exports = {
    /**
     * Classify location based on night sky photo and annotation
     *
     * @param  {Mat} image OpenCv Mat matrix
     * @param  {Json} annotation
     *
     */
    run: function(image, annotation) {
        return classify(image, annotation);
    }
};



var main = function(image, annotation) {
    console.log("Classify night sky image");
    classify(image, annotation);
}


if (require.main === module) {
    main();
}