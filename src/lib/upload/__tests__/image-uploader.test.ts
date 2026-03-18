import { ImageUploader } from '../image-uploader'

// Mock canvas and image compression
global.HTMLCanvasElement.prototype.getContext = jest.fn()
global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,test')

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  onload: null,
  result: 'data:image/jpeg;base64,test',
})) as any

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob://test-url')
global.URL.revokeObjectURL = jest.fn()

describe('ImageUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateFile', () => {
    it('should validate a valid image file', () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      expect(() => ImageUploader.validateFile(file)).not.toThrow()
    })

    it('should reject file that is too large', () => {
      const file = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }) // 6MB
      
      expect(() => ImageUploader.validateFile(file)).toThrow('File size must be less than 5MB')
    })

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      
      expect(() => ImageUploader.validateFile(file)).toThrow('File must be JPEG, PNG, or WebP')
    })

    it('should reject empty file', () => {
      const file = new File([''], 'empty.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 0 })
      
      expect(() => ImageUploader.validateFile(file)).toThrow('File is empty')
    })
  })

  describe('validateImageContent', () => {
    it('should validate valid image dimensions', async () => {
      const mockImage = {
        naturalWidth: 1200,
        naturalHeight: 1200,
        onload: null,
        onerror: null,
      } as any
      
      global.Image = jest.fn().mockImplementation(() => mockImage)
      
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      await expect(ImageUploader.validateImageContent(file)).resolves.toBeUndefined()
      
      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }
    })

    it('should reject image that is too small', async () => {
      const mockImage = {
        naturalWidth: 100,
        naturalHeight: 100,
        onload: null,
        onerror: null,
      } as any
      
      global.Image = jest.fn().mockImplementation(() => mockImage)
      
      const file = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
      
      await expect(ImageUploader.validateImageContent(file)).rejects.toThrow(
        'Image dimensions must be at least 300x300 pixels'
      )
    })

    it('should reject image that is too large', async () => {
      const mockImage = {
        naturalWidth: 5000,
        naturalHeight: 5000,
        onload: null,
        onerror: null,
      } as any
      
      global.Image = jest.fn().mockImplementation(() => mockImage)
      
      const file = new File(['test'], 'large.jpg', { type: 'image/jpeg' })
      
      await expect(ImageUploader.validateImageContent(file)).rejects.toThrow(
        'Image dimensions cannot exceed 4000x4000 pixels'
      )
    })

    it('should handle image load error', async () => {
      const mockImage = {
        naturalWidth: 0,
        naturalHeight: 0,
        onload: null,
        onerror: null,
      } as any
      
      global.Image = jest.fn().mockImplementation(() => mockImage)
      
      const file = new File(['test'], 'corrupt.jpg', { type: 'image/jpeg' })
      
      await expect(ImageUploader.validateImageContent(file)).rejects.toThrow(
        'Failed to load image'
      )
      
      // Trigger image error
      if (mockImage.onerror) {
        mockImage.onerror(new Event('error'))
      }
    })
  })

  describe('getImageDimensions', () => {
    it('should return correct image dimensions', async () => {
      const mockImage = {
        naturalWidth: 1200,
        naturalHeight: 800,
        onload: null,
        onerror: null,
      } as any
      
      global.Image = jest.fn().mockImplementation(() => mockImage)
      
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      const dimensions = await ImageUploader.getImageDimensions(file)
      
      expect(dimensions).toEqual({ width: 1200, height: 800 })
      
      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload(new Event('load'))
      }
    })
  })

  describe('compressImage', () => {
    it('should compress image successfully', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      const mockCanvas = {
        width: 1200,
        height: 1200,
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,compressed'),
      } as any
      
      global.HTMLCanvasElement = jest.fn().mockImplementation(() => mockCanvas)
      
      const compressed = await ImageUploader.compressImage(file, 1200, 1200, 0.8)
      
      expect(compressed).toBeInstanceOf(Blob)
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
    })

    it('should handle compression error', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      global.HTMLCanvasElement = jest.fn().mockImplementation(() => {
        throw new Error('Canvas error')
      })
      
      await expect(
        ImageUploader.compressImage(file, 1200, 1200, 0.8)
      ).rejects.toThrow('Canvas error')
    })
  })

  describe('generateFilename', () => {
    it('should generate unique filename', () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      const filename = ImageUploader.generateFilename(file)
      
      expect(filename).toMatch(/^product-image-\d+\.jpg$/)
      expect(filename).not.toBe('image.jpg')
    })

    it('should handle different file types', () => {
      const pngFile = new File(['test'], 'image.png', { type: 'image/png' })
      const webpFile = new File(['test'], 'image.webp', { type: 'image/webp' })
      
      const pngFilename = ImageUploader.generateFilename(pngFile)
      const webpFilename = ImageUploader.generateFilename(webpFile)
      
      expect(pngFilename).toMatch(/\.png$/)
      expect(webpFilename).toMatch(/\.webp$/)
    })
  })

  describe('uploadToStorage', () => {
    it('should upload file to storage successfully', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue({
              data: { path: 'product-images/test.jpg' },
              error: null,
            }),
            getPublicUrl: jest.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/test.jpg' },
            }),
          }),
        },
      }
      
      // Mock the supabase client
      jest.doMock('@/lib/supabase/client', () => mockSupabase)
      
      const result = await ImageUploader.uploadToStorage(file, 'product-images')
      
      expect(result).toBe('https://example.com/test.jpg')
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('product-images')
    })

    it('should handle upload error', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Upload failed'),
            }),
          }),
        },
      }
      
      jest.doMock('@/lib/supabase/client', () => mockSupabase)
      
      await expect(
        ImageUploader.uploadToStorage(file, 'product-images')
      ).rejects.toThrow('Upload failed')
    })
  })

  describe('uploadProductImage', () => {
    it('should upload product image with full pipeline', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      
      // Mock all the steps
      jest.spyOn(ImageUploader, 'validateFile').mockImplementation(() => {})
      jest.spyOn(ImageUploader, 'validateImageContent').mockResolvedValue(undefined)
      jest.spyOn(ImageUploader, 'compressImage').mockResolvedValue(new Blob(['compressed']))
      jest.spyOn(ImageUploader, 'uploadToStorage').mockResolvedValue('https://example.com/image.jpg')
      
      const result = await ImageUploader.uploadProductImage(file)
      
      expect(result).toBe('https://example.com/image.jpg')
      expect(ImageUploader.validateFile).toHaveBeenCalledWith(file)
      expect(ImageUploader.validateImageContent).toHaveBeenCalledWith(file)
      expect(ImageUploader.compressImage).toHaveBeenCalled()
      expect(ImageUploader.uploadToStorage).toHaveBeenCalled()
    })

    it('should handle validation error', async () => {
      const file = new File(['test'], 'invalid.jpg', { type: 'image/jpeg' })
      
      jest.spyOn(ImageUploader, 'validateFile').mockImplementation(() => {
        throw new Error('Invalid file')
      })
      
      await expect(ImageUploader.uploadProductImage(file)).rejects.toThrow('Invalid file')
    })
  })

  describe('uploadProductImages', () => {
    it('should upload multiple images', async () => {
      const files = [
        new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'image2.jpg', { type: 'image/jpeg' }),
      ]
      
      jest.spyOn(ImageUploader, 'uploadProductImage').mockResolvedValue('https://example.com/image.jpg')
      
      const results = await ImageUploader.uploadProductImages(files)
      
      expect(results).toHaveLength(2)
      expect(results[0]).toBe('https://example.com/image.jpg')
      expect(results[1]).toBe('https://example.com/image.jpg')
      expect(ImageUploader.uploadProductImage).toHaveBeenCalledTimes(2)
    })

    it('should handle empty array', async () => {
      const results = await ImageUploader.uploadProductImages([])
      
      expect(results).toHaveLength(0)
    })

    it('should handle partial failures', async () => {
      const files = [
        new File(['test1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'image2.jpg', { type: 'image/jpeg' }),
      ]
      
      jest.spyOn(ImageUploader, 'uploadProductImage')
        .mockResolvedValueOnce('https://example.com/image1.jpg')
        .mockRejectedValueOnce(new Error('Upload failed'))
      
      await expect(ImageUploader.uploadProductImages(files)).rejects.toThrow('Upload failed')
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            remove: jest.fn().mockResolvedValue({
              data: {},
              error: null,
            }),
          }),
        },
      }
      
      jest.doMock('@/lib/supabase/client', () => mockSupabase)
      
      await expect(ImageUploader.deleteImage('product-images', 'test.jpg')).resolves.toBeUndefined()
      
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('product-images')
    })

    it('should handle delete error', async () => {
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            remove: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Delete failed'),
            }),
          }),
        },
      }
      
      jest.doMock('@/lib/supabase/client', () => mockSupabase)
      
      await expect(
        ImageUploader.deleteImage('product-images', 'test.jpg')
      ).rejects.toThrow('Delete failed')
    })
  })

  describe('placeholder upload', () => {
    it('should upload placeholder image', async () => {
      jest.spyOn(ImageUploader, 'uploadToStorage').mockResolvedValue('https://example.com/placeholder.jpg')
      
      const result = await ImageUploader.uploadPlaceholderImage('product-123')
      
      expect(result).toBe('https://example.com/placeholder.jpg')
      expect(ImageUploader.uploadToStorage).toHaveBeenCalled()
    })

    it('should delete placeholder image', async () => {
      jest.spyOn(ImageUploader, 'deleteImage').mockResolvedValue(undefined)
      
      await expect(
        ImageUploader.deletePlaceholderImage('product-123')
      ).resolves.toBeUndefined()
      
      expect(ImageUploader.deleteImage).toHaveBeenCalledWith(
        'product-images',
        'placeholders/product-123.jpg'
      )
    })
  })
})
