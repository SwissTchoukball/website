<h4>Situation actuelle</h4>
<form id="etatCotisations" method="post"
      action="?menuselection=<?php echo $menuselection; ?>&smenuselection=<?php echo $smenuselection; ?>">
    <table class="st-table">
        <tr>
            <th>Saison</th>
            <th>Club</th>
            <th>Montant</th>
            <th>Pay?</th>
        </tr>
        <?php
        $anneePassee = date('Y') - 2;
        $debugMessage = "";

        //Affichage de la liste des clubs avec leur ?tat actuel de paiemenet de cotisations
        $clubQuery =
            "SELECT Cotisations_Clubs.id, annee, clubs.club, Cotisations_Clubs.idClub, montant, datePaiement
			 FROM Cotisations_Clubs, clubs
			 WHERE Cotisations_Clubs.idClub=clubs.nbIdClub
			 	AND annee>='" . $anneePassee . "'
			 ORDER BY annee DESC";
        $result = mysql_query($clubQuery);
        while ($donnees = mysql_fetch_assoc($result)) {
            $annee = $donnees['annee'];
            $saison = $annee . " - " . ($annee + 1);
            $club = $donnees['club'];
            $idClub = $donnees['idClub'];
            $montant = $donnees['montant'];
            $datePaiement = $donnees['datePaiement'];
            if ($datePaiement != null) {
                $anneePaiement = substr($datePaiement, 0, 4);
                $moisPaiement = substr($datePaiement, 5, 2);
                $jourPaiement = substr($datePaiement, 8, 2);
            } else {
                $anneePaiement = date('Y');
                $moisPaiement = date('m');
                $jourPaiement = date('d');
            }
            $montantPaye = $datePaiement != null;

            //Gestion du changement d'?tat de paiement
            if (isset($_POST[$annee . ':' . $idClub . ':paye'])) {
                $nouveauMontantPaye = $_POST[$annee . ':' . $idClub . ':paye'] == 1;
                $nouveauAnneePaiement = $_POST[$annee . ':' . $idClub . ':annee'];
                $nouveauMoisPaiement = $_POST[$annee . ':' . $idClub . ':mois'];
                $nouveauJourPaiement = $_POST[$annee . ':' . $idClub . ':jour'];
                if (($nouveauMontantPaye && !$montantPaye) ||
                    $nouveauAnneePaiement != $anneePaiement ||
                    $nouveauMoisPaiement != $moisPaiement ||
                    $nouveauJourPaiement != $jourPaiement
                ) { //Non-pay? -> pay? OU changement de date
                    if (checkdate($nouveauMoisPaiement, $nouveauJourPaiement, $nouveauAnneePaiement)) {
                        $requetePaye = "UPDATE Cotisations_Clubs SET datePaiement='" . $nouveauAnneePaiement . "-" . $nouveauMoisPaiement . "-" . $nouveauJourPaiement . "' WHERE annee='" . $annee . "' AND idClub=" . $idClub;
                        mysql_query($requetePaye);
                        $montantPaye = true;
                        $anneePaiement = $nouveauAnneePaiement;
                        $moisPaiement = $nouveauMoisPaiement;
                        $jourPaiement = $nouveauJourPaiement;
                    }
                } elseif (!$nouveauMontantPaye && $montantPaye) { //Pay? -> non-pay?
                    $requeteNonPaye = "UPDATE Cotisations_Clubs SET datePaiement=NULL WHERE annee='" . $annee . "' AND idClub=" . $idClub;
                    mysql_query($requeteNonPaye);
                    $montantPaye = false;
                }
            }
            ?>
            <tr class="<?php echo $montantPaye ? "st-table__ok" : "st-table__wrong"; ?>">
                <td><?php echo $saison; ?></td>
                <td><?php echo $club; ?></td>
                <td><?php echo $montant . " CHF"; ?></td>
                <td>
                    <select name="<?php echo $annee; ?>:<?php echo $idClub; ?>:paye" title="Statut">
                        <option value="1" <?php echo $montantPaye ? "selected='selected'" : ""; ?>>Pay?</option>
                        <option value="0" <?php echo $montantPaye ? "" : "selected='selected'"; ?>>Non-pay?</option>
                    </select>
                    <label> le </label>
                    <select name="<?php echo $annee; ?>:<?php echo $idClub; ?>:jour" title="Date de paiement (jour)">
                        <?php echo modif_liste_jour($jourPaiement); ?>
                    </select>
                    <select name="<?php echo $annee; ?>:<?php echo $idClub; ?>:mois" title="Date de paiement (mois)">
                        <?php echo modif_liste_mois($moisPaiement); ?>
                    </select>
                    <select name="<?php echo $annee; ?>:<?php echo $idClub; ?>:annee" title="Date de paiement (ann?e)">
                        <?php echo modif_liste_annee(-1, 0, $anneePaiement); ?>
                    </select>
                </td>
            </tr>
            <?php
        }
        ?>
    </table>
    <input type="submit" value="Valider" class="button button--primary"/>
</form>
<script>
    $(function () {
        // Ici, le DOM est enti?rement d?fini
    });
</script>
