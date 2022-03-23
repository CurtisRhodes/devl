<?php
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

        $pdo->beginTransaction();

        $sql = "insert into ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
               "values ('".$ErrorCode."',".$FolderId.",'".$VisitorId."','".$CalledFrom."','".$ErrorMessage."','".$Occured."')";

        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $pdo->commit();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success.' .$sql; '.$sql;;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
