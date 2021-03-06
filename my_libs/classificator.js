const fs = require('fs');
const cp = require('./colorpicker.js');
const cv = require('opencv4nodejs');


function GetCoef(color){
    var coords = cp.findMatch(color);
    //console.log("comparing: ", color);
    console.log("row: ", coords.row);
    console.log("final color: ", coords.color);
    return coords.row;
}

function getDominantColors(sample, i, ring, maxID){
    //todo for each img in ring get dominant, if dark or white then throw away
    console.log("\nSample: ", i);
    sample.cvtColor(cv.COLOR_BGR2RGB);

    //
    var dir = './../samples_lib/'+maxID;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    cv.imwriteAsync(dir+'/'+ring+'_'+i+'.png', sample, function (err){
        if(err){
            console.log(err);
        }
    });

    var c1OK = 1, c2OK = 1;
    var coef = 0;

    var treshold = 0;
    if(ring == 4 ){
        treshold = 270;
    }
    if(ring == 3 ){
        treshold = 260;
    }
    else if(ring == 2 ){
        treshold = 220;
    }
    else{
        treshold = 150;
    }
    //const path = './../temp_draw/sample'+i+'.png'

    console.log("\n\ngoto picking dominant colors: ");
    var res = cp.pick(sample);
    var c1 = res[0];
    var c2 = res[1];
    var r1 = res[2];
    var r2 = res[3];
    var sum1 = c1[0] + c1[1] + c1[2];
    var sum2 = c2[0] + c2[1] + c2[2];

    console.log("\nColor 1: ", res[0]);
    console.log("percent: ", res[2]);
    console.log("sum 1: ", sum1);
    console.log("\nColor 2: ", res[1]);
    console.log("percent: ", res[3]);
    console.log("sum 2: ", sum2);

    //get coefs on color scale
    if( (sum1 < treshold && r1 > 50) || (sum2 < treshold && r2 > 50) ){
        return -1;
    }
    else{
        if(sum1 < treshold){
            r1 = 0;
            r2 = 1;
            c1OK = 0;
        }

        if(sum2 < treshold){
            r2 = 0;
            r1 = 1;
            c2OK = 0;
        }

        if(sum1 < treshold && sum2 < treshold){
            return -1;
        }

        //kontrola svetle modreho okraje
        if((ring == 4) && c1[2] > 150 && (c1[0] > 100 || c1[1] > 200)){
            r1 = 0;
            r2 = 1;
            c1OK = 0;
        }

        if((ring == 4) && c2[2] > 150 && (c2[0] > 100 || c2[1] > 200)){
            r2 = 0;
            r1 = 1;
            c2OK = 0;
        }

        var coef1 = 0, coef2 = 0;
        if(c1OK == 1)
            coef1 = GetCoef(c1);
        if(c2OK == 1)
            coef2 = GetCoef(c2);

        if(c1OK == 1 && c2OK == 1 && (Math.abs(coef1 - coef2) > 150)){
            console.log("\tWeird difference, pass sample.")
            return -1;
        }
        coef = coef1*r1 + coef2*r2;
    }

    return Math.floor(coef);
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

    image.drawCircle ( center_pt, rect1.r , new cv.Vec(255, 255, 255) , 8);

    image.drawCircle ( center_pt, radius , new cv.Vec(0, 255, 255) , 8);

    for(var i = 0; i < count; i++){
        var x = (rect1.r)*Math.sin(angle*i)+center.x-rect1.s/2;
        var y = (rect1.r)*Math.cos(angle*i)+center.y-rect1.s/2;
        var rect = new cv.Rect(x,y, rect1.s, rect1.s);
        image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

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
    //const scaled = image.resize(Math.floor(dim.width/2),Math.floor(dim.height/2));
    cv.imwrite('./../temp_draw/img.jpg', image);
}

function drawRings4(image ,radius, count, size, offset, dim){
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
        r: Math.floor(radius/1.8),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*0.9)
    }

    var rect4 = {
        r: Math.floor(radius/2.5),
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

    //center
    image.drawCircle ( center_pt, 10, new cv.Vec(0, 0, 255) , 8);

    //okraj
    image.drawCircle ( center_pt, radius , new cv.Vec(0, 255, 255) , 8);

    image.drawCircle ( center_pt, rect1.r , new cv.Vec(255, 255, 255) , 8);
    for(var i = 0; i < count; i++){
        var x = (rect1.r)*Math.sin(angle*i)+center.x-rect1.s/2;
        var y = (rect1.r)*Math.cos(angle*i)+center.y-rect1.s/2;
        var rect = new cv.Rect(x,y, rect1.s, rect1.s);
        image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

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

    image.drawCircle ( center_pt, rect4.r , new cv.Vec(255, 255, 255) , 8);
    for(var i = 0; i < count; i++){
        var x = (rect4.r)*Math.sin(angle*i)+center.x-rect4.s/2;
        var y = (rect4.r)*Math.cos(angle*i)+center.y-rect4.s/2;
        var rect = new cv.Rect(x,y, rect4.s, rect4.s);
        image.drawRectangle (rect , new cv.Vec(0, 0, 0) , 3);
    }
    //scale to show
    //const scaled = image.resize(Math.floor(dim.width/2),Math.floor(dim.height/2));
    cv.imwrite('./../temp_draw/img4.jpg', image);
}


function extractRings4(image ,radius, count, size, offset, dim, id){
    var rect1 = {
        r: Math.floor(radius/1.08),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*1.2)
    }

    var rect2 = {
        r: Math.floor(radius/1.2),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: size
    }

    var rect3 = {
        r: Math.floor(radius/1.8),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*0.9)
    }

    var rect4 = {
        r: Math.floor(radius/2.5),
        x: dim.width/2+offset.xx,
        y: this.r*2+offset.yy,
        s: Math.floor(size*0.9)
    }

    console.log("Extracting");
    var center = {
        x: Math.floor(dim.width/2-offset.xx),
        y: Math.floor(dim.height/2)
    }
    const center_pt = new cv.Point(center.x, center.y);

    var angle = Math.floor(360/count);
    console.log("Angle: "+angle );

    var ring4res = 0;
    var coefSum4 = 0;
    var okSamples4= 0;
    for(var i = 0; i < count; i++){
        var x = (rect1.r)*Math.sin(angle*i)+center.x-rect1.s/2;
        var y = (rect1.r)*Math.cos(angle*i)+center.y-rect1.s/2;
        var rect = new cv.Rect(x,y, rect1.s, rect1.s);
        //image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

        //test get dom color
        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 4, id);
        if(coef != -1){
            okSamples4 += 1;
            coefSum4 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }



    var ring3res = 0;
    var coefSum3 = 0;
    var okSamples3= 0;
    for(var i = 0; i < count; i++){
        var x = (rect2.r)*Math.sin(angle*i)+center.x-rect2.s/2;
        var y = (rect2.r)*Math.cos(angle*i)+center.y-rect2.s/2;
        var rect = new cv.Rect(x,y, rect2.s, rect2.s);
        //image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

        //test get dom color
        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 3, id);
        if(coef != -1){
            okSamples3 += 1;
            coefSum3 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }



    var ring2res = 0;
    var coefSum2 = 0;
    var okSamples2= 0;
    for(var i = 0; i < count; i++){
        //                                    shift from 0,0 to the center of
        var x = (rect3.r)*Math.sin(angle*i) + center.x - rect3.s/2;
        var y = (rect3.r)*Math.cos(angle*i) + center.y - rect3.s/2;
        var rect = new cv.Rect(x,y, rect3.s, rect3.s);

        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 2, id);
        if(coef != -1){
            okSamples2 += 1;
            coefSum2 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }



    var ring1res = 0;
    var coefSum1 = 0;
    var okSamples1 = 0;
    for(var i = 0; i < count; i++){
        var x = (rect4.r)*Math.sin(angle*i)+center.x-rect4.s/2;
        var y = (rect4.r)*Math.cos(angle*i)+center.y-rect4.s/2;
        var rect = new cv.Rect(x,y, rect4.s, rect4.s);
        //image.drawRectangle (rect , new cv.Vec(0, 0, 0) , 3);

        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 1, id);
        if(coef != -1){
            okSamples1 += 1;
            coefSum1 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }

    ring4res = coefSum4/okSamples4;
    console.log("\tFourth ring: " , ring4res);
    ring3res = coefSum3/okSamples3;
    console.log("\tThird ring: " , ring3res);
    ring2res = coefSum2/okSamples2;
    console.log("\tSecond ring: " , ring2res);
    ring1res = coefSum1/okSamples1;
    console.log("\tInner ring: " , ring1res);


    return [ring4res, ring3res, ring2res, ring1res];
}

