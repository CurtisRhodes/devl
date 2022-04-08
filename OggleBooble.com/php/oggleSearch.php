<?php
    try
    {

        include('yagdrassel.php');
        $pdo = pdoConn();

        $searchString = $_GET['searchString'];

//        $cmd = $pdo->query('select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f '.
//                ' join CategoryFolder p on f.Parent = p.Id '.
//                ' where f.FolderName like "'.$searchString.'%" and f.FolderType != "singleChild"');
//        
//        $searchResults = $cmd->fetchAll();
//        $results = [];
//
//        foreach($searchResults as $searchResult)
//        {
//            $results[] = ['Id' => $searchResult['Id'],
//            'ParentName' => $searchResult['ParentName'],
//            'FolderName' => $searchResult['FolderName']];
//        }

        $cmd = $pdo->query('select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f '.
                ' join CategoryFolder p on f.Parent = p.Id '.
                ' where (f.FolderName like "%'.$searchString.'%") and (f.FolderName not like "'.searchString.'%") and f.FolderType != "singleChild"');

        $searchResults = $cmd->fetchAll();
        foreach($searchResults as $searchResult)
        {
            $results[] = ['Id' => $searchResult['Id'],
            'ParentName' => $searchResult['ParentName'],
            'FolderName' => $searchResult['FolderName']];
        }

    }
    catch(Exception $e) {
        $results = $e->getMessage();
    }
    echo json_encode($results);

?>