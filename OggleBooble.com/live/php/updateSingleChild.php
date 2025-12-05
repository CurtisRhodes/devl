<?php

    include('getConnection.php');
    $conn = pdoConn('oggleboo_Danni');
    
    $folderId = $_POST['folderId'];
    $folderName = $_POST['folderName'];
    $commentText = $_POST['commentText'];
    $success = "ono";
    try
    {
        $sql = "update CategoryFolder set FolderName = '".$folderName."' where Id=".$folderId;
        $stmt = $conn->prepare($sql);
        $stmt->execute();    
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $sql = 'SELECT FolderId from FolderDetail WHERE FolderId ='.$folderId;
            $stmt = $conn->prepare($sql);
            $stmt->execute([$_GET['FolderId']]);
            if($stmt->fetchColumn()) {
                $sql = "update FolderDetail set FolderComments = '".$commentText."' where FolderId=".$folderId;
                $stmt = $conn->prepare($sql);
                $stmt->execute();    
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok';
                }
                else {
                    $success = "update FolderComment:".$stmt1Success;
                }
            }
            else {
                $sql = "insert FolderDetail (FolderId,CommentText) values(.$folderId.",'".$commentText."')";
                $stmt = $conn->prepare($sql);
                $stmt->execute();    
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok';
                }
                else {
                    $success = "insert FolderComment:".$stmt1Success;
                }
            }
        }
        else {
            $success = "update CategoryFolder :".$stmt1Success;
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    $conn = null;
    echo $success;
?>