function extractRings(image ,radius, count, size, offset, dim, id){
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

    console.log("Extracting");
    var center = {
        x: Math.floor(dim.width/2-offset.xx),
        y: Math.floor(dim.height/2)
    }
    const center_pt = new cv.Point(center.x, center.y);

    var angle = Math.floor(360/count);
    console.log("Angle: "+angle );

    var ring3res = 0;
    var coefSum3 = 0;
    var okSamples3= 0;
    for(var i = 0; i < count; i++){
        var x = (rect1.r)*Math.sin(angle*i)+center.x-rect1.s/2;
        var y = (rect1.r)*Math.cos(angle*i)+center.y-rect1.s/2;
        var rect = new cv.Rect(x,y, rect1.s, rect1.s);
        //image.drawRectangle (rect , new cv.Vec(100, 100, 255) , 3);

        //test get dom color
        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 3, id);
        if(coef != -1){
            okSamples3 += 1;
            coefSum3 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }



    var ring2res = 0;
    var coefSum2 = 0;
    var okSamples2= 0;
    for(var i = 0; i < count; i++){
        //                                    shift from 0,0 to the center of
        var x = (rect2.r)*Math.sin(angle*i) + center.x - rect2.s/2;
        var y = (rect2.r)*Math.cos(angle*i) + center.y - rect2.s/2;
        var rect = new cv.Rect(x,y, rect2.s, rect2.s);

        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 2, id);
        if(coef != -1){
            okSamples2 += 1;
            coefSum2 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }



    var ring1res = 0;
    var coefSum1 = 0;
    var okSamples1 = 0;
    for(var i = 0; i < count; i++){
        var x = (rect3.r)*Math.sin(angle*i)+center.x-rect3.s/2;
        var y = (rect3.r)*Math.cos(angle*i)+center.y-rect3.s/2;
        var rect = new cv.Rect(x,y, rect3.s, rect3.s);
        //image.drawRectangle (rect , new cv.Vec(0, 0, 0) , 3);

        const sample = image.getRegion(rect);
        var coef = getDominantColors(sample, i, 1, id);
        if(coef != -1){
            okSamples1 += 1;
            coefSum1 += coef;
        }
        console.log("\t\tSample "+i+" coeficient: ", coef);
    }

    ring3res = coefSum3/okSamples3;
    console.log("\tThird ring: " , ring3res);
    ring2res = coefSum2/okSamples2;
    console.log("\tSecond ring: " , ring2res);
    ring1res = coefSum1/okSamples1;
    console.log("\tInner ring: " , ring1res);


    return [ring3res, ring2res, ring1res];
}

