import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { StoreProvider, useStore } from '../../app/context/StoreContext'
import * as sellersDb from '../../lib/db/sellers'

function Caller() {
  const { submitSellerApplication } = useStore()
  React.useEffect(() => {
    submitSellerApplication({
      businessName: 'Test Shop', businessType: 'Retail', category: 'General',
      phone: '0777000000', whatsapp: '', city: 'Harare', address: '1 Test St',
      description: 'Test', documents: [],
    })
  }, [])
  return <div>caller</div>
}

describe('Onboarding -> email flow', () => {
  beforeEach(() => {
    // inject a logged-in user into localStorage so StoreProvider picks it up
    localStorage.setItem('msika_user', JSON.stringify({ id: 'user-1', name: 'Tester', email: 'tester@example.com', phone: '0777000000', role: 'guest' }))
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  test('client calls /api/send-seller-email after submitSellerApplication', async () => {
    // mock sellersDb to behave as if Supabase stored the application
    vi.spyOn(sellersDb, 'submitSellerApplication').mockResolvedValue({ referenceNumber: 'MSK-S123456' } as any)
    vi.spyOn(sellersDb, 'fetchSellerByUserId').mockResolvedValue({ id: 'seller-uuid' } as any)

    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <StoreProvider>
        <Caller />
      </StoreProvider>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const called = fetchMock.mock.calls.find(c => (c[0] as string).includes('/api/send-seller-email'))
    expect(Boolean(called)).toBe(true)
  })
})
