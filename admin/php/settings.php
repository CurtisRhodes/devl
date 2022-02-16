<?php


function pdoConn() {
      $host_name = 'db5006287599.hosting-data.io';
      $database = 'dbs5250893';
      $user_name = 'dbu50024';
      $password = 'Larimore_311d496b-6e28-4231-a1f8-09c3941a6c8f.jpg';

      //$dbh = new PDO('mysql:host=localhost;dbname=test', $user, $pass);
      //$db = new mysqli($host_name, $user_name, $password, $database);


    try {
    	return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);
    } catch (PDOException $exception) {
    	// If there is an error with the connection, stop the script and display the error.
    	exit('Failed to connect to database!');
    }
}

?>




