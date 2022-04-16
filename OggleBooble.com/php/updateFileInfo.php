<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $folderId = $_POST['folderId'];
        $folderName = $_POST['folderName'];
        $folderComments = $_POST['folderComments'];
        $country = $_POST['country'];
        $city = $_POST['city'];
        $dob = $_POST['dob'];
        $boobs = $_POST['boobs'];
        $figure = $_POST['figure'];

        $sql = "UPDATE CategoryFolder SET FolderName='".$folderName."' WHERE Id=".$folderId;
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success." folder update";
        }

        if($success == 'ok'){
            $cmd1 = $pdo->query("select * from FolderDetail where FolderId=".$folderId);
            $result = $cmd1->fetchAll();

            if($result == false) {
                $sql = "insert FolderDetail (FolderId,FolderComments,HomeCountry,HomeTown,Birthday,FakeBoobs,Measurements) ".
                "values(".$folderId.",'".$folderComments."','".$country."','".$city."','".$dob."','".$boobs."','".$figure."')";
                $stmt= $pdo->prepare($sql);
                $stmt->execute();    
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok insert';
                }
                else {
                    $success = $stmt1Success." insert ".$sql;
                }
            }
            else {
                $sql = "UPDATE FolderDetail SET FolderComments='".$folderComments."', HomeCountry=".$country."', HomeTown='".$city."', Birthday='"
                        .$dob."', FakeBoobs=".$boobs.", Measurements='".$figure."' WHERE FolderId=".$folderId;
                $stmt= $pdo->prepare($sql);
                $stmt->execute();
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok update';
                }
                else {
                    $success = $stmt1Success." update";
                }
            }
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
