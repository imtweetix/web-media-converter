import { FileItem, VideoSettings, ProgressCallback } from '../types';

export class VideoConversionService {
  // Helper function to convert CRF to approximate bitrate
  private static crfToBitrate(
    crf: number,
    resolution: { width: number; height: number }
  ): number {
    // More conservative bitrate calculation for smaller file sizes
    // Lower CRF = higher quality = higher bitrate
    const pixelCount = resolution.width * resolution.height;

    // Much more conservative bitsPerPixel values
    let bitsPerPixel: number;

    if (crf <= 18) {
      bitsPerPixel = 0.08; // Very high quality
    } else if (crf <= 23) {
      bitsPerPixel = 0.05; // High quality (default) - much lower than before
    } else if (crf <= 28) {
      bitsPerPixel = 0.03; // Medium quality
    } else if (crf <= 35) {
      bitsPerPixel = 0.02; // Lower quality
    } else {
      bitsPerPixel = 0.01; // Very low quality
    }

    // Calculate bitrate in bits per second for web-optimized output
    // Base calculation uses conservative FPS multiplier
    const bitrate = Math.round(pixelCount * bitsPerPixel * 24); // Base on 24fps

    // Clamp to more reasonable web values for smaller files
    return Math.max(50000, Math.min(bitrate, 3000000)); // 50kbps to 3Mbps max
  }

  // Helper function to calculate target resolution
  private static calculateTargetResolution(
    originalWidth: number,
    originalHeight: number,
    videoSettings: VideoSettings
  ): { width: number; height: number } {
    if (videoSettings.resolution === 'default') {
      return { width: originalWidth, height: originalHeight };
    }

    if (videoSettings.resolution === 'custom') {
      if (videoSettings.customWidth && videoSettings.customHeight) {
        return {
          width: videoSettings.customWidth,
          height: videoSettings.customHeight,
        };
      }
      // Fallback to original if custom values are not provided
      return { width: originalWidth, height: originalHeight };
    }

    // Parse standard resolution (e.g., "1920x1080")
    const [width, height] = videoSettings.resolution.split('x').map(Number);

    // Calculate aspect ratio preserving dimensions
    const originalAspectRatio = originalWidth / originalHeight;
    const targetAspectRatio = width / height;

    if (originalAspectRatio > targetAspectRatio) {
      // Original is wider, limit by width
      return {
        width,
        height: Math.round(width / originalAspectRatio),
      };
    } else {
      // Original is taller, limit by height
      return {
        width: Math.round(height * originalAspectRatio),
        height,
      };
    }
  }

  // Helper function to detect video FPS
  private static detectVideoFPS(video: HTMLVideoElement): Promise<number> {
    return new Promise(resolve => {
      let lastTimestamp = 0;
      let frameCount = 0;
      let measurementStarted = false;
      let detectionComplete = false;

      const updateFps = (now: number) => {
        if (detectionComplete) return;

        if (!measurementStarted) {
          lastTimestamp = now;
          measurementStarted = true;
          frameCount = 0;
        }

        // Check if enough time has passed to get a stable FPS value
        if (now - lastTimestamp > 1000) {
          // 1 second of measurement
          const fps = frameCount / ((now - lastTimestamp) / 1000);
          detectionComplete = true;

          // Round to common frame rates for better accuracy
          let detectedFps = Math.round(fps);

          // Snap to common frame rates if close
          const commonFrameRates = [
            12, 15, 23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60,
          ];
          for (const commonFps of commonFrameRates) {
            if (Math.abs(fps - commonFps) < 1) {
              detectedFps = Math.round(commonFps);
              break;
            }
          }

          // Fallback to 24 if detection seems unreliable
          if (detectedFps < 5 || detectedFps > 120) {
            detectedFps = 24;
          }

          // Stop video playback after detection
          video.pause();
          resolve(detectedFps);
          return;
        }

        frameCount++;

        // Use requestVideoFrameCallback if available, otherwise setTimeout
        if ('requestVideoFrameCallback' in video) {
          video.requestVideoFrameCallback(updateFps);
        } else {
          // Fallback for browsers without requestVideoFrameCallback
          setTimeout(() => {
            if (!detectionComplete) {
              updateFps(performance.now());
            }
          }, 16); // ~60fps polling
        }
      };

      // Start FPS detection
      const startDetection = () => {
        video.currentTime = Math.min(1, video.duration / 4); // Start from 1 second or 25% through video
        video
          .play()
          .then(() => {
            if ('requestVideoFrameCallback' in video) {
              video.requestVideoFrameCallback(updateFps);
            } else {
              updateFps(performance.now());
            }
          })
          .catch(() => {
            // If play fails, return default FPS
            resolve(24);
          });
      };

      // Wait for video to be ready
      if (video.readyState >= 2) {
        startDetection();
      } else {
        video.addEventListener('canplay', startDetection, { once: true });
      }

      // Timeout after 3 seconds
      setTimeout(() => {
        if (!detectionComplete) {
          detectionComplete = true;
          resolve(24); // Default fallback
        }
      }, 3000);
    });
  }

