<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AR Marker Map</title>
    <link rel="stylesheet" href="vendor/twbs/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/"
</head>
<body>
<div class="container">
    <!-- Static navbar -->
    <nav class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button"
                        class="navbar-toggle collapsed"
                        data-toggle="collapse"
                        data-target="#navbar"
                        aria-expanded="false"
                        aria-controls="navbar"
                >
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="https://github.com/gafk/AR-Marker-Map">AR Marker Map</a>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
                <ul class="nav navbar-nav">
                    <li>
                        <a href="https://github.com/gafk/AR-Marker-Map" target="_blank">
                            Инструмент размещения AR-меток на карте помещения
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="row">
        <div class="col-md-4">
            <button type="button" class="btn btn-primary" id="loadMapBtn">Загрузить карту</button>
        </div>
    </div>

    <div class="row">
        <div class="map" id="map"></div>
    </div>

    <input type="file"
           style="display: none"
           id="mapFile"
           accept="image/png"
    >
</div>

<script src="vendor/components/jquery/jquery.min.js"></script>
<script src="js/index.js"></script>
</body>
</html>