<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');

        $visitorId = $_POST['visitorId'];
        $folderId = $_POST['folderId'];
        $siteCode = $_POST['siteCode'];
        $occured = date('Y-m-d H:i:s');

        $sql = "insert into TrackbackHit (VisitorId, PageId, SiteCode, Occured) values ('".$visitorId."',".$folderId.",'".$siteCode."','".$occured."')";
    
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

