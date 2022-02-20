<?php


    $path = $_GET['path'];

    $results = scandir(.$path);

    echo json_encode($results);

?>