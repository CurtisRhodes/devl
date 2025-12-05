<?php
        $success = "ono";

        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');

        $folderId = $_POST['folderId'];
        $albumComments = $_POST['albumComments'];
        $country = $_POST['country'];
        $city = $_POST['city'];
        $region = $_POST['region'];
        $dob = $_POST['dob'];
        $boobs = $_POST['boobs'];
        $figure = $_POST['figure'];

        $cmd = $conn->query("select * from FolderDetail where FolderId=".$folderId);
        $result = $cmd->fetch();

        $success = $result;

        if($result == false) {
            $sql = "insert FolderDetail (FolderId,FolderComments,HomeCountry,Region,HomeTown,Birthday,FakeBoobs,Measurements) ".
            "values(".$folderId.",'".$albumComments."','".$country."','".$region."','".$city."','".$dob."','".$boobs."','".$figure."')";
            $stmt= $conn->prepare($sql);
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
            $sql = "UPDATE FolderDetail SET FolderComments='".$albumComments."', HomeCountry='".$country."', Region='".$region."', HomeTown='".$city."',".
                " Birthday='".$dob."', FakeBoobs=".$boobs.", Measurements='".$figure."' WHERE FolderId=".$folderId;
            $stmt= $conn->prepare($sql);
            $stmt->execute();
            $stmt1Success = $stmt->errorCode();
            if($stmt1Success == '00000') {
                $success = 'ok update'; 
            }
            else {
                if($stmt1Success=='27000')
                    $success = "date format: ".$dob;
                else
                    $success = $stmt1Success." update";
            }
        }
        $conn = null;
    echo $success;
?>
