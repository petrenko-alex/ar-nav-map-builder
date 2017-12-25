$(function () {
    var map = $('#map');
    var loadMapBtn = $('#loadMapBtn');
    var mapFile = $('#mapFile');

    loadMapBtn.click(loadMap);
    mapFile.on('change', setMap);
    //map.click(canvasClicked);

    // Development only
    map.css('background-image', 'url(upload/plan1.png)');
});

function loadMap() {
    $('#mapFile').trigger('click');
}

function setMap() {
    var file = $('#mapFile').get(0).files[0];
    // TODO: Save to db

    var reader  = new FileReader();
    reader.onload = function(event) {
      var dataUri = event.target.result;
      $('#map').css('background-image', 'url(' + dataUri + ')');
    };

    reader.onerror = function(event) {
        console.error('Оишбка чтения файла: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
}

function  canvasClicked(event) {
    // TODO: Save to db


    var marker = new Image();
    marker.onload = function() {
        var ctx = $('#map').get(0).getContext('2d');
        var coordinates = getMousePos(event);
        var offset = 16;

        ctx.drawImage(marker, coordinates.x - offset, coordinates.y - offset);
    };
    marker.src = 'upload/marker.png';
}

function getMousePos(event) {
    var canvas = $('#map');
    var rect = canvas.get(0).getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function getDriver() {
    return neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "neo4j"));
}

function getSession() {
    var driver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "neo4j"));
    return driver.session();
}

function testQuery() {
    var session = getSession();
    session
        .run('MERGE (james:Person {name : {nameParam} }) RETURN james.name AS name', {nameParam: 'James'})
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record.get('name'));
            });
            session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
}