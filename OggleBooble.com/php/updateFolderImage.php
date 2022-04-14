<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $folderImage = $_GET['folderImage'];
        $folderId = $_GET['folderId'];
        $level = $_GET['level'];

        if($level == 'folder') {
            $sql = "UPDATE CategoryFolder SET FolderImage=".$folderImage." WHERE Id=".$folderId;
        }
        if($level == 'parent') {
            $cmd = $pdo->query("select * from CategoryFolder where Id = ".$folderId);
            $catRow = $cmd->fetch();
            $sql = "UPDATE CategoryFolder SET FolderImage=".$folderImage." WHERE  Id=".$catRow[Parent];
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
