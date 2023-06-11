# Inspiration

List of languages and libraries that inspired DreamQL.

[nozdrenkov.com/dreamql](http://nozdrenkov.com/dreamql) - most recent

# Inspiration

### 1. BigQuery SQL (and other engines)

The engine iteself is very good, reading data from anywhere, saving it as you prefer, can run on multiple workers, ML training, ML inference, calling arbitrary APIs. We shouldn’t loose this productivity, we should enhance it.

### 2. ReScript, ReasonML, OCaml

Ability to pipe everything. Everything is just an immutable chain of operations. Structural pattern matching. Concise syntax. Type inference is really good, it has strong types, but you don’t see them.

### 3. Elixir, Erlang OTP

Piping everything, separation of concerns, phenomenal distributed engine model.

### 4. Datalog, Logica, Yedalog

Really cool prolog-inspired languages describing pure logic.

[logica.dev](https://logica.dev/) - a datalog, compiling into BigQuery SQL, SQLLite, etc.

While it’s really cool, I don’t see people easily migrating to write e.g. data pipelines using datalog.

### 5. Haskell Lens / Optics

[Optics](https://hackage.haskell.org/package/optics-0.4.2/docs/Optics.html) (and it’s predecessor Lens) are really cool libraries to manipulate data. We should achieve this simplicity and type safety in DreamQL, while leveraging distributed backends.

### 6. Jaql

[Jaql](https://en.wikipedia.org/wiki/Jaql) - a functional data processing and query language, to process a bunch of JSONs. Everything is a chain. Compiles to Hadoop. We basically need something like that, but modern.

### 7. PRQL

[PRQL](https://prql-lang.org/) - basically the same what we’re trying to do, composable SQL alternative, transpiles to SQL, written in Rust. Focused on analytic queries first. You can pipe everything. Integration with dbt.

While this is very good, we want something that looks more like JS, like ReScript.

### 8. GraphQL

This one is very good, minimalist query language. Imagine having GraphQL for data pipelines, where you can also chain your operations, describing logic, parsing unstructured text.

### 9. JQ

[JQ](https://stedolan.github.io/jq/) is a lightweight command-line JSON processor. We should be able to parse JSONs like we can do with JQ, with similar minimal readable syntax.

### 10. LINQ / Java Stream API / PyFunctional / Python Pandas

We should have similar functions to transform the data effectively. Also this feels like a wrapper over logic, e.g. you call groupBy function and pass a ton of stuff inside (e.g. in Python Pandas). It feels like we need to have a way to express the logic directly, without wrappers.

### 11. Neo4j Cypher

Great approach on matching instead of joins.

### Others

- EdgeQL from EdgeDB
- Unison — content storage idea, NixOS hashing idea
- https://github.com/ajnsit/languages-that-compile-to-sql
