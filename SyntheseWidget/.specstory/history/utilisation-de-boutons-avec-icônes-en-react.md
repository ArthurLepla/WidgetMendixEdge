## SpecStory

## Utilisation de boutons avec icônes en React (4/18/2025, 9:18:36 AM)

_**User**_

Vois tu dans mon component DPE, j'ai un bouton qui me permet d'ouvrir un dialog, j'utilise une icone lucide react ect. Est ce bien la façon la plus propre d'utiliser un bouton avec une icone ?
Par exemple, est ce que radix ui ne proposerait pas des icones buttons ?

---

_**Assistant**_



---

_****_

Bonjour ! Analysons votre code pour le bouton d'ouverture du dialogue dans le composant `DPE`.

Votre implémentation actuelle utilise un élément `<button>` standard, contenant une icône `lucide-react` (`<Settings />`), et le tout est enveloppé par `<Dialog.Trigger asChild>`.

```tsx
<Dialog.Trigger asChild>
    <button
        title="Configurer les seuils DPE"
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        aria-label="Configurer les seuils DPE"
        disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || !formAttrsAvailable}
    >
        <Settings className="w-7 h-7 text-gray-600" />
    </button>
</Dialog.Trigger>
```

**Est-ce la façon la plus propre ?**

Oui, c'est une manière tout à fait **correcte et courante** d'implémenter un bouton avec une icône, surtout lorsque l'on travaille directement avec les primitives Radix UI et une bibliothèque d'icônes comme `lucide-react`.

