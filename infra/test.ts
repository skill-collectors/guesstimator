import * as pulumi from '@pulumi/pulumi'
import { describe, it, expect, beforeAll } from 'vitest'

pulumi.runtime.setMocks({
  newResource: function (args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
    return {
      id: `${args.name}_id`,
      state: args.inputs
    }
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs
  }
})

describe('infrastructure', () => {
  let infra: typeof import('./index')

  beforeAll(async function () {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import('./index')
  })

  it('creates an S3 bucket', async () => {
    const bucketName = await new Promise((resolve, reject) => {
      infra.bucketName.apply(bucketName => resolve(bucketName))
    })
    expect(bucketName).toBe('my-bucket_id')
  })
})
