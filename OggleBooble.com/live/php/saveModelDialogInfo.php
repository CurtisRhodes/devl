<?php
    $success = "ono";
    try {
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

        $cmd = $conn->query("select FolderId from FolderDetail where FolderId=".$folderId);
        $rowExists = $cmd->fetch()[FolderId];
        if($rowExists == false) {
            $sql = "insert FolderDetail (FolderId,FolderComments,HomeCountry,Region,HomeTown,Birthday,FakeBoobs,Measurements) ".
            "values(".$folderId.",'".$albumComments."','".$country."','".$region."','".$city."','".$dob."','".$boobs."','".$figure."')";
            $conn->exec($sql);
            $success = "ok";
        }
        else {
            $sql = "UPDATE FolderDetail SET FolderComments='".$albumComments."', HomeCountry='".$country."', Region='".$region."', HomeTown='".$city."',".
                " Birthday='".$dob."', FakeBoobs=".$boobs.", Measurements='".$figure."' WHERE FolderId=".$folderId;
            $conn->exec($sql);
            $success = "ok";
        }
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    $conn = null;
    echo $success;
?>
