import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { Upload, Sparkles, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const ImageUploader = ({ 
  onImageUpload, 
  buttonText = "Upload Image", 
  allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFileSize = 10485760, // 10MB in bytes
  showPreview = true,
  className = "",
  style = {},
  productDetails = {} // For AI image generation context
}) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'generate'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiError, setAiError] = useState('');

  // Check if Cloudinary is loaded
  useEffect(() => {
    const checkCloudinary = () => {
      if (window.cloudinary) {
        setCloudinaryLoaded(true);
      } else {
        console.error('Cloudinary widget not loaded. Make sure to include the Cloudinary script in your HTML.');
      }
    };

    // Check immediately
    checkCloudinary();

    // Also check after a short delay in case script is still loading
    const timer = setTimeout(checkCloudinary, 1000);

    return () => clearTimeout(timer);
  }, []);

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded. Please check your setup.');
      return;
    }

    setIsUploading(true);
    
    try {
      window.cloudinary.openUploadWidget(
        {
          cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          max_files: 1,
          client_allowed_formats: allowedFormats,
          max_file_size: maxFileSize,
          sources: ['local', 'url', 'camera'],
          show_powered_by: false,
          theme: 'minimal'
        },
        (error, result) => {
          setIsUploading(false);
          
          if (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
            return;
          }

          if (result && result.event === 'success') {
            const imageData = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
              originalFilename: result.info.original_filename || 'Unknown',
              format: result.info.format,
              width: result.info.width,
              height: result.info.height,
              bytes: result.info.bytes,
              createdAt: result.info.created_at,
              source: 'cloudinary'
            };

            console.log('Image uploaded successfully:', imageData);
            
            setUploadedImage(imageData);
            
            // Send image data to parent component
            if (onImageUpload) {
              onImageUpload(imageData);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error opening Cloudinary widget:', error);
      setIsUploading(false);
      alert('Failed to open upload widget. Please try again.');
    }
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description for the image you want to generate.');
      return;
    }

    setIsGenerating(true);
    setAiError('');
    
    try {
      const generatedImage = await geminiService.generateImage(aiPrompt, productDetails);
      
      const imageData = {
        url: generatedImage.url,
        originalFilename: `AI_Generated_${Date.now()}.png`,
        format: 'png',
        width: 1024, // Default AI generated image size
        height: 1024,
        bytes: 0, // Unknown for AI generated
        createdAt: generatedImage.generatedAt,
        prompt: generatedImage.prompt,
        source: generatedImage.source || 'gemini_ai'
      };

      console.log('AI Image generated successfully:', imageData);
      
      setUploadedImage(imageData);
      
      // Send image data to parent component
      if (onImageUpload) {
        onImageUpload(imageData);
      }
    } catch (error) {
      console.error('AI Image generation error:', error);
      setAiError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData);
    if (onImageUpload) {
      onImageUpload(imageData);
    }
  };

  return (
    <div 
      className={`image-uploader ${className}`} 
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 'auto',
        maxWidth: '100%',
        ...style
      }}
    >
      {/* Tab Navigation */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'generate'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          {!uploadedImage && (
            <button 
              onClick={openCloudinaryWidget} 
              disabled={isUploading || !cloudinaryLoaded}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                isUploading || !cloudinaryLoaded
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : !cloudinaryLoaded ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {buttonText}
                </>
              )}
            </button>
          )}

          {!cloudinaryLoaded && !uploadedImage && (
            <p className="text-xs text-gray-500 mt-2">
              Loading upload widget...
            </p>
          )}
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          {/* AI Generation Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">AI Image Generation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Generate professional product images using Gemini 2.0 Flash Preview. Images are automatically saved to Cloudinary for optimal performance.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., A modern smartphone with a sleek design on a white background"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about the product, style, and background you want
            </p>
          </div>
          
          <button
            onClick={generateAIImage}
            disabled={isGenerating || !aiPrompt.trim()}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isGenerating || !aiPrompt.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating & Uploading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </button>

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Generation Failed</p>
                  <p className="text-xs text-red-600 mt-1">{aiError}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Try using the upload feature instead, or check your API key configuration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image preview */}
      {showPreview && uploadedImage && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            {uploadedImage.source === 'gemini_ai_cloudinary' ? 'AI Generated Image' : 
             uploadedImage.source === 'gemini_ai' ? 'Generated Image' : 'Uploaded Image'}
          </h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <img 
              src={uploadedImage.url} 
              alt={uploadedImage.originalFilename}
              className="w-full h-48 object-cover rounded-lg"
            />
            {uploadedImage.source === 'gemini_ai_cloudinary' && (
              <div className="mt-3 text-sm text-green-600 font-semibold">✓ Saved to Cloudinary</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;