/* Author: Tatarize
*   
*  Website: http://godsnotwheregodsnot.blogspot.com/
*
*  Original post: http://godsnotwheregodsnot.blogspot.com/2013/11/field-diamond-squared-fractal-terrain.html
*
*  Source: http://tatarize.nfshost.com/FieldDiamondSquare.htm
*
*/


export function diamondSquaredMap(x, y, width, height, iterations) {
    var map = fieldDiamondSquared(x, y, x+width, y+height, iterations);

    var maxdeviation = getMaxDeviation(iterations);

    for (var j = 0; j < width; j++) {
        for (var k = 0; k < height; k++) {
            map[j][k] = map[j][k] / maxdeviation;
        }
    }
    return map;

    function create2DArray(d1, d2) {
        var x = [],
                i = 0,
                j = 0;

        for (i = 0; i < d1; i += 1) {
            x[i] = [];
        }
        return x;
    }

    function fieldDiamondSquared(x0, y0, x1, y1, iterations) {
        if (x1 < x0) { return null; }
        if (y1 < y0) { return null; }
        var finalwidth  = x1 - x0;
        var finalheight = y1 - y0;
        var finalmap = create2DArray(finalwidth, finalheight);
        if (iterations === 0) {
            for (var j = 0; j < finalwidth; j++) {
                for (var k = 0; k < finalheight; k++) {
                    finalmap[j][k] =  displace(iterations,x0+j,y0+k) ;
                }
            }
            return finalmap;
        }
        var ux0 = Math.floor(x0 / 2) - 1;
        var uy0 = Math.floor(y0 / 2) - 1;
        var ux1 = Math.ceil(x1 / 2) + 1;
        var uy1 = Math.ceil(y1 / 2) + 1;
        var uppermap = fieldDiamondSquared(ux0, uy0, ux1, uy1, iterations-1);

        var uw = ux1 - ux0;
        var uh = uy1 - uy0;

        var cx0 = ux0 * 2;
        var cy0 = uy0 * 2;

        var cw = uw*2-1;
        var ch = uh*2-1;
        var currentmap = create2DArray(cw,ch);

        for (var j = 0; j < uw; j++) {
            for (var k = 0; k < uh; k++) {
                currentmap[j*2][k*2] = uppermap[j][k];
            }
        }
        var xoff = x0 - cx0;
        var yoff = y0 - cy0;
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k - 1] + currentmap[j - 1][k + 1] + currentmap[j + 1][k - 1] + currentmap[j + 1][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 2; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 2; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }

        for (var j = 0; j < finalwidth; j++) {
            for (var k = 0; k < finalheight; k++) {
                finalmap[j][k] = currentmap[j+xoff][k+yoff];
            }
        }

        return finalmap;
    }

    // Random function to offset
    function displace(iterations, x, y) {
        return (((PRH(iterations,x,y) - 0.5)*2)) / (iterations+1);
    }

    function getMaxDeviation(iterations) {
        var dev = 0.5 / (iterations+1);
        if (iterations <= 0) return dev;
        return getMaxDeviation(iterations-1) + dev;
    }

    //This function returns the same result for given values but should be somewhat random.
    function PRH(iterations,x,y) {
        var hash;
        x &= 0xFFF;
        y &= 0xFFF;
        iterations &= 0xFF;
        hash = (iterations << 24);
        hash |= (y << 12);
        hash |= x;
        var rem = hash & 3;
        var h = hash;

        switch (rem) {
            case 3:
                hash += h;
                hash ^= hash << 32;
                hash ^= h << 36;
                hash += hash >> 22;
                break;
            case 2:
                hash += h;
                hash ^= hash << 22;
                hash += hash >> 34;
                break;
            case 1:
                hash += h;
                hash ^= hash << 20;
                hash += hash >> 2;
        }
        hash ^= hash << 6;
        hash += hash >> 10;
        hash ^= hash << 8;
        hash += hash >> 34;
        hash ^= hash << 50;
        hash += hash >> 12;

        return (hash & 0xFFFF) / 0xFFFF;
    }

};