<?php
    $success = "ono";
    try
    {
        $path = $_GET['path'];
        $folderId = $_GET['folderId'];

        //preg_grep removes the dots
        $scanned_directory = preg_grep('/^([^.])/', scandir($path));

        $fileCount = count($scanned_directory);


        include('yagdrassel.php');
        $pdo = pdoConn();

        $sql = "UPDATE CategoryFolder SET Files=".$fileCount." WHERE Id=".$folderId;
        $stmt= $pdo->prepare($sql);
        $stmt->execute();

        $success="ok ".$fileCount.' $path: '.$path;

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
