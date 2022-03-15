<?php
    $success = "ono";
    try
    {
        $needsSaving = $_GET['needsSaving'];
        $path = $_GET['path'];
        $oldFileName = $_GET['oldFileName'];
        $newFileName = $_GET['newFileName'];

        if($needsSaving == true)
        {
            $files = preg_grep('/^([^.])/', scandir($path));
            if($files !== false)
            {
                $fileCount = count($files);

                $success = $oldFileName." not found. FileCount: ".$fileCount;
                foreach ($files as $file) {
                    if($file == $oldFileName) {
                        $success = "found but";
                        if($file.rename($path.'/'.$file, $path.'/'.$newFileName) == true)
                            $success = "ok";
                        else {
                            $success = "rename fail  :".$path.'/'.$file;
                        }
                    }
                }  
            }
            else {
                $success = "scannDir fail. Path: [".$path."]";
            }
        }
        else {
            $success = "ok2";
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
