/**
 * Image Upload Service
 * Handles secure image upload, validation, optimization, and storage
 */

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export class ImageUploader {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  private static readonly DEFAULT_OPTIONS: Required<UploadOptions> = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'jpeg',
  };

  /**
   * Validate image file
   */
  static validateFile(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({
        field: 'size',
        message: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 5MB`
      });
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push({
        field: 'type',
        message: `File type ${file.type} is not allowed. Use JPEG, PNG, or WebP`
      });
    }

    // Check filename
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push({
        field: 'name',
        message: 'Filename contains invalid characters'
      });
    }

    return errors;
  }

  /**
   * Validate actual image content
   */
  static async validateImageContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Compress and resize image
   */
  static async compressImage(
    file: File, 
    options: UploadOptions = {}
  ): Promise<File> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.naturalWidth,
            img.naturalHeight,
            opts.maxWidth,
            opts.maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            `image/${opts.format}`,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for compression'));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > height) {
        width = maxWidth;
        height = Math.round(maxWidth / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(maxHeight * aspectRatio);
      }
    }

    return { width, height };
  }

  /**
   * Generate unique filename
   */
  static generateFilename(originalName: string, format: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = format;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Upload to storage (placeholder for actual implementation)
   */
  static async uploadToStorage(
    file: File,
    path: string = 'products'
  ): Promise<UploadResult> {
    // This is a placeholder implementation
    // In production, you would upload to:
    // - AWS S3 with presigned URLs
    // - Cloudinary
    // - Supabase Storage
    // - or another storage service

    const filename = this.generateFilename(file.name, 'jpeg');
    const dimensions = await this.getImageDimensions(file);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock URL for now
    return {
      url: `/images/uploads/${path}/${filename}`,
      filename,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      format: 'jpeg',
    };
  }

  /**
   * Complete upload process with validation and optimization
   */
  static async uploadProductImage(
    file: File,
    options?: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Step 1: Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
      }

      // Step 2: Validate image content
      const isValidImage = await this.validateImageContent(file);
      if (!isValidImage) {
        throw new Error('Invalid image content - file may be corrupted');
      }

      // Step 3: Compress and optimize
      const compressedFile = await this.compressImage(file, options);

      // Step 4: Upload to storage
      const result = await this.uploadToStorage(compressedFile, 'products');

      console.log('Image uploaded successfully:', result);
      return result;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadProductImages(
    files: File[],
    options?: UploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadProductImage(files[i], options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        errors.push(error as Error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`All uploads failed: ${errors.map(e => e.message).join(', ')}`);
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} uploads failed, ${results.length} succeeded`);
    }

    return results;
  }

  /**
   * Delete image from storage (placeholder)
   */
  static async deleteImage(url: string): Promise<void> {
    // Placeholder implementation
    console.log('Deleting image:', url);
    // In production, you would:
    // 1. Extract key from URL
    // 2. Call storage API to delete
    // 3. Handle errors appropriately
  }

  /**
   * Get image info from URL
   */
  static async getImageInfo(url: string): Promise<Partial<UploadResult>> {
    // Placeholder implementation
    return {
      url,
      format: 'jpeg',
    };
  }
}

// Export convenience functions
export const uploadProductImage = ImageUploader.uploadProductImage.bind(ImageUploader);
export const uploadProductImages = ImageUploader.uploadProductImages.bind(ImageUploader);
export const validateImageFile = ImageUploader.validateFile.bind(ImageUploader);
export const deleteImage = ImageUploader.deleteImage.bind(ImageUploader);