*   **Radix UI et les Icônes :** Radix UI se concentre sur la fourniture de primitives d'interface utilisateur non stylées et accessibles (Dialog, Dropdown, Tooltip, etc.). Il ne fournit **pas** sa propre bibliothèque d'icônes ni de composants stylisés comme un `IconButton` dédié. L'objectif est de vous donner les blocs de construction fonctionnels et accessibles, que vous pouvez ensuite styliser et composer comme vous le souhaitez.
*   **Le Rôle de `asChild` :** La prop `asChild` sur `Dialog.Trigger` (et d'autres composants Radix) est spécifiquement conçue pour ce cas d'usage. Elle permet au composant Radix de fusionner ses propres props et comportements (comme les gestionnaires de clics, les attributs `aria-*`) sur l'élément enfant direct (votre `<button>`), sans ajouter d'élément DOM supplémentaire. C'est la manière idiomatique d'intégrer vos propres éléments ou composants personnalisés avec les primitives Radix.
*   **Flexibilité :** Cette approche vous donne un contrôle total sur le rendu du bouton et de l'icône, en utilisant les classes Tailwind pour le style, ce qui correspond bien au reste de votre configuration.

**Radix UI propose-t-il des `IconButton` ?**

Non, Radix UI lui-même ne propose pas de composant `IconButton` prêt à l'emploi. Les bibliothèques construites *au-dessus* de Radix UI, comme [Shadcn/ui](https://ui.shadcn.com/), fournissent souvent de tels composants (`<Button variant="ghost" size="icon">...<Icon /></Button>`). Cependant, si vous n'utilisez pas déjà une telle bibliothèque, votre approche actuelle est parfaitement valide et propre.

**En résumé :**

Votre méthode actuelle est bonne et conforme aux pratiques standard lors de l'utilisation directe de Radix UI et `lucide-react`. Vous utilisez `asChild` correctement pour intégrer votre bouton personnalisé avec le déclencheur du dialogue. Il n'y a pas de manière intrinsèquement "plus propre" offerte *par Radix UI lui-même* pour faire cela.

---

_**User**_

Pourrait tu augmenter la taille du bouton (et de l'icone), comment faire ?
Et pourquoi le dialog ne s'ouvre pas proprement au milieu de la page ?

---

_**Assistant**_



---

_****_

Okay, let's tackle ces deux points !

**1. Augmenter la Taille du Bouton et de l'Icône**

Pour augmenter la taille du bouton et de l'icône, vous devez ajuster les classes Tailwind qui contrôlent le padding du bouton et les dimensions de l'icône.

*   **Padding du bouton :** La classe `p-1` définit le padding autour de l'icône. Augmentez cette valeur (par exemple, `p-2`) pour agrandir la zone cliquable du bouton.
*   **Taille de l'icône :** Les classes `w-7 h-7` définissent la largeur et la hauteur de l'icône `Settings`. Augmentez ces valeurs (par exemple, `w-8 h-8` ou `w-9 h-9`) pour rendre l'icône elle-même plus grande.

Voici comment vous pouvez modifier le code :

```typescript:src/components/DPE.tsx
// ... existing code ...

export const DPE = (props: DPEProps): ReactElement => {
    // ... existing code ...

    return (
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="card-base relative">
                {/* Settings Button: Increased size */}
                <Dialog.Trigger asChild>
                    <button
                        title="Configurer les seuils DPE"
                        // Increased padding (p-2)
                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        aria-label="Configurer les seuils DPE"
                        disabled={!props.prepareAndSaveDPESettingsMF?.canExecute || !formAttrsAvailable}
                    >
                        {/* Increased icon size (w-8 h-8) */}
                        <Settings className="w-8 h-8 text-gray-600" />
                    </button>
                </Dialog.Trigger>

                {/* Header */}
// ... existing code ...
```

Ajustez les valeurs (`p-2`, `w-8`, `h-8`) selon la taille désirée.

**2. Centrage du Dialogue Radix UI**

Le dialogue Radix UI (`Dialog.Content`) *devrait* s'ouvrir au milieu de la page (du viewport, plus précisément) grâce aux classes Tailwind que vous utilisez déjà :

```typescript:src/components/DPE.tsx
// ... existing code ...
            {/* Dialog Content */}
            <Dialog.Portal>
                 <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow z-40" />
                 <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto z-50">
                    {/* ... content ... */}
                 </Dialog.Content>
            </Dialog.Portal>
// ... existing code ...
```

Voici pourquoi ces classes le centrent :

1.  `fixed`: Positionne l'élément par rapport au viewport.
2.  `top-1/2 left-1/2`: Place le coin supérieur gauche de l'élément au centre exact du viewport.
3.  `-translate-x-1/2 -translate-y-1/2`: Applique une transformation qui déplace l'élément vers la gauche de 50% de *sa propre largeur* et vers le haut de 50% de *sa propre hauteur*. C'est cette combinaison qui assure un centrage parfait, quelle que soit la taille du dialogue.

**Pourquoi pourrait-il *ne pas sembler* centré ?**

*   **`Dialog.Portal` :** Radix UI utilise un `<Dialog.Portal>` par défaut. Cela signifie que le contenu du dialogue est rendu à la fin du `<body>` (ou dans un autre conteneur spécifié), en dehors de la hiérarchie DOM de votre composant `DPE`. Il est donc centré par rapport au *viewport global*, pas par rapport à la carte `DPE` elle-même. C'est généralement le comportement souhaité pour un modal.
*   **Contenu Asymétrique :** Si le contenu *à l'intérieur* du dialogue est très déséquilibré (par exemple, beaucoup plus haut que large, ou avec des éléments visuellement lourds d'un côté), cela pourrait donner l'illusion que la *boîte* du dialogue n'est pas centrée, même si ses coordonnées le sont.
*   **Styles Conflictuels :** Bien que moins probable avec les classes utilitaires Tailwind et le portail, il est *théoriquement* possible qu'un autre style CSS (global ou d'une autre bibliothèque) interfère avec `position: fixed` ou `transform: translate`. Vous pouvez utiliser les outils de développement de votre navigateur pour inspecter l'élément `Dialog.Content` et vérifier ses styles calculés et sa position.
*   **Dimensions/Scroll :** Les classes `max-h-[85vh]` et `overflow-y-auto` gèrent le cas où le contenu est trop grand. Le conteneur `Dialog.Content` sera toujours centré, mais vous pourriez avoir à faire défiler *à l'intérieur* de celui-ci.

**Que vérifier ?**

1.  Confirmez que vous vous attendez bien à un centrage par rapport au *viewport* et non par rapport à un élément parent spécifique.
2.  Utilisez les outils de développement pour inspecter l'élément `Dialog.Content` lorsqu'il est ouvert. Vérifiez ses dimensions et les propriétés `top`, `left`, `transform` dans l'onglet "Computed" ou "Styles".
3.  Assurez-vous qu'il n'y a pas d'erreurs dans la console qui pourraient indiquer un problème de rendu ou de style.

