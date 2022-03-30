
<?php
    try
    {
        include('registro.php');
        $pdo = pdoConn();
  
        $folderId = $_POST['folderId'];
        $siteCode = $_POST['siteCode'];
        $visitorId = $_POST['visitorId'];
        $occured = date('Y-m-d H:i:s');

        $sql = "insert into TrackbackHit (FolderId, SiteCode, VisitorId, Occured) values ".
                "('".$folderId."','".$siteCode."','".$visitorId."','".$occured."')";

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
