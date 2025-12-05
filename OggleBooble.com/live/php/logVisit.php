<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Visitors');
  
        $visitorId = $_POST['visitorId'];
        $appName = $_POST['appName'];
        $visitDate = date('Y-m-d');
        $occured= date('Y-m-d H:i:s');

        $sql = "insert into Visit (VisitorId, AppCode, VisitDate, Occured) values ('".$visitorId."','".$appName."','".$visitDate."','".$occured."')";

        $stmt1 = $conn->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = 'code: '.$stmt1Success;
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = 'e: '.$e->getMessage();
    }
    echo $success;

?>
