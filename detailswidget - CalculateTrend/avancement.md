### ⌛ Changement :
Séparation des unités IPE1 et IPE2 et synchronisation du toggle sur les unités des cards.

Fichiers modifiés:
- `src/utils/smartUnitUtils.ts`: `getSmartIPEUnits` renvoie désormais deux unités distinctes (`ipe1Unit`=IPE_kg, `ipe2Unit`=IPE), ajout d’un calcul robuste par énergie; export `findSmartVariableUnit` déjà existant utilisé côté widget.
- `src/Detailswidget.tsx`: application des unités différenciées aux cards 1/2/3 selon l’IPE actif, calcul du titre via `smartAutoUnits.ipe1Name/ipe2Name`, et choix de l’unité de production aligné sur IPE_kg (kg) vs IPE (pcs).
 - `src/Detailswidget.xml`: ajout de `ipeEnergyType` (Enum Elec/Gaz/Eau/Air) et suppression du groupe « Noms des IPE » (labels maintenant basés strictement sur les unités détectées).
 - `src/utils/smartUnitUtils.ts`: ajout de `getIPEVariantsFromVariables` (détection non hardcodée des variantes IPE par asset/énergie) et `findProductionUnitForIPE` (déduction de l’unité Prod cohérente avec l’IPE actif).

### 🤔 Analyse :
Avant, IPE1 et IPE2 héritaient de la même unité (souvent celle détectée en premier), d’où `ipe1Name` == `ipe2Name` et des cards bloquées en kg. On sépare la résolution: IPE1 privilégie IPE_kg (kWh/kg), IPE2 privilégie IPE (kWh/pcs). Le toggle bascule maintenant aussi les unités des cards. Impact: UX correcte, cohérence unités/noms, pas de régression linter.

### 💜 Prochaines étapes :
- Ajouter un log de vérification des unités par série (premiers items) pour diagnostiquer les DS atypiques.
- Tests unitaires sur `getSmartIPEUnits` et `getSmartIPEUnitForSeries` avec jeux de variables mixtes.
- Exposer dans le XML un override manuel optionnel des noms d’IPE.

---

### ⌛ Changement (complément – 2025‑08‑01) :
Correction d’un cas où les deux labels du toggle IPE affichaient la même unité lorsque les séries ne fournissaient pas de `MetricType`. Désormais, en absence d’indication explicite, IPE1 force la variante `IPE_kg` et IPE2 force la variante `IPE` à partir des variables de l’asset.

### 🤔 Analyse :
L’ancienne logique favorisait `IPE_kg` via `getSmartIPEUnitForSeries` pour les deux séries lorsque `MetricType` était `null`/`Conso`, produisant deux labels identiques. On priorise maintenant `getIPEVariantsFromVariables` (par énergie `ipeEnergyType`) et on n’utilise la déduction par série qu’en second recours. Ajout de logs `reasoning` pour expliquer la décision.

### 💜 Prochaines étapes :
- Vérifier sur plusieurs assets que `ipeVariants` contient bien les deux variantes attendues.
- Ajouter des tests d’intégration UI pour le toggle.

---

### ⌛ Changement (complément – 2025‑08‑01, 2) :
Nettoyage du XML: suppression des propriétés d’icône des cards. Ajustement UI: icônes des cards ramenées à 30×30 (`IPECard.tsx`, `IPECard.css`).

### 🤔 Analyse :
Les icônes n’étaient pas configurées par le XML et paraissaient trop grandes; on standardise la taille dans le composant (lucide-react `size={30}`) et on réduit la boîte d’icône via la variable CSS `--triple-cards-icon-size` pour un rendu cohérent.

---

### ⌛ Changement (2025‑08‑08) :
Alignement visuel du toggle IPE avec les boutons Granularité/Export et neutralisation des conflits CSS.

Fichiers modifiés:
- `src/components/ChartContainer/ChartContainer.css` : ajout de `box-sizing`, `line-height` communs et `align-items` sur `.ipe-toggle-group`; renforcement des règles via `!important` (groupe et items) pour éviter les overrides par `styles.css` global. Harmonisation du padding et des tailles responsives avec `!important`.

### 🤔 Analyse :
Des règles globales surchargeaient ponctuellement le groupe Radix, créant un décalage de hauteur avec les autres contrôles. En figeant les propriétés critiques (box model, typographie, padding) et en augmentant la spécificité (avec `!important` ciblé), on garantit un rendu identique et stable dans l’environnement Mendix.

### 💜 Prochaines étapes :
- Surveiller le rendu sur 3 breakpoints (≥1024, 768–1023, ≤480).
- Si d’autres collisions apparaissent, encapsuler via un wrapper plus spécifique (`.chart-header-actions .ipe-toggle-group`).