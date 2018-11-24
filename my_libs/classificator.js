const fs = require('fs');
const dir = './directory';
const dc = require('dominant-color');
const cv = require('opencv4nodejs');

function getDominantColors(ring){
    //todo for each img in ring get dominant, if dark or white then throw away
    //get coefs on colo scale

    //save coeficients
}



function extract(mat){
    //todo extract rings of samples
    console.log("Extracting");

    const width = 1454;
    const height = 1444;
    const offset_x = 34;
    const offset_y = 52;
    //scale
    const scaled = mat.resize(width, height);
    //first ring at 1350
    const ring1 = 1350
    const size1 = 50;
    const roi1 = new cv.Rect(width/2+offset_x, ring1+offset_y , size1, size1);
    const test1 = scaled.getRegion(roi1);
    console.log(test1.rows);
    cv.imshow('test1', test1);
    cv.waitKey();
    cv.imshow('scaled', scaled);
    cv.waitKey();
    //for each ring get coeficients
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