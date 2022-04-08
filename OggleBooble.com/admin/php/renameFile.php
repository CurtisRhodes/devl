<?php
    $success = "ok";
    try
    {
        $path = $_GET['path'];
        $oldFileName = $_GET['oldFileName'];
        $newFileName = $_GET['newFileName'];

        $files = preg_grep('/^([^.])/', scandir($path));
        if($files == false){
            $success = "scannDir fail. Path: [".$path."]";
        }
        else {
	        // $fileCount = count($files);
            foreach ($files as $file) {
                if($success == "ok")
                if($file == $oldFileName) {
                    if($file.rename($path.'/'.$file, $path.'/'.$newFileName) != true)
                        $success = "rename fail  :".$path.'/'.$file;
                }
            }  
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
