# Description de la période et indicateurs (conception)

> **Statut : proposition, rien n'est implémenté.** Ni côté front, ni côté back. `PeriodDto` n'a aujourd'hui ni `description` ni `indicators`, et aucun endpoint d'indicateurs n'existe.

## Objectif

1. Afficher une **description** de la période courante, masquée par défaut.
2. Afficher des **indicateurs** : des montants qui ne sont pas de simples sommes d'écritures filtrées par tags.

Deux solutions sont décrites pour les indicateurs :

| | Solution 1 : indicateurs côté back (`fetchMetrics`) | Solution 2 : langage interprété par le front |
|---|---|---|
| Où sont définis les indicateurs | dans le code Java (une classe par indicateur) | dans un `textarea` de `PeriodModal`, **par période** |
| Même modèle pour toutes les périodes | **oui** (limite) | non, chaque période a ses indicateurs |
| Source des montants | SQL, JPQL, calcul Java, autre service : **libre** | `compute` (filtres de `ComputationRequestDto`) |
| Sommes et différences entre indicateurs | à coder dans les providers | **dans le langage** |
| Nouvel endpoint | `GET /metrics` | aucun |
| Changer un indicateur | redéployer le back | modifier le texte |
| Sécurité | requêtes écrites en code, paramètres liés | aucun SQL, endpoint existant |

Les deux peuvent coexister (voir section « Combiner les deux »).

Les deux solutions partagent le **panneau d'affichage** (section A).

---

## A. Description de la période et panneau (commun)

### Prérequis back

Ajouter un champ à `PeriodDto` (par exemple `description?: string | null`), puis relancer `npm run generate:api` pour qu'il apparaisse dans `src/api/generated.ts`. Aujourd'hui `PeriodDto` contient seulement `id`, `title`, `startDate`, `endDate`, `currencyCode` et `hidden`. (La solution 2 ajoute un second champ, `indicators`.)

### Affichage

La période courante est `selectedPeriod`, détenue par `HomeView`. Aucune nouvelle donnée n'a besoin de circuler vers le haut.

- **Panneau en superposition** (`position: absolute`) sous la `.period-bar`, par-dessus `HeaderView` et la liste. Il ne décale pas la mise en page.
- **Hauteur limitée** : `max-height: ~40vh`, `overflow-y: auto`, `overscroll-behavior: contain`, car la description peut être longue.
- **Fermeture** : tap en dehors, même bouton, même geste, ou changement de période.
- **Visibilité** : le bouton n'apparaît que si la période a une description ou des indicateurs.
- **Contenu** : la description, puis la liste des indicateurs.

### Déclencheurs

| Déclencheur | Détail |
|---|---|
| Bouton ℹ️ à droite de la `.period-bar` | découvrable, fonctionne aussi sur ordinateur |
| Swipe vers le bas sur la `.period-bar` | ouvre ; swipe vers le haut ferme |

Le swipe doit être nettement vertical (`dy > 40px` et `|dy| > 1.5 × |dx|`) pour ne pas se déclencher en faisant défiler les périodes. Il ne gêne pas `PullToRefresh`, qui ne couvre que `.entry-content`, une zone séparée.

Écartés : taper sur la période active (pas découvrable, mélange sélection et information) et l'appui long (conflit avec le menu contextuel mobile).

### Pièges à éviter

- Rendre le panneau **en dehors de `PullToRefresh`**, sinon ses touches remontent au pull-to-refresh (voir `docs/modal-teleport-pull-to-refresh.md`).
- Le panneau vit dans `HomeView` ; `PeriodSelection` reste inchangé.

---

## Solution 1 : indicateurs côté back (`fetchMetrics`)

### Règle de sécurité

**Le front n'envoie jamais de SQL ni de fragment de requête.** Les requêtes sont écrites dans le back, avec des paramètres liés. Le front demande seulement « les indicateurs de cette période ».

### Ce que ce n'est pas : `useComputation`

| | `useComputation` | `useMetrics` |
|---|---|---|
| Entrée | période + tags + exclus + texte + devise | période + devise cible |
| Qui décide quoi calculer | le front, via les filtres | le back, via ses définitions |
| Sortie | 1 total + détail par devise | N montants nommés |
| Se recalcule quand | filtres, dates ou écritures changent | période ou écritures changent |

