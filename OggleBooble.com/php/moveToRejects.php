<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];
        $rejectFolderId = -6;

            $sql = "update ImageFile set FolderId=".$rejectFolderId.", RootFolder='reject' where Id=".$imageFileId;
        }
        $stmt= $pdo->prepare($sql);
        $stmt->execute();

        $success="ok";

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
