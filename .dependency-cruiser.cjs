const COMPOSITION_ROOT = '^src/composition-root\\.tsx$'
const ENTRY_POINT = '^src/main\\.tsx$'

function layerRule(name, from, to) {
  return {
    name,
    severity: 'error',
    comment: `${from} no puede depender de ${to}`,
    from: { path: `^src/${from}/` },
    to: { path: `^src/${to}/` },
  }
}

module.exports = {
  forbidden: [
    layerRule('domain-no-application', 'domain', 'application'),
    layerRule('domain-no-infrastructure', 'domain', 'infrastructure'),
    layerRule('domain-no-ui', 'domain', 'ui'),
    layerRule('application-no-infrastructure', 'application', 'infrastructure'),
    layerRule('application-no-ui', 'application', 'ui'),
    layerRule('infrastructure-no-application', 'infrastructure', 'application'),
    layerRule('infrastructure-no-ui', 'infrastructure', 'ui'),
    layerRule('ui-no-infrastructure', 'ui', 'infrastructure'),
    {
      name: 'solo-la-raiz-de-composicion-cablea',
      severity: 'error',
      comment: 'La infraestructura solo se enchufa desde la raíz de composición',
      from: { pathNot: [COMPOSITION_ROOT, '^src/infrastructure/'] },
      to: { path: '^src/infrastructure/' },
    },
    {
      name: 'sin-ciclos',
      severity: 'error',
      comment: 'Un ciclo entre módulos borra la dirección de la dependencia',
      from: {},
      to: { circular: true },
    },
    {
      name: 'sin-huerfanos',
      severity: 'error',
      comment: 'Un módulo que nadie importa es código muerto',
      from: { orphan: true, pathNot: [ENTRY_POINT] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.app.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
