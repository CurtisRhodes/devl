<?php
    $success = "ono";
    try
    {
        $path = $_GET['path'];
        $folderId = $_GET['folderId'];

        include('yagdrassel.php');
        $pdo = pdoConn();

        $updatedate = new date();

        $cmd = $pdo->query("select count(*) from oggleboo_registo.PageHit where date(Occured) =".$updatedate);
        $hits = $cmd->fetch();
            
        $cmd = $pdo->query("select count(*) from oggleboo_registo.Visitor where date(InitialVisit) =". $updatedate);
        $newvisitors = $cmd->fetch();

        $cmd = $pdo->query("select count(*) from oggleboo_registo.Visit where VisitDate=". $updatedate);
        $visits = $cmd->fetch();


        $sql = "update ignore oggleboo_registo.MetricsMatrix set hits=".$hits.", newvisitors=".$newvisitors.",Visits="$visits."where Occured=".$updatedate;
        $stmt= $pdo->prepare($sql);

        $stmt->execute();
        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success."   sql: ".$sql;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
