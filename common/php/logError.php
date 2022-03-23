<?php
    try
    {
//        include('registro.php');
//        $pdo = pdoConn();

//        $ErrorCode = $_POST['ErrorCode'];
//        $FolderId = $_POST['FolderId'];
//        $VisitorId = $_POST['VisitorId'];
//        $CalledFrom = $_POST['CalledFrom'];
//        $ErrorMessage = $_POST['ErrorMessage'];
//        //$Occured = date('Y-m-d H:i:s');
//
//        //$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//
//        $pdo->beginTransaction();
//
//        $sql = "INSERT INTO ErrorLog (ErrorCode,FolderId,VisitorId,CalledFrom,ErrorMessage,Occured) ".
//            "VALUES ('".$ErrorCode."','".$FolderId."','".$VisitorId."','".$CalledFrom."','".$ErrorMessage."','".$now."')";
//            
//        $stmt1 = $pdo->prepare($sql);
//        $stmt1->execute();
//
//        $pdo->commit();
//
//        $stmt1Success = $stmt1->errorCode();
//        if($stmt1Success == '00000') {
//            $stmt2 = $pdo->prepare("insert into CategoryImageLink (ImageCategoryId,ImageLinkId,SortOrder) values (".$folderId.",'".$Id."',0)");
//            $stmt2->execute();
//            $success = 'ok';
//        }
//        else {
//            $success = $stmt1Success;
//        }
//
//        $pdo = null;

            $success = 'AT LEAST FILE FOUND';

    }
    catch(PDOException $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
