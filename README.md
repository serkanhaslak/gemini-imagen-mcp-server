# Gemini Imagen MCP Server

[![npm version](https://badge.fury.io/js/gemini-imagen-mcp-server.svg)](https://badge.fury.io/js/gemini-imagen-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A production-ready Model Context Protocol (MCP) server that integrates Google's Gemini Imagen API with Claude Desktop for AI-powered image generation. Features multiple model support, batch processing, and advanced generation parameters.

## ✨ Features

- **🎨 Multiple Imagen Models**: Support for Imagen 3, Imagen 4, and Imagen 4 Ultra
- **📦 Batch Processing**: Generate multiple images efficiently with configurable batch sizes
- **🎛️ Advanced Parameters**: Negative prompts, person generation controls, custom seeds
- **📐 Flexible Aspect Ratios**: Support for 1:1, 3:4, 4:3, 9:16, 16:9
- **🔧 CLI Configuration**: Command-line arguments for model selection and batch settings
- **🛡️ Production Ready**: Comprehensive error handling, validation, and logging
- **📊 Generation History**: Track and review previous generations with full parameters
- **🏥 Health Monitoring**: Built-in health checks and API connectivity diagnostics
- **📚 Built-in Documentation**: Comprehensive API documentation and examples

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Claude Desktop or MCP-compatible client

### Installation

#### 🚀 Option 1: NPM Installation (Recommended)

**Install globally:**
```bash
npm install -g gemini-imagen-mcp-server
```

**Configure Claude Desktop:**

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "gemini-imagen-mcp",
      "args": ["--model", "imagen-4-ultra", "--batch", "--max-batch-size", "4"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key-here"
      }
    }
  }
}
```

#### 📁 Option 2: Manual Installation

1. **Clone and setup:**
```bash
git clone https://github.com/serkanhaslak/gemini-imagen-mcp-server.git
cd gemini-imagen-mcp-server
npm install
```

2. **Build the server:**
```bash
npm run build
```

3. **Configure Claude Desktop:**

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-imagen-mcp-server/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key-here"
      }
    }
  }
}
```

**Restart Claude Desktop** and start generating images!

### Updates

**NPM users:**
```bash
npm update -g gemini-imagen-mcp-server
```

**Manual installation users:**
```bash
git pull
npm install
npm run build
```

## 🎛️ Command Line Options

Configure the server behavior with command line arguments:

```bash
# Use different model as default
node build/index.js --model imagen-4-ultra

# Enable batch processing with custom batch size
node build/index.js --batch --max-batch-size 8

# Custom output directory
node build/index.js --output-dir /path/to/your/images

# Combine multiple options
node build/index.js --model imagen-4 --batch --max-batch-size 4 --output-dir ./my-images
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--model <model>` | Default model (imagen-3, imagen-4, imagen-4-ultra) | imagen-4-ultra |
| `--batch` | Enable batch processing mode | disabled |
| `--max-batch-size <size>` | Maximum batch size (1-8) | 4 |
| `--output-dir <dir>` | Output directory for images | ./generated_images |
| `--help, -h` | Show help message | - |
| `--version, -v` | Show version | - |

## 🔧 Available Tools

### `generate_image`
Generate single or multiple images with comprehensive parameters.

**Parameters:**
- `prompt` (required): Text description of the image
- `model`: Model selection (imagen-3, imagen-4, imagen-4-ultra)
- `number_of_images`: Number of images to generate (1-4)
- `aspect_ratio`: Image aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9)
- `person_generation`: Control person generation (dont_allow, allow_adult, allow_all)
- `negative_prompt`: What to avoid in the image
- `seed`: Random seed for reproducible results
- `output_format`: Output format (image/jpeg, image/png)

**Example:**
```
Generate an image of "a serene mountain landscape at sunset" using imagen-4-ultra with 16:9 aspect ratio
```

### `batch_generate`
Process multiple prompts efficiently with shared settings.

