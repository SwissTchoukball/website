<?php
session_start();

require('config.php');

include "includes/var.href.inc.php";

$afterLoginTarget = VAR_HREF_PAGE_ADMIN;
if (isset($_GET['redirect']) && $_GET['redirect'] != '') {
    $afterLoginTarget = urldecode($_GET['redirect']);
}

$protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$uri = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');

// If already logged in (logged in from another window and stayed on the login page in this window)
if ($_SESSION["__userLevel__"] < 100) {
    header("Location: $protocol://$host$uri" . $afterLoginTarget, true);
}

// se faire passer pour la partie admin
$PHP_SELF = VAR_HREF_PAGE_ADMIN;

// les champs existent ?
if (isset($_POST["login"]) && isset($_POST["username"]) && isset($_POST["password"])) {
    $usernameLogin = strtolower(mysql_real_escape_string(strip_tags($_POST["username"])));

    $requeteSQL = "SELECT p.id, nom, prenom, username, userLevel, password, idClub, gestionMembresClub, c.nbIdClub
                   FROM `Personne` p, `clubs` c
                   WHERE (p.`username`='" . $usernameLogin . "' OR p.email = '" . $usernameLogin . "')
                   AND p.`idClub`=c.`id`";
    $resultatSQL = mysql_query($requeteSQL);
    if (!$resultatSQL) {
        header("Location: $protocol://$host$uri/login-fail-4", true);
    } else {
        $record = mysql_fetch_array($resultatSQL);
        if ($record === false) {
            header("Location: $protocol://$host$uri/login-fail-1", true);
            exit();
        }

        //echo $requeteSQL."<br />";
        //echo md5($_POST["password"])."==".$record["password"];


        if (md5($_POST["password"]) == $record['password']) {
            $_SESSION["__nom__"] = $record['nom'];
            $_SESSION["__prenom__"] = $record['prenom'];
            $_SESSION["__idUser__"] = $record['id'];
            $_SESSION["__username__"] = $record['username'];
            $_SESSION["__userLevel__"] = $record['userLevel'];
            $_SESSION['__authdata__'] = base64_encode($record['username'] . ':' . $record['password']);
            $_SESSION["__idClub__"] = $record['idClub'];
            $_SESSION["__nbIdClub__"] = $record['nbIdClub'];
            $_SESSION["__gestionMembresClub__"] = $record['gestionMembresClub'];

            // gestion de l'autoconnexion par cookie
            if ($_POST["autoConnect"] != "") {
                // creation du cookie
                $troisMois = time() + (3600 * 24 * 30) * 3;

                setcookie("login[username]", $_SESSION["__username__"], $troisMois, "/");
                setcookie("login[password]", $record["password"], $troisMois, "/");
            }

            // Insertion du login dans l'historique des logins
            $maintenant = getdate();
            $requeteSQL = "INSERT INTO `HistoriqueLogin` ( `username` , `date` , `heure` )
                           VALUES ('" . $record["username"] . "', '" . $maintenant["year"] . "-" . $maintenant["mon"] . "-" . $maintenant["mday"] . "', '" . $maintenant["hours"] . ":" . $maintenant["minutes"] . ":" . $maintenant["seconds"] . "')";
            mysql_query($requeteSQL);

            header("Location: $protocol://$host$uri" . $afterLoginTarget, true);
        } else {
            header("Location: $protocol://$host$uri/login-fail-1", true);
        }
    }
} else {
    header("Location: $protocol://$host$uri/login-fail-3", true);
}
