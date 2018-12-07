const fs = require('fs');
const cv = require('opencv4nodejs');


function calculateCenter(points, n) {
    var vals = [];
    for (var i = 0; i < n; i++) { vals.push(0); }
    for (var i = 0; i < points.length; i++) {
        for (var j = 0; j < n; j++) {
            vals[j] += points[i][j];
        }
    }
    for (var i = 0; i < n; i++) {
        vals[i] = vals[i] / points.length;
    }
    return vals;
}

function squareEuclidianDistance(a, b){
    var s = 0;
    for (var i = 0, l = a.length; i < l; i++) {
        s += Math.pow(a[i] - b[i], 2)
    }
    return Math.sqrt(s);
}


function KMeans(points, k, min_diff) {
    console.log('KMeans started for ', k);
    plen = points.length;
    clusters = [];
    seen = [];
    while (clusters.length < k) {
        idx = parseInt(Math.random() * plen);
        found = false;
        for (var i = 0; i < seen.length; i++ ) {
            if (idx === seen[i]) {
                found = true;
                break;
            }
        }
        if (!found) {
            seen.push(idx);
            clusters.push([points[idx], [points[idx]]]);
        }
    }

    console.log('clusters finished');

    var endpoint = 0;
    while (true) {
        plists = [];
        for (var i = 0; i < k; i++) {
            plists.push([]);
        }
        //console.log('clusters pushed');

        for (var j = 0; j < plen; j++) {
            var p = points[j], smallest_distance = 10000000, idx = 0;
            for (var i = 0; i < k; i++) {
                var distance = squareEuclidianDistance(p, clusters[i][0]);
                if (distance < smallest_distance) {
                    smallest_distance = distance;
                    idx = i;
                }
            }
            plists[idx].push(p);
        }


        var diff = 0;
        for (var i = 0; i < k; i++) {
            if(Number.isNaN(clusters[i][0][0])){
                console.log("Breaking ", clusters[i][0][0]);
                endpoint = 1;
                break;
            }
            var old = clusters[i];
            var center = calculateCenter(plists[i], 3);
            var new_cluster = [center, (plists[i])];


            var dist = squareEuclidianDistance(old[0], center);
            clusters[i] = new_cluster;

            diff = diff > dist ? diff : dist;
        }
        //console.log("diff ", diff);
        if (diff < min_diff || endpoint == 1) {
            console.log("final diff ", diff);
            break;
        }
    }
    return clusters;
}

function findRatio(data, points){
    var distA = 0, distB = 0;
    var pA = 0, pB = 0;

    for(var k = 0; k < data.length; k++){
        var p = data[k];

        distA = squareEuclidianDistance(points[0], p);
        distB = squareEuclidianDistance(points[1], p);

        if(parseFloat(distB) - parseFloat(distA) < 1e-7 ){
            pA += 1;
        }
        else if(parseFloat(distA) - parseFloat(distB) < 1e-7){
            pB += 1;
        }
    }

    //normalize:
    //data.length = 100%
    var percA = parseFloat(pA/data.length);
    var percB = parseFloat(pB/data.length);

    return [percA, percB];
}

/*
*
*/
function pick(m) {
    var results = [];
    var data = [];

    var k = 0;
    console.log('picking data')
    for(var i = 0; i < m.rows; i++){
        for(var j = 0; j < m.cols; j++, k++){
            var pixel = m.at(i, j);
            data[k] = [pixel.x, pixel.y, pixel.z];
        }
    }

    var res_col = KMeans(data, 2, 1);
    console.log('KMeans finished')
    var points = [res_col[0][0], res_col[1][0]];
    var res_ratio = findRatio(data, points);

    for (var i = 0; i < res_col.length; i++) {
        var col = res_col[i][0];
        tmp = Math.floor(col[0]);
        col[0] = Math.floor(col[2]);
        col[1] = Math.floor(col[1]);
        col[2] = tmp;
        results[i] = (col)
    }
    results[res_col.length] = (res_ratio[0]);
    results[res_col.length + 1] = (res_ratio[1]);

    return results;
}


function findMatch(color) {
    var col = [color[2], color[1], color[0]];
    var scale = cv.imread('./../scales/scale_rgb.jpg');
    var minimum = 1e6;
    var coords = {
        row: 0,
        col: 0,
        color: []
    };

    for(var i = 0; i < scale.rows; i++){
        for(var j = 0; j < scale.cols; j++){
            var pixel = scale.at(i, j);
            var point = [pixel.x, pixel.y, pixel.z];
            var dist = squareEuclidianDistance(col, point);
            if(dist - minimum < 1e-6){
                minimum = dist;
                coords.col = j;
                coords.row = i;
                coords.color = [point[2], point[1], point[0]];
            }
        }
    }

    console.log("matched: ", color, " to ", coords.color);

    return coords;
}

module.exports = {
    /**
     * Pick dominant colors from sample
     *
     * @param  {Mat} image sample as OpenCV Mat matrix
     *
     */
    pick: function(image) {
        return pick(image);
    },

    /**
     * Finds coordinates on color scale for dominant color
     *
     * @param  {RGB float vector} RGB color
     *
     */
    findMatch:  function(color){
        return findMatch(color);
    }
};



var main = function(image) {
    //console.log("Pick colors from sample");
    //return pick(image);
}


if (require.main === module) {
    main();
}