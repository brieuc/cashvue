export default {
  api: {
    input: './openapi-2.json',
    output: {
      target: './src/api/generated.ts',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/api/fetch-instance.ts',
          //path: './src/api/fetch-mutator.ts',
          name: 'customFetch'
        },
        // Désactive les types de paramètres regroupés
        useDates: false,
        useTypeOverInterfaces: true,
      }
    }
  }
}
