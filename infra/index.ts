import SvelteApp from './lib/SvelteApp'
import * as pulumi from '@pulumi/pulumi'

const stack = pulumi.getStack()
const subDomain = stack === 'prod' ? 'agile-poker' : `agile-poker-${stack}`
const apexDomain = 'superfun.link'
const tags = { iac: 'pulumi', project: 'agile-poker', stack }

if ( stack !== 'localdev' ) {
  // In localdev, we can just run the app with Vite
  const svelteApp = new SvelteApp('agile-poker-app', {
    subDomain,
    apexDomain,
    tags,
  })
}
