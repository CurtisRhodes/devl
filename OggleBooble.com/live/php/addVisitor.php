<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Visitors');
  
        $visitorId = $_POST['visitorId'];
        $ipAddress = $_POST['ipAddress'];
        $city = $_POST['city'];
        $country = $_POST['country'];
        $region = $_POST['region'];
        $geoCode = $_POST['geoCode'];
        $initialPage = $_POST['initialPage'];		

        $sql = "insert into Visitor (VisitorId, IpAddress, City, Region, Country, GeoCode, InitialVisit, InitialPage) ".
            "values ('".$visitorId."','".$ipAddress."','".$city."','".$region."','".$country."','".$geoCode."','".date('Y-m-d H:i:s')."','".$initialPage."')";

        $stmt1 = $conn->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success;
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
        $pdo = null;
    }
    echo $success;

?>
