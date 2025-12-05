<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');

        $source = $_POST['Source'];
        $imageId = $_POST['ImageId'];
        $destination = $_POST['Destination'];

        $sql = "insert into ImageLink (Source,ImageId,Destination,SortOrder) values (".$source.",'".$imageId."',".$destination.",0)";

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $stmtSuccess = $stmt->errorCode();
        if($stmtSuccess == '00000') {
            $success = 'ok';
        }
        else {
            $success ="err: ".$stmt1Success." sql: ".$sql;
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