  static async convertToWebM(
    file: FileItem,
    videoSettings: VideoSettings,
    updateProgress: ProgressCallback,
    updateFile: (id: string | number, updates: Partial<FileItem>) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      updateProgress(10);

      // Create video element to get video info
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = async () => {
        try {
          updateProgress(20);

          // Ensure video is actually playable
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            reject(
              new Error(
                `Cannot process ${file.name}. The video format may not be supported or the file may be corrupted.`
              )
            );
            return;
          }

          // Get video dimensions and duration
          const originalDimensions = {
            width: video.videoWidth,
            height: video.videoHeight,
          };
          const duration = video.duration;

          // Calculate target resolution
          const finalDimensions = this.calculateTargetResolution(
            video.videoWidth,
            video.videoHeight,
            videoSettings
          );

          updateFile(file.id, {
            originalDimensions,
            finalDimensions,
            duration,
          });

          updateProgress(30);

          // Check for WebM support with fallback options
          let mimeType = 'video/webm;codecs=vp8';
          let isSupported = MediaRecorder.isTypeSupported(mimeType);

          if (!isSupported) {
            // Try VP9 codec
            mimeType = 'video/webm;codecs=vp9';
            isSupported = MediaRecorder.isTypeSupported(mimeType);
          }

          if (!isSupported) {
            // Try without specifying codec
            mimeType = 'video/webm';
            isSupported = MediaRecorder.isTypeSupported(mimeType);
          }

          if (!isSupported) {
            reject(
              new Error(
                'WebM video encoding not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.'
              )
            );
            return;
          }

          updateProgress(40);

          // Create canvas for video processing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          canvas.width = finalDimensions.width;
          canvas.height = finalDimensions.height;

          updateProgress(50);

          // Determine target FPS based on settings
          let targetFps: number;
          if (videoSettings.fps === 'default') {
            // Detect the actual video FPS
            updateProgress(55);
            try {
              targetFps = await this.detectVideoFPS(video);
              console.log(`Detected video FPS: ${targetFps}`);
              // Pause video and reset for conversion
              video.pause();
              video.currentTime = 0;
            } catch (error) {
              console.warn('FPS detection failed, using 24fps default:', error);
              targetFps = 24; // Fallback
            }
          } else {
            targetFps = parseInt(videoSettings.fps);
          }

          // Create MediaRecorder to record the canvas stream
          const stream = canvas.captureStream(targetFps);

          // Add audio track if enabled and available (cross-browser support)
          if (videoSettings.audioEnabled) {
            try {
              // Try different methods for audio capture
              let videoStream = null;
              if ((video as any).captureStream) {
                videoStream = (video as any).captureStream();
              } else if ((video as any).mozCaptureStream) {
                videoStream = (video as any).mozCaptureStream();
              }

              if (videoStream) {
                const audioTracks = videoStream.getAudioTracks();
                if (audioTracks.length > 0) {
                  stream.addTrack(audioTracks[0]);
                }
              }
            } catch (audioError) {
              console.warn(
                'Audio capture not available, continuing without audio:',
                audioError
              );
            }
          }

          // Calculate bitrate from CRF
          const bitrate = this.crfToBitrate(videoSettings.crf, finalDimensions);

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            videoBitsPerSecond: bitrate,
          });

          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const webmBlob = new Blob(chunks, { type: 'video/webm' });
            updateProgress(100);

            // Generate thumbnail for the converted video
            try {
              const thumbnailUrl =
                await this.getVideoThumbnailFromBlob(webmBlob);
              // Store the thumbnail URL in the file item
              updateFile(file.id, { convertedPreview: thumbnailUrl });
            } catch (error) {
              console.warn(
                'Could not generate converted video thumbnail:',
                error
              );
            }

