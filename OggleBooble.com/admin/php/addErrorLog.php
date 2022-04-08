<?php
    $success = "ono";
    try
    {
        include('registro.php');
        $pdo = pdoConn();

        $ErrorCode = $_POST['ErrorCode'];
        $FolderId = $_POST['FolderId'];
        $VisitorId = $_POST['VisitorId'];
        $CalledFrom = $_POST['CalledFrom'];
        $ErrorMessage = $_POST['ErrorMessage'];
        $Occured = date('Y-m-d H:i:s');

        $success = 'null';
        if($ErrorCode != '')        {
        
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "INSERT INTO ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
                "VALUES ('".$ErrorCode."','".$FolderId."','".$VisitorId."','".$CalledFrom."','".$ErrorMessage."','".$Occured."')";
            
            $pdo->exec($sql);

            $success = 'ok';
        }

        $pdo = null;
    }
    catch(PDOException $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
