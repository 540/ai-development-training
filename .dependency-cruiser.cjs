const INFRASTRUCTURE = '^src/core/[^/]+/infrastructure/'

module.exports = {
  forbidden: [
    {
      name: 'ui-does-not-import-infrastructure',
      severity: 'error',
      comment: 'Views ask pokemonService for data; they never reach the infrastructure',
      from: { path: '^src/ui/' },
      to: { path: INFRASTRUCTURE },
    },
    {
      name: 'domain-depends-on-nothing',
      severity: 'error',
      comment: 'The domain depends on no other layer',
      from: { path: '^src/core/[^/]+/domain/' },
      to: { path: ['^src/ui/', INFRASTRUCTURE, '^src/core/[^/]+/services/', '^src/di/'] },
    },
    {
      name: 'services-only-know-the-domain',
      severity: 'error',
      comment: 'Services only know the domain; infrastructure is plugged in from src/di',
      from: { path: '^src/core/[^/]+/services/' },
      to: { path: ['^src/ui/', INFRASTRUCTURE] },
    },
    {
      name: 'only-di-wires-infrastructure',
      severity: 'error',
      comment: 'Infrastructure is only plugged in from the dependency injection',
      from: { pathNot: ['^src/di/', '^src/core/[^/]+/_di/', INFRASTRUCTURE, '\\.test\\.tsx?$', '^src/test/'] },
      to: { path: INFRASTRUCTURE },
    },
    {
      name: 'no-cycles',
      severity: 'error',
      comment: 'A cycle between modules erases the direction of the dependency',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: 'A module nobody imports is dead code',
      from: { orphan: true, pathNot: ['^src/main\\.tsx$', '\\.d\\.ts$', '\\.test\\.tsx?$', '^src/test/setup\\.ts$'] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
}
