<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');
        
        $searchString = $_GET['searchString'];

//        $sql = "select f.Id, f.RootFolder, f.FolderName, f.FolderType, p.FolderName ParentName ".
//            "from CategoryFolder f join CategoryFolder p on p.Id = f.Parent ". 
//            "where ((f.FolderName like '".$searchString."%') and (f.FolderType !='singleChild'))".
//            " union ".
//            "select f.Id, f.RootFolder, f.FolderName, f.FolderType, p.FolderName ParentName ".
//            "from CategoryFolder f join CategoryFolder p on p.Id = f.Parent ". 
//            "where (f.FolderName like '%".$searchString."%') and (f.FolderName not like '".$searchString."%') and (f.FolderType != 'singleChild')";

        $sql = "select f.Id, f.RootFolder, f.FolderName, f.FolderType, p.FolderName ParentName ".
            "from CategoryFolder f join CategoryFolder p on p.Id = f.Parent ". 
            "where (f.FolderName like '%".$searchString."%') and (f.FolderType != 'singleChild') order by FolderName limit 100";

        $cmd = $conn->query($sql);
        $results = $cmd->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);

    }
    catch(Exception $e) {
        $results = $e->getMessage();
    }
?>