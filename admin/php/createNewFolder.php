<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $parentId = $_GET['parentId'];
        $newFolderName = $_GET['newFolderName'];
        $folderType = $_GET['folderType'];

        $sql = "Insert CategoryFolder values";
        $stmt= $pdo->prepare($sql);
        $stmt->execute([$SortOrder, $FolderId, $ItemId]);

        $stmt = null;
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
