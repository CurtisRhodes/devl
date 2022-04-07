<?php

    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];

        $sql = "delete from ImageFile where Id='".$imageFileId."'";

        $stmt1= $pdo->prepare($sql);
        $stmt1->execute();
        $stmt1Success = $stmt1->errorCode();

//        $success = 'ok '.$imageFileId;

        if($stmt1Success == '00000') {
//            $stmt2 = $pdo->prepare("delete from CategoryImageLink where ImageLinkId='".$imageFileId."'");
//            $stmt2->execute();
//            $stmt2Success = $stmt2->errorCode();
//            if($stmt2Success == '00000')
                $success = 'ok';
//            }
//            else {
//                $success = $stmt2Success;
//            }
//        }
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
