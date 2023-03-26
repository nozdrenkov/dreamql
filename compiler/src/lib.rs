use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn dreamql_to_bigquery(input: &str) -> String {
  format!("select * from {}", input.to_uppercase())
}
