<?php
    $success = "ono";
    try
    {
        $path = $_GET['path'];
        $oldFileName = $_GET['oldFileName'];
        $newFileName = $_GET['newFileName'];

        $files = preg_grep('/^([^.])/', scandir($path));

        $success = "not found";
        foreach ($files as $file) {
            if($file == $oldFileName) {
                list($width, $height, $type, $attr) = getimagesize($path.$oldFileName);
                $fileSize = filesize($path.$oldFileName);
                $success = $file.rename($path.$file, $path.$newFileName);
            }
        }  
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
