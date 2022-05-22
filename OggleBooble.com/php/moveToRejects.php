<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];
        $rejectFolderId = -6;

        $sql = "update ImageFile set FolderId=".$rejectFolderId." where Id='".$imageFileId."'";
        $stmt= $pdo->prepare($sql);
        $stmt->execute();
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $sql = "update CategoryImageLink SET ImageCategoryId=".$rejectFolderId." WHERE ImageLinkId='".$imageFileId."'";
            $stmt= $pdo->prepare($sql);
            $stmt->execute();
            $stmt1Success = $stmt->errorCode();
            if($stmt1Success == '00000') {
                $success = 'ok';
            }
            else {
                $success = $stmt1Success." sql: ".$sql;
            }
        }
        else {
            $success = $stmt1Success." sql: ".$sql;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
