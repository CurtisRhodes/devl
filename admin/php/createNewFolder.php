<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $parentId = $_GET['parentId'];
        $newFolderName = $_GET['newFolderName'];
        $rootFolder = $_GET['rootFolder'];
        $folderType = $_GET['folderType'];

        $stmt = $pdo->prepare("INSERT INTO users (Parent,FolderName,RootFolder,FolderPath,SortOrder,FolderType) VALUES (?,?,?,?,?,?)");
        $pdo->beginTransaction();

        $stmt->execute([$parentId, $newFolderName, $rootFolder, 0, $folderType]);

        $pdo->commit();
        $pdo = null;
    }
    catch(Exception $e) {
        $pdo->rollback();
        $success = $e->getMessage();
    }
    echo $success;

?>
