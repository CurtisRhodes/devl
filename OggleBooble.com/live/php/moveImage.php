<?php

    include('getConnection.php');
    $conn = pdoConn('oggleboo_Danni');

    $imageId = $_POST['imageId'];
    $targetFolderId = $_POST['targetFolderId'];
    $success = "ono";
    try
    {
        $sql = "update ImageFile set FolderId=".$targetFolderId." where Id='".$imageId."'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();    
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = "err: ".$stmt1Success.". sql:".$sql;
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    $conn = null;
    echo $success;
?>