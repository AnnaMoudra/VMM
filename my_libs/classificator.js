const fs = require('fs');
const dir = './directory';



function extract(file){

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
function classify(p, a) {
    //TODO
    console.log("In CLASSIFY");
    var results = {};
    //create FILE unique ID
    var dir = "./../../img_lib";
    /*
    fs.readdir(dir, function(err, files){
        console.log("number of files saved: ");
        console.log(files.length);
    });
    */

    //load image from temp

    //extract features


    //return to results


    return results;
}




module.exports = {
    /**
     * Classify location based on night sky photo and annotation
     *
     * @param  {String} image path
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