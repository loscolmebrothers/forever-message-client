import { renderHook, waitFor } from '@testing-library/react'
import { useBottleQueue } from '@/hooks/useBottleQueue'

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          in: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
    channel: jest.fn(() => mockChannel),
    removeChannel: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))

describe('useBottleQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty queue when no userId provided', () => {
    const { result } = renderHook(() => useBottleQueue(''))

    expect(result.current.queueItems).toEqual([])
    expect(result.current.pendingCount).toBe(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('should fetch queue items on mount when userId is provided', async () => {
    const { result } = renderHook(() => useBottleQueue('0x123'))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should calculate pending count correctly', async () => {
    const mockQueueItems = [
      {
        id: '1',
        message: 'Test 1',
        user_id: '0x123',
        status: 'queued' as const,
        progress: 0,
        ipfs_cid: null,
        blockchain_id: null,
        error: null,
        attempts: 0,
        max_attempts: 3,
        created_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
      },
      {
        id: '2',
        message: 'Test 2',
        user_id: '0x123',
        status: 'minting' as const,
        progress: 50,
        ipfs_cid: 'Qm123',
        blockchain_id: null,
        error: null,
        attempts: 1,
        max_attempts: 3,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: null,
      },
    ]

    const { supabase } = require('@/lib/supabase/client')
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          in: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockQueueItems,
              error: null,
            })),
          })),
        })),
      })),
    })

    const { result } = renderHook(() => useBottleQueue('0x123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.pendingCount).toBe(2)
  })

  it('should handle errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const { supabase } = require('@/lib/supabase/client')
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          in: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: new Error('Database error'),
            })),
          })),
        })),
      })),
    })

    const { result } = renderHook(() => useBottleQueue('0x123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    consoleErrorSpy.mockRestore()
  })

  it('should provide technical details state management', async () => {
    const { result } = renderHook(() => useBottleQueue('0x123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.technicalDetails).toBeNull()
    expect(typeof result.current.setTechnicalDetails).toBe('function')
  })

  it('should subscribe to real-time updates', async () => {
    const { supabase } = require('@/lib/supabase/client')

    const { result } = renderHook(() => useBottleQueue('0x123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(supabase.channel).toHaveBeenCalledWith('queue:0x123')
    expect(mockChannel.on).toHaveBeenCalled()
    expect(mockChannel.subscribe).toHaveBeenCalled()
  })

  it('should cleanup subscription on unmount', async () => {
    const { supabase } = require('@/lib/supabase/client')
    const { result, unmount } = renderHook(() => useBottleQueue('0x123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    unmount()

    expect(supabase.removeChannel).toHaveBeenCalled()
  })
})
