<?php

try
{
    $path = $_GET['path'];

    //preg_grep removes the dots
    $files = preg_grep('/^([^.])/', scandir($path));

    $results = [];

    foreach ($files as $file) {

        if ( is_dir($file) ) {
           $results[] = ['name' => $file,'type' => 'dir'];
        }
        else{
           $results[] = ['name' => $file,'type' => 'file'];
        }
    }
    echo json_encode($results);
//    echo json_encode($files);
}
catch(Exception $e) {
  echo 'Error: ' .$e->getMessage();
}

?>
