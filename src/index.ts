#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer';

// Available Imagen models
const IMAGEN_MODELS = {
  "imagen-3": "models/imagen-3.0-generate-002",
  "imagen-4": "models/imagen-4.0-generate-preview-06-06", 
  "imagen-4-ultra": "models/imagen-4.0-ultra-generate-preview-06-06"
} as const;

type ImagenModel = keyof typeof IMAGEN_MODELS;

// Claude Code focused - always save files to imagen folder

// Configuration interface
interface ServerConfig {
  apiKey: string;
  defaultModel: ImagenModel;
  batchProcessing: boolean;
  maxBatchSize: number;
  outputDir: string;
}

// Parse command line arguments
function parseArgs(): Partial<ServerConfig> {
  const args = process.argv.slice(2);
  const config: Partial<ServerConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      console.log(`
Gemini Imagen MCP Server for Claude Code

Usage: node index.js [options]

Options:
  --model <model>          Imagen model to use (imagen-3, imagen-4, imagen-4-ultra)
  --batch                  Enable batch processing mode
  --max-batch-size <size>  Maximum batch size (default: 4)
  --output-dir <dir>       Output directory for images (default: imagen)
  --help, -h               Show this help message
  --version, -v            Show version

Environment Variables:
  GEMINI_API_KEY          Your Google Gemini API key (required)

Models:
  imagen-3                Imagen 3.0 (stable)
  imagen-4                Imagen 4.0 (preview) 
  imagen-4-ultra          Imagen 4.0 Ultra (preview)

Example:
  GEMINI_API_KEY=your_key node index.js --model imagen-4-ultra --batch
`);
      process.exit(0);
    }
    
    if (arg === '--version' || arg === '-v') {
      console.log('1.3.0');
      process.exit(0);
    }
    
    if (arg === '--model' && i + 1 < args.length) {
      const model = args[i + 1] as ImagenModel;
      if (model in IMAGEN_MODELS) {
        config.defaultModel = model;
        i++;
      } else {
        console.error(`Error: Invalid model '${model}'. Available models: ${Object.keys(IMAGEN_MODELS).join(', ')}`);
        process.exit(1);
      }
    }
    
    if (arg === '--batch') {
      config.batchProcessing = true;
    }
    
    if (arg === '--max-batch-size' && i + 1 < args.length) {
      const size = parseInt(args[i + 1]);
      if (isNaN(size) || size < 1 || size > 8) {
        console.error('Error: max-batch-size must be between 1 and 8');
        process.exit(1);
      }
      config.maxBatchSize = size;
      i++;
    }
    
    if (arg === '--output-dir' && i + 1 < args.length) {
      config.outputDir = args[i + 1];
      i++;
    }
  }
  
  return config;
}

// Initialize configuration
const cliConfig = parseArgs();

// Validate API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

// Server configuration
const serverConfig: ServerConfig = {
  apiKey,
  defaultModel: cliConfig.defaultModel || 'imagen-4-ultra',
  batchProcessing: cliConfig.batchProcessing || false,
  maxBatchSize: cliConfig.maxBatchSize || 4,
  outputDir: cliConfig.outputDir || 'imagen'
};

const IMAGEN_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

console.error(`Starting Gemini Imagen MCP Server for Claude Code`);
console.error(`Default model: ${serverConfig.defaultModel}`);
console.error(`Batch processing: ${serverConfig.batchProcessing ? 'enabled' : 'disabled'}`);
console.error(`Max batch size: ${serverConfig.maxBatchSize}`);
console.error(`Output directory: ${serverConfig.outputDir}`);
console.error(`Working directory: ${process.cwd()}`);

// Initialize server
const server = new McpServer({
  name: "gemini-imagen-claude-code",
  version: "1.3.0"
});

// Image generation history for tracking
const imageHistory = new Map<string, any>();

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to generate filename
function generateFilename(prompt: string, model: string, index: number = 1): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedPrompt = prompt.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_');
  return `${model}_${timestamp}_${sanitizedPrompt}_${index}.png`;
}

// Helper function to save image locally
async function saveImageLocally(base64Data: string, filename: string): Promise<string> {
  let outputDir = serverConfig.outputDir;
  
  // For Claude Code: Always save relative to current working directory
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.resolve(process.cwd(), outputDir);
  }
  
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.writeFile(filepath, buffer);
  
  return filepath;
}

