var counter = 1;

$(function () {
    var map = $('#map');
    var loadMapBtn = $('#loadMapBtn');
    var mapFile = $('#mapFile');
    var mapList = $('#mapList');

    // Set bindings
    loadMapBtn.click(loadMap);
    mapFile.on('change', setMap);
    map.click(mapClicked);
    mapList.change(mapChanged);


    loadMaps();

    // Development only

});

function loadMap() {
    $('#mapFile').trigger('click');
}

function setMap() {
    var file = $('#mapFile').get(0).files[0];

    var reader = new FileReader();
    reader.onload = function (event) {
        var dataUri = event.target.result;
        $('#map').css('background-image', 'url(' + dataUri + ')');
        saveMapToDb(file, dataUri);
    };

    reader.onerror = function (event) {
        console.error('Оишбка чтения файла: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
}

function mapClicked(event) {
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

function saveMapToDb(file) {
    var fileName = file.name;
    var mapName = fileName.substring(0, fileName.search('.png'));

    var session = getSession();
    session.run(
        'CREATE (:Map {mapName: {mapNameParam}, mapFile: {mapFileParam}})',
        {mapNameParam: mapName, mapFileParam: fileName}
    )
        .then(function (result) {
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function loadMaps() {
    var mapList = $('#mapList');
    var session = getSession();
    session
        .run('MATCH (maps:Map) RETURN maps.mapName AS mapName, maps.mapFile AS mapFile, maps.id AS mapId')
        .then(function (result) {
            console.log(result);
            result.records.forEach(function (record) {
                var map = $('<option/>');
                map.attr('value', record.get('mapFile'));
                map.text(record.get('mapName'));
                map.attr('id', record.get('mapId'));
                mapList.append(map);
            });

            // Set init map
            if(result.records.length) {
                var firstRecord = result.records[0];
                setMapByFileName(firstRecord.get('mapFile'));
            }

        })
        .catch(function (error) {
            console.log(error);
        });
}

function mapChanged(event) {
    setMapByFileName(this.value);
}

function setMapByFileName(fileName) {
    var map = $('#map');
    fileName = 'upload/' + fileName;
    var url = 'url(\'' + fileName + '\')';
    map.css('background-image', url);
}