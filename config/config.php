<?php 
// if(!isset($_SERVER['HTTP_REFERE'])){
//     header("Location:http://localhost/e-commerce/index.php");
//     exit;
// }
try{

    define("HOST","localhost");

    define("DBNAME","Freshcery");

    define("USER","root");

    define("PASS","");

    $conn = new PDO("mysql:host=".HOST.";dbname=".DBNAME.";",USER,PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

// if($conn == true){
//     echo "Conmnected Succesfully";
// }else{
//     echo "Error";
// }
}catch(Exception $e){
    echo $e->getMessage();
}
?>