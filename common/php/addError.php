<?php
    $success = "ono";
    try
    {
        include('https://common.ogglefiles.com/php/hitCountConn.php');
        $pdo = pdoConn();

        $ErrorCode = $_POST['ErrorCode'];
        $FolderId = $_POST['FolderId'];
        $VisitorId = $_POST['VisitorId'];
        $CalledFrom = $_POST['CalledFrom'];
        $ErrorMessage = $_POST['ErrorMessage'];
        $Occured = date('Y-m-d H:i:s');

        $sql = "INSERT INTO ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
            "VALUES ('".$ErrorCode."','".$FolderId."','".$VisitorId."','".$CalledFrom."',".$Occured."')";
        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $success = 'ok';

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
