var counter = 1;

$(function () {
    var map = $('#map');
    var loadMapBtn = $('#loadMapBtn');
    var mapFile = $('#mapFile');
    var mapList = $('#mapList');
    var delMarkersBtn = $('#delMarkersBtn');
    var delMapBtn = $('#delMapBtn');

    // Set bindings
    loadMapBtn.click(loadMap);
    mapFile.on('change', setMap);
    map.click(mapClicked);
    mapList.change(mapChanged);
    delMarkersBtn.click(deleteMarkers);
    delMapBtn.click(deleteMap);

    loadMaps();
});

function loadMap() {
    $('#mapFile').trigger('click');
}

function setMap() {
    var file = $('#mapFile').get(0).files[0];
    console.log(file);
    var fileName = file.name;
    var mapList = $('#mapList');

    var reader = new FileReader();
    reader.onload = function (event) {
        // Set background
        var dataUri = event.target.result;
        $('#map').css('background-image', 'url(' + dataUri + ')');

        // Add map to list
        var mapName = fileName.substring(0, fileName.search('.png'));
        var map = $('<option/>');
        map.attr('value', fileName);
        map.text(mapName);
        mapList.append(map);
        $('#mapList option:last').attr('selected', 'selected');

        saveMapToDb(file, dataUri);

        $('div.marker').remove();
    };

    reader.onerror = function (event) {
        console.error('Оишбка чтения файла: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
}

function mapClicked(event) {
    var markerID = putMarkerOnMap();
    saveMarkerToDb(markerID);
}

function putMarkerOnMap() {
    var markerId = 'marker' + counter;
    // Create DOM elements
    var outerDiv = $('<div/>');
    var img = $('<img/>');
    var p = $('<p/>');

    // Setup created elements
    outerDiv.addClass('marker');
    outerDiv.attr('id', markerId);
    outerDiv.css('left', (event.clientX - 16) + 'px');
    outerDiv.css('top', (event.clientY - 16) + 'px');
    img.attr('src', 'upload/marker.png');
    p.text(counter++);

    // Add elements to DOM structure
    outerDiv.append(img);
    outerDiv.append(p);
    $('#map').after(outerDiv);

    return markerId;
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
        'CREATE (map:Map {mapName: {mapNameParam}, mapFile: {mapFileParam}}) RETURN ID(map) AS mapId',
        {mapNameParam: mapName, mapFileParam: fileName})
        .then(function (result) {
            console.log(result);
            if (result.records.length) {
                var id = result.records[0].get('mapId');
                $('#mapList option:last').attr('id', id);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function saveMarkerToDb(markerID) {
    var selector = '#' + markerID;
    var markerDiv = $(selector);

    // Get current map
    var curMapId = $('#mapList').find(':selected').attr('id');

    // Get marker properties
    var markerX = markerDiv.css('left');
    var markerY = markerDiv.css('top');
    var markerName = markerDiv.find('p').text();

    // Save marker node
    var session = getSession();
    session.run(
        'CREATE (marker:Marker {markerName: {markerNameParam}, markerId: {markerIdParam}, x: {xParam}, y: {yParam}, mapId: {mapIdParam}})',
        {markerNameParam: markerName, markerIdParam: markerID, xParam: markerX, yParam: markerY, mapIdParam: curMapId})
        .then(function (result) {
            console.log('create node');
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
        });

    // Add relationship with map
    session.run(
        'MATCH (map:Map),(marker:Marker) WHERE ID(map) = {mapIdParam} AND marker.markerId = {markerIdParam} CREATE(marker)-[r:PLACED_ON]->(map) RETURN r',
        {mapIdParam: Number(curMapId), markerIdParam: '' + markerID + ''})
        .then(function (result) {
            console.log('create rel with map');
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
        });

    // Add relationship with prev marker
    var markerNum = Number(markerName);
    if (markerNum > 1) {
        var prevMarkerNum = markerNum - 1;
        session.run(
            'MATCH (prev:Marker),(cur:Marker) WHERE prev.markerName = {prevMarkerName} AND cur.markerName = {curMarkerName} AND prev.mapId = cur.mapId CREATE(prev)-[r:NEXT]->(cur) RETURN r',
            {prevMarkerName: String(prevMarkerNum), curMarkerName: String(markerNum)})
            .then(function (result) {
                console.log('create rel with prev node');
                console.log(result);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}

function loadMaps() {
    var mapList = $('#mapList');
    var session = getSession();
    session
        .run('MATCH (maps:Map) RETURN maps.mapName AS mapName, maps.mapFile AS mapFile, ID(maps) AS mapId')
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
            if (result.records.length) {
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

    // Re-initialize markers
    $('div.marker').remove();
    loadMarkers();
}

function loadMarkers() {
    var curMapId = $('#mapList').find(':selected').attr('id');

    var session = getSession();
    session.run(
        'MATCH(marker:Marker)-[r:PLACED_ON]->(map:Map) WHERE ID(map) = {mapId} RETURN marker',
        {mapId: Number(curMapId)})
        .then(function (result) {
            result.records.forEach(function (record) {
                putMarkerOnMapFromDb(record.get('marker').properties);
            })
        })
        .catch(function (error) {
            console.log(error);
        });
}

function putMarkerOnMapFromDb(markerObject) {
    var markerId = markerObject.markerId;
    // Create DOM elements
    var outerDiv = $('<div/>');
    var img = $('<img/>');
    var p = $('<p/>');

    // Setup created elements
    outerDiv.addClass('marker');
    outerDiv.attr('id', markerId);
    outerDiv.css('left', markerObject.x);
    outerDiv.css('top', markerObject.y);
    img.attr('src', 'upload/marker.png');
    p.text(markerObject.markerName);

    // Init counter
    var markerNum = Number(markerObject.markerName);
    if(counter < markerNum) {
        counter = markerNum + 1;
    }

    // Add elements to DOM structure
    outerDiv.append(img);
    outerDiv.append(p);
    $('#map').after(outerDiv);

    return markerId;
}

function deleteMarkers() {
    var curMapId = $('#mapList').find(':selected').attr('id');
    // Delete from db
    var session = getSession();
    session.run(
        'MATCH (markers: Marker) WHERE markers.mapId = {mapIdParam} DETACH DELETE markers',
        {mapIdParam: String(curMapId)})
        .then(function (result) {
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
        });

    // Delete from map
    $('div.marker').remove();
}

function deleteMap() {
    var curMapId = $('#mapList').find(':selected').attr('id');
    // Delete from db
    var session = getSession();
    session.run(
        'MATCH(map:Map) WHERE ID(map) = {mapIdParam} DELETE map',
        {mapIdParam: Number(curMapId)})
        .then(function (result) {
            // Delete from list
            var selector = 'select#mapList option#' + curMapId ;
            $(selector).remove();

            // Set other map or empty
            var curMapFileName = $('#mapList').find(':last').attr('value');
            if(curMapFileName !== undefined) {
                setMapByFileName(curMapFileName);
            } else {
                $('#map').css('background-image', 'url()');
            }
        })
        .catch(function (error) {
            console.log(error);
            var alert = $('<div>');
            alert.addClass('alert');
            alert.addClass('alert-danger');
            alert.text('Сначала нужно удалить все метки с карты.');
            $('#controlPanel').after(alert);
        });
}