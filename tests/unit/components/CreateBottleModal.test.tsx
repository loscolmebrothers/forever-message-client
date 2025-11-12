import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateBottleModal } from '@/components/Ocean/CreateBottleModal'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            user: { id: 'mock-user-id' },
          },
        },
      }),
    },
  },
}))

global.fetch = jest.fn()

describe('CreateBottleModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('should not render when isOpen is false', () => {
    render(
      <CreateBottleModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    expect(screen.queryByPlaceholderText('Write your message...')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })
  })

  it('should display character counter', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('0/120')).toBeInTheDocument()
    })
  })

  it('should update character counter when typing', async () => {
    const user = userEvent.setup()
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Write your message...')
    await user.type(textarea, 'Hello World')

    await waitFor(() => {
      expect(screen.getByText('11/120')).toBeInTheDocument()
    })
  })

  it('should enforce 120 character limit', async () => {
    const user = userEvent.setup()
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Write your message...') as HTMLTextAreaElement
    const longMessage = 'a'.repeat(150)

    await user.type(textarea, longMessage)

    await waitFor(() => {
      expect(textarea.value.length).toBeLessThanOrEqual(120)
    })
  })

  it('should prevent newlines when Enter is pressed', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Write your message...') as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: 'Hello\nWorld' } })

    await waitFor(() => {
      expect(textarea.value).toBe('HelloWorld')
    })
  })

  it('should call onClose when close button is clicked', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Close'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should disable seal button when message is empty', async () => {
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Seal your message/)).toBeDisabled()
    })
  })

  it('should enable seal button when message has content', async () => {
    const user = userEvent.setup()
    render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Write your message...')
    await user.type(textarea, 'Test message')

    await waitFor(() => {
      expect(screen.getByLabelText(/Seal your message/)).not.toBeDisabled()
    })
  })

  it('should reset form when modal is closed and reopened', async () => {
    const { rerender } = render(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write your message...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Write your message...') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test' } })

    rerender(
      <CreateBottleModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    rerender(
      <CreateBottleModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      const newTextarea = screen.getByPlaceholderText('Write your message...') as HTMLTextAreaElement
      expect(newTextarea.value).toBe('')
    })
  })
})
