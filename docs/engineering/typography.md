# Semantic typography

Typography is selected by UI role, not by the amount of available space in one component. The shared roles live in `src/app/globals.css`.

| Role                | Class                      | Intended use                                     |
| ------------------- | -------------------------- | ------------------------------------------------ |
| Display             | `type-display`             | Landing hero only                                |
| Marketing title     | `type-marketing-title`     | Public landing section headings                  |
| Page title          | `type-page-title`          | Adult-facing page and dialog titles              |
| Child page title    | `type-child-page-title`    | Main child-facing page title                     |
| Section title       | `type-section-title`       | Adult-facing section and panel headings          |
| Child section title | `type-child-section-title` | Child-facing mission and gameplay sections       |
| Card title          | `type-card-title`          | Record, card and navigation identity             |
| Body                | `type-body`                | Primary reading text and form controls           |
| Child body          | `type-child-body`          | Child-facing instructions                        |
| Supporting          | `type-supporting`          | Descriptions, helper text and metadata sentences |
| Label               | `type-label`               | Form labels and compact field names              |
| Caption             | `type-caption`             | Short metadata and counters                      |
| Overline            | `type-overline`            | Compact group/category labels                    |
| Action              | `type-action`              | Buttons and navigation actions                   |

## Rules

- Do not add text smaller than 12px. Vietnamese diacritics need sufficient line height.
- Do not select a size solely to make text fit; fix wrapping, width or density instead.
- A heading keeps the same semantic class on desktop and mobile; responsive sizing belongs inside the role.
- Child-facing instructions stay at body size or larger. Administrative metadata may use supporting or caption styles.
- Keep colors outside typography roles so status and contrast remain contextual.
