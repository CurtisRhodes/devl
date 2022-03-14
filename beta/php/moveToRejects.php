<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $folderId = $_GET['folderId'];
        $level = $_GET['level'];

        if($level == 'folder') {
            $sql = "UPDATE CategoryFolder SET FolderImage=".$folderImage." WHERE Id=".$folderId;
        }
        if($level == 'parent') {
            $cmd = $pdo->query("select Parent from CategoryFolder where Id = ".$folderId);
            $catRow = $cmd->fetch();
            $sql = "UPDATE CategoryImageLink SET FolderImage=".$folderImage." WHERE  Id=".$catRow[Id];
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