En principe, avec les classes actuelles, le centrage devrait fonctionner correctement par rapport au viewport.

---

_**User**_

Peut tu faire une analyse compléte pour identifier pourquoi mon dialog n'est pas au centre ?

---

_**Assistant**_



---

_****_

Absolument. Analysons en détail pourquoi votre dialogue Radix UI pourrait ne pas apparaître parfaitement centré, même avec les classes Tailwind standard (`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`).

Voici les points clés à examiner :

1.  **Le Contexte de Positionnement `fixed`** :
    *   Normalement, `position: fixed` positionne un élément par rapport au *viewport* (la fenêtre visible du navigateur).
    *   **Exception cruciale :** Si un élément parent (n'importe où dans l'arbre DOM, même très haut) a une propriété CSS `transform`, `perspective`, ou `filter` appliquée (autre que `none`), cet ancêtre devient le *bloc conteneur* pour tous ses descendants en `position: fixed`, y compris votre dialogue rendu via `Dialog.Portal`.
    *   **Cause possible :** Un composant parent, la mise en page Mendix globale, ou même un style appliqué sur `<html>` ou `<body>` pourrait avoir une de ces propriétés (`transform`, `perspective`, `filter`). Si ce parent n'est pas lui-même centré ou de pleine taille, le dialogue sera centré *par rapport à ce parent* et non plus par rapport au viewport. C'est l'une des causes les plus fréquentes de "mauvais" centrage pour les éléments `fixed`.
    *   **Vérification :** Utilisez les outils de développement du navigateur. Inspectez l'élément `Dialog.Content` (qui est probablement un `div` rendu par le `Portal` à la fin du `<body>`). Remontez l'arbre DOM parent par parent et vérifiez si l'un d'eux a une propriété `transform`, `perspective`, ou `filter` dans ses styles calculés (Computed Styles).

