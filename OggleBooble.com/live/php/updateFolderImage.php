<?php
try
{
    include('getConnection.php');
    $conn = pdoConn('oggleboo_Danni');

    $link = $_POST['link'];
    $folderId = $_POST['folderId'];
    $level = $_POST['level'];

    if($level == 'folder') {
        $sql = "UPDATE CategoryFolder SET FolderImage='".$link."' WHERE Id=".$folderId;
    }
    if($level == 'parent') {
        $cmd = $conn->query("select Parent as ParentId from CategoryFolder where Id = ".$folderId);
        $catRow = $cmd->fetch();
        $parentId = $catRow[ParentId];
        $sql = "UPDATE CategoryFolder SET FolderImage='".$link."' WHERE  Id=".$parentId;
    }
    if($level == 'grandparent') {
        $cmd = $conn->query("select Parent as ParentId from CategoryFolder where Id = ".$folderId);
        $catRow = $cmd->fetch();
        $parentId = $catRow[ParentId];
        $cmd = $conn->query("select Parent as grandParentId from CategoryFolder where Id = ".$parentId);
        $catRow = $cmd->fetch();
        $grandParentId = $catRow[grandParentId];
        $sql = "UPDATE CategoryFolder SET FolderImage='".$link."' WHERE  Id=".$grandParentId;
    }

    $stmt= $conn->prepare($sql);
    $stmt->execute();
    $stmt1Success = $stmt->errorCode();
    if($stmt1Success == '00000') {
        $success = 'ok';
    }
    else {
        $success = $stmt1Success;
    }

    echo $success;
    $conn = null;
}
catch(Exception $e) {
    echo $e->getMessage();
}
?>
