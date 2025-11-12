import { renderHook, waitFor } from '@testing-library/react'
import { useBottles } from '@/hooks/useBottles'

jest.mock('@/hooks/useBottleQueue', () => ({
  useBottleQueue: jest.fn(() => ({
    queueItems: [],
    pendingCount: 0,
    technicalDetails: null,
    setTechnicalDetails: jest.fn(),
  })),
}))

jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    address: '0x123',
    isConnected: true,
  })),
}))

global.fetch = jest.fn()

describe('useBottles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch bottles on mount', async () => {
    const mockBottles = [
      {
        id: 1,
        creator: '0x123',
        ipfsHash: 'Qm123',
        userId: '0x123',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        isForever: false,
        blockchainStatus: 'confirmed',
        message: 'Test message',
        type: 'bottle',
        likeCount: 0,
        commentCount: 0,
        timestamp: Date.now(),
        exists: true,
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bottles: mockBottles,
        total: 1,
        hasMore: false,
      }),
    })

    const { result } = renderHook(() => useBottles())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.bottles.length).toBeGreaterThanOrEqual(1)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useBottles())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    consoleErrorSpy.mockRestore()
  })

  it('should return empty state when no bottles exist', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bottles: [],
        total: 0,
        hasMore: false,
      }),
    })

    const { result } = renderHook(() => useBottles())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isEmpty).toBe(true)
  })

  it('should support pagination with hasMore flag', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bottles: Array(20).fill(null).map((_, i) => ({
          id: i + 1,
          creator: '0x123',
          ipfsHash: `Qm${i}`,
          userId: '0x123',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          isForever: false,
          blockchainStatus: 'confirmed',
          message: `Message ${i}`,
          type: 'bottle',
          likeCount: 0,
          commentCount: 0,
          timestamp: Date.now(),
          exists: true,
        })),
        total: 50,
        hasMore: true,
      }),
    })

    const { result } = renderHook(() => useBottles())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.loadingProgress.isFullyLoaded).toBe(false)
  })

  it('should expose mutate function for manual refresh', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        bottles: [],
        total: 0,
        hasMore: false,
      }),
    })

    const { result } = renderHook(() => useBottles())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(typeof result.current.mutate).toBe('function')

    await waitFor(async () => {
      await result.current.mutate()
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should provide loading progress information', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bottles: Array(20).fill(null).map((_, i) => ({
          id: i + 1,
          creator: '0x123',
          ipfsHash: `Qm${i}`,
          userId: '0x123',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          isForever: false,
          blockchainStatus: 'confirmed',
          message: `Message ${i}`,
          type: 'bottle',
          likeCount: 0,
          commentCount: 0,
          timestamp: Date.now(),
          exists: true,
        })),
        total: 100,
        hasMore: true,
      }),
    })

    const { result } = renderHook(() => useBottles())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.loadingProgress.loaded).toBeGreaterThanOrEqual(20)
    expect(result.current.loadingProgress.total).toBe(100)
  })
})
