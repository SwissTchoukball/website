<?php
$retour = mysql_query("SELECT * FROM TextCorpPage WHERE IdTextCorpPage = '37' ORDER BY paragrapheNum");

// Mettre le logo, quand un logo officiel sera valid?.
// echo "<img class='imageFlottanteDroite' src='pictures/logos/logo_EWC15.png' />";

while ($donnees = mysql_fetch_array($retour)) {
    echo "<p>";
    afficherAvecEncryptageEmail($donnees["paragraphe" . $_SESSION["__langue__"]]);
    echo "</p><br />";
}

?>
<h2>R?sultats suisses</h2>
<h3 class="alt">Rovello (IT) 2019</h3>
<table class="classementTourFinal">
    <tr>
        <th>Position</th>
        <th>?quipe</th>
    </tr>
    <tr>
        <td>3?me</td>
        <td>Val-de-Ruz Flyers</td>
    </tr>
    <tr>
        <td>4?me</td>
        <td>Lausanne Olympic</td>
    </tr>
</table>
<h3 class="alt">Varsovie (PL) 2018</h3>
<table class="classementTourFinal">
    <tr>
        <th>Position</th>
        <th>?quipe</th>
    </tr>
    <tr>
        <td>1er</td>
        <td>La Chaux-de-Fonds</td>
    </tr>
    <tr>
        <td>2?me</td>
        <td>Lausanne Olympic</td>
    </tr>
</table>
<h3 class="alt">Weimar (DE) 2017</h3>
<table class="classementTourFinal">
    <tr>
        <th>Position</th>
        <th>?quipe</th>
    </tr>
    <tr>
        <td>2?me</td>
        <td>La Chaux-de-Fonds</td>
    </tr>
    <tr>
        <td>4?me</td>
        <td>Lausanne Olympic</td>
    </tr>
</table>
<h3 class="alt">Le Havre (FR) 2016</h3>
<table class="classementTourFinal">
    <tr>
        <th>Position</th>
        <th>?quipe</th>
    </tr>
    <tr>
        <td>2?me</td>
        <td>Piranyon Origin</td>
    </tr>
</table>
<h3 class="alt">Turin (IT) 2015</h3>
<table class="classementTourFinal">
    <tr>
        <th>Position</th>
        <th>?quipe</th>
    </tr>
    <tr>
        <td>1er</td>
        <td>Val-de-Ruz Flyers</td>
    </tr>
    <tr>
        <td>2?me</td>
        <td>Geneva Eagles</td>
    </tr>
</table>
