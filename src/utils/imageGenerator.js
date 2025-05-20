const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageGenerationError extends Error {
  constructor(message, code, isRetryable) {
    super(message);
    this.name = 'ImageGenerationError';
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

class InMemoryImageGenerator {
  constructor() {
    // Cache for background image
    this.backgroundImage = null;
    this.backgroundPromise = null;
  }

  async loadBackground() {
    if (this.backgroundImage) {
      return this.backgroundImage;
    }

    if (this.backgroundPromise) {
      return this.backgroundPromise;
    }

    this.backgroundPromise = fs.readFile(path.join(__dirname, '..', 'assets', 'authimage.png'))
      .then(buffer => {
        this.backgroundImage = buffer;
        return buffer;
      })
      .catch(error => {
        this.backgroundPromise = null;
        throw new ImageGenerationError(
          'Background image file not found',
          'FILE_NOT_FOUND',
          false
        );
      });

    return this.backgroundPromise;
  }

  async generateTokenImage(token) {
    try {
      const svgBuffer = Buffer.from(`
        <svg width="800" height="400">
          <style>
            @font-face {
              font-family: 'Inter Display';
              src: url('${path.join(__dirname, '..', 'assets', 'InterDisplay-Bold.ttf')}');
              font-weight: bold;
            }
          </style>
          <text 
            x="100" 
            y="220" 
            font-family="'Inter Display'"
            font-weight="bold"
            font-size="68px" 
            fill="white"
            text-anchor="start"
            dominant-baseline="middle"
            letter-spacing="1px"
          >${token}</text>
        </svg>
      `);

      // Get cached background
      const backgroundImage = await this.loadBackground();

      // Create the image
      const buffer = await sharp(backgroundImage)
        .resize(800, 400, {
          fit: 'cover',
          position: 'center'
        })
        .composite([{
          input: svgBuffer,
          top: 0,
          left: 0
        }])
        .png()
        .toBuffer();

      return buffer;

    } catch (error) {
      console.error('Sharp error details:', error);
      throw new ImageGenerationError(
        'Failed to generate image',
        'GENERATION_FAILED',
        true
      );
    }
  }
}

module.exports = {
  imageGenerator: new InMemoryImageGenerator(),
  ImageGenerationError
};