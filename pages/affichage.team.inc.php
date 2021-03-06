<?php
function getTeamQuery($teamID)
{
    $query = "SELECT p.idDbdPersonne, p.nom, p.prenom, p.idFITBMatchDB, p.idSexe, cnm.numero, cnm.idFonction, cnf.titreH" . $_SESSION['__langue__'] . " AS titreH, cnf.titreF" . $_SESSION['__langue__'] . " AS titreF, clubs.club
				  FROM CadreNational_Membres cnm
				  LEFT OUTER JOIN DBDPersonne p ON p.idDbdPersonne = cnm.idPersonne
				  LEFT OUTER JOIN CadreNational_Fonctions cnf ON cnf.id = cnm.idFonction
				  LEFT OUTER JOIN clubs clubs ON clubs.nbIdClub = p.idClub
				  WHERE cnm.idEquipe=" . $teamID . "
				  AND (ISNULL(cnm.dateFin) OR cnm.dateFin >= CURDATE())
				  ORDER BY cnm.idFonction, p.nom, p.prenom";
    return $query;
}

function afficherPersonneTeam($record, $extensionPhotos, $afficherNumero)
{
    echo "<div class='joueur-es'>";
    if ($record["idFonction"] == 1) {
        $extensionPhotos = "_coach" . $extensionPhotos;
    }
    $nomFichierPhoto = nomPhotoValide($record["nom"], $record["prenom"], $extensionPhotos, "jpg");
    // le fichier existe ?
    if (is_file($_SERVER["DOCUMENT_ROOT"] . $nomFichierPhoto)) {
        echo "<img class='photo-joueur-es' src='" . $nomFichierPhoto . "' alt='Photo de " . $record["prenom"] . " " . $record["nom"] . "'>";

    } else {
        echo '<!-- Fichier ' . $_ENV["DOCUMENT_ROOT"] . $nomFichierPhoto . ' inexistant -->';
    }

    echo "<div class='infos-joueur-es'>";
    echo "<div class='nom-joueur-es'>" . $record["prenom"] . " " . $record["nom"] . "</div>";
    echo "<div class='numero-joueur-es'>";
    if ($afficherNumero && $record['numero'] != null) {
        echo $record['numero'];
    }
    echo "</div>";

    echo "<div class='club-joueur-es'>";
    echo $record["club"] . "<br />";
    // Hiding the link to the FITB file until they hopefully put it back one day...
//    if ($record["idFITBMatchDB"] != 0) {
//        echo "<a href='http://www.fitbcompetitions.org/index.php?detail=player&id=" . $record["idFITBMatchDB"] . "' target='_blank'>Fiche FITB</a><br />";
//    }
    echo "</div>";
    echo "</div>";

    echo "<div class='titre-joueur-es'>";
    if ($record['idFonction'] != 4) {
        if ($record['idSexe'] == 3) {
            echo $record['titreF'] . "<br />";
        } else {
            echo $record['titreH'] . "<br />";
        }
    }
    echo "</div>";

    echo "</div>";
}
