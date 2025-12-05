<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');
  
        $eventCode = $_POST['EventCode'];
        $folderId = $_POST['FolderId'];
        $visitorId = $_POST['VisitorId'];
        $calledFrom = $_POST['CalledFrom'];

        $occured = date('Y-m-d H:i:s');

        $sql = "insert into EventLog (EventCode, FolderId, VisitorId, CalledFrom, Occured) ".
               "values ('".$eventCode."',".$folderId.",'".$visitorId."','".$calledFrom."','".$occured."')";

        $conn->exec($sql);
        $success = "ok";
        $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
