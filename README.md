# Gemini Imagen MCP Server for Claude Code

[![npm version](https://badge.fury.io/js/gemini-imagen-mcp-server.svg)](https://badge.fury.io/js/gemini-imagen-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

🎨 **Perfect Claude Code MCP server** for AI-powered image generation with Google's Gemini Imagen API. Generate images directly in your project's `imagen/` folder while coding!

## ✨ Why This MCP Server?

- **🔥 Claude Code Optimized**: Designed specifically for Claude Code workflow
- **📁 Project Integration**: Images saved directly in your project's `imagen/` folder
- **🎯 Zero Setup**: Just add API key and start generating images
- **⚡ Multiple Models**: Support for Imagen 3, Imagen 4, and Imagen 4 Ultra
- **📦 Batch Processing**: Generate multiple images efficiently
- **🎛️ Advanced Controls**: Aspect ratios, negative prompts, seeds, and more

## 🚀 Quick Start

### 1. Get Your API Key
Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Install & Configure
**Zero Installation Required** - Use with npx:

Add to your Claude Code MCP settings:
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["-y", "gemini-imagen-mcp-server"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Start Generating Images!
```
Generate an image of "a futuristic robot coding in a modern office"
```

Images will be saved to `imagen/` folder in your current project! 🎯

## 📁 How It Works

When you generate images, they're automatically saved with descriptive filenames:
```
your-project/
├── imagen/
│   ├── imagen-4-ultra_2024-01-15T10-30-45_futuristic_robot_coding_1.png
│   ├── imagen-4_2024-01-15T10-32-12_sunset_landscape_1.png
│   └── imagen-3_2024-01-15T10-35-01_abstract_art_design_1.png
├── src/
└── README.md
```

## 🎨 Available Models

| Model | Quality | Speed | Best For |
|-------|---------|-------|----------|
| **imagen-4-ultra** | 🌟🌟🌟🌟🌟 | ⚡⚡⚡ | Premium quality, detailed images |
| **imagen-4** | 🌟🌟🌟🌟 | ⚡⚡⚡⚡ | Great quality, faster generation |
| **imagen-3** | 🌟🌟🌟 | ⚡⚡⚡⚡⚡ | Good quality, fastest generation |

## 💡 Usage Examples

### Basic Image Generation
```
Generate an image of "a cat wearing a space helmet"
```

### Advanced Parameters
```
Generate an image with these settings:
- Prompt: "minimalist website mockup for a coffee shop"
- Model: imagen-4-ultra
- Aspect ratio: 16:9
- Negative prompt: "cluttered, busy, complex"
```

### Batch Generation
```
Generate images for these prompts:
1. "logo design for a tech startup"
2. "mobile app interface wireframe"
3. "modern dashboard UI design"
```

### Design Assets for Projects
```
Create a collection of images:
- "app icon design, minimalist, blue and white"
- "hero banner for landing page, technology theme"
- "user avatar placeholder, professional style"
```

## 🎛️ Advanced Features

### Aspect Ratios
- `1:1` - Perfect squares (logos, avatars)
- `16:9` - Widescreen (banners, headers)
- `9:16` - Portrait (mobile screens)
- `4:3` - Standard (presentations)
- `3:4` - Portrait (posters)

### Control Parameters
- **Negative Prompts**: Specify what to avoid
- **Seeds**: Get reproducible results
- **Person Generation**: Control person appearance
- **Output Format**: JPEG or PNG

### Batch Processing
Generate multiple images efficiently with shared settings:
```
Generate a batch of logo variations with these prompts:
["minimalist coffee logo", "geometric coffee logo", "vintage coffee logo"]
using imagen-4-ultra with 1:1 aspect ratio
```

## ⚙️ Configuration Options

### Command Line Arguments
```bash
# Use different default model
npx gemini-imagen-mcp-server --model imagen-4-ultra

# Enable batch processing
npx gemini-imagen-mcp-server --batch --max-batch-size 8

# Custom output directory
npx gemini-imagen-mcp-server --output-dir assets/images
```

### Available Options
| Option | Description | Default |
|--------|-------------|---------|
| `--model` | Default model (imagen-3, imagen-4, imagen-4-ultra) | imagen-4-ultra |
| `--batch` | Enable batch processing | disabled |
| `--max-batch-size` | Max batch size (1-8) | 4 |
| `--output-dir` | Output directory | imagen |

## 🛠️ Installation Methods

### Option 1: NPX (Recommended)
No installation needed! Just configure and use:
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["-y", "gemini-imagen-mcp-server"],
      "env": {"GEMINI_API_KEY": "your-key"}
    }
  }
}
```

### Option 2: Global Install
```bash
npm install -g gemini-imagen-mcp-server
```

Then configure:
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "gemini-imagen-claude-code",
      "env": {"GEMINI_API_KEY": "your-key"}
    }
  }
}
```