// Claude Code image handling - save files in imagen folder
async function handleImageDisplay(base64Data: string, mimeType: string, prompt: string, model: string, index: number = 1): Promise<any[]> {
  const imageSize = Buffer.from(base64Data, 'base64').length;
  const content: any[] = [];
  
  // Save file to imagen folder
  const filename = generateFilename(prompt, model, index);
  const imagePath = await saveImageLocally(base64Data, filename);
  
  if (imagePath) {
    // Get relative path for better display
    const relativePath = path.relative(process.cwd(), imagePath);
    content.push({
      type: "text",
      text: `Image saved to: ${relativePath}\nSize: ${formatBytes(imageSize)}`
    });
  } else {
    content.push({
      type: "text",
      text: `Failed to save image (Size: ${formatBytes(imageSize)})`
    });
  }
  
  return content;
}

// Enhanced Imagen API call with comprehensive parameters
async function callImagenAPI(options: {
  prompt: string;
  model?: ImagenModel;
  numberOfImages?: number;
  aspectRatio?: string;
  outputFormat?: string;
  personGeneration?: string;
  negativePrompt?: string;
  seed?: number;
}) {
  const {
    prompt,
    model = serverConfig.defaultModel,
    numberOfImages = 1,
    aspectRatio = "1:1",
    outputFormat = "image/jpeg",
    personGeneration = "allow_adult",
    negativePrompt,
    seed
  } = options;

  const modelId = IMAGEN_MODELS[model];
  
  const requestBody: any = {
    instances: [
      {
        prompt: prompt
      }
    ],
    parameters: {
      outputMimeType: outputFormat,
      sampleCount: numberOfImages,
      personGeneration: personGeneration,
      aspectRatio: aspectRatio
    }
  };

  // Add optional parameters
  if (negativePrompt) {
    requestBody.instances[0].negativePrompt = negativePrompt;
  }
  
  if (seed !== undefined) {
    requestBody.parameters.seed = seed;
  }

  const response = await fetch(`${IMAGEN_API_BASE}/${modelId}:predict?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Batch processing function
async function processBatch(prompts: string[], sharedOptions: any = {}) {
  const batchSize = Math.min(prompts.length, serverConfig.maxBatchSize);
  const results = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map(prompt => 
      callImagenAPI({ prompt, ...sharedOptions })
    );
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      throw error;
    }
  }
  
  return results;
}

// Enhanced image generation tool
server.registerTool(
  "generate_image",
  {
    description: "Generate images using Google Gemini Imagen models",
    inputSchema: {
      prompt: z.string().describe("Text description of the image to generate"),
      model: z.enum(["imagen-3", "imagen-4", "imagen-4-ultra"]).optional().describe("Imagen model to use"),
      number_of_images: z.number().min(1).max(4).optional().describe("Number of images to generate (1-4)"),
      aspect_ratio: z.enum(["1:1", "3:4", "4:3", "9:16", "16:9"]).optional().describe("Image aspect ratio"),
      person_generation: z.enum(["dont_allow", "allow_adult", "allow_all"]).optional().describe("Person generation policy"),
      negative_prompt: z.string().optional().describe("What to avoid in the image"),
      seed: z.number().optional().describe("Random seed for reproducible results"),
      output_format: z.enum(["image/jpeg", "image/png"]).optional().describe("Output image format")
    }
  },
  async ({ prompt, model, number_of_images = 1, aspect_ratio = "1:1", person_generation = "allow_adult", negative_prompt, seed, output_format = "image/jpeg" }) => {
    try {
      // Call Imagen API
      const response = await callImagenAPI({
        prompt,
        model: model as ImagenModel,
        numberOfImages: number_of_images,
        aspectRatio: aspect_ratio,
        personGeneration: person_generation,
        negativePrompt: negative_prompt,
        seed,
        outputFormat: output_format
      });
      
      if (!response.predictions || response.predictions.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No images were generated. Please try a different prompt."
            }
          ],
          isError: true
        };
      }

      const content: any[] = [];
      const usedModel = model || serverConfig.defaultModel;

      // Add summary text
      content.push({
        type: "text",
        text: `Generated ${response.predictions.length} image(s) with ${usedModel}\nPrompt: "${prompt}"\nAspect ratio: ${aspect_ratio}${negative_prompt ? `\nNegative prompt: "${negative_prompt}"` : ''}${seed ? `\nSeed: ${seed}` : ''}`
      });

      // Process each image using smart display handling
      for (let i = 0; i < response.predictions.length; i++) {
        const prediction = response.predictions[i];
        if (prediction.bytesBase64Encoded) {
          const imageContent = await handleImageDisplay(
            prediction.bytesBase64Encoded,
            output_format,
            prompt,
            usedModel,
            i + 1
          );
          content.push(...imageContent);
        }
      }

      // Store in history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        prompt,
        model: usedModel,
        numberOfImages: number_of_images,
        aspectRatio: aspect_ratio,
        personGeneration: person_generation,
        negativePrompt: negative_prompt,
        seed,
        imageCount: response.predictions.length
      };
      imageHistory.set(Date.now().toString(), historyEntry);

      return {
        content
      };

    } catch (error: any) {
      console.error("Imagen API error:", error);
      
      if (error.message?.includes('403') || error.message?.includes('API_KEY')) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Authentication failed: Please check your Gemini API key configuration"
            }
          ],
          isError: true
        };
      } else if (error.message?.includes('429') || error.message?.includes('RATE_LIMIT')) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Rate limit reached. Please try again later or upgrade your API plan"
            }
          ],
          isError: true
        };
      } else if (error.message?.includes('SAFETY')) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Content policy violation: The prompt was blocked by safety filters"
            }
          ],
          isError: true
        };
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: `Error generating image: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);



// Batch image generation tool
server.registerTool(
  "batch_generate",
  {
    description: "Generate multiple images with different prompts using batch processing",
    inputSchema: {
      prompts: z.array(z.string()).describe("Array of text prompts for image generation"),
      model: z.enum(["imagen-3", "imagen-4", "imagen-4-ultra"]).optional().describe("Imagen model to use for all images"),
      shared_settings: z.object({
        aspect_ratio: z.enum(["1:1", "3:4", "4:3", "9:16", "16:9"]).optional(),
        person_generation: z.enum(["dont_allow", "allow_adult", "allow_all"]).optional(),
        output_format: z.enum(["image/jpeg", "image/png"]).optional()
      }).optional().describe("Shared settings for all images")
    }
  },
  async ({ prompts, model, shared_settings = {} }) => {
    try {
      if (!serverConfig.batchProcessing) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Batch processing is disabled. Start server with --batch flag to enable."
            }
          ],
          isError: true
        };
      }

      if (prompts.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No prompts provided for batch generation."
            }
          ],
          isError: true
        };
      }

      const content: any[] = [];
      const usedModel = model || serverConfig.defaultModel;

      content.push({
        type: "text",
        text: `Starting batch generation of ${prompts.length} images using ${usedModel}\nBatch size: ${serverConfig.maxBatchSize}`
      });

      // Process in batches
      const results = await processBatch(prompts, {
        model: usedModel,
        numberOfImages: 1,
        ...shared_settings
      });

      let totalImages = 0;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const prompt = prompts[i];
        
        if (result.predictions && result.predictions.length > 0) {
          totalImages += result.predictions.length;
          
          for (let j = 0; j < result.predictions.length; j++) {
            const prediction = result.predictions[j];
            if (prediction.bytesBase64Encoded) {
              // Add prompt label for batch images
              content.push({
                type: "text",
                text: `Image ${i + 1}: "${prompt.slice(0, 50)}..."`
              });
              
              // Use smart display handling for batch images
              const imageContent = await handleImageDisplay(
                prediction.bytesBase64Encoded,
                shared_settings.output_format || "image/jpeg",
                prompt,
                usedModel,
                j + 1
              );
              content.push(...imageContent);
            }
          }
        }
      }

      content.push({
        type: "text",
        text: `\n✅ Batch generation completed\nTotal images generated: ${totalImages}`
      });

      return { content };

    } catch (error: any) {
      console.error("Batch generation error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error in batch generation: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// List available models tool
server.registerTool(
  "list_models",
  {
    description: "List available Imagen models and their capabilities",
    inputSchema: {}
  },
  async () => {
    const modelInfo = {
      "imagen-3": {
        name: "Imagen 3.0",
        status: "Stable",
        capabilities: ["Text-to-image", "High quality", "Fast generation"]
      },
      "imagen-4": {
        name: "Imagen 4.0",
        status: "Preview",
        capabilities: ["Text-to-image", "Improved quality", "Better text rendering"]
      },
      "imagen-4-ultra": {
        name: "Imagen 4.0 Ultra",
        status: "Preview",
        capabilities: ["Text-to-image", "Highest quality", "Best prompt adherence"]
      }
    };

    const content = [
      {
        type: "text" as const,
        text: `Available Imagen Models:\n\n${Object.entries(modelInfo).map(([key, info]) => 
          `🎨 ${info.name} (${key})\n   Status: ${info.status}\n   Capabilities: ${info.capabilities.join(', ')}`
        ).join('\n\n')}\n\n💡 Current default model: ${serverConfig.defaultModel}`
      }
    ];

    return { content };
  }
);

// Enhanced health check tool
server.registerTool(
  "health_check",
  {
    description: "Check server status and API connectivity",
    inputSchema: {}
  },
  async () => {
    try {
      // Test API connection with a simple test request using default model
      const testModelId = IMAGEN_MODELS[serverConfig.defaultModel];
      const testResponse = await fetch(`${IMAGEN_API_BASE}/${testModelId}:predict?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: "test"
            }
          ],
          parameters: {
            outputMimeType: "image/jpeg",
            sampleCount: 1,
            personGeneration: "allow_adult",
            aspectRatio: "1:1"
          }
        })
      });
      
      const isApiConnected = testResponse.status !== 403 && testResponse.status !== 401;
      
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Server healthy (Claude Code)\n` +
                  `📡 API connected: ${isApiConnected ? 'Yes' : 'No'}\n` +
                  `🔑 API key configured: ${apiKey ? 'Yes' : 'No'}\n` +
                  `🎨 Default model: ${serverConfig.defaultModel}\n` +
                  `📦 Batch processing: ${serverConfig.batchProcessing ? 'Enabled' : 'Disabled'}\n` +
                  `📊 Images generated this session: ${imageHistory.size}\n` +
                  `📁 Output directory: ${serverConfig.outputDir}\n` +
                  `📂 Working directory: ${process.cwd()}\n` +
                  `⏰ Server uptime: ${process.uptime().toFixed(0)}s`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Server status: Issues detected\n` +
                  `📡 API connected: No\n` +
                  `🔑 API key configured: ${apiKey ? 'Yes' : 'No'}\n` +
                  `⚠️  Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// Generation history resource
server.registerResource(
  "generation_history",
  "history://generations",
  {
    description: "View recent image generation history",
    mimeType: "application/json"
  },
  async () => {
    const history = Array.from(imageHistory.entries()).map(([id, entry]) => ({
      id,
      ...entry
    }));
    
    return {
      contents: [
        {
          uri: "history://generations",
          mimeType: "application/json",
          text: JSON.stringify(history, null, 2)
        }
      ]
    };
  }
);

// API documentation resource
server.registerResource(
  "api_documentation",
  "docs://api",
  {
    description: "Comprehensive API documentation and examples",
    mimeType: "text/markdown"
  },
  async () => {
    const docs = `# Gemini Imagen MCP Server for Claude Code

## Overview
This MCP server is specifically designed for Claude Code to generate images directly in your project directory. Images are saved to the \`imagen/\` folder in your project root.

## Available Models
- **imagen-3**: Stable Imagen 3.0 model
- **imagen-4**: Preview Imagen 4.0 model  
- **imagen-4-ultra**: Preview Imagen 4.0 Ultra model (recommended)

## Tools

### generate_image
Generate single or multiple images with advanced parameters.

**Parameters:**
- \`prompt\` (required): Text description
- \`model\`: Model selection (imagen-3, imagen-4, imagen-4-ultra)
- \`number_of_images\`: 1-4 images
- \`aspect_ratio\`: 1:1, 3:4, 4:3, 9:16, 16:9
- \`person_generation\`: dont_allow, allow_adult, allow_all
- \`negative_prompt\`: What to avoid
- \`seed\`: For reproducible results
- \`output_format\`: image/jpeg, image/png

### batch_generate
Process multiple prompts efficiently with batch processing.

**Parameters:**
- \`prompts\`: Array of text prompts
- \`model\`: Model for all images
- \`shared_settings\`: Common settings

### list_models
Show available models and capabilities.

### health_check
Check server status and API connectivity for Claude Code.

## Resources

### generation_history
View recent generation history with parameters.

### api_documentation
This documentation.

## Configuration for Claude Code

Add to your Claude Code MCP configuration:
\`\`\`json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["-y", "gemini-imagen-mcp-server"],
      "env": {"GEMINI_API_KEY": "your-api-key"}
    }
  }
}
\`\`\`

## Command Line Usage

\`\`\`bash
# Start with custom model
node index.js --model imagen-4-ultra

# Enable batch processing
node index.js --batch --max-batch-size 8

# Custom output directory
node index.js --output-dir custom-images
\`\`\`

## Environment Variables

- \`GEMINI_API_KEY\`: Your Google Gemini API key (required)

## Output
All images are saved to the \`imagen/\` folder in your project root with descriptive filenames.
`;
    
    return {
      contents: [
        {
          uri: "docs://api",
          mimeType: "text/markdown",
          text: docs
        }
      ]
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Gemini Imagen MCP server running");
  console.error("Ready to generate images with Google Gemini Imagen API");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
}); 