function extract(mat, id){
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

    //const result = extractRings(scaled, base_radius/2, 11, 60, offset, dim, id);
    const result = extractRings4(scaled, base_radius/2, 11, 60, offset, dim, id);

    /*
    const scaled2 = mat.resize(dim.width, dim.height);
    drawRings4(scaled2, base_radius/2, 11, 60, offset, dim);
    const scaled3 = mat.resize(dim.width, dim.height);
    drawRings(scaled3, base_radius/2, 11, 60, offset, dim);

     */

    return result;
}

function GetMaxID(){
    var filesImg = fs.readdirSync('./../img_lib');
    var filesRes = fs.readdirSync('./../result_lib');
    var max = (filesImg.length > filesRes.length) ? filesImg.length : filesRes.length;
    return max;
}


function SaveToFile(result, image){
    cv.imwrite('./../img_lib/'+result.id+'.jpg', image);
    var jsonData = JSON.stringify(result);
    fs.writeFileSync('./../result_lib/'+result.id+'.txt', jsonData);
}

function predicateBy(prop){
    return function(a,b){
        if( a[prop] > b[prop]){
            return 1;
        }else if( a[prop] < b[prop] ){
            return -1;
        }
        return 0;
    }
}



function LoadSortedLibrary(items){
    var lib = [];
    if(items.length == 0){
        return [];
    }
    else{
        //sort
        items.sort( predicateBy("order") );
        for(var j = 0; j < items.length; j++){
            lib[j] = items[j];
        }
    }
    return lib;
}

