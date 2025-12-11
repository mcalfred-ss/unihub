import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputPill } from '../InputPill'

describe('InputPill', () => {
  it('renders with label', () => {
    render(<InputPill label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders input field', () => {
    render(<InputPill />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(<InputPill error="This is an error" />)
    expect(screen.getByText('This is an error')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const handleChange = jest.fn()
    render(<InputPill onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    
    await userEvent.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<InputPill className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<InputPill ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

