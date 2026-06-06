import React from 'react'
import { render, screen } from '@testing-library/react'
import { MsikaLogo } from '../app/components/MsikaLogo'

describe('MsikaLogo', () => {
  test('renders with default props', () => {
    render(<MsikaLogo />)
    expect(screen.getByLabelText('msika')).toBeInTheDocument()
    expect(screen.getByLabelText('msika')).toHaveTextContent('msika')
  })

  test('renders large light logo', () => {
    render(<MsikaLogo size="lg" color="light" />)
    const el = screen.getByLabelText('msika')
    expect(el).toBeInTheDocument()
  })
})