/*
*
* Compare results from 4 rings.
*
*/
function compareResults4(lib, result){
    var worse = 0;
    console.log(lib.features);
    var lib_feat = lib.features;
    var res_feat = result.features;
    //[ring3res, ring2res, ring1res];
    var ring3 = lib_feat[0] - res_feat[0];
    var ring2 = lib_feat[1] - res_feat[1];
    var ring1 = lib_feat[2] - res_feat[2];
    var ring0 = lib_feat[3] - res_feat[3];

    var weight = [0.9, 1, 1.2, 1.2];

    if(res_feat[0] < res_feat[2]/2 || lib_feat[0] < lib_feat[2]/2)
        ring3 = 0;

    if(res_feat[1] < res_feat[3]/2 || lib_feat[1] < lib_feat[3]/2)
        ring2 = 0;

    var res = ring3*weight[0] + ring2*weight[1] + ring1* weight[2] + ring0* weight[3];

    console.log('Comparison:');
    console.log('ring 3: ', ring3);
    console.log('ring 2: ', ring2);
    console.log('ring 1: ', ring1);
    console.log('ring 0: ', ring0);

    console.log('Comparison after Weights:');
    console.log('ring 3: ', ring3*weight[0]);
    console.log('ring 2: ', ring2*weight[1]);
    console.log('ring 1: ', ring1*weight[2]);
    console.log('ring 1: ', ring0*weight[3]);

    console.log('\tweighted res: ', res);

    if(res > 0){
        worse = 1
    }
    else{
        worse = -1
    }

    return worse;
}


function compareResults(lib, result){
    var worse = 0;
    console.log(lib.features);
    var lib_feat = lib.features;
    var res_feat = result.features;
    //[ring3res, ring2res, ring1res];
    var ring3 = lib_feat[0] - res_feat[0];
    var ring2 = lib_feat[1] - res_feat[1];
    var ring1 = lib_feat[2] - res_feat[2];

    var weight = [0.8, 1, 1.5];
    var res = ring3*weight[0] + ring2*weight[1] + ring1* weight[2];

    console.log('Comparison:');
    console.log('ring 3: ', ring3);
    console.log('ring 2: ', ring2);
    console.log('ring 1: ', ring1);

    console.log('Comparison after Weights:');
    console.log('ring 3: ', ring3*weight[0]);
    console.log('ring 2: ', ring2*weight[1]);
    console.log('ring 1: ', ring1*weight[2]);

    console.log('\tweighted res: ', res);

    if(res > 0){
        worse = 1
    }
    else{
        worse = -1
    }

    return worse;
}


