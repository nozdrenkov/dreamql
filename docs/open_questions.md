# Open Questions

### **Distributed Backend: where to compile?**

- I want this code to be running on distributed backends (e.g. BigQuery, Spark, Dataflow, etc).
- it would be nice to avoid using SQL as intermediate step (bad orthogonality, not extendible, etc) and produce some sort of low-level bytecode (maybe LLVM MLIR?) that could run already on the distributed backend.

Candidates:

- Google BigQuery - super fast, a lot of connectors, only uses SQL as API sadly. Hard to make extendible with WASM (via UDF hacks, and it’s a bottle-neck for performance).
- Google [Dataflow](https://cloud.google.com/dataflow/) - lot’s of connectors, takes ages to create a job and distribute on workers. Not sure easy adoption, as people need creating their clusters, etc.
- Apache [Spark](http://spark.apache.org/) (e.g. Databricks uses it) - looks nice, need to figure out how to run WASM on multiple workers easily
- [Differential Dataflow](http://timelydataflow.github.io/differential-dataflow) (or  [Timely Dataflow](https://timelydataflow.github.io/timely-dataflow/)) - looks super cool, but requires creating your own infrastructure (e.g. provisioning workers, implementing connectors to databases, etc), it’s like creating your own BigQuery or Snowflake from scratch.

### **WASM: how to make DreamQL extendible? how to leverage existing ecosystems?**

A big problem of SQL is that you can’t simply import a library and use it.

WASM allows creating light-weight portable code. It would be nice make DreamQL super extensible, so you can implement your own libraries, but also it would be wise to tap into existing ecosystems. E.g. you can connect your favourite python library for parsing text (e.g. regexes) and use it in DreamQL.

It’s OK if this code (e.g. checking if string matches regex) could be running in a single thread, as long as we can create thousands of workers, and feed there our data in parallel.

- More words:
  [Jamie Brandon](https://github.com/jamii) recommends leaning on WASM as an extension language (see [Against SQL](http://scattered-thoughts.net/writing/against-sql)). I think this is a brilliant idea because you can simply use your favourite library (say parsing strings) in your favourite language (say Python) from DreamQL.
  Not sure how I could do that if I choose transpilation to SQL as a backend. In the case of BigQuery I would have to either:
  - wrap this library into a Cloud Function (e.g. AWS Lambda) and then call it from the main code (extra API call)
  - invoke WASM bytecode from JS UDF ([you can do it!](https://liufuyang.github.io/2020/02/09/rust-bigquery.html)), kind of hacky and doesn’t scale well (one VM).
  I think the same problem with other query engines like Postgres, etc.

### What m**ath framework should be under the hood?**

Which minimum set of primitives to choose for the language? I would need to make sure that everything is self-consistent and proven.

- Ideas: everything is expression, functions are first-class citizens
- At the moment I’m now diving into [denotational semantics](https://en.wikipedia.org/wiki/Denotational_semantics), [relational algebra](https://en.wikipedia.org/wiki/Relational_algebra), lambda calculus, pi-calculus, kappa calculus, etc. It would be nice to create something and prove it with [coq](https://en.wikipedia.org/wiki/Coq) or [lean](<https://en.wikipedia.org/wiki/Lean_(proof_assistant)>). No idea how to do that 🙂
- Maybe differential dataflow or timely dataflow could help?
- prolog/datalog sounds like a very good low-level thing (I love that it doesn’t have joins).
