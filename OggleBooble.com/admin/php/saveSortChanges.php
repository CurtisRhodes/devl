<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $sortOrderArray = $_POST['sortOrderArray'];
        $decodedSortOrderArray = json_decode($sortOrderArray,true);
        $knt = 0;


        foreach ($decodedSortOrderArray as $sortItem) {
            $FolderId = '0';
            $ItemId = 'z';
            $SortOrder = 'z';

            foreach($sortItem as $x => $x_value) {
                if($x == 'FolderId') $FolderId = $x_value;
                if($x == 'ItemId') $ItemId = $x_value;
                if($x == 'SortOrder') $SortOrder = $x_value;
            }

            if($SortOrder != 'z')
            {
                //$sql = 'Update CategoryImageLink set SortOrder='.$sortItem.SortOrder.
                //' where ImageCategoryId='.$sortItem.FolderId.' and ImageLinkId='.$sortItem.ItemId;

                $sql = "UPDATE CategoryImageLink SET SortOrder=? WHERE ImageCategoryId=? AND ImageLinkId=?";
                $stmt= $pdo->prepare($sql);
                //$stmt->execute([$sortItem.SortOrder, $sortItem.FolderId, $sortItem.ItemId]);
                $stmt->execute([$SortOrder, $FolderId, $ItemId]);

                $knt++;
            }
        }
        $success="knt=".$knt;
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
