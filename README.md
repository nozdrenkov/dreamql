# DreamQL

DreamQL is a modern, expressive, and minimalist query language for data processing and transformation in distributed environments. Inspired by the best features of SQL, ReScript, OCaml, F#, Elixir, Datalog, Logica, and more, DreamQL aims to provide a powerful yet easy-to-learn syntax for working with data.

## Example

```js
import tm
import gcs as storage

london_weather_forecast =
  timeseries_weather_data
  -> filter city == 'London'
  -> filter timestamp >= tm.now()

emoji = humidity => {
  match humidity {
  | < 0.5 => '🔥'
  | _     => '🌧️'
  }
}

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

## Features

- Concise and expressive syntax
- Pipe-based data transformation
- Structural pattern matching
- Powerful type inference system
- Inspired by the best features of multiple languages
- Suitable for distributed data processing

## Read more:

- [Background](docs/background.md)

## Getting Started

init:

```sh
cd compiler
cargo install wasm-pack
```

from root directory:

```sh
wasm-pack \
  build compiler \
  --target web \
  --out-dir=../sandbox/node_modules/dreamql_compiler_wasm
```

run sandbox:

```sh
cd sandbox
yarn

yarn start
```
