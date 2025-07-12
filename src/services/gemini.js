import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google Generative AI
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export const geminiService = {
    async generateResponse(prompt, conversationHistory = []) {
        try {
            // Get the generative model - using latest 2.5 flash
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Prepare the conversation context
            const systemPrompt = `You are a helpful AI assistant for the WKC (Walmart-Kinetic-Connect) platform. 
      This is an inventory management system for sellers and Walmart. 
      You can help users with:
      - Inventory management questions
      - Product categorization
      - Pricing strategies
      - Stock management
      - Platform features
      - Best practices for sellers
      
      Be concise, helpful, and professional. Keep responses under 200 words unless more detail is specifically requested.`;

            // Create chat session
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    ...conversationHistory.map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.content }]
                    }))
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            });

            // Generate response
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    },

    async generateImage(prompt, productDetails = {}) {
        try {
            // Create a detailed prompt for image generation based on product details
            const enhancedPrompt = this.createImagePrompt(prompt, productDetails);

            console.log('Generating image with prompt:', enhancedPrompt);

            // Generate image using the correct model and response modalities
            const response = await genAI.models.generateContent({
                model: "gemini-2.0-flash-preview-image-generation",
                contents: enhancedPrompt,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });

            console.log('Gemini API Response:', response);

            // Check if the response contains image data
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const content = response.candidates[0].content;
                console.log('Content parts:', content.parts);

                // Look for image data in the parts
                for (const part of content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        const imageData = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';

                        // Convert base64 to blob for Cloudinary upload
                        const base64Response = await fetch(`data:${mimeType};base64,${imageData}`);
                        const blob = await base64Response.blob();

                        // Upload to Cloudinary
                        const cloudinaryUrl = await this.uploadToCloudinary(blob);

                        return {
                            url: cloudinaryUrl,
                            prompt: enhancedPrompt,
                            generatedAt: new Date().toISOString(),
                            source: 'gemini_ai_cloudinary'
                        };
                    }
                }

                // If no inline data found, check if there's text with image URL
                const textPart = content.parts.find(part => part.text);
                if (textPart && textPart.text) {
                    console.log('Text response:', textPart.text);
                    // Check if the text contains an image URL
                    const imageUrlMatch = textPart.text.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
                    if (imageUrlMatch) {
                        return {
                            url: imageUrlMatch[0],
                            prompt: enhancedPrompt,
                            generatedAt: new Date().toISOString()
                        };
                    }
                    // If no image URL found, try to extract base64 data
                    const base64Match = textPart.text.match(/data:image\/[^;]+;base64,([^"\s]+)/);
                    if (base64Match) {
                        return {
                            url: base64Match[0],
                            prompt: enhancedPrompt,
                            generatedAt: new Date().toISOString()
                        };
                    }
                    // If still no image found, throw a more helpful error
                    throw new Error('Gemini returned text instead of an image. Please try a different prompt.');
                }
            }

            throw new Error('No image generated from Gemini API. Please check your API key and try again.');
        } catch (error) {
            console.error('Gemini Image API error:', error);
            throw error;
        }
    },

    async uploadToCloudinary(blob) {
        try {
            // Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', blob, 'gemini-generated-image.png');
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Failed to upload to Cloudinary');
            }

            const data = await response.json();
            console.log('Cloudinary upload successful:', data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to save generated image to Cloudinary');
        }
    },

    createImagePrompt(userPrompt, productDetails) {
        const { name, category, description } = productDetails;

        let basePrompt = userPrompt || `Generate a professional product image`;

        if (name) {
            basePrompt += ` for "${name}"`;
        }

        if (category) {
            basePrompt += ` in the ${category} category`;
        }

        if (description) {
            basePrompt += `. Description: ${description}`;
        }

        // Add professional styling instructions
        basePrompt += `. Create a clean, professional product image with: 
        - White or neutral background
        - High quality, realistic product representation
        - Good lighting and shadows
        - Suitable for e-commerce use
        - No text or watermarks
        - Professional product photography style`;

        return basePrompt;
    },

    // Helper method to format conversation for the API
    formatConversation(messages) {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }
}; 