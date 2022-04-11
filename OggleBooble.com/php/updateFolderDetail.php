<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $folderId = $_POST['folderId'];
        $folderName = $_POST['folderName'];
        $folderComments = $_POST['folderComments'];

//        $sql = "UPDATE CategoryFolder SET FolderName=".$folderName." WHERE Id=".$folderId;
//        $cmd= $pdo->prepare($sql);
//        $cmd->execute();

//        $cmd1 = $pdo->query("select * from CategoryFolder where Id=".$folderId);
//        $result = $cmd1->fetchAll();

//       if($result == "false") {
            $success = "$folderId: ".$folderId;
//            $sql = "insert FolderDetail (FolderId,FolderComments) values(.$folderId.,'.$folderComments.');
//            $stmt= $pdo->prepare($sql);
//            $stmt->execute();        
//       }
//       else {
//            $success = "update folderDetail";
//            $sql = "UPDATE FolderDetail SET FolderComments ='".$folderComments."' WHERE FolderId=".$folderId;
//           $stmt= $pdo->prepare($sql);
//            $stmt->execute();
//        }
        
//        $success = "ok";

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
