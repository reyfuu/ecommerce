<?php 
require "../includes/header.php"; 
require "../config/config.php";

if(isset($_SESSION['username'])){
    echo "<script>window.location.href='".APPURL."';</script>";
}

if(isset($_POST['submit'])){
    $username=$_POST['username'];
    $password=$_POST['password'];



    $login= $conn->query("SELECT *FROM login WHERE username='$username'");
    $login->execute();

    $fetch= $login->fetch(PDO::FETCH_ASSOC);

    if($login->rowCount() >0){

        if(password_verify($password,$fetch['password'])){
            $_SESSION['username']=$username;
            $_SESSION['email']=$fetch['email'];
            $_SESSION['image']=$fetch['image'];
            echo "<script>window.location.href='".APPURL."';</script>";
        }else{
            echo "<script>alert('email or password is wrong')</script>";
        }
    }else{
        echo "<script>alert('email or password is wrong')</script>";
       
    }
}

?>

    <div id="page-content" class="page-content">
        <div class="banner">
            <div class="jumbotron jumbotron-bg text-center rounded-0" style="background-image: url('<?= APPURL?>/assets/img/bg-header.jpg');">
                <div class="container">
                    <h1 class="pt-5">
                        Login Page
                    </h1>
                    <p class="lead">
                        Save time and leave the groceries to us.
                    </p>

                    <div class="card card-login mb-5">
                        <div class="card-body">
                            <form class="form-horizontal" method="post" action="login.php" >
                                <div class="form-group row mt-3">
                                    <div class="col-md-12">
                                        <input class="form-control" name="username" type="text" required placeholder="Username">
                                    </div>
                                </div>
                                <div class="form-group row mt-3">
                                    <div class="col-md-12">
                                        <input class="form-control" name="password" type="password" required placeholder="Password">
                                    </div>
                                </div>
                                <div class="form-group row text-center mt-4">
                                    <div class="col-md-12">
                                        <button type="submit" name="submit" class="btn btn-primary btn-block text-uppercase">Log In</button>
                                    </div>
                                </div>

                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php require "../includes/footer.php" ?>


