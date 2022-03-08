<?php
    $success = "ono";
    try
    {
        include('settings.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];

        $pdo->beginTransaction();

        $sql = "delete from ImageFile where Id=".$imageFileId;
        $stmt= $pdo->prepare($sql);
        $stmt->execute();

        $sql = "delete from CategoryImageLink where ImageLinkId=".$imageFileId;
        $stmt= $pdo->prepare($sql);
        $stmt->execute();

        $pdo->commit();

        $success="ok";

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
