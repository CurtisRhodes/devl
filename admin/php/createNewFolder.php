<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $parentId = $_GET['parentId'];
        $newFolderName = $_GET['newFolderName'];
        $folderType = $_GET['folderType'];
        $sortOrder = $_GET['sortOrder'];

         $cmd = $pdo->query("select * from CategoryFolder where Id = ".$parentId);
            $catRow = $cmd->fetch();

        $rootFolder = $catRow[RootFolder];
        $folderPath = $catRow[FolderPath]."/".$newFolderName;

        $stmt = $pdo->prepare("INSERT INTO CategoryFolder (Parent,FolderName,RootFolder,FolderPath,FolderType,SortOrder) VALUES (?,?,?,?,?,?)");
        $pdo->beginTransaction();

        $stmt->execute([$parentId, $newFolderName, $rootFolder, $folderPath, $folderType, $sortOrder]);

        $pdo->commit();
        $pdo = null;
        
        //$mkdirSuccess = mkdir("../../danni/".$folderPath);
        //$mkdirSuccessText = iff($mkdirSuccess,'ok','directory fail');
        //$success = "../../danni/".$folderPath. " : ". $mkdirSuccessText;
        $success = "ok";
        //$success = "parentId: ". $parentId. " newFolderName: ". $newFolderName ." rootFolder: ". $rootFolder. " folderType: ". $folderType;
    }
    catch(Exception $e) {
        $pdo->rollback();
        $success = $e->getMessage();
    }
    echo $success;

?>
