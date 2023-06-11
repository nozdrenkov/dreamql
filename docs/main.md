# DreamQL [DRAFT]

# Summary

<aside>
💡 **A modern declarative language, with lean syntax,
for transforming data, to run in distributed environments.**

</aside>

- Simply wiring input to output, just describe your business logic. Less code, less bugs.
- Optimised to run on distributed backends (BigQuery, Dataflow, Apache Spark, etc).
- Can call APIs (e.g. FaaS/Cloud functions for custom logic).
- Read data from anywhere, save anywhere you want.
- No boilerplate, your MapReduce/Apache Beam ETL pipelines in just a few sentences of code.
- Easy-to-write analytics queries.
- Great for parsing arbitrary unstructured data in efficient way.
- Everything is immutable and pipeable.

```jsx
// Import your favourite libraries.
import tm
import gcs as storage

// Pipe function calls.
london_weather_forecast =
  timeseries_weather_data
  -> filter city == 'London'
  -> filter timestamp >= tm.now()

// Create your functions. Use pattern matching.
emoji = humidity => {
  match humidity {
  | < 0.5 => '🔥'
  | _     => '🌧️'
  }
}

// The '@' sign means group by.
// Derive necessary data using curly braces.
dashboard_results_json =
  london_weather_forecast {
    @date: timestamp -> date
    @location: (
      latitude
      longitude
    )
    humidity: humidity_level -> mean -> emoji
    mean_temperature: temperature_2m_above_ground_celsius -> mean
  }
  -> sort date location
  -> to_json

dashboard_results_json -> storage.save 'my_datasets.dashboard.json'
```

# Background, Motivation, Inspiration

