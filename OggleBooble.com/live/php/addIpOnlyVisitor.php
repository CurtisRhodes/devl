<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Visitors');

        $visitorId = $_POST['visitorId'];
        $ipAddress = $_POST['ipAddress'];

        $sql = "insert into Visitor (VisitorId, IpAddress, InitialVisit) values ('".$visitorId."','".$ipAddress."','".date('Y-m-d H:i:s')."')";
    
        $conn->exec($sql);

        $stmt1Success = $conn->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success;
        }
                
        echo $success;
        // echo json_decode($success);

    } catch(PDOException $e) {
        echo $e->getMessage();
    }

?>