Le mécanisme (appel API, stockage dans une `ref`) est le même, seule la source des montants change. Deux options côté front : un fichier `useMetrics.ts` séparé (une seule responsabilité, recommandé), ou une fonction `fetchMetrics` de plus dans `useComputation` (un fichier de moins, mais `HeaderView` utilise `useComputation` et n'a besoin que du total filtré).

### Contrat d'API (à définir côté back)

```
GET /metrics?startDate=2026-10-01T00:00:00&endDate=2026-10-31T23:59:59&targetCurrencyCode=CHF
```

```json
[
  { "code": "rent",      "title": "Loyer + charges",      "amount": 1850.00,  "currencyCode": "CHF" },
  { "code": "off-budget","title": "Dépenses hors budget", "amount": 432.60,   "currencyCode": "CHF" },
  { "code": "savings",   "title": "Solde compte épargne", "amount": 12400.00, "currencyCode": "CHF" }
]
```

Pas de tags, pas de texte, pas de SQL : seulement la période et la devise cible. Un `code` string stable sert de `:key` dans le `v-for` du front.

### Côté front

`useMetrics.ts` (état local, comme `useComputation`) :

```ts
import { getMetrics, type GetMetricsParams, type MetricDto } from '@/api/generated'
import { ref } from 'vue'

export function useMetrics() {
  const metrics = ref<MetricDto[]>([])
  const error = ref(false)

  const fetchMetrics = async (params: GetMetricsParams) => {
    error.value = false
    try {
      const response = await getMetrics(params)
      if (response.status === 200) metrics.value = response.data
    } catch {
      error.value = true
    }
  }

  return { metrics, error, fetchMetrics }
}
```

Contrairement à `fetchComputation` (`compute(...).then(...)` sans `await` ni gestion d'erreur), `fetchMetrics` attend la réponse et attrape l'erreur, pour afficher « indisponible » au lieu de rester silencieux.

Appel depuis `PeriodMetrics.vue` :

```ts
const { metrics, error, fetchMetrics } = useMetrics()

const load = () => {
  if (!props.startDate || !props.endDate) return   // même garde que HeaderView
  fetchMetrics({
    startDate: props.startDate,
    endDate: props.endDate,
    targetCurrencyCode: props.targetCurrencyCode,
  })
}

watch(() => [props.startDate, props.endDate, props.entriesUpdated], load, { immediate: true })
```

`PeriodMetrics.vue` (présentation) reçoit de `HomeView` les props `startDate`, `endDate`, `targetCurrencyCode` et `entriesUpdated`, gère les états chargement / erreur / liste vide (masqué). Les indicateurs **ne suivent pas** les filtres (tags, texte) : ils dépendent seulement de la période.

Les noms `getMetrics`, `GetMetricsParams` et `MetricDto` sont ceux qu'orval générerait à partir d'un `GET /metrics` et d'un schéma `MetricDto`.

### Côté back (Spring Boot)

Structure existante : contrôleurs qui implémentent une interface `*Api` (annotations OpenAPI), services `*Service` / `*ServiceImpl`, DTO en records, MapStruct, JPA sur MariaDB, Liquibase, tests sur H2.

#### Principe : un `MetricService` qui agrège des providers

Une classe par indicateur ; Spring injecte toutes les implémentations d'une interface sous forme de `List`. Ajouter un indicateur = ajouter une classe, sans toucher au service.

```
MetricController (implements MetricApi)
   └── MetricService
          └── List<MetricProvider>   ← injectée par Spring
                 ├── RentMetricProvider
                 ├── OffBudgetMetricProvider
                 └── SavingsBalanceMetricProvider
```

#### Briques

```java
public interface MetricProvider {
    String code();
    String title();
    int sortingOrder();
    MetricResult compute(MetricContext context);
}

public record MetricContext(LocalDateTime startDate, LocalDateTime endDate, String targetCurrencyCode) {}
public record MetricResult(BigDecimal amount, String currencyCode) {}
```

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricServiceImpl implements MetricService {

    private final List<MetricProvider> providers;

    @Override
    public List<Metric> computeAll(MetricContext context) {
        return providers.stream()
            .sorted(Comparator.comparingInt(MetricProvider::sortingOrder))
            .map(p -> computeSafely(p, context))
            .filter(Objects::nonNull)
            .toList();
    }

    private Metric computeSafely(MetricProvider p, MetricContext ctx) {
        try {
            MetricResult r = p.compute(ctx);
            return new Metric(p.code(), p.title(), r.amount(), r.currencyCode());
        } catch (Exception e) {
            // un indicateur en échec ne doit pas faire tomber les autres
            log.warn("Metric '{}' failed", p.code(), e);
            return null;
        }
    }
}
```

#### Exemple de provider

```java
@Component
@RequiredArgsConstructor
public class RentMetricProvider implements MetricProvider {

    private final EntryRepository entryRepository;

    public String code()      { return "rent"; }
    public String title()     { return "Loyer + charges"; }
    public int sortingOrder() { return 10; }

    public MetricResult compute(MetricContext ctx) {
        BigDecimal amount = entryRepository.sumRent(ctx.startDate(), ctx.endDate());
        return new MetricResult(amount, "CHF");
    }
}
```

```java
// EntryRepository
@Query(value = """
    SELECT COALESCE(SUM(e.amount), 0)
    FROM entry e
    WHERE e.accounting_date BETWEEN :start AND :end
      AND ...condition libre...
    """, nativeQuery = true)
BigDecimal sumRent(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
```

Un provider peut aussi utiliser JPQL, `JdbcTemplate`, ou ne pas faire de SQL (calcul Java, appel à un autre service). Le front ne le voit pas.

#### Contrôleur

`MetricApi` (annotations OpenAPI) + `MetricController implements MetricApi` :

```java
@Override
public ResponseEntity<List<MetricDto>> getMetrics(LocalDateTime startDate, LocalDateTime endDate, String targetCurrencyCode) {
    var metrics = metricService.computeAll(new MetricContext(startDate, endDate, targetCurrencyCode));
    return ResponseEntity.ok(metricMapper.toDtos(metrics));   // MapStruct, comme les autres
}
```

`MetricDto` est un record : `code`, `title`, `amount`, `currencyCode`.

#### Points à décider

1. **Devises (le plus délicat).** `ComputationServiceImpl` convertit chaque écriture vers `targetCurrencyCode` en Java (`getLocalizedAmount`, `RateCache`). Un `SUM(amount)` SQL additionne des devises différentes. Soit `GROUP BY currency_code` en SQL puis conversion et somme en Java avec `RateCache` (recommandé, cohérent avec le reste), soit indicateur limité à une devise fixe.
2. **Sécurité.** Requêtes écrites en code avec paramètres liés → pas d'injection. Endpoint derrière `JwtAuthFilter` comme les autres.
3. **Tests.** Les tests utilisent H2. Une requête native MariaDB peut ne pas y passer : mocker le repository pour les providers, ou écrire un SQL dans le sous-ensemble commun.
4. **Performance.** Providers exécutés en séquence : suffisant pour peu d'indicateurs. Si besoin, `CompletableFuture` ou cache par période.

#### Variante : indicateurs définis en base

Une table `metric_definition` avec les requêtes, exécutées via `JdbcTemplate`, permettrait d'en ajouter sans redéployer. Cela exige un utilisateur de base **en lecture seule**, un timeout et une validation stricte. À n'envisager que si le besoin d'ajouter sans déploiement se confirme ; commencer par les providers en code.

### Limite de la solution 1

Les providers sont les **mêmes pour toutes les périodes**. Les rendre spécifiques à une période demanderait de rattacher chaque provider à des périodes côté back. C'est ce qui motive la solution 2.

### Ordre de mise en œuvre (solution 1)

1. Back : champ de description sur `PeriodDto` (+ migration Liquibase, + mapper).
2. Back : `MetricProvider`, `MetricService`, `MetricController`, premiers providers, tests.
3. `npm run generate:api` côté front.
4. Front : `useMetrics`, `PeriodMetrics.vue`, panneau dans `HomeView` (bouton ℹ️ + swipe).
5. Optionnel : champ de description dans `PeriodModal`.
6. Mettre à jour `COMPONENTS.md`.

---

## Solution 2 : langage d'indicateurs interprété par le front

### Principe

Chaque période stocke un **texte** (champ `indicators`), saisi dans un `textarea` de `PeriodModal`. Au moment de l'affichage, le front interprète ce texte : chaque ligne est soit une **requête** (traduite en `ComputationRequestDto` et envoyée à `compute`, l'endpoint existant), soit une **expression** qui combine d'autres lignes (sommes, différences…).

Chaque période a donc ses propres indicateurs, sans modèle commun.

### Modèle de données (back)

Deux champs texte sur `PeriodDto` (et sur l'entité `Period`, le mapper, une migration Liquibase) :

| Champ | Type | Rôle |
|---|---|---|
| `description` | `String`, nullable, `TEXT` | texte libre affiché dans le panneau |
| `indicators` | `String`, nullable, `TEXT` | programme du langage d'indicateurs |

Le back **stocke sans interpréter** (seulement une limite de longueur, `@Size`). Puis `npm run generate:api`. Deux champs séparés pour ne pas mélanger texte libre et code.

### Le langage

Un programme = **une ligne par indicateur**, de la forme `nom = …`.

- Si la partie droite contient des `clé:`, c'est une **requête**.
- Sinon, c'est une **expression** qui référence d'autres lignes.

```
Salaire = tags: Revenus
Loyer = tags: Logement, Charges
Courses = tags: Courses; exclude: Bio
Fixes = Loyer + Courses
Reste = Salaire + Fixes
Taux d'effort = abs(Fixes) / Salaire * 100
Cafés = search: starbucks; from: -1M; to: -1M
```

#### Requêtes

`clé: valeurs`, séparées par `;`. Elles se traduisent en `ComputationRequestDto`.

| Clé | Valeur | Champ de `ComputationRequestDto` |
|---|---|---|
| `tags` | titres séparés par des virgules | `tags` |
| `exclude` | titres séparés par des virgules | `excludedTags` |
| `search` | texte | `searchText` |
| `currency` | code ISO | `targetCurrencyCode` |
| `from` / `to` | date ou décalage (`-1M`) | `startDate` / `endDate` |

- Sans `from` / `to`, les dates sont celles de `HomeView` (`startDate` / `endDate`), donc l'interrupteur « à ce jour » s'applique.
- Sans `currency`, la devise cible est celle de `HomeView` (`targetCurrencyCode`).
- Les tags sont donnés **par leur titre**, résolus via `useTags` (voir questions ouvertes).
- `tags` et `excludedTags` valent `[]` par défaut. `ComputationSpecBuilder` ignore les collections vides.

#### Expressions

- Opérateurs `+ - * /`, parenthèses, nombres littéraux, et la fonction `abs()`.
- Une référence est le **nom d'une ligne précédente**. Si le nom contient des espaces : `[Taux d'effort]`.
- Priorités habituelles : `*` et `/` avant `+` et `-`.

#### Lignes masquées

Un préfixe `_` calcule sans afficher : `_Salaire = tags: Revenus`. Utile pour les étapes intermédiaires.

#### Règles

| Règle | Détail |
|---|---|
| **Ordre** | une expression ne référence que les lignes **précédentes** (première version). Aucun cycle possible, l'ordre de lecture est l'ordre de calcul |
| **Signe** | `totalAmount` est signé (dépenses négatives, revenus positifs). Les calculs utilisent les montants **signés** : `Salaire + Loyer` donne le solde réel. `abs()` sert à la lecture. `Salaire - Loyer` *ajouterait* le loyer, ce qui est le piège classique |
| **Devises** | chaque requête renvoie un montant converti dans sa devise cible. Une expression qui mélange des devises différentes est une **erreur** : le front n'a pas les taux |
| **Erreurs** | division par zéro, nom inconnu, tag introuvable, syntaxe : erreur **sur la ligne**, sans arrêter les autres. Les lignes qui en dépendent affichent « dépend de X » |
| **Doublons** | deux lignes avec le même filtre ne lancent **qu'une** requête |

#### Grammaire (indicative)

```
programme  := ligne*
ligne      := '_'? nom '=' (requete | expr)
requete    := paire (';' paire)*
paire      := clé ':' valeur
expr       := terme (('+' | '-') terme)*
terme      := facteur (('*' | '/') facteur)*
facteur    := nombre | reference | 'abs' '(' expr ')' | '(' expr ')' | '-' facteur
reference  := nom | '[' texte ']'
```

### Architecture front

#### Pourquoi pas un `useComputation` par composant

Une expression dépend d'autres lignes. L'évaluation doit donc être **centralisée**, et non répartie dans un composant par ligne.

#### Briques

1. **`parseIndicators(text, tags)`** : fonction pure et testable. Retourne une liste de lignes `{ name, hidden, kind: 'query' | 'expr', request | ast, error }`.
   Un tokenizer plus un parseur à descente récursive. **Pas d'`eval` ni de `new Function`** : on interprète l'AST nous-mêmes.
2. **`useIndicators(text, startDate, endDate)`** (composable) :
   - lance les **requêtes** en parallèle avec `compute`, une fois chacune (clé de dédoublonnage = JSON de la requête) ;
   - garde un état par requête (chargement, valeur, erreur) ;
   - calcule les **expressions** dans un `computed` à partir de ces résultats : dès qu'une requête arrive, les expressions dépendantes se mettent à jour ;
   - ne calcule que les lignes nécessaires : une ligne masquée dont rien ne dépend n'est pas exécutée.
3. **`PeriodIndicators.vue`** : affichage en liste (nom, montant, devise) avec les états chargement et erreur.
4. **`PeriodModal.vue`** : le `textarea` des indicateurs, avec un **aperçu des erreurs de syntaxe en direct** (même parseur), pour ne pas les découvrir à l'affichage.

#### Gestion des appels

- Chargement **seulement quand le panneau est ouvert**.
- Recharger quand la période (`startDate` / `endDate`), `targetCurrencyCode` ou `entriesChanged` change, tant que le panneau est ouvert.
- Même garde que `HeaderView` : aucune requête tant que les dates sont `undefined`.
- Les indicateurs **ne suivent pas** les filtres de `HomeView` (tags, texte) : ils dépendent de la période et de leur propre définition.
- `fetchComputation` actuel appelle `compute(...).then(...)` sans `await` ni `catch`. Pour les indicateurs, appeler `compute` avec gestion d'erreur par requête.

#### Flux de données (à reporter dans `COMPONENTS.md`)

```
HomeView
 ├── selectedPeriod.description / .indicators
 ├── startDate, endDate, targetCurrencyCode, entriesChanged
 └── PeriodIndicators (panneau, hors PullToRefresh)
        :description :indicators :start-date :end-date :target-currency-code :entries-updated
        └── useIndicators → compute × N → expressions
```

### Points d'attention

1. **Coût.** Côté back, `compute` charge toutes les écritures correspondantes en mémoire (`entryService.getEntries(spec, Pageable.unpaged())`) puis les additionne en Java. N requêtes = N chargements. Mitigations : chargement à l'ouverture seulement, plafond du nombre de requêtes (par exemple 10), dédoublonnage. Si c'est trop lent : un endpoint qui accepte plusieurs requêtes en un appel.
2. **Tag cumulatif.** `ComputationSpecBuilder` ignore la date de début quand on filtre sur **un seul tag cumulatif** (le solde se cumule depuis le début). Un indicateur `tags: Épargne` en hérite, ce qui est probablement voulu.
3. **Tag renommé ou supprimé.** Avec les titres, un tag renommé casse la ligne : le tag introuvable donne une erreur sur cette ligne. Par id, ce serait robuste mais illisible.
4. **Aucune injection possible.** Le front envoie une `ComputationRequestDto` structurée à un endpoint déjà authentifié. Aucun SQL n'est construit à partir du texte.
5. **Limite du modèle.** Un indicateur ne peut exprimer que ce que `ComputationRequestDto` filtre : dates, tags, tags exclus, devises, texte, devise cible. Il ne peut pas exprimer un solde externe, ni un calcul qui n'est pas une somme d'écritures.

### Questions ouvertes (solution 2)

1. **Tags par titre ou par id ?** Proposition : titre, résolu via `useTags`.
2. **Affichage du signe** : chaque ligne en montant signé (juste mathématiquement) ou en valeur absolue comme `HeaderView` (`absoluteAmount`) ? `abs()` permet de forcer dans les calculs.
3. **Références dans n'importe quel ordre ?** La première version impose « lignes précédentes ». Autoriser un ordre libre demande un tri topologique et une détection de cycles.

### Ordre de mise en œuvre (solution 2)

1. Back : champs `description` et `indicators` (entité, DTO, mapper, migration Liquibase, `@Size`).
2. `npm run generate:api`.
3. Front : `parseIndicators` + tests unitaires (grammaire, erreurs, priorités, signes).
4. Front : `useIndicators` (requêtes, dédoublonnage, évaluation).
5. Front : `PeriodIndicators.vue` et le panneau dans `HomeView` (bouton ℹ️ + swipe).
6. Front : `textarea` description et indicateurs dans `PeriodModal`, avec aperçu des erreurs.
7. Mettre à jour `COMPONENTS.md`.

---

## Combiner les deux

Les deux solutions ne s'excluent pas. Si un montant ne peut pas s'exprimer avec des filtres (solde externe, SQL libre), on peut ajouter les providers de la solution 1 **et** les rendre accessibles depuis le langage de la solution 2 : une clé ou une fonction (par exemple `metric: rent`) référence un provider, et le résultat entre dans les expressions comme n'importe quelle autre ligne.

```
Loyer = metric: rent
Salaire = tags: Revenus
Reste = Salaire + Loyer
```

Chaque période choisit alors les indicateurs qu'elle utilise, et les providers restent la source pour les montants hors filtres.
