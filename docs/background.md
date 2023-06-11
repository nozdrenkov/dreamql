# Background

[nozdrenkov.com/dreamql](http://nozdrenkov.com/dreamql) - this post has more detailed background

# Background

## 1. Analytic Queries

SQL is my favourite language so far, because it makes me super productive. I can just go to BigQuery, grab data from various sources, filter it, save anywhere, run ML models inference, create wonderful dashboards on top of that. And I wouldn’t even need to close the browser tab.

At the same time the language is super annoying. E.g. if you want to create a function, you do:

```jsx
CREATE TEMP TABLE FUNCTION my_func(inp ANY TYPE) AS ( ... );
```

Can it be something modern?

```jsx
my_func = inp => ...
```

SQL is always different on different platforms. Hard to have libraries that work everywhere.

SQL is super error-prone, easy to mess up in joins, etc. Hard to write tests. IDEs don’t support it well. Read more in the [**Against SQL article**](https://www.scattered-thoughts.net/writing/against-sql) by Jamie Brandon.

## 2. Data Pipelines

Implementing batch or streaming data processing (e.g. ETL) pipelines is a super common task. E.g. you can grab data from 10 different sources, metrics databases, pub-sub/kafka event logs, then apply a lot of business logic to it, save this data into other storages, or call APIs to trigger other events.

One way of solving this task is to write a custom pipeline (e.g. Flume Java, Apache Beam Python). This would result in a ton of boiler plate code. It’s super slow to implement, hard to test, takes time to launch it (e.g. on Dataflow).

Alternative approach is to use BigQuery or similar engines. You can write your logic in SQL, it would be fairly concise. If you have a complicated computation (e.g. processing video data), this could be wrapped into a separate FaaS and invoked from the SQL. E.g. BigQuery allows training ML models and running inference. Also allows custom user-defined functions in other languages.

You have a big gap between these two approaches. SQL is not well composable, error-prone pascal-like language. It’s hard to do e.g. tests for SQL. On other side, writing your own map reduce jobs takes too much boiler plate and super inconvenient.

Products like dbt and dataform trying to solve this issue. But if we had a minimalist declarative language for data manipulation, with a spirit of SQL, but composable, with ability to run on a distributed backend, that would solve a lot of problems.

## 3. Microservices

In many cases, writing a microservice is just about converting a request JSON into a response JSON (or proto), and doing some business logic along the way, checking permissions, requesting something from the database, etc. We write a phenomenal amount of boilerplate for this. It would be nice to have a minimalist language to describe this business logic (it could transpile to Go or whatever).

### Do we need to invent language?

Another alternative is to create a library or some sort of eDSL.

- for eDSL I guess you need the DSL (domain specific language) itself first.
- library is a good idea, because you can tap into existing ecosystems easily, you can leverage tooling for your language. But the problem is that you’re kind of abstracting away from the actual logic, you’re starting to write wrappers or generators of another language.

It would be cool to have this “better SQL” language which would be a high-level orchestrator, which can be integrated with other languages via eDSL, via interops, via FaaS/API calls.

You can think of this as a more powerful GraphQL or more lean and modern SQL.

<aside>
💡 We need a declarative language with minimalist syntax to describe data transformations that can run in distributed environments.

</aside>
