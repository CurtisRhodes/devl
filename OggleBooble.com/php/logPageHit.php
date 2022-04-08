<?php
    try
    {
        include('registro.php');
        $pdo = pdoConn();
  
        $visitorId = $_POST['visitorId'];
        $pageId = $_POST['pageId'];
        $occured = date('Y-m-d');

        $sql = "insert into PageHit (VisitorId, PageId, Occured) values ('".$visitorId."','".$pageId."','".$occured."')";

        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
