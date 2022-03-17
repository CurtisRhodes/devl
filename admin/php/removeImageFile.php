<?php
    $success = "ono";
    try
    {
        include('settings.php');
        $pdo = pdoConn();

        $imageFileId = $_GET['imageFileId'];

        $pdo->beginTransaction();

            $sql = "delete from ImageFile where Id='".$imageFileId."'";
            $stmt1= $pdo->prepare($sql);
            $stmt1->execute();
            $stmt1Success = $stmt1->errorCode();

        $pdo->commit();
        
        if($stmt1Success == '00000') {
            $pdo->beginTransaction();
                $stmt2 = $pdo->prepare("delete from CategoryImageLink where ImageLinkId='".$imageFileId."'");
                $stmt2->execute();
            $pdo->commit();
            $stmt2Success = $stmt2->errorCode();
            if($stmt2Success == '00000')
                $success = 'ok';
            }
            else {
                $success = $stmt1Success;
            }
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