**Parameters:**
- `prompts`: Array of text prompts
- `model`: Model to use for all images
- `shared_settings`: Common settings (aspect_ratio, person_generation, output_format)

**Example:**
```
Generate images for these prompts: ["peaceful forest", "bustling city", "calm ocean"] using imagen-4 with 3:4 aspect ratio
```

### `list_models`
Show available Imagen models and their capabilities.

### `health_check`
Check server status, API connectivity, and configuration.

## 📚 Available Resources

### `generation_history`
Access recent image generation history with full parameters and metadata.

### `api_documentation`
Comprehensive API documentation with examples and best practices.

## 📖 Usage Examples

### Basic Generation
```
Generate an image of "a cat wearing a space helmet"
```

### Advanced Generation
```
Generate an image with these parameters:
- Prompt: "futuristic city with flying cars"
- Model: imagen-4-ultra
- Aspect ratio: 16:9
- Negative prompt: "dark, gloomy, crowded"
- Seed: 12345
```

### Batch Processing
```
Generate images for these prompts:
1. "sunrise over mountains"
2. "cozy coffee shop interior"
3. "abstract digital art"
```

## 🧪 Development

### Building and Testing

```bash
# Build the project
npm run build

# Run tests
npm run test

# Development with auto-rebuild
npm run watch

# Test with MCP Inspector
npm run inspector
```

### Testing with MCP Inspector

The MCP Inspector provides an interactive interface for testing:

```bash
npm run dev
```

This opens a web interface where you can test all tools and resources interactively.

## 🏗️ Architecture

The server implements the MCP protocol with:

- **4 Tools**: generate_image, batch_generate, list_models, health_check
- **2 Resources**: generation_history, api_documentation
- **Multiple Models**: Imagen 3, Imagen 4, Imagen 4 Ultra
- **Batch Processing**: Configurable parallel processing
- **Error Handling**: Comprehensive error handling and validation
- **Type Safety**: Full TypeScript implementation with Zod validation

## 📊 Model Comparison

| Model | Status | Best For | Quality | Speed |
|-------|--------|----------|---------|-------|
| Imagen 3 | Stable | General use | High | Fast |
| Imagen 4 | Preview | Better text rendering | Higher | Medium |
| Imagen 4 Ultra | Preview | Premium quality | Highest | Slower |

## 🔒 Security & Best Practices

- **API Key Security**: Never commit API keys to version control
- **Environment Variables**: Use environment variables for sensitive data
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Handling**: Comprehensive error handling prevents crashes
- **Rate Limiting**: Respects API rate limits and handles gracefully

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- Check that `GEMINI_API_KEY` is set correctly
- Verify Node.js version (18+)
- Ensure dependencies are installed: `npm install`

**API authentication errors:**
- Verify API key is correct and has proper permissions
- Check that billing is enabled for your Google Cloud project
- Ensure the API key hasn't expired

**Generation fails:**
- Check prompt doesn't violate content policies
- Verify model availability in your region
- Check API quotas and limits

**Claude Desktop integration:**
- Ensure configuration file path is correct
- Verify server path is absolute
- Restart Claude Desktop after configuration changes

### Debug Mode

Enable debug logging:
```bash
DEBUG=* node build/index.js
```

## 📋 API Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |

### CLI Arguments

All CLI arguments are optional and have sensible defaults.

### Error Codes

- `INVALID_API_KEY`: API key is missing or invalid
- `RATE_LIMIT_EXCEEDED`: API rate limit reached
- `CONTENT_POLICY_VIOLATION`: Prompt violates content policies
- `INVALID_PARAMETERS`: Invalid tool parameters
- `NETWORK_ERROR`: Network connectivity issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the specification
- [Google Gemini API](https://ai.google.dev/gemini-api/docs/image-generation) for the Imagen models
- [Anthropic](https://www.anthropic.com/) for Claude Desktop integration

## 🔗 Links

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

---

**Ready to generate amazing images with Claude? Install the server and start creating!** 🎨