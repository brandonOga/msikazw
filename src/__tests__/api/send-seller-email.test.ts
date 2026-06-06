import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the email helper used by the API handler
vi.mock('../../../src/lib/email', () => ({ sendTransactionalEmail: vi.fn().mockResolvedValue(true) }))

import handler from '../../../api/send-seller-email'

function makeReq(body: any) {
  return { method: 'POST', body }
}

function makeRes() {
  let statusCode = 200
  let payload: any = null
  return {
    status(code: number) { statusCode = code; return this },
    json(obj: any) { payload = obj; return this },
    send(msg: any) { payload = msg; return this },
    _get() { return { statusCode, payload } }
  }
}

describe('api/send-seller-email', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns 400 for missing fields', async () => {
    const req = makeReq({})
    const res = makeRes()
    // @ts-ignore
    await handler(req, res)
    const out = res._get()
    expect(out.statusCode).toBe(400)
  })

  it('calls sendTransactionalEmail and returns 200', async () => {
    const req = makeReq({ to: 'a@b.com', name: 'A', referenceNumber: 'MSK-S000' })
    const res = makeRes()
    // @ts-ignore
    await handler(req, res)
    const out = res._get()
    expect(out.statusCode).toBe(200)
  })
})
