<?php
	
    include('getConnection.php');
    $conn = pdoConn('oggleboo_Visitors');

    $visitorId = $_POST['visitorId'];
    $userEmail = $_POST['userEmail'];
    $userName = $_POST['userName'];
    $occured = date('Y-m-d H:i:s');
    $success = "ono";

    try
    {
        $sql = "insert RegisteredUser (VisitorId,UserName,Email,Created) 
            values('".$visitorId."','".$userName."','".$userEmail."','".$occured."')";
        $stmt = $conn->prepare($sql);
        $stmt->execute();    
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = "error: ".$stmt1Success;
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }

    echo $success;
?>