2.  **Conflits de Styles CSS** :
    *   **Spécificité :** Une autre règle CSS plus spécifique pourrait surcharger les classes Tailwind. Par exemple, une règle comme `#monApp dialog { position: absolute !important; top: 10px !important; }` pourrait annuler vos classes.
    *   **Styles Globaux/Mendix :** Vérifiez les feuilles de style globales de votre application ou les styles injectés par Mendix. Ils pourraient cibler les éléments `dialog`, les éléments avec certains `data-state` (comme `[data-state=open]`), ou même des `div` génériques de manière conflictuelle.
    *   **Vérification :** Inspectez l'élément `Dialog.Content`. Regardez les styles appliqués dans l'onglet "Styles" des outils de développement. Voyez quelles règles définissent `position`, `top`, `left`, `transform`. Y a-t-il des règles barrées (indiquant qu'elles sont surchargées) ? Y a-t-il des styles inattendus qui s'appliquent ?

3.  **Comportement de `Dialog.Portal`** :
    *   Par défaut, `Dialog.Portal` rend le contenu du dialogue à la fin de l'élément `<body>`. Cela l'isole généralement des styles de son composant parent *React*.
    *   **Container Personnalisé :** Si vous avez configuré `Dialog.Portal` pour utiliser un `container` spécifique (une prop optionnelle), alors le dialogue sera rendu dans cet élément conteneur, et les points 1 et 2 s'appliquent par rapport à *ce* conteneur. (Vous ne semblez pas faire cela dans le code montré).
    *   **Vérification :** Confirmez dans l'inspecteur DOM que le dialogue apparaît bien comme un enfant direct de `<body>` ou du conteneur attendu si vous en utilisez un.

4.  **Animations et Transitions (`animate-contentShow`)** :
    *   La classe `data-[state=open]:animate-contentShow` applique une animation à l'ouverture. Si cette animation (`contentShow` définie dans votre `tailwind.config.js`) implique elle-même des `transform` complexes ou interfère avec le positionnement initial, cela pourrait causer un décalage ou un "saut" visuel pendant l'ouverture.
    *   **Vérification :** Essayez temporairement de supprimer la classe `data-[state=open]:animate-contentShow` de `Dialog.Content` pour voir si le dialogue apparaît au bon endroit *sans* l'animation. Si c'est le cas, le problème vient de la définition de l'animation `contentShow`.

5.  **Calculs de Taille et `transform`** :
    *   Les transformations `-translate-x-1/2 -translate-y-1/2` dépendent de la taille calculée de l'élément `Dialog.Content` lui-même.
    *   **Contenu Dynamique :** Si le contenu *à l'intérieur* du dialogue change de taille très rapidement après l'ouverture (par exemple, chargement d'images, rendu asynchrone), il est *possible* (mais moins fréquent) que le calcul initial de la translation soit basé sur une taille incorrecte, menant à un mauvais positionnement.
    *   **Vérification :** Ouvrez le dialogue et observez si sa taille change après l'ouverture initiale. Inspectez ses dimensions (`width`, `height`) dans les outils de développement.

**En résumé, les pistes les plus probables sont :**

1.  **Un parent avec `transform`, `perspective`, ou `filter`** qui change le contexte de `position: fixed`.
2.  **Des styles CSS conflictuels** (globaux, Mendix, ou plus spécifiques) qui surchargent les classes de centrage Tailwind.

**Comment procéder :**

1.  **Ouvrez les outils de développement de votre navigateur.**
2.  **Déclenchez l'ouverture du dialogue.**
3.  **Inspectez l'élément `Dialog.Content`** (le `div` qui contient votre formulaire, rendu par le `Portal`).
4.  **Examinez l'onglet "Styles" / "Computed Styles" :**
    *   Vérifiez les valeurs de `position`, `top`, `left`, `transform`. Sont-elles celles attendues (`fixed`, `50%`, `50%`, `translate(-50%, -50%)`) ?
    *   Notez toutes les règles CSS qui affectent ces propriétés. Y a-t-il des surcharges (`!important`) ou des sources inattendues (fichiers CSS Mendix, styles globaux) ?
5.  **Remontez l'arbre DOM depuis `Dialog.Content` jusqu'à `<html>` :**
    *   Pour chaque parent, vérifiez dans "Computed Styles" si `transform`, `perspective`, ou `filter` a une valeur autre que `none`. Si vous en trouvez un, c'est probablement votre coupable.

Cette investigation devrait vous permettre d'identifier la cause exacte du problème de centrage.

---

_**User**_

Içi ?

---

_**Assistant**_



---

_****_

Merci pour les captures d'écran ! Elles sont très utiles.

En examinant les images, voici ce que l'on peut voir :

1.  **Élément Sélectionné :** Vous avez bien sélectionné le `div` qui correspond au `Dialog.Content` de Radix UI (il a l'id `radix-:r9:` et le `role="dialog"`).
2.  **Classes Appliquées :** On voit clairement les classes Tailwind pour le centrage : `fixed`, `top-1/2`, `left-1/2`, `-translate-x-1/2`, `-translate-y-1/2`. Ces classes *devraient* centrer l'élément par rapport au viewport.
3.  **Position dans le DOM :** Le chemin en bas (`html > body.profile-desktop.role-administrator > div#radix-:r9:...`) montre que le dialogue est rendu (probablement via `Portal`) comme un enfant direct (ou quasi-direct) de `<body>`. C'est le comportement attendu.
4.  **Aperçu Visuel (dans les outils dev) :** La petite boîte bleue en haut à gauche des outils de développement, qui représente l'élément sélectionné sur la page, montre le dialogue positionné **vers le haut de la page**, pas au centre vertical.

**Conclusion Principale :**

Puisque les classes de centrage `fixed`, `top-1/2`, `left-1/2`, `-translate-x-1/2`, `-translate-y-1/2` sont bien appliquées mais que le résultat visuel n'est pas centré verticalement, la cause la plus probable est celle que nous avons évoquée précédemment :

**Un élément ancêtre (probablement `body.profile-desktop.role-administrator` ou un wrapper Mendix autour de votre contenu principal) possède une propriété CSS `transform`, `perspective`, ou `filter` qui modifie le contexte de positionnement pour les éléments `position: fixed`.**

Lorsque cela se produit, `top: 50%` et `translateY(-50%)` ne se réfèrent plus au viewport, mais aux dimensions de cet ancêtre "transformé". Si cet ancêtre ne fait pas toute la hauteur du viewport, le dialogue sera mal positionné verticalement.

**Prochaines Étapes Suggérées :**

1.  Dans les outils de développement, **sélectionnez l'élément `<body>`** (qui a les classes `profile-desktop role-administrator`).
2.  Allez dans l'onglet **"Computed"** (Styles Calculés).
3.  **Filtrez ou recherchez** les propriétés :
    *   `transform`
    *   `perspective`
    *   `filter`
4.  Vérifiez si l'une de ces propriétés a une valeur autre que `none`. Si c'est le cas, c'est très probablement la source du problème. Il faudra identifier d'où vient ce style (Mendix ? CSS personnalisé ?) et voir s'il peut être supprimé ou ajusté pour ne pas affecter le positionnement `fixed` du dialogue.
5.  Si `<body>` n'a rien, remontez et vérifiez l'élément `<html>`. Vérifiez aussi s'il y a des `div` Mendix *entre* `body` et votre `div#radix-:r9:` qui pourraient avoir ces propriétés.

---

_**User**_

Je n'ai pas de trouvé de propriété transform, perpective ou filter.

---

_**Assistant**_



---

_****_

Okay, merci pour la vérification et la nouvelle capture d'écran !

Vous avez raison, il n'y a pas de `transform`, `perspective`, ou `filter` visible sur le `<body>` dans les styles calculés de base.

Cependant, l'image révèle un **indice très important** : les styles appliqués via l'attribut `data-scroll-locked` sur le `<body>`. Cet attribut est typiquement ajouté par des bibliothèques comme Radix UI lorsque le dialogue est ouvert pour empêcher le défilement de la page en arrière-plan.

Regardez les styles injectés pour `body[data-scroll-locked]`:

```css
body[data-scroll-locked] {
    overflow: hidden !important;
    overscroll-behavior: contain;
    /* ---> */ position: relative !important; /* <--- CETTE LIGNE EST SUSPECTE */
    padding-left: 0px;
    padding-top: 0px;
    padding-right: 0px !important;
    margin-left: 0;
    margin-top: 0;
    margin-right: 0px !important;
}
```

La ligne **`position: relative !important;`** est la plus suspecte ici.

**Pourquoi est-ce suspect ?**

Même si ce n'est pas `transform`, `perspective` ou `filter`, forcer `position: relative` sur l'élément `<body>` peut parfois interférer avec le calcul du positionnement des éléments enfants en `position: fixed`, surtout dans des environnements complexes comme Mendix où d'autres structures de mise en page sont en jeu.

*   Théoriquement, `position: fixed` devrait toujours se rapporter au viewport sauf si un ancêtre a `transform/perspective/filter`. Mais l'ajout de `position: relative` au `body` *pendant que* le dialogue est ouvert pourrait créer des conflits ou être interprété différemment par le navigateur dans ce contexte spécifique. Les `!important` rendent la chose encore plus agressive.
*   Cela pourrait signifier que le `top: 50%` de votre dialogue `fixed` n'est plus calculé par rapport à la hauteur totale du viewport, mais par rapport à la hauteur du `<body>` lui-même, qui pourrait ne pas correspondre exactement au viewport à cause d'autres styles Mendix (potentiels `padding`, `margin`, ou structure `flex`/`grid` au niveau supérieur).

**Suggestion de Test Immédiat :**

1.  Ouvrez le dialogue.
2.  Dans les outils de développement, avec l'élément `<body>` sélectionné, allez dans l'onglet "Styles".
3.  Trouvez la règle `body[data-scroll-locked]`.
4.  **Décochez (ou supprimez) uniquement la ligne `position: relative !important;`**.
5.  **Observez immédiatement si le dialogue se recentre correctement.**

Si le dialogue se recentre après avoir désactivé ce `position: relative`, alors nous avons trouvé la cause directe : le mécanisme de verrouillage de défilement de Radix interfère avec le positionnement `fixed` dans votre environnement Mendix. Il faudra ensuite chercher une solution (configuration Radix, surcharge CSS, etc.).

---

_**User**_

Déjà tu peux supprimer cela : .max-h-\[85vh\]

---

_**Assistant**_



---

_****_

Okay, je vais supprimer la classe `max-h-[85vh]` du composant `Dialog.Content`. Cela signifie que le dialogue n'aura plus de hauteur maximale limitée à 85% de la hauteur du viewport et pourra s'étendre verticalement en fonction de son contenu.

```typescript:src/components/DPE.tsx
// ... existing code ...

            {/* Dialog Content */}
            <Dialog.Portal>
                 <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow z-40" />
                 {/* Removed max-h-[85vh] class */}
                 <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto z-50">
                    <Dialog.Title className="text-xl font-semibold mb-4 text-gray-800">
                        Configurer les Seuils DPE
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-600 mb-6">
// ... existing code ...
```

La classe `max-h-[85vh]` a été retirée de la liste des classes pour `Dialog.Content`.

---

_**User**_

Vérifions si il n'y a pas de conflict ou superposition de css

---

_**Assistant**_



---

_****_

Excellent idée. Pour vérifier les conflits et superpositions CSS qui pourraient affecter le positionnement du dialogue, nous allons utiliser les outils de développement de manière méthodique.

Voici comment procéder :

1.  **Ouvrez le Dialogue :** Assurez-vous que le dialogue DPE est visible sur la page.
2.  **Inspectez `Dialog.Content` :** Faites un clic droit sur le contenu *visible* du dialogue et choisissez "Inspecter" ou "Inspecter l'élément". Cela devrait sélectionner le `div` avec `role="dialog"` (celui qui a les classes `fixed top-1/2 left-1/2...`).
3.  **Examinez l'Onglet "Styles" :**
    *   **Filtrez sur les propriétés clés :** Dans la barre de filtre des styles (souvent en haut à droite de l'onglet Styles), tapez `position`, puis `top`, `left`, `transform`, `margin`, `padding` l'un après l'autre.
    *   **Observez les règles appliquées :** Pour chaque propriété :
        *   Quelles règles définissent sa valeur ? (e.g., `.top-1\/2`, `.fixed`, une règle de `base.scss`, une règle de `widgets.css`, un style inline ?)
        *   Y a-t-il des règles barrées ? Cela indique qu'elles sont surchargées par une règle plus spécifique ou `!important`. Laquelle surcharge ?
        *   Y a-t-il des `!important` ? Ceux-ci peuvent souvent causer des problèmes inattendus.
    *   **Portez une attention particulière aux styles venant de :**
        *   Styles inline (attribut `style="..."` sur l'élément).
        *   Feuilles de style Mendix (souvent dans des fichiers comme `widgets.css` ou des styles injectés).
        *   Feuilles de style globales de votre projet (`base.scss` ou équivalent).
4.  **Vérifiez à nouveau `body[data-scroll-locked]` :**
    *   Sélectionnez l'élément `<body>` dans l'inspecteur.
    *   Allez dans l'onglet "Styles".
    *   Trouvez la règle pour `body[data-scroll-locked]`.
    *   **Testez en décochant `position: relative !important;`** (si ce n'est pas déjà fait). Le dialogue bouge-t-il ?
5.  **Examinez l'Onglet "Computed" (Calculé) :**
    *   Avec l'élément `Dialog.Content` toujours sélectionné, allez dans l'onglet "Computed".
    *   Développez les propriétés `position`, `top`, `left`, `transform`, `margin`, `padding`.
    *   Quelles sont les **valeurs finales calculées** par le navigateur ? Sont-elles exactement `fixed`, `50%`, `50%`, `translate(-50%, -50%)` (ou l'équivalent en pixels) ? Si non, cliquez sur la petite flèche à côté de la valeur pour voir quelle règle CSS l'a finalement définie.

**Que rechercher spécifiquement ?**

*   Une règle CSS (probablement de Mendix ou d'un CSS global) qui surcharge `position: fixed` ou les propriétés `top`/`left`/`transform`.
*   Des `margin` ou `padding` inattendus appliqués au dialogue ou à ses parents (comme `body`) qui pourraient le décaler.
*   La confirmation (ou l'infirmation) que le `position: relative !important` sur `body[data-scroll-locked]` est le coupable.

Faites ces vérifications et dites-moi ce que vous trouvez d'inhabituel ou de conflictuel ! N'hésitez pas à partager une nouvelle capture d'écran si vous voyez quelque chose de spécifique.

---



---

