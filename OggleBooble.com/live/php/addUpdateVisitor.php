<?php
    $success = "ono";
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Visitors');

        $isNewUser = $_POST['isNewUser'];
        $visitorId = $_POST['visitorId'];
        $ipAddress = $_POST['ipAddress'];
        $city = $_POST['city'];
        $region = $_POST['region'];
        $country = $_POST['country'];
        $geoCode = $_POST['geoCode'];
        // $initialPage = $_POST['initialPage'];

        if(isNewUser=='true') {
            $sql = "insert into Visitor (VisitorId, IpAddress, City, Region, Country, GeoCode, InitialVisit, InitialPage) ".
            "values ('".$visitorId."','".$ipAddress."','".$city."','".$region."','".$country."','".$geoCode."','".date('Y-m-d H:i:s')."','".$initialPage."')";
        }
        else{
            $sql = "UPDATE Visitor SET IpAddress='".$ipAddress."',City='".$city."',Region='".$region."',Country='".$country."',GeoCode='".$geoCode."' WHERE VisitorId='".$visitorId."'";        
        }

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
