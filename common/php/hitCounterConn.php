<?php
function pdoConn() {
      $host_name = 'db5006368569.hosting-data.io';
      $database = 'dbs5303285';
      $user_name = 'dbu361219';
      $password = 'Larimore_4ab5a1f4-a130-4fcf-b715-2d5ba6d8e1f9.jpg';

    try {
    	return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);
    } catch (PDOException $exception) {
    	exit('Failed to connect to database!');
    }
}
?>