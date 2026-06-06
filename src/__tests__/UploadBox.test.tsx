import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadBox } from '../app/pages/SellerOnboarding'

describe('UploadBox', () => {
  test('calls onUploaded with uploading=true when file selected', async () => {
    const doc = { id: 'doc1', label: 'ID', required: true, filename: null, url: null, uploading: false, hint: '' }
    const onUploaded = vi.fn()
    const onRemove = vi.fn()

    render(<UploadBox doc={doc} userId={undefined} onUploaded={onUploaded} onRemove={onRemove} />)

    const input = document.querySelector('input[type=file]') as HTMLInputElement | null
    // Create a fake file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })

    if (input instanceof HTMLInputElement) {
      Object.defineProperty(input, 'files', { value: [file] })
      fireEvent.change(input)
    } else {
      // fallback: find hidden input and dispatch change
      const hidden = document.querySelector('input[type=file]') as HTMLInputElement
      Object.defineProperty(hidden, 'files', { value: [file] })
      fireEvent.change(hidden)
    }

    // onUploaded should be called at least once with uploading true
    expect(onUploaded).toHaveBeenCalled()
    const calledWithUploading = onUploaded.mock.calls.some(call => call[3] === true)
    expect(calledWithUploading).toBe(true)
  })
})
