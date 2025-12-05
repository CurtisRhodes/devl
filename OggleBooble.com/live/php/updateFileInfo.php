<?php
	
    $success = "ono";
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');

        $folderId = $_POST['folderId'];
        $folderName = $_POST['folderName'];
        $folderComments = $_POST['folderComments'];

        $sql = "UPDATE CategoryFolder SET FolderName='".$folderName."' WHERE Id=".$folderId;
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success." cat folder fail";
        }

        if($success == 'ok'){
            $cmd1 = $conn->query("select * from FolderDetail where FolderId=".$folderId);
            $result = $cmd1->fetch();

            if($result == false) {
                $sql = "insert FolderDetail (FolderId,FolderComments,FakeBoobs) values('.$folderId.','".$folderComments."',0)";
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
                $sql = "UPDATE FolderDetail SET FolderComments='".$folderComments."' WHERE FolderId=".$folderId;
                $stmt= $conn->prepare($sql);
                $stmt->execute();
                $stmt1Success = $stmt->errorCode();
                if($stmt1Success == '00000') {
                    $success = 'ok update';
                }
                else {
                    $success = "result: ".$result." err: ".$stmt1Success." update";
                }
            }
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
