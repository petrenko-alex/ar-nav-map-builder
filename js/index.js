$(function () {
    var map = $('#map');
    var loadMapBtn = $('#loadMapBtn');
    var mapFile = $('#mapFile');

    loadMapBtn.click(loadMap);
    mapFile.on('change', setMap);
});

function loadMap() {
    $('#mapFile').trigger('click');
}

function setMap() {
    var file = $('#mapFile').get(0).files[0];

    var reader  = new FileReader();
    reader.onload = function(event) {
      var dataUri = event.target.result;
      var context = document.getElementById('map').getContext('2d');
      var img = new Image();

      img.onload = function() {
          context.drawImage(img, 0, 0);
      };
      img.src = dataUri;
    };

    reader.onerror = function(event) {
        console.error('Оишбка чтения файла: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
}