<?php

    $path = $_GET['path'];

    //preg_grep removes the dots

    $files = preg_grep('/^([^.])/', scandir($path));

    $results = array();

    foreach ($files as $file) {
        if (is_dir($file)) {
            array_push($results,{$file,"dir"});
        }
        else{
            array_push($results,{$file,"file"});
        }
    }

    echo json_encode($results);

?>