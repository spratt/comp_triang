"use strict";
(function() {
    // configuration
    var pointRadius = 5;
    var clickBox = 60;
    
    var pointSets = [new PointSet(document.getElementById('c1')),
                     new PointSet(document.getElementById('c2'))];

    var output = document.getElementById('output');

    function saveState() {
        var state = null;
        var title = null;
        var url = document.location.toString().split('?')[0];
        url += '?' + pointSets[0].toString() + '|' + pointSets[1].toString();
        history.pushState(state, title, url);
    }

    var add = null;
    function getRadioValue() {
        add = document.querySelector('input[name="add_group"]:checked').value;
        console.log('Radio value: ' + add);
    }
    getRadioValue();
    

    var checkButton = document.getElementById('check');
    function clearCheckButton() {
        output.innerHTML = '';
    }

    function drawPoint(context, x, y, color) {
        if(!color) {
            color = 'black';
        }
        context.beginPath();
        context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    function drawEdge(context, pt1, pt2, color) {
        if(!color) {
            color = 'black';
        }
        context.beginPath();
        context.moveTo(pt1.x, pt1.y);
        context.lineTo(pt2.x, pt2.y);
        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();
    }

    function draw(pointSet) {
        clearCheckButton();
        var context = pointSet.context;
        (function() {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        })();
        pointSet.convexHull();
        saveState();
        var points = pointSet.points;
        var chPoints = pointSet.chPoints;
        var edges = pointSet.edges;
        var chEdges = pointSet.chEdges;
        var selected_point = pointSet.selected_point;
        for(var i = 0; i < points.length; ++i) {
            var point = points[i];
            drawPoint(context, point.x, point.y, 'green');
        }
        for(var i = 0; i < chPoints.length; ++i) {
            var pt = points[chPoints[i]];
            drawPoint(context, pt.x, pt.y, 'blue');
        }
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var pt1 = points[e[0]];
            var pt2 = points[e[1]];
            drawEdge(context, pt1, pt2);
        }
        for(var i = 0; i < chEdges.length; ++i) {
            var e = chEdges[i];
            var pt1 = points[e[0]];
            var pt2 = points[e[1]];
            drawEdge(context, pt1, pt2);
        }
        if(selected_point > -1) {
            var point = points[selected_point];
            drawPoint(context, point.x, point.y, 'orange');
        }
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function sqrDistance(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }
    
    function findClickedPoint(p, pointSet) {
        var points = pointSet.points;
        var threshold = Math.pow(pointRadius, 2) + clickBox;
        for(var i = 0; i < points.length; ++i) {
            var candidate = points[i];
            var sqrDist = sqrDistance(p, candidate);
            if(threshold > sqrDist) {
                return i;
            }
        }
        return -1;
    }

    function addPoint(p, pointSet) {
        var clicked_point = findClickedPoint(p, pointSet);
        console.log('Clicked point: ' + clicked_point);
        if(clicked_point > -1) {
            console.log('deleting point');
            pointSet.removePoint(clicked_point);
        } else {
            console.log('adding point');
            pointSet.addPoint(p);
        }
    }

    function addEdge(p, pointSet) {
        var selected_point = pointSet.selected_point;
        var clicked_point = findClickedPoint(p, pointSet);
        var edges = pointSet.edges;
        var chPoints = pointSet.chPoints;
        var points = pointSet.points;
        if(clicked_point > -1) {
            if(clicked_point === selected_point) {
                console.log('Unselecting point');
                pointSet.unselectPoint();
            } else if(selected_point === -1) {
                console.log('Selecting point');
                pointSet.selectPoint(clicked_point);
            } else {
                var found = pointSet.hasEdge(selected_point, clicked_point);
                if(found > -1) {
                    console.log('Removing edge');
                    pointSet.removeEdge(found);
                } else {
                    console.log('Adding edge');
                    pointSet.addEdge(selected_point, clicked_point);
                }
            }
        }            
    }

    function selectCHPoint(p, pointSet) {
        var selected_point = pointSet.selected_point;
        var chPoints = pointSet.chPoints;
        var clicked_point = findClickedPoint(p, pointSet);
        if(clicked_point > -1) {
            if(clicked_point === selected_point) {
                console.log('Unselecting point');
                pointSet.unselectPoint();
            } else if(chPoints.indexOf(clicked_point) !== -1) {
                console.log('Selecting point ' + clicked_point);
                pointSet.selectPoint(clicked_point);
            } else {
                console.log('Invalid point');
            }
        } else {
            console.log('No point clicked');
        }        
    }

    function movePoint(start, end, pointSet) {
        var clicked_point = findClickedPoint(start, pointSet);
        if(clicked_point > -1) {
            pointSet.movePoint(clicked_point, end);
        }
    }

    var inputNodeList = document.querySelectorAll('input');
    for(var i = 0; i < inputNodeList.length; ++i) {
        var e = inputNodeList[i];
        e.addEventListener('click', function(evt) {
            pointSets.forEach(function(pointSet) {
                pointSet.unselectPoint();
                draw(pointSet);
            });
        });
    }

    function resize() {
        pointSets.forEach(function(pointSet) {
            pointSet.canvas.width = window.innerWidth / 2;
            draw(pointSet);
        });
    }

    function highlightPoint(i, pointSet) {
        var point = pointSet.points[i];
        drawPoint(pointSet.context, point.x, point.y, 'red');
    }

    function onLoad() {
        // restore state
        var url = decodeURI(document.location.toString());
        if(url.indexOf('?') !== -1) {
            var state = url.split('?')[1];
            console.log('Reloading from state: ' + state);
            var states = state.split('|');
            pointSets[0].fromString(states[0]);
            pointSets[1].fromString(states[1]);
        }

        var useCapture = false;
        window.addEventListener('resize', resize, useCapture);
        resize();

        document.getElementById('clear').addEventListener('click', function(evt) {
            if(window.confirm('Are you sure you want to clear the points?')) {
                pointSets.forEach(function(pointSet) {
                    pointSet.clear();
                    draw(pointSet);
                });
            }
        });
        document.getElementById('triangulate').addEventListener('click', function(evt) {
            pointSets.forEach(function(pointSet) {
                pointSet.triangulate();
                draw(pointSet);
            });
        });
        document.getElementById('layers').addEventListener('click', function(evt) {
            pointSets.forEach(function(pointSet) {
                pointSet.layers();
                draw(pointSet);
            });
        });
        checkButton.addEventListener('click', function(evt) {
            pointSets.forEach(function(pointSet) { draw(pointSet); });
            var ret = PointSet.checkCompatible(pointSets[0], pointSets[1]);
            if(ret === true) {
                output.innerHTML = 'Compatible!';
            } else {
                if(typeof ret === 'string') {
                    output.innerHTML = 'Incompatible: ' + ret;
                } else if(ret[0]) {
                    output.innerHTML = 'Incompatible: ' + ret[0];
                    highlightPoint(ret[1], pointSets[0]);
                    highlightPoint(ret[2], pointSets[1]);
                }
            }
        });
        pointSets.forEach(function(pointSet) {
            var start = null;
            pointSet.canvas.addEventListener('mousedown', function(evt) {
                start = getMousePos(pointSet.canvas, evt);
            });
            pointSet.canvas.addEventListener('click', function(evt) {
                pointSets.forEach(function(pointSet) { draw(pointSet); });
                getRadioValue();
                var p = getMousePos(pointSet.canvas, evt);
                console.log('click at (' + p.x + ',' + p.y + ')');
                if(add === 'add_points') {
                    addPoint(p, pointSet);
                } else if(add === 'add_edges') {
                    addEdge(p, pointSet);
                } else if(add === 'select_ch_point') {
                    selectCHPoint(p, pointSet);
                } else if(add === 'move_points') {
                    console.log('Moving point from ', start, ' to ', p);
                    movePoint(start, p, pointSet);
                } else {
                    console.error('Invalid add_group value');
                }
                start = null;
                draw(pointSet);
            });
        });
        var tooSoon = false;
        pointSets.forEach(function(pointSet) {
            pointSet.canvas.addEventListener('mousemove', function(evt) {
                var hover_point = getMousePos(pointSet.canvas, evt);
                var p = -1;
                if(!tooSoon) {
                    p = findClickedPoint(hover_point, pointSet);
                }
                if(p !== -1) {
                    tooSoon = true;
                    console.log('Hovering over point: ', p);
                    console.log('points[', p, ']:     ', pointSet.points[p]);
                    var tooltip = document.getElementById('tooltip');
                    if(pointSet.labels[p]) {
                        console.log('labels[', p, ']: ', pointSet.labels[p]);
                        tooltip.innerHTML = 'Vertex: ' + pointSet.labels[p];
                    } else {
                        tooltip.innerHTML = 'No label';
                    }
                    var milliseconds = 500;
                    setTimeout(function() {tooSoon = false;}, milliseconds);
                }
            });
        });
    }

    (function setupOnLoad() {
        var fn = function() {};
        
        if(typeof window.onload === 'function') {
            fn = window.onload;
        }
        
        window.onload = function() {
            onLoad();
            fn();
        }
    })();
})();