/*
*
* Classify image:
*               Extract features and compare them to up to date library.
*               Save image to folder img_lib.
*               Save resulted information to folder result_lib.
*               Construct results from comparisons, add handles to ordered list.
*               Save ordered list to order.txt
*
*/
function classify(m, a) {
    //TODO
    console.log("In CLASSIFY: ");
    var results = {
        order: null,
        count: 0,
        sqm_guess: null,
        pictures: []
    };


    //create unique ID
    var maxID = GetMaxID();
    //extract features
    var feature_vector = extract(m, maxID);




    console.log("Image will be saved as: "+maxID+".jpg");
    var result = {
        id: maxID,
        features: feature_vector,
        name: a.name,
        sqm: a.sqm,
        time: a.time
    }

    //load ORDER
    var order;
    var lib = [];
    if(maxID < 1){
        order = {
            items: []
        }
        console.log("Creating order file");
        var jsonData = JSON.stringify(order);
        fs.writeFileSync('./../order.txt', jsonData);
    }
    else{
        console.log("Reading order file");
        var data = fs.readFileSync('./../order.txt', 'utf8')
        console.log("Data:",data);
        order = JSON.parse(data.replace(/\s/g, ""));
        console.log("Items count: ", order.items.length);
        lib = LoadSortedLibrary(order.items);
    }


    //compare
    var curr_ID;
    var curr_res;
    var worse = 0;
    var new_ord = 0;
    var k = 0;
    if(lib.length > 0){
        for(k = 0; k < lib.length; k++){
            //
            curr_ID = lib[k].id;
            console.log("lib[k]", lib[k]);
            console.log("curr_ID", curr_ID);
            data = fs.readFileSync('./../result_lib/'+curr_ID+'.txt', 'utf8')
            worse = 0;
            console.log("lib data", data);
            curr_res = JSON.parse(data.replace(/\s/g, ""));
            //worse = compareResults(curr_res, result);
            worse = compareResults4(curr_res, result);

            if(worse == 1){
                //jdeme dal
                console.log("Our pic is worse than: "+ curr_ID);
                new_ord = k+1;
            }
            else{
                console.log("Worse value: "+ worse)
                console.log("Our pic is BETTER than: "+ curr_ID);
                new_ord = k;
                break;
            }
        }
    }
    //save new ORDER
    var new_item = {
        order: new_ord,
        id: maxID
    }

    //shift WORSE pictures in lib by one
    for(var j = 0; j < lib.length; j++){
        var ord = lib[j].order;

        if(ord >= new_ord){
            lib[j].order = ord+1;
        }
    }

    //insert new order to lib
    lib[lib.length] = new_item;
    order.items = lib;
    //sort items by ORDER
    order.items.sort(predicateBy("order"));
    //save NEW order
    var jsonData = JSON.stringify(order);
    fs.writeFile('./../order.txt', jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });

    //return 10 or less best matches
    results.order = new_ord+1;
    results.count = maxID+1;

    if(new_ord < 4){
        console.log('new_ord < 4: ', new_ord)
        if(lib.length > 10){
            console.log('lib.length > 10: ', lib.length)
            for(var j = 0; j < 10; j++){
                var it = {
                    filename:"",
                    order: 0
                }
                it.filename = order.items[j].id+'.jpg';
                it.order = order.items[j].order;
                results.pictures[j] = it;
            }
        }
        else{
            console.log('lib.length <= 10: ', lib.length)
            for(var j = 0; j < lib.length; j++){
                var it = {
                    filename:"",
                    order: 0
                }
                it.filename = order.items[j].id+'.jpg';
                it.order = order.items[j].order;
                results.pictures[j] = it;
            }
        }
    }
    else{
        console.log('new_ord >= 4: ', new_ord)
        if(lib.length > new_ord+6){
            //tzn prvek neni uplne na konci
            for(var k = 0, j = new_ord-4; j < new_ord+6; j++, k++){
                var it = {
                    filename:"",
                    order: 0
                }
                it.filename = order.items[j].id+'.jpg';
                it.order = order.items[j].order;
                results.pictures[k] = it;
            }
        }
        else{
            if(lib.length > 10){
                console.log('lib.length > 10: ', lib.length)
                //prvek je dost na konci a muzeme vzit odzadu 10
                for(var k=0, j = lib.length-10; j < lib.length; j++, k++){
                    var it = {
                        filename:"",
                        order: 0
                    }
                    it.filename = order.items[j].id+'.jpg';
                    it.order = order.items[j].order;
                    results.pictures[k] = it;
                }
            }
            else {
                //vezmeme vsechno co mame
                for(var j = 0; j < lib.length; j++){
                    var it = {
                        filename:"",
                        order: 0
                    }
                    it.filename = order.items[j].id+'.jpg';
                    it.order = order.items[j].order;
                    results.pictures[j] = it;
                }
            }

        }
    }

    //save image, feature_vector && annotation
    SaveToFile(result, m);

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
    return classify(image, annotation);
}


if (require.main === module) {
    main();
}