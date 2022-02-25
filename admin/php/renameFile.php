<?php
    $success = "ono";
    try
    {
        $path = $_GET['path'];
        $oldFileName = $_GET['oldFileName'];
        $newFileName = $_GET['newFileName'];

        $files = preg_grep('/^([^.])/', scandir($path));

        $file = $files.

        $success = "ok";
        //$success = "parentId: ". $parentId. " newFolderName: ". $newFolderName ." rootFolder: ". $rootFolder. " folderType: ". $folderType;
    }
    catch(Exception $e) {
        $pdo->rollback();
        $success = $e->getMessage();
    }
    echo $success;

?>
