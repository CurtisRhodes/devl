    <?php
/*    
      $host_name = '64.20.55.234';
      $database = 'st21569_yagdrassel';
      $user_name = 'st21569_webVisitor';
      $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';
*/    
      $host_name = '64.20.55.234';
      $database = 'st21569_wysiwyg';
      $user_name = 'st21569_wysiwyg';
      //$password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';
      $password = 'Swan_0075cea3-2316-42c7-ba30-a7f22641f197.jpg';

      $link = new mysqli($host_name, $user_name, $password, $database);

      if ($link->connect_error) {
        die('<p>Failed to connect to MySQL: '. $link->connect_error .'</p>');
      } else {
        echo '<p>Connection to MySQL server successfully established.</p>';
      }
    ?>
