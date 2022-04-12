<?php
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];

        $stmt1= $pdo->prepare("delete from ImageFile where Id=".$imageFileId);
        $stmt1->execute();
        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $stmt2 = $pdo->prepare("delete from CategoryImageLink where ImageLinkId=".$imageFileId);
            $stmt2->execute();
            $stmt2Success = $stmt2->errorCode();
            if($stmt2Success == '00000') {
                $success = 'ok';
            }
            else {
                $success = 'catLink: '.$stmt2Success;
            }
        }
        else {
            $success =  'Image file: '.$stmt1Success;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
