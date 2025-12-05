<?php

    include('getConnection.php');
    $conn = pdoConn('oggleboo_Danni');

    $folderId = $_GET['folderId'];
    
    $sql = "select Id, FileName from ImageFile where FolderId in (select Id from CategoryFolder where Parent =".$folderId.") limit 1";
    $cmd = $conn->query($sql);
    $Imageinfo = $cmd->fetch();
        
    $sql = "UPDATE CategoryFolder SET FolderImage='".$Imageinfo[Id]."' WHERE Id=".$folderId;
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $stmt1Success = $stmt->errorCode();
    if($stmt1Success == '00000') {
        $success = $Imageinfo[FileName];
    }
    else {
        $success = "Error: ".$stmt1Success;
    }

    echo $success;

?>
