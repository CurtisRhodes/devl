<?php
    $success = "ono";
    try
    {
        include('settings.php');
        $pdo = pdoConn();

        $linkId = $_GET['$linkId'];
        $folderId = $_GET['folderId'];
        $level = $_GET['level'];

        if($level == 'folder') {
            $sql = "UPDATE CategoryFolder SET FolderImage=? WHERE Id=".$folderId;
        }
        if($level == 'parent') {
            $sql = "UPDATE CategoryImageLink SET SortOrder=? WHERE ImageCategoryId=? AND ImageLinkId=?";
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
