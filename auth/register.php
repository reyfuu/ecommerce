<?php require "../config/config.php";?>
<?php require "../includes/header.php";?>
<?php

    if(isset($_POST['submit'])){

        if($_POST['password'] == $_POST['cpassword']){
        $fullName=$_POST['fullname'];
        $email=$_POST['email'];
        $username=$_POST['username'];
        $image="user.png";
        $password=$_POST['password'];

        $options=[
            'cost'=>11
        ];

        $password= password_hash($password,PASSWORD_BCRYPT,$options);
        $insert = $conn->prepare("INSERT INTO login(username,password,email,name,image)
        VALUES (:username,:password,:email,:fullname,:image)");

        $insert->execute([
            ":username"=>$username,
            ":password"=>$password,
            ":email"=>$email,
            ":fullname"=>$fullName,
            ":image"=>$image
        ]);

        echo "<script>window.location.href='login.php';</script>";

        }else{
            echo "<script>alert('password does not match, write correct password')</script>";
        }
    }
?>

    <div id="page-content" class="page-content">
        <div class="banner">
            <div class="jumbotron jumbotron-bg text-center rounded-0" style="background-image: url('<?= APPURL?>/assets/img/bg-header.jpg');">
                <div class="container">
                    <h1 class="pt-5">
                        Register Page
                    </h1>
                    <p class="lead">
                        Save time and leave the groceries to us.
                    </p>

                    <div class="card card-login mb-5">
                        <div class="card-body">
                            <form class="form-horizontal" method="post" action="register.php">
                                <div class="form-group row mt-3">
                                    <div class="col-md-12">
                                        <input class="form-control" name="fullname" type="text" required placeholder="Full Name" >
                                    </div>
                                </div>
                                <div class="form-group row mt-3">
                                    <div class="col-md-12">
                                        <input class="form-control" name="email" type="email" required placeholder="Email">
                                    </div>
                                </div>
                                
                                <div class="form-group row mt-3">
                                    <div class="col-md-12">
                                        <input class="form-control" name="username" type="text" required placeholder="Username">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <div class="col-md-12">
                                        <input class="form-control" name="password" type="password" required placeholder="Password">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <div class="col-md-12">
                                        <input class="form-control" name="cpassword" type="password" required placeholder="Confirm Password">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <!-- <div class="col-md-12">
                                        <div class="checkbox">
                                            <input id="checkbox0" type="checkbox" name="terms">
                                            <label for="checkbox0" class="mb-0">I Agree with <a href="terms.html" class="text-light">Terms & Conditions</a> </label>
                                        </div>
                                    </div> -->
                                </div>
                                <div class="form-group row text-center mt-4">
                                    <div class="col-md-12">
                                        <button type="submit" name="submit" class="btn btn-primary btn-block text-uppercase">Register</button>
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


