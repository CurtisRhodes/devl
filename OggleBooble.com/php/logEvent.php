<?php
    try
    {
        include('registro.php');
        $pdo = pdoConn();
  
        $eventCode = $_POST['eventCode'];
        $folderId = $_POST['folderId'];
        $visitorId = $_POST['visitorId'];
        $calledFrom = $_POST['calledFrom'];

        $Occured = date('Y-m-d H:i:s');

        $sql = "insert into EventLog (EventCode, FolderId, VisitorId, CalledFrom, Occured) ".
               "values ('".$eventCode."',".$folderId.",'".$visitorId."','".$calledFrom."','".$Occured."')";

        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success.' .$sql; '.$sql;;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
