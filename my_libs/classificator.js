

function classify(i, a) {
    //TODO
}




module.exports = {
    /**
     * Classify location based on night sky photo and annotation
     *
     * @param  {Json} image
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