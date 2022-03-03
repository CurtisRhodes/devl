    <?php

/*    
      $host_name = 'db5006287599.hosting-data.io';
      $database = 'dbs5250893';
      $user_name = 'dbu50024';
      $password = 'Larimore_311d496b-6e28-4231-a1f8-09c3941a6c8f.jpg';
      */

      //$host_name = 'storage1400.is.cc';
      //$host_name = '74.208.236.50';
      $host_name = '64.20.55.234';
      $database = 'st21569_yagdrassel';
      $user_name = 'st21569_webVisitor';
      $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';
 

      $link = new mysqli($host_name, $user_name, $password, $database);

      if ($link->connect_error) {
        die('<p>Failed to connect to MySQL: '. $link->connect_error .'</p>');
      } else {
        echo '<p>Connection to MySQL server successfully established.</p>';
      }
    ?>
