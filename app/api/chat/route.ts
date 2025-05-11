import { NextRequest, NextResponse } from 'next/server';

// Define message type for our chat interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
}

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function makeGeminiRequest(messages: Message[]) {
  const lastMessage = messages[messages.length - 1];
  
  // Prepare the content parts
  const parts = [];
  
  // If there's an image but no text content, use a better prompt
  const hasImage = !!lastMessage.image;
  const hasText = !!lastMessage.content.trim();
  
  // Add text content
  if (hasImage && !hasText) {
    parts.push({
      text: "What do you see in this image?"
    });
  } else if (hasText) {
    parts.push({
      text: lastMessage.content
    });
  }
  
  // Add image content if present
  if (lastMessage.image) {
    // Remove the "data:image/[type];base64," prefix
    const base64Image = lastMessage.image.split(',')[1];
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: lastMessage.image.split(';')[0].split(':')[1]
      }
    });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get response from Gemini');
  }

  const data = await response.json();
  return data;
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const geminiResponse = await makeGeminiRequest(messages);
    
    // Extract the response text from Gemini's response
    const responseText = geminiResponse.candidates[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      reply: responseText
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get response from Gemini',
        type: error.type || 'unknown_error'
      },
      { status: error.status || 500 }
    );
  }
} 