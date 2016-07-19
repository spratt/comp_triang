(function() {
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');
    var draw_centers = document.getElementById('draw_centers');
    var draw_circles = document.getElementById('draw_circles');
    var high_ch_points = document.getElementById('high_ch_points');
    var draw_ch_edges = document.getElementById('draw_ch_edges');
    var checkboxes = [
        draw_centers, draw_circles, high_ch_points, draw_ch_edges
    ];

    var centers = [];
    var chPoints = [];

    function clear() {
        centers = [];
        draw();
    }

    document.getElementById('clear').addEventListener('click', function(evt) {
        clear();
    });

    function draw() {
        (function() {
            console.log('clearing');
            context.clearRect(0, 0, canvas.width, canvas.height);
        })();
        convexHull(centers);
        console.log('drawing');
        for(var i = 0; i < centers.length; ++i) {
            var center = centers[i];
            if(draw_circles.checked) {
                console.log('drawing circles');
                strokeBigCircle(context, center.x, center.y, '#003300');
            }
            if(draw_centers.checked) {
                console.log('drawing centers');
                fillLittleCircle(context, center.x, center.y, 'green');
            }
        }
        for(var i = 1; i < chPoints.length; ++i) {
            var pt1 = chPoints[i-1];
            var pt2 = chPoints[i];
            if(high_ch_points.checked) {
                if(i == 2) {
                    fillLittleCircle(context, pt1.x, pt1.y, 'blue');
                }
                fillLittleCircle(context, pt2.x, pt2.y, 'blue');
            }

            if(draw_ch_edges.checked) {
                context.beginPath();
                context.moveTo(pt1.x, pt1.y);
                context.lineTo(pt2.x, pt2.y);
                context.lineWidth = 1;
                context.stroke();
            }
        }
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function fillLittleCircle(context, x, y, color) {
        var radius = 5
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    function strokeBigCircle(context, x, y, color) {
        var radius = 300;
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.lineWidth = 5;
        context.strokeStyle = color;
        context.stroke();
    }

    canvas.addEventListener('click', function(evt) {
        var p = getMousePos(canvas, evt);
        console.log('click at (' + p.x + ',' + p.y + ')');
        // if we have clicked on a circle center
        if(false) {
            // grab the circle
        } else {
            centers.push(p);
            draw();
        }
    });

    //////////////////////////////////////////////////////////////////////
    function isLeftTurn(p1, p2, p3) {
        var x1 = p2.x - p1.x;
        var x2 = p3.x - p1.x;
        var y1 = p2.y - p1.y;
        var y2 = p3.y - p1.y;
        return 0 > (x1 * y2 - x2 * y1);
    }

    function convexHull(points) {
        console.log('computing convex hull');
        chPoints = [];
        points.sort(function(a,b) {
            return b.x - a.x;
        });
        halfHull(points, true).forEach(function(pt) {
            chPoints.push(pt);
        });
        halfHull(points, false).reverse().forEach(function(pt) {
            chPoints.push(pt);
        });
    }

    function halfHull(points, left) {
        if(points.length < 3) {
            return points;
        }
        var stack = [];
        for(var i = 0; i < points.length; ++i) {
            var p = points[i];
            while(stack.length > 1 &&
                  isLeftTurn(stack[stack.length-2],
                             stack[stack.length-1], p) == left) {
                stack.pop();
            }
            stack.push(p);
        }
        return stack;
    }

    checkboxes.forEach(function(cbox) {
        cbox.addEventListener('click', function(evt) {
            console.log('Clicked');
            draw();
        });
    });
})();
