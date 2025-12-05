<?php
	
    include('getConnection.php');
    $conn = pdoConn('oggleboo_Feedback');


    $visitorId = $_POST['visitorId'];
    $folderId = $_POST['folderId'];
    $commentText = $_POST['commentText'];
    $occured = date('Y-m-d H:i:s');
    $success = "ono";

    try
    {
        $sql = "insert FolderComment (VisitorId,FolderId,CommentText,Occured) ".
                "values('".$visitorId."',".$folderId.",'".$commentText."','".$occured."')";
        $stmt = $conn->prepare($sql);
        $stmt->execute();    
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success." insert ".$sql;
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    $conn = null;
    echo $success;
?>