<aside>
💡 [**nozdrenkov.com/dreamql](https://www.nozdrenkov.com/dreamql/)** - most recent background, motivation and languages that inspired DreamQL. Below you can see drafts of that article.

</aside>

[Background](/docs/background.md)

[Inspiration](/docs/inspiration.md)

[Open Questions](/docs/open_questions.md)

The plan is to make it an open source project, with MIT licence.

# Principles

We can use this as a check-list when making decisions:

- Friendly inclusive community. Easy to ask questions, easy to adopt, easy to contribute.
- User first. Needs to be very convenient. Tooling matters a lot:
  - E.g. code playgrounds, VS code support, syntax highlighting, formatting.
- Productive. User needs to be immediately productive.
- Clarity. No boilerplate. Focus on the pure logic of data flow. Less code, less bugs.
  - Progressive complexity disclosure, like in Swift.
- Safety, correctness, etc.

# Design

<aside>
💡 Brilliant [**Against SQL checklist**](https://www.scattered-thoughts.net/writing/against-sql/#after-sql), on what to keep in mind.

Absolutely [**amazing video**](https://youtu.be/R2Aa4PivG0g) by Peter Alvaro about query languages and distributed systems.

</aside>

At a high level the compilation process looks like that:

<aside>
💡 **DreamQL code →** tokensizer → tokens **→ parser → AST → codegen → SQL, WASM, etc**

</aside>

The tokenizer / lexer step will be skipped, because we don’t need it if using modern parser combinators. We could only need it to improve performance. So, in the future it might be added back.

## Parser

This will take the stream of code characters and grammar rules, transform it into the AST or fail with error.

I used **parser combinators** instead of other approaches:

- [youtu.be/RDalzi7mhdY](https://youtu.be/RDalzi7mhdY) - the best video about parser combinators I found (for beginners).
- [hackage.haskell.org/package/parsec](https://hackage.haskell.org/package/parsec) - inspired by this.
- It’s super concise, and seems less error-prone than other approaches.

I’m planning to use [PEGs](https://en.wikipedia.org/wiki/Parsing_expression_grammar) over CFGs:

- [https://peps.python.org/pep-0617](https://peps.python.org/pep-0617) - Python started using them recently too.
- Packrat algo -- allows parsing pegs in O(n) time (and a lot of mem).
- It seems this leads to simpler grammar and has nice features.

The first dirty prototype is in TypeScript using [parsimmon](https://github.com/jneen/parsimmon) - monadic LL(infinity) parser combinator library.

Once the first prototype is ready, it will be re-written in Rust for performance and safety. See the Rust parser combinators libraries I found:

- [github.com/pest-parser/pest](https://github.com/pest-parser/pest) - I discovered PEGs through this one.
- [github.com/Geal/nom](https://github.com/Geal/nom) - the most popular.
- [github.com/zesterer/chumsky](https://github.com/zesterer/chumsky) - I'm thinking to go ahead with this, it has fantastic error handling.
- [github.com/Marwes/combine](https://github.com/Marwes/combine)
- [github.com/J-F-Liu/pom](https://github.com/J-F-Liu/pom)

(Note: [http://gallium.inria.fr/~fpottier/menhir/](http://gallium.inria.fr/~fpottier/menhir/) - this LR(1) one is good in OCaml world)

Showing meaningful errors is super important. The https://github.com/zesterer/ariadne Rust library seems like a good choice.

## AST

The language design will be AST-centric. Syntax is important because it’s an interface for the users to create AST. But the AST will be our source of truth.

The AST will be as lean as possible. We can think of this as a bunch of proto messages. We’ll be gradually evolving this, adding new properties to the nodes, deprecating the old ones.

The compatibility approach will be like in Rust {TODO: describe this}.

[https://gist.github.com/nozdrenkov/d7c77ed2e92d69b6537f732b95be2e55](https://gist.github.com/nozdrenkov/d7c77ed2e92d69b6537f732b95be2e55) - AST v0

## Codegen

Ideally we want to generate some IR (like in LLVM) that can easily be run on distributed systems, i.e. without transpiling into SQL {TODO: find such backends}.

### BigQuery SQL transpiler

To make this language immediately useful, also to make the development easy, the first version will be just an ad-hoc transpiler into BigQuery SQL.

I hacked quickly some tool in React TS + [CodeMirror](https://codemirror.net/) (also considered [Monaco](https://microsoft.github.io/monaco-editor/) like in VS code), so the compiler generates code as I type it. Also I can run actual queries against BigQuery engine. This way we have a short feedback loop and can develop the language faster.

![Screenshot 2022-12-01 at 22.57.51.png](DreamQL%20%5BDRAFT%5D%209c72f0a25bc74d58a411df5bc9fa2b31/Screenshot_2022-12-01_at_22.57.51.png)

The main idea for now is to create a dependency graph for all primitives, perform topological sort and generate code for it. I guess it will be something like that to begin with:

```sql
create temp table function func as (
  -- move repeated code into functions like that, etc
);

with view_1 as (
  -- some subquery
),

view_2 as (
  -- some subquery
),

...

select * from view_100;
```

Ideally we also need to have an optimiser for queries. But that could be longer term.

<aside>
💡 Note: PRQL backend is powered by [Apache DataFusion](https://arrow.apache.org/datafusion/) and [DuckDB](https://duckdb.org/).

</aside>

### WASM / WASI

We can compile into WASM bytecode, which could be run anywhere. So the tool e.g. could be used as a JQ. This could be a good to have, but doesn’t solve a problem of running on a distributed backend. I.e. we’d need to schedule tasks manually, etc.

More and more platforms start supporting WASM / WASI in general.

In BigQuery we can create JavaScript UDFs, so we can hack it to launch arbitrary WASM too. Here’s [the example](https://liufuyang.github.io/2020/02/09/rust-bigquery.html) of running Rust code on BigQuery.

{TODO: need to do more research about it}.

### Differential Dataflow

{TODO: Now looking into different computational frameworks / math models for distributed systems.

[https://timelydataflow.github.io/differential-dataflow](https://timelydataflow.github.io/differential-dataflow/) - looks super cool and promising (also timely dataflow).}

## Syntax

<aside>
💡 Less builtin syntax, more stdlib functions!

</aside>

<aside>
💡 One approach is to write a lot of super common use-cases where SQL doesn’t work, and write a concise, less error-prone syntax for them.

</aside>

<aside>
💡 Break down SQL into small building blocks, and then build something lean and modern, having only essential things.

</aside>

<aside>
💡 You should be able to construct your query programmatically, through the language itself. SELECT <c1, c2, c3> — stuff in <> could be just a result of a function call. Functions are also first-class citizens.

</aside>

{TODO: Then we need to prove somehow, that everything is self-consistent}.

### Everything is immutable

Similar to SQL, you can’t mutate anything.

### Variables (i.e. constants)

Creating variables is easy. Similar to JS, just without let/var/const.

```jsx
x = 10
s = f'some text here ${x}'

obj = {
  name: 'Harry'
  city: {
    name: 'London'
    contry: 'UK'
  }
}

arr = [1, 2, 3]
```

### Functions

{Need to think more, but JS-style is a good start}

```jsx
sqr = x => x * x

sqr = x => {
  res = x * x
  res  // we return last element, no return keyword needed
}

// not really convinced that we need this one
fn sqr(x) {
  x * x
}
```

which in SQL would be like:

```jsx
create temp function sqr(a any type) as (
  x * x
);
```

Function calls:

```jsx
sqr(3) // regular function call, similar to SQL function calls
sqr 3  // if not ambigious, allow omitting parentices

// allow piping
3 -> sqr

my_data
-> transform_row_somehow metadata
-> sort name date
-> limit 10
```

### MegaGroupByMap operator

If we don’t have `@` sign, this is just a mapping function. If we have `@`, it becomes group by.

```jsx
some_data {
  @key_column1          // group by this column
  @key2: column2 + 3    // group by this column too, also rename it
  agg1: column3 -> sum  // aggregation and renaming
}
```

in SQL this will be

```jsx
select
  key_column1,
  column2 + 3 as key2
  sum(column3) as agg1
from some_data
group by 1, 2
```

This could be applied to expressions returning:

- subquery / table
- array of structs
- a single struct or nested JSON object

{TODO: think how to maybe combine this with pattern matching}

### JOINs

SQL joins are error-prone. we need to be careful to not explode stuff, if you joined incorrectly you can have way more rows than you anticipated. It would be nice to provide guards:

- find only one row
- find as many as you want
- find at least one
- find at most one

for example you can join

```sql
-- Option 1
select
  person.name as person_name,
  city.name as city_name
from person
left join city on person.city = city.name

-- Option 2
select
  person.name as person_name,
  (
     select name
     from city
     where person.city = city.name
     limit 1
  ) as city_name
from person
```

{TODO: explain more here this nonsense}

consider:

- left, full, inner, cross, lateral joins and also union all / union distinct

{Do we need JOINS? How can we simplify it, e.g. like in Logica}

{TODO: this is hard, one of the options is like that}

```jsx
(a: table_a
 b: table_b
 a.date == b.timestamp -> date) {
 // derive some data here if you fancy it
}
```

Alternative would be to create a function like leftJoin, etc and pass data inside. But that would be like generating SQL.

<aside>
💡 My mental model is dumping tables together, and then extracting whatever needed from both. Similar to match in Cypher.

</aside>

### Windows

{TODO: think whether we need these, and if yes, how to express them in the best way}

### Spread operator

```jsx
updateUserAge = user age => {...user, age}

master.CleanData = tables =>
  `clean.*` {
    dataset: _table_suffix
    ...
  }
  -> filter _table_suffix in tables
```

the second expression in BigQuery SQL would be:

```sql
CREATE OR REPLACE TABLE FUNCTION master.CleanData(tables ARRAY<STRING>) AS (
  SELECT
    _TABLE_SUFFIX AS dataset,
   *
  FROM `clean.*`
  WHERE _TABLE_SUFFIX IN UNNEST(tables)
);
```

### Structural Pattern Matching

Some function in SQL:

```sql
CREATE TEMP FUNCTION TrapKind(trap STRING, pest STRING) AS (
  CASE
    WHEN LOWER(trap) LIKE '%egg%'
      OR LOWER(pest) LIKE '%egg%'    THEN 'INSECT_EGG_TRAP'
    WHEN LOWER(trap) LIKE '%female%' THEN 'INSECT_STICKY_TRAP'
    ELSE 'INSECT_PHEROMONE_TRAP'
  END
);
```

Could be something like that:

{TODO: need to think more about how to implement it nicely}

```sql
trap_kind = (trap string, pest string) string => {
  match {
  | like(trap->lower, '%egg%') || like(pest->lower, '%egg%') => 'INSECT_EGG_TRAP'
  | trap->lower->like('%female%') => 'INSECT_STICKY_TRAP'
  | _ => 'INSECT_PHEROMONE_TRAP'
  }
}

trap_kind = (trap string, pest string) string =>
  match {
  | 'INSECT_EGG_TRAP' <= like(trap->lower, '%egg%') || like(pest->lower, '%egg%')
  | 'INSECT_STICKY_TRAP' <= trap->lower->like('%female%')
  | 'INSECT_PHEROMONE_TRAP' <= _
  }
```

---

{TODO: show example of fetching data from deeply nested JSON using pattern matching}

### Code blocks

```jsx
// Variables inside { ... } have their own scope,
// and not visible from the outside.
res = {
  a = 1
  b = 2 + a
  c = 3 + c
}

a = 2
```

### Destructuring

```jsx
lon lat = location
```

{TODO: make sure it’s not ambigious}

{TODO: think how to combine it with pattern matching, because it’s kind of similar concept}

### NULL safety

### Type System

{I guess like in ReScript / OCaml ideally. Static with good inference.}

{Maybe like in JS}

{At least we’ll have 2 types, a table/subquery and a scalar}

### Testing

{TODO: Needs to be a simple way of writing tests. Not part of the language, but thinking about it in advance would be good.}

# Interop with other languages

{TODO: Basically how to leverage existing ecosystems?}

# Building a community

{discord, slack, twitter, what people use nowadays?}

# Tooling

- Code playground (with ability to send to BigQuery)
- Colab/Jupiter integration like in Logica
- Syntax highlight
- Formatter
- Maybe converting from SQL automatically into DreamQL?

# Name

- DreamQL is just a code name to start. Need to come up with a better one 🙂
- [flx.dev](http://flx.dev) — free domain, maybe it should be flx?
- NiceQL 🙂

Something related to wiring input and output, declaring logic in a lean way.

Or something about transforming the data.

{TODO: create a poll maybe}

# Declutter

{TODO: recursion, probably not}

But at any time it needs to be proven that it’s self-consistent.

Tap into existing ecosystems

Early adoption

`{don’t forget about Unison}`

Idea is to create a minimalist language to simply write input and output. To do pure data manipulation and call endpoints if necessary.

1. Short syntax
2. Needs to be much more composable than SQL
3. Modern features, like pattern matching, destruction of objects
4. Dependant types?
5. OCaml / ReScript-style strong type system
6. Null safety
7. Safety when it comes to multiple rows after joins
8. Think of **some monads, algebraic effects**
9. **Value semantics** like in swift (instead of reference semantics), copy on write
   pure immutability like in java immutable

column aliases like in [PRQL](https://news.ycombinator.com/item?id=30060784):

> > Readability is pretty similar to prql. It would really help in SQL if you could refer to column aliases so you don't have to repeat the expression.

break down SQL into small bricks → try to find essential ones, everything else needs to be a library, so developers can make fantastic libs later.
