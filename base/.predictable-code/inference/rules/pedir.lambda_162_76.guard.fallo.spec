rule "pedir_lambda_162_76_guard_fallo"
  tier: pure
  effect: pure
  given:
  when: r.ok != true
  then:
    throw "fallo"
  examples:
    example "guard trips":
      inputs:
      expected: error "fallo"