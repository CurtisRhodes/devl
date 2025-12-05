 <?php
    //   delete from Carousel where FolderId in (select FolderId from ImageLink where Parent = 5980);
    //   -- LOVE IT 
    //   -- 
    //   insert ignore Carousel
    //    select * from vwLoadCarousel where FolderId in (select FolderId from ImageLink where FolderId in (select Id from  CategoryFolder where Parent = 5980));
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Stats');

        $folderId = $_POST['folderId'];

        $sql0 = "delete from Carousel where FolderId in (select FolderId from ImageLink where Parent=".$folderId.")";
        $stmt= $pdo->prepare($sql);
        $stmt->execute();

        $success0 = $stmt->errorCode();
        if($success0 == '00000') {

            $sql1 = "insert ignore Carousel select * from vwLoadCarousel where FolderId in (select Id from  CategoryFolder where Parent=".folderId."))";

            $stmt1 = $conn->prepare($sql1);
            $stmt1->execute();

            $success1 = $stmt1->errorCode();
            if($success1 == '00000') {
                $success = 'ok';
            }
            else {
                $success = $stmt1Success.' .$sql; '.$sql1;
            }
        else {
            $success = $success0.' .$sql; '.$sql0;
        }
        $conn = null;
    }
    catch(Exception $e) {
        $success = "Exception: ".$e->getMessage();
    }
    echo $success;

?>
