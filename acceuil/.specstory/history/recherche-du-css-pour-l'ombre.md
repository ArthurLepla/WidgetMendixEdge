## SpecStory

## Recherche du CSS pour l'ombre (4/16/2025, 12:38:21 PM)

_**User**_

--tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

peut tu me trouver le css responsable de cela ?

---

_**Assistant**_



---

_****_

Okay, I will read the `src/ui/KPISection.css` file to locate the CSS rule responsible for that shadow.

---

_****_

Read file: undefined

---

_****_

Based on the file contents, the CSS rule responsible for that specific shadow is:

```css
.widget-energy-dashboard .kpi-card {
    /* ... other styles ... */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
    /* ... other styles ... */
}
```

Additionally, within the `@layer components` block, the `.kpi-card` class uses the Tailwind utility `shadow-md`, which generates the same shadow:

```css
@layer components {
    .kpi-card {
        @apply bg-white rounded-xl shadow-md p-6 border border-[var(--border-color)];
    }
    /* ... */
}
```

The first rule with `.widget-energy-dashboard .kpi-card` has `!important`, which gives it higher specificity and likely overrides the Tailwind utility unless the `!important` flag is also used in the Tailwind configuration or subsequent overrides.

---

_**User**_

Peut tu augmenter un peu le titre des QuicksNavCard ?

---

_**Assistant**_



---



---

