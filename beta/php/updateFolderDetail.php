<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $folderId = $_POST['folderId'];
        $folderName = $_POST['folderImage'];
        $folderComments = $_POST['folderComments'];

        if($level == 'folder') {
            $sql = "UPDATE CategoryFolder SET FolderName=".$folderName." WHERE Id=".$folderId;
        }
        $cmd= $pdo->prepare($sql);
        $cmd->execute();

        $cmd = $pdo->query("select * from FolderDetail where FolderId = ".$folderId);
        $folderDetailRow = $cmd->fetch();
        if($folderDetailRow == 'false') {
            $sql = "insert FolderDetail (FolderId,FolderComments) values(.$folderId.,'.$folderComments.');
            $stmt= $pdo->prepare($sql);
            $stmt->execute();        
        }
        else {
            $sql = "UPDATE FolderDetail SET FolderComments ='".$folderComments."' WHERE FolderId=".$folderId;
            $stmt= $pdo->prepare($sql);
            $stmt->execute();
        }

        $success = "ok";

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
