<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');

        $visitorId = $_POST['visitorId'];
        $pageId = $_POST['pageId'];
        $occured = date('Y-m-d');
        $actually = date('Y-m-d H:i:s');

        $sql = "insert into PageHit (VisitorId, PageId, Occured, Actually) values ('".$visitorId."',".$pageId.",'".$occured."','".$actually."')";
    
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

