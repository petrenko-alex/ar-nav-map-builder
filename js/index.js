var counter = 1;

$(function () {
    var map = $('#map');
    var loadMapBtn = $('#loadMapBtn');
    var mapFile = $('#mapFile');

    loadMapBtn.click(loadMap);
    mapFile.on('change', setMap);
    map.click(mapClicked);

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

function  mapClicked(event) {
    // TODO: Save to db

    console.log('map clicked');
    putMarkerOnMap();
}

function getMousePos(event) {
    var canvas = $('#map');
    var rect = canvas.get(0).getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function putMarkerOnMap() {
    // Create DOM elements
    var outerDiv = $('<div/>');
    var img = $('<img/>');
    var p = $('<p/>');

    // Setup created elements
    outerDiv.addClass('marker');
    outerDiv.attr('id', 'marker' + counter);
    outerDiv.css('left', (event.clientX - 16) + 'px');
    outerDiv.css('top', (event.clientY - 16) + 'px');
    img.attr('src', 'upload/marker.png');
    p.text(counter++);

    // Add elements to DOM structure
    outerDiv.append(img);
    outerDiv.append(p);
    $('#map').after(outerDiv);
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