            // Clean up blob URL when done
            setTimeout(() => {
              if ((video as any)._cleanup) {
                (video as any)._cleanup();
              }
            }, 100); // Small delay to ensure video element is done

            resolve(webmBlob);
          };

          mediaRecorder.onerror = event => {
            // Clean up blob URL on error
            setTimeout(() => {
              if ((video as any)._cleanup) {
                (video as any)._cleanup();
              }
            }, 100);

            reject(new Error('MediaRecorder error: ' + event.error));
          };

          // Start recording
          mediaRecorder.start();
          updateProgress(60);

          // Play video and draw frames to canvas
          video.currentTime = 0;

          let isRecording = true;
          let lastTime = 0;
          let stuckCount = 0;

          // Add timeout to prevent infinite hanging
          const conversionTimeout = setTimeout(
            () => {
              if (isRecording) {
                console.warn('Video conversion timed out, stopping recording');
                isRecording = false;
                mediaRecorder.stop();
              }
            },
            Math.max(30000, duration * 1000 * 2)
          ); // 30 seconds minimum, or 2x video duration

          let frameCount = 0;
          const drawFrame = () => {
            if (
              !isRecording ||
              video.ended ||
              video.currentTime >= video.duration
            ) {
              if (isRecording) {
                isRecording = false;
                clearTimeout(conversionTimeout);
                mediaRecorder.stop();
              }
              return;
            }

            // Check if video is stuck (same time for too long)
            if (video.currentTime === lastTime) {
              stuckCount++;
              if (stuckCount > 100) {
                // If stuck for 100 frames (~3 seconds at 30fps)
                console.warn('Video appears stuck, forcing completion');
                isRecording = false;
                clearTimeout(conversionTimeout);
                mediaRecorder.stop();
                return;
              }
            } else {
              stuckCount = 0;
            }

            // Check if video element is still valid and has dimensions
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              try {
                ctx.drawImage(
                  video,
                  0,
                  0,
                  finalDimensions.width,
                  finalDimensions.height
                );

                // Update progress based on video playback - more accurate calculation
                const playbackProgress = video.currentTime / video.duration;
                const progress = 60 + playbackProgress * 38; // 60-98% range

                // Update progress every 10 frames for smoother feedback
                frameCount++;
                if (frameCount % 10 === 0) {
                  updateProgress(Math.min(Math.round(progress), 98));
                }

                lastTime = video.currentTime;
              } catch (error) {
                console.warn('Error drawing video frame:', error);
                // Continue without throwing to prevent conversion from failing
              }
            }

            if (isRecording) {
              requestAnimationFrame(drawFrame);
            }
          };

          // Start playback and frame drawing
          video
            .play()
            .then(() => {
              drawFrame();
            })
            .catch(playError => {
              console.warn('Video play failed:', playError);
              // Start drawing anyway in case it's a minor issue
              drawFrame();
            });
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        let errorMessage = 'Failed to load video file.';

        if (fileExtension === 'wmv') {
          errorMessage = `Cannot process ${fileName}. WMV files may use codecs not supported by browsers. The file will remain in your list - you can try conversion anyway, but for best results consider using MP4 or WebM format.`;
        } else if (['mov', 'mkv'].includes(fileExtension || '')) {
          errorMessage = `Cannot process ${fileName}. This video format may not be fully supported by your browser. You can try conversion, but MP4 or WebM formats work more reliably.`;
        } else {
          errorMessage = `Cannot process ${fileName}. The video file may use an unsupported codec or be corrupted. You can try conversion, but the file may not be compatible.`;
        }

        reject(new Error(errorMessage));
      };

      // Load the video file using blob URL instead of data URL
      let blobUrl: string | null = null;

      if (file.file) {
        try {
          blobUrl = URL.createObjectURL(file.file);
          video.src = blobUrl;

          // Clean up blob URL only when processing is completely done
          const cleanup = () => {
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
              blobUrl = null;
            }
          };

          // Store cleanup function to call it later
          (video as any)._cleanup = cleanup;
        } catch (error) {
          reject(new Error('Failed to create blob URL for video file'));
        }
      } else {
        video.src = file.preview;
      }
    });
  }

  static validateVideoFile(file: File): {
    isValid: boolean;
    error?: string;
    warning?: string;
  } {
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB limit for videos

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Video file "${file.name}" is too large. Maximum file size is 500MB.`,
      };
    }

    const isVideo = file.type.startsWith('video/');

    // Browser-native supported formats for video processing
    const browserNativeFormats = ['video/mp4', 'video/webm', 'video/ogg'];

    // Additional formats we can attempt to process (may have limited browser support)
    const additionalFormats = ['video/mov', 'video/quicktime', 'video/3gpp'];

    // Formats with known browser compatibility issues
    const problematicFormats = ['video/x-ms-wmv', 'video/x-ms-asf'];

    const fileName = file.name.toLowerCase();

    // Check if it's a video file
    if (!isVideo && !fileName.match(/\.(mp4|webm|ogg|mov|3gp)$/)) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported video format.`,
      };
    }

    // Check for potentially problematic formats but still allow them
    const isProblematic = problematicFormats.some(
      format =>
        file.type.toLowerCase() === format ||
        fileName.endsWith('.wmv') ||
        fileName.endsWith('.asf')
    );

    // We'll try to convert these files anyway - let the conversion process handle any issues

    // Check for browser-native support
    const isNativelySupported = browserNativeFormats.some(
      format => file.type.toLowerCase() === format
    );

    const isAdditionalSupported = additionalFormats.some(
      format =>
        file.type.toLowerCase() === format ||
        fileName.endsWith('.' + format.split('/')[1].replace('x-', ''))
    );

    // Reject AVI and WMV files explicitly
    if (
      fileName.endsWith('.avi') ||
      fileName.endsWith('.wmv') ||
      file.type.toLowerCase() === 'video/avi' ||
      file.type.toLowerCase() === 'video/x-msvideo' ||
      isProblematic
    ) {
      return {
        isValid: false,
        error: `File "${file.name}" is not supported. For best results, please use MP4, WebM, MOV, or 3GP formats.`,
      };
    }

    if (!isNativelySupported && !isAdditionalSupported) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported video format. Supported formats: MP4, WebM, OGG, MOV, 3GP.`,
      };
    }

    // Accept all video files and let the conversion process handle compatibility
    return { isValid: true };
  }

  static getVideoThumbnailFromBlob(videoBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set a timeout for thumbnail generation
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Thumbnail generation timed out'));
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeout);
        if (video.src && video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src);
        }
      };

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        video.currentTime = Math.min(1, video.duration / 4);
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          cleanup();
          resolve(thumbnail);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Failed to load video'));
      };

      try {
        const blobUrl = URL.createObjectURL(videoBlob);
        video.src = blobUrl;
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  static getVideoThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set a dynamic timeout based on file size (3-10 seconds)
      const dynamicTimeout = Math.min(
        10000,
        Math.max(3000, videoFile.size / 100000)
      );
      const timeout = setTimeout(() => {
        cleanup();
        resolve(this.generateFallbackThumbnail(videoFile.name));
      }, dynamicTimeout);

      const cleanup = () => {
        clearTimeout(timeout);
        if (video.src && video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src);
        }
      };

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        video.currentTime = Math.min(1, video.duration / 4); // Get frame at 1s or 25% through
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          cleanup();
          resolve(thumbnail);
        } catch (error) {
          cleanup();
          resolve(this.generateFallbackThumbnail(videoFile.name));
        }
      };

      video.onerror = () => {
        cleanup();
        // Instead of rejecting, resolve with fallback thumbnail
        resolve(this.generateFallbackThumbnail(videoFile.name));
      };

      try {
        const blobUrl = URL.createObjectURL(videoFile);
        video.src = blobUrl;
      } catch (error) {
        cleanup();
        resolve(this.generateFallbackThumbnail(videoFile.name));
      }
    });
  }

  private static generateFallbackThumbnail(fileName: string): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // Return a simple data URL if canvas is not available
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTYgMTgwTDM4NCAyNDBMMjU2IDMwMFYxODBaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=';
    }

    canvas.width = 640;
    canvas.height = 360;

    // Create a simple video placeholder thumbnail
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a play button
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 40, canvas.height / 2 - 30);
    ctx.lineTo(canvas.width / 2 + 30, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 - 40, canvas.height / 2 + 30);
    ctx.closePath();
    ctx.fill();

    // Add file name text
    ctx.fillStyle = '#374151';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const shortName =
      fileName.length > 50 ? fileName.substring(0, 47) + '...' : fileName;
    ctx.fillText(shortName, canvas.width / 2, canvas.height - 30);

    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
