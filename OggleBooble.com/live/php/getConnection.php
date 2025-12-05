<?php
header("Access-Control-Allow-Origin: *");
function pdoConn($database) {

    $host_name = 'da100.is.cc';
    //$user_name = 'oggleboo_dbAdmin';
    //$password = 'gHcPqL47qfNEq6danE3E';
    $user_name = 'oggleboo_user';
    $password = '9uJW8wwpbT7CDYS6AMf4';

    try {

        return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);

    } catch (PDOException $ex) {
        $code = $ex->getCode();
        $err = $ex->getMessage();
        exit('connection Failed: '.$err);
    }
}
?>
