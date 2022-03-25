<?php
    try
    {
        include('registro.php');
        $pdo = pdoConn();
  
        $visitorId = $_POST['visitorId'];
        $appName = $_POST['appName'];
        $visitDate = date('Y-m-d');

        $sql = "insert into Visit (VisitorId, AppCode, VisitDate) values ('".$visitorId."','".$appName."','".$visitDate."')";

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
