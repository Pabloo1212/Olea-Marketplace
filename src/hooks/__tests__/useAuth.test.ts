import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, useIsAdmin, useIsProducer, useUserRole } from '../useAuth'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    refreshSession: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn((callback) => {
      // Store the callback to trigger it manually in tests
      mockSupabase.authStateChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
  authStateChangeCallback: null as ((event: string, session: any) => void) | null,
}

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>
mockedCreateClient.mockReturnValue(mockSupabase)

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  
  // Mock window.location.origin
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3000',
    },
    writable: true,
  })
})

describe('useAuth', () => {
  describe('initial state', () => {
    it('should return initial loading state', () => {
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.profile).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.userRole).toBe(null)
    })
  })

  describe('authentication state', () => {
    it('should set user when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      const { result } = renderHook(() => useAuth())
      
      // Trigger auth state change to simulate authentication
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: mockUser,
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('should handle authentication error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      })
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.user).toBe(null)
        expect(result.current.isAuthenticated).toBe(false)
      })
    })
  })

  describe('profile management', () => {
    const mockProfile = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'customer',
      name: 'Test User',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    it('should fetch profile when user is authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })
      
      const { result } = renderHook(() => useAuth())
      
      // Trigger auth state change to simulate user authentication
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: mockUser,
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
        expect(result.current.userRole).toBe('customer')
      })
    })

    it('should create profile if not exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      // Profile not found
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // Not found error
            }),
          }),
        }),
      })
      
      // Create profile
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })
      
      const { result } = renderHook(() => useAuth())
      
      // Trigger auth state change to simulate user authentication
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: mockUser,
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
        expect(result.current.userRole).toBe('customer')
      })
    })

    it('should handle profile fetch error', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      })
      
      const { result } = renderHook(() => useAuth())
      
      await waitFor(() => {
        expect(result.current.profile).toBe(null)
        expect(result.current.userRole).toBe(null)
      })
    })
  })

  describe('auth actions', () => {
    beforeEach(() => {
      // Set up authenticated state
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { id: 'user-1', email: 'test@example.com' }
        },
        error: null,
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-1',
                email: 'test@example.com',
                role: 'customer',
              },
              error: null,
            }),
          }),
        }),
      })
    })

    describe('signIn', () => {
      it('should sign in user successfully', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { 
            user: { id: 'user-1', email: 'test@example.com' },
            session: { access_token: 'token' }
          },
          error: null,
        })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        const signInResult = await result.current.signIn(
          'test@example.com',
          'password'
        )
        
        expect(signInResult).toEqual({ error: null })
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        })
      })

      it('should handle sign in error', async () => {
        const error = new Error('Invalid credentials')
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error,
        })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        const signInResult = await result.current.signIn(
          'test@example.com',
          'wrong-password'
        )
        
        expect(signInResult).toEqual({ error: 'Invalid credentials' })
      })
    })

    describe('signUp', () => {
      it('should sign up user successfully', async () => {
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { 
            user: { id: 'user-1', email: 'test@example.com' },
            session: { access_token: 'token' }
          },
          error: null,
        })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        const signUpResult = await result.current.signUp(
          'test@example.com',
          'password',
          { name: 'Test User' }
        )
        
        expect(signUpResult).toEqual({ error: null })
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
          options: {
            data: {
              name: 'Test User',
              role: 'customer',
            },
          },
        })
      })
    })

    describe('signOut', () => {
      it('should sign out user successfully', async () => {
        mockSupabase.auth.signOut.mockResolvedValue({ error: null })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        await result.current.signOut()
        
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      })

      it('should handle sign out error', async () => {
        const error = new Error('Sign out error')
        mockSupabase.auth.signOut.mockResolvedValue({ error })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        // signOut doesn't throw, it just logs the error
        await result.current.signOut()
        
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      })
    })

    describe('resetPassword', () => {
      it('should reset password successfully', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        await result.current.resetPassword('test@example.com')
        
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          { redirectTo: 'http://localhost:3000/auth/reset-password' }
        )
      })
    })

    describe('updateProfile', () => {
      it('should update profile successfully', async () => {
        const mockUpdate = jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
        mockSupabase.from.mockReturnValue({
          update: mockUpdate,
        })
        
        const updatedProfile = {
          id: 'user-1',
          email: 'test@example.com',
          role: 'customer',
          name: 'Updated Name',
        }
        
        // Mock fetchProfile to return updated profile
        const mockSelect = jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedProfile,
              error: null,
            }),
          }),
        })
        
        // Override the from mock for this test
        mockSupabase.from.mockImplementation((table: string) => {
          if (table === 'profiles') {
            return {
              update: mockUpdate,
              select: mockSelect,
            }
          }
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn(),
              }),
            }),
          }
        })
        
        const { result } = renderHook(() => useAuth())
        
        // Set up authenticated state first
        const mockUser = { id: 'user-1', email: 'test@example.com' }
        if (mockSupabase.authStateChangeCallback) {
          mockSupabase.authStateChangeCallback('SIGNED_IN', {
            user: mockUser,
            access_token: 'token',
          })
        }
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
          expect(result.current.isAuthenticated).toBe(true)
        })
        
        const updateResult = await result.current.updateProfile({ name: 'Updated Name' })
        
        expect(updateResult).toEqual({ error: null })
      })
    })

    describe('refreshSession', () => {
      it('should refresh session successfully', async () => {
        mockSupabase.auth.refreshSession.mockResolvedValue({ error: null })
        
        const { result } = renderHook(() => useAuth())
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })
        
        await result.current.refreshSession()
        
        expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
      })
    })
  })

  describe('convenience hooks', () => {
    beforeEach(() => {
      // Set up authenticated state with admin role
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { id: 'user-1', email: 'admin@example.com' }
        },
        error: null,
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-1',
                email: 'admin@example.com',
                role: 'admin',
              },
              error: null,
            }),
          }),
        }),
      })
    })

    it('should return correct user role', async () => {
      const { result } = renderHook(() => useUserRole())
      
      // Trigger auth state change to simulate admin authentication
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: { id: 'user-1', email: 'admin@example.com' },
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(result.current.userRole).toBe('admin')
      })
    })

    it('should check if user is admin', async () => {
      // Test admin hook separately
      const { result: adminResult } = renderHook(() => useIsAdmin())
      
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: { id: 'user-1', email: 'admin@example.com' },
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(adminResult.current.isAdmin).toBe(true)
      }, { timeout: 3000 })
      
      // Test producer hook separately
      const { result: producerResult } = renderHook(() => useIsProducer())
      
      if (mockSupabase.authStateChangeCallback) {
        mockSupabase.authStateChangeCallback('SIGNED_IN', {
          user: { id: 'user-1', email: 'admin@example.com' },
          access_token: 'token',
        })
      }
      
      await waitFor(() => {
        expect(producerResult.current.isProducer).toBe(false)
      }, { timeout: 3000 })
    })
  })

  describe('auth state changes', () => {
    it('should handle auth state changes', async () => {
      let authStateCallback: ((event: string, session: any) => void) | null = null
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        }
      })
      
      const { result } = renderHook(() => useAuth())
      
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(authStateCallback).not.toBeNull()
      
      // Simulate auth state change
      if (authStateCallback) {
        authStateCallback('SIGNED_IN', {
          user: { id: 'user-2', email: 'new@example.com' }
        })
      }
      
      // The hook should react to the state change
      await waitFor(() => {
        expect(result.current.user?.id).toBe('user-2')
      })
    })
  })
})
