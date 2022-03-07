<?php
    $success = "ono";
    try
    {
        include('registro.php');
        $pdo = pdoConn();
//
        $ErrorCode = $_POST['errorCode'];
        $FolderId = $_POST['folderId'];
        $VisitorId = $_POST['visitorId'];
        $CalledFrom = $_POST['calledFrom'];
        $ErrorMessage = $_POST['errorMessage'];
        $Occured = date('Y-m-d H:i:s');

        $success = 'null';

        $sql = "INSERT INTO ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
               "VALUES ('".$ErrorCode."',".$FolderId.",'".$VisitorId."','".$CalledFrom."',".$ErrorMessage."','".$Occured."')";

        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $success = 'ok  error code: '.$ErrorCode;


       $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
