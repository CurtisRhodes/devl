<?php

   include('yagdrassel.php');
   $pdo = pdoConn();

   $whereClause = $_GET['whereClause'];
   $limit = $_GET['limit'];

   $cmd = $pdo->query("select f.Id, concat(f2.FolderPath,'/',i.FileName) FileName, f.FolderName from CategoryFolder f ".
            "join ImageFile i on f.FolderImage = i.Id ".
            "join CategoryFolder f2 on i.FolderId = f2.Id ".
            " where ".$whereClause." and f.FolderType !='singleChild'".
            "order by rand() limit ". $limit);

           //"where f.RootFolder='".$spaType."' and f.FolderType !='singleChild'".

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>


