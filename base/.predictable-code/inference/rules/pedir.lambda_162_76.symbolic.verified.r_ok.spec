rule "pedir_lambda_162_76_ensures_r_ok"
  tier: pure
  effect: pure
  given:
  when: call precondition "r.ok"
  then:
  contracts:
    pre: call ensures "r.ok"
  examples: