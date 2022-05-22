<?php
    try
    {
        include('registro.php');
        $pdo = pdoConn();
  
        $visitorId = $_POST['visitorId'];
        $ip = $_POST['ip'];
        $city = $_POST['city'];
        $region = $_POST['region'];
        $country = $_POST['country'];
        $loc = $_POST['loc'];
        $initialVisit = date('Y-m-d H:i:s');
        $initialPage = $_POST['initialPage'];

        $sql = "insert into Visitor (VisitorId, IpAddress, City, Region, Country, GeoCode, InitialVisit, InitialPage) ".
            "values ('".$visitorId."','".$ip."','".$city."','".$region."','".$country."','".$loc."','".$initialVisit."',".$initialPage)";

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
