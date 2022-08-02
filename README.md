# Image retrieval: klasifikace světelného znečištění na základě porovnávání fotografií oblohy


Výsledkem projektu je aplikace, která dovede zařadit vstupní jasovou mapu do databáze, seřazené podle znatelnosti světelného znečištění. Z reprezentativních vzorků z každého vstupního obrázku aplikace určí dominantní barevnost a porovná ji s barevnou škálou určující hodnotu světelného znečištění. Pomocí takto získaných koeficientů je vstupní obrázek zařazen do databáze.
Vstupem aplikace je jasová mapa fisheye fotografie noční oblohy.
Výstupem aplikace je databáze jasových map, seřazená od nejlepších případů po ty nejhorší.
Vedlejším výstupem aplikace jsou koeficienty (metrika) zevrubně popisující stav světelného znečištění na fotografii.


### Způsob řešení
Celý proces se skládal z několika dílčích kroků:
    1. Normalizace vstupních dat.
    2. Výběr zajímavých oblastí.
    3. Extrakce dominantních barev ze vzorků za použití k-means shlukování barevných složek jednotlivých vzorků.
    4. Analýza vybraných barev. Zahození nevhodných dat.
    5. Získání koeficientů z každé zachované oblasti.
    6. Porovnání koeficientů se stávající databází.

Pro více informací viz final_report.pdf