### Option 3: Local Development
```bash
git clone https://github.com/serkanhaslak/gemini-imagen-mcp-server.git
cd gemini-imagen-mcp-server
npm install
npm run build
```

## 🧪 Development & Testing

### Build & Test
```bash
# Build the project
npm run build

# Run comprehensive tests
npm run test

# Development with auto-rebuild
npm run watch

# Interactive testing with MCP Inspector
npm run dev
```

### Project Structure
```
src/
├── index.ts          # Main MCP server implementation
build/                # Compiled JavaScript
test_server.js        # Comprehensive test suite
tsconfig.json         # TypeScript configuration
```

## 🔧 Available Tools

### `generate_image`
Generate single or multiple images with full parameter control.

### `batch_generate`
Process multiple prompts efficiently with shared settings.

### `list_models`
Show all available Imagen models and their capabilities.

### `health_check`
Check server status, API connectivity, and configuration.

## 📚 Resources

### `generation_history`
Access recent image generation history with full parameters.

### `api_documentation`
Comprehensive API documentation with examples.

## 🐛 Troubleshooting

### Common Issues

**"GEMINI_API_KEY not found"**
- Ensure API key is set in MCP configuration
- Verify the key is valid and has billing enabled

**"No images generated"**
- Check if prompt violates content policies
- Try a simpler prompt first
- Verify API quota hasn't been exceeded

**"Permission denied"**
- Ensure Claude Code has write access to project directory
- Check that `imagen/` folder can be created

### Debug Mode
Run with debug logging:
```bash
DEBUG=* npx gemini-imagen-mcp-server
```

## 🎯 Perfect for Claude Code Projects

This MCP server is specifically designed for developers using Claude Code:

- **Project-Centric**: Images go directly in your project
- **Developer-Friendly**: Descriptive filenames with timestamps
- **Workflow Integration**: Generate assets while coding
- **Version Control Ready**: Images in dedicated folder
- **Batch Operations**: Generate multiple assets efficiently

## 🔒 Security & Best Practices

- ✅ API keys handled securely through environment variables
- ✅ Input validation with Zod schemas
- ✅ Comprehensive error handling
- ✅ Rate limiting and quota management
- ✅ No sensitive data logged or stored

## 📈 Use Cases

### Web Development
- Hero images and banners
- UI/UX mockups and wireframes
- Logo and branding assets
- Placeholder images

### App Development
- App icons and splash screens
- User interface elements
- Marketing assets
- Documentation images

### Content Creation
- Blog post illustrations
- Social media graphics
- Presentation visuals
- Product mockups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

## 📊 API Limits & Pricing

- **Free Tier**: Generous monthly quota
- **Rate Limits**: Automatically handled
- **Batch Processing**: Optimized for efficiency
- **Cost Control**: Monitor usage with health checks

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Why Choose This MCP Server?

- **🎯 Purpose-Built**: Specifically for Claude Code workflows
- **⚡ Zero Config**: Works out of the box with just API key
- **📁 Smart Organization**: Images organized in project folders
- **🔄 Active Development**: Regular updates and improvements
- **📖 Great Documentation**: Comprehensive guides and examples
- **🛠️ Developer-Friendly**: Built by developers, for developers

---

**Ready to supercharge your Claude Code projects with AI-generated images?** 

Install now and start creating! 🚀

```bash
# Just add to your MCP config and go!
npx -y gemini-imagen-mcp-server --help
```