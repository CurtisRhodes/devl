<?php
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $rootPath = $_GET['rootPath'];
        $rootId = $_GET['rootId'];

        $Issues=0;
        $ChangesMade = 0;
        $FoldersProcessed = 0;
        $LocalOffset = '../../danni/';

        function updateFolder($pdo, $folderId, $folderPath, &$ChangesMade, &$FoldersProcessed, &$Issues)
        {
            $LocalOffset = '../../danni/';

            $dirfileCount = 0;
            $ScanFiles = scandir($folderPath);
            foreach ($ScanFiles as $file) {
                if(!is_dir($folderPath.'/'.$file)) {
                    $dirfileCount++;
                }
            }

            $cmd = $pdo->query("select * from CategoryFolder where Id=".$folderId);
            $catRow = $cmd->fetch();
            if($catRow[Files] != $dirfileCount) {
                $stmt= $pdo->prepare("UPDATE CategoryFolder SET Files=".$dirfileCount." WHERE Id=".$folderId);
                $stmt->execute();
                $ChangesMade++;
            }

            $cmd = $pdo->query("select * from CategoryFolder where Parent=".$folderId);
            $subDirs = $cmd->fetchAll();
            $subDirCount = count($subDirs);

            if($catRow[SubFolders] != $subDirCount) {
                $stmt= $pdo->prepare("UPDATE CategoryFolder SET SubFolders=".$subDirCount." WHERE Id=".$folderId);
                $stmt->execute();
                $ChangesMade++;
            }

            // DANGER recurr
            foreach($subDirs as $subDir) {
                updateFolder($pdo, $subDir[Id], $LocalOffset.$subDir[FolderPath], $ChangesMade, $FoldersProcessed, $Issues);
            }

            $cmd = $pdo->query("select count(*) as childFolders from CategoryFolder where Parent=".$folderId);
            $subFolderCountRow = $cmd->fetch();
            $ImmediateSubFoldersCount = $subFolderCountRow[childFolders];

            if($CatRow[SubFolders] != $TotalImmediateSubFolders) {
                $stmt= $pdo->prepare("UPDATE CategoryFolder SET SubFolders=".$TotalImmediateSubFolders." WHERE Id=".$folderId);
                $stmt->execute();
                $ChangesMade++; 
            }

            if($ImmediateSubFoldersCount > 0) 
            {   
                $cmd = $pdo->query("select sum(TotalSubFolders) as totalSubFiles from CategoryFolder where Parent=".$folderId);
                $totalSubFoldersRow = $cmd->fetch();
                $TotalSubFolderSubFolders = $totalSubFoldersRow[totalSubFiles];

                $TotalSubFolderRollup = $TotalSubFolderSubFolders + $ImmediateSubFoldersCount;

                if($CatRow[TotalSubFolders] != $TotalSubFolderRollup) {
                    $oldCatRowTotalSubs = $CatRow[TotalSubFolders];
                    $stmt= $pdo->prepare("UPDATE CategoryFolder SET TotalSubFolders=".$TotalSubFolderRollup." WHERE Id=".$folderId);
                    $stmt->execute();

                    if(is_null($oldCatRowTotalSubs)) 
                    {   //$cmd = $pdo->query("select * from CategoryFolder where Id=".$folderId);
                        //$catRow11 = $cmd->fetch();
                        $Issues++;
                        //$Issues= $TotalSubFolderRollup." WHERE Id=".$folderId;
                }
                    else{
                        $ChangesMade++;
                    }
                }

                $cmd = $pdo->query("select sum(Files) as totalChildSum from CategoryFolder where Parent=".$folderId);
                $filesSum = $cmd->fetch();
                $childFilesSum = $filesSum[totalChildSum];

                if($CatRow[TotalChildFiles] != $childFilesSum) {
                    $oldCatRowTotalChild = $CatRow[TotalChildFiles];
                    $stmt= $pdo->prepare("UPDATE CategoryFolder SET TotalChildFiles=".$childFilesSum." WHERE Id=".$folderId);
                    $stmt->execute();
                    if(is_null($oldCatRowTotalChild)) 
                    {
                        //$cmd = $pdo->query("select * from CategoryFolder where Id=".$folderId);
                        //$catRow11 = $cmd->fetch();
                        $Issues++;
                    }
                    else{
                        $ChangesMade++;
                    }
                }
            }
            $FoldersProcessed++;
        }

        updateFolder($pdo, $rootId, $LocalOffset.$rootPath, $ChangesMade, $FoldersProcessed, $Issues);

        $pdo = null;        
        $returnObject = ['ok', $FoldersProcessed, $ChangesMade, $Issues];
    }       
    catch(Exception $e) {
      echo 'Error: ' .$e->getMessage();
    }
    echo json_encode($returnObject);
?>
