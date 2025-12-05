<?php
        $success = "ono";

        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');

        $folderId = $_POST['folderId'];
        $folderName = $_POST['folderName'];
        $folderComment = $_POST['folderComment'];

        $cmd = $conn->query("select * from FolderDetail where FolderId=".$folderId);
        $result = $cmd->fetch();

        if($result == false) {
            $sql = "insert FolderDetail (FolderId,FolderComments) values(".$folderId.",'".$folderComment."');";
            $stmt= $conn->prepare($sql);
            $stmt->execute();           
            if($stmt1Success == '00000') {
                $sql = "update CategoryFolder SET FolderName='".$folderName."' where Id=".$folderId;
                $stmt= $conn->prepare($sql);
                $stmt->execute();
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok insert';
                }
                else {
                    $success = "update CategoryFolder "$stmt1Success." sql: ".$sql;
                }
            }
            else {
                $success = " insert FolderDetail ".$stmt1Success." sql: ".$sql;
            }
        }
        else {
            $sql = "update FolderDetail SET FolderComments='".$folderComment."' where FolderId=".$folderId;
            $stmt= $conn->prepare($sql);
            $stmt->execute();
            $stmt1Success = $stmt->errorCode();
            if($stmt1Success == '00000') {
                $sql = "update CategoryFolder SET FolderName='".$folderName."' where Id=".$folderId;
                $stmt= $conn->prepare($sql);
                $stmt->execute();
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok update'; 
                }
                else {
                    $success = "update CategoryFolder "$stmt1Success." sql: ".$sql;
                }
            }
            else {
                $success = "update FolderDetail ".$stmt1Success." sql: ".$sql;
            }
        }
        $conn = null;
    echo $success;
?>
