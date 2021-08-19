# Competitions

The pages in this competitions directory get most of their data from the Leverade API.

In order to define more flexibly which competition we show and with a human-readable URL, we have a small competition structure on Directus for the _seasons_ and the _competitions_. We also have the notion of _edition_, which is a _competition_ for a specific _season_.

The naming in Leverade is not exactly similar to what we use at Swiss Tchoukball.

Here's a mapping:

| Frontend      | Directus                        | Leverade      |
| ------------- | ------------------------------- | ------------- |
| `competition` | `national_competitions`         | _N/A_         |
| `season`      | `seasons`                       | `season`      |
| `edition`     | `national_competition_editions` | `tournament`  |
| `phase`       | _N/A_                           | `group`       |
| `phase.group` | _N/A_                           | `group.group` |
| `round`       | _N/A_                           | `round`       |
| `match`       | _N/A_                           | `match`       |
| `standings`   | _N/A_                           | `standings`   |
