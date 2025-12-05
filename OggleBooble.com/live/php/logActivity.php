<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');
  
        $activityCode = $_POST['activityCode'];
        $folderId = $_POST['folderId'];
        $visitorId = $_POST['visitorId'];
        $calledFrom = $_POST['calledFrom'];

        $Occured = date('Y-m-d H:i:s');

        $sql = "insert into ActivityLog (ActivityCode, FolderId, VisitorId, CalledFrom, Occured) ".
               "values ('".$activityCode."',".$folderId.",'".$visitorId."','".$calledFrom."','".$Occured."')";

        $stmt1 = $conn->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success.' .$sql; '.$sql;;
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = "Exception: ".$e->getMessage();
    }
    echo $success;

?>
