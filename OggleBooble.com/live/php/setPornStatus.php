<?php

    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Visitors');

        $visitorId = $_POST['visitorId'];
        $pornStatus = $_POST['pornStatus'];

        $sql = "UPDATE Visitor SET PornStatus='".$pornStatus."' WHERE VisitorId='".$visitorId."'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $stmt1Success = $stmt->errorCode();

        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = "error code:".$stmt1Success." sql: ".$sql;
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>