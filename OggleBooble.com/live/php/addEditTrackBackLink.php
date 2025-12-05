<?php
    $success = 'ono';
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');
  
        $folderId = $_POST['folderId'];
        $siteCode = $_POST['siteCode'];
        $href = $_POST['href'];
        $status = $_POST['status'];
        $mode = $_POST['mode'];

        if($mode == 'add'){
            $sql = "insert TrackbackLink values (".$folderId.",'".$siteCode."','".$href."','".$status."')";
            $stmt = $conn->prepare($sql);
            $stmt->execute();    
            $stmt1Success = $stmt->errorCode();
            if($stmt1Success == '00000') {
                $success = 'ok';
            }
            else {
                $success = "error: ".$stmt1Success." sql: ".$sql;
            }
        }
        if($mode == 'update'){
            $sql = "update TrackbackLink set Href='".$href."', LinkStatus='".$status."' where CatFolderId=".$folderId;
            $conn->exec($sql);
            $success = "ok";
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    $conn = null;
    echo $success;
?>
