<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');

        $ErrorCode = $_POST['ErrorCode'];
        $FolderId = $_POST['FolderId'];
        $VisitorId = $_POST['VisitorId'];
        $CalledFrom = $_POST['CalledFrom'];
        $ErrorMessage = $_POST['ErrorMessage'];
        $Occured = date('Y-m-d H:i:s');
        
        // header("Access-Control-Allow-Origin: *");

        $sql = "insert into ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
               "values ('".$ErrorCode."',".$FolderId.",'".$VisitorId."','".$CalledFrom."','".$ErrorMessage."','".$Occured."')";


        $conn->exec($sql);
        $success = "ok";

       // $stmt1 = $pdo->prepare($sql);
       // $stmt1->execute();
       // $stmt1Success = $stmt1->errorCode();
       // if($stmt1Success == '00000') {
       //   $success = 'ok';
       // }
       // else {
       //     $success = $stmt1Success;
       // }
       $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
