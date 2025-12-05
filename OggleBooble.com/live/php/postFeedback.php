<?php
	
    include('getConnection.php');
    $conn = pdoConn('oggleboo_Feedback');

    $visitorId = $_POST['visitorId'];
    $folderId = $_POST['folderId'];
    $commentText = $_POST['commentText'];
    $feedbackCat = $_POST['feedbackCat'];
    $email = $_POST['email'];
    $occured = date('Y-m-d H:i:s');
    $success = "ono";

    try
    {
        $sql = "insert Feedback (VisitorId,FolderId,CommentText,FeedbackCat,Occured,Email) ".
                "values('".$visitorId."',".$folderId.",'".$commentText."','".$feedbackCat."','".$occured."','".$email."')";
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