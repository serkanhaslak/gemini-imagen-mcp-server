# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Build and Development
```bash
# Build the project (compiles TypeScript to JavaScript)
npm run build

# Run comprehensive MCP protocol tests
npm run test

# Development mode with auto-rebuild on file changes
npm run watch

# Interactive testing with MCP Inspector web interface
npm run dev
```

### Version Management and Publishing
```bash
# Clean build artifacts
npm run clean

# Prepare for NPM publication (clean, build, run tests)
npm run prepublishOnly
```

## Architecture Overview

This is a **Claude Code-focused MCP server** that integrates Google's Gemini Imagen API specifically for project-based image generation. The architecture is streamlined for developers working in project environments where images should be generated directly in the project folder structure.

### Key Design Principles

**Claude Code Optimization**: This server is specifically designed for Claude Code workflows, not Claude Desktop. The fundamental difference is:
- **Claude Code**: Can access and write files in project directories
- **Claude Desktop**: Cannot effectively display or manage project files

**Project-Centric File Management**: All images are saved to the `imagen/` folder in the current working directory (project root), making them immediately available as project assets.

### Core Architecture Components

**Main Server (`src/index.ts`)**
- Implements MCP protocol using `@modelcontextprotocol/sdk` 
- Streamlined for file-saving workflow (no display mode complexity)
- Registers 4 tools and 2 resources optimized for project development
- Uses simple path resolution: relative to current working directory

**Critical Implementation Details:**
- **Image Storage**: Always saves to `imagen/` folder in project root
- **Filename Generation**: Descriptive names with model, timestamp, and prompt
- **Path Handling**: Simple relative path resolution (no environment detection needed)
- **File Organization**: `imagen/imagen-4-ultra_2024-01-15T10-30-45_prompt_snippet_1.png`

### MCP Protocol Implementation

**Tools (4 total):**
1. `generate_image`: Single/multiple image generation with comprehensive parameters
2. `batch_generate`: Efficient batch processing for multiple prompts with shared settings
3. `list_models`: Shows available Imagen models and capabilities
4. `health_check`: Server status and API connectivity for Claude Code environment

**Resources (2 total):**
1. `generation_history`: JSON history of all generations with parameters
2. `api_documentation`: Claude Code-focused API documentation

### Google Gemini Imagen Integration

**Supported Models:**
- `imagen-3`: Stable, fast generation
- `imagen-4`: Preview, improved quality  
- `imagen-4-ultra`: Preview, highest quality (default)

**API Features:**
- Full parameter support: aspect ratios, negative prompts, seeds, person generation
- Comprehensive error handling for API failures, rate limits, safety violations
- Efficient batch processing with configurable parallelism

## Configuration for Claude Code

### Environment Variables
- `GEMINI_API_KEY`: Required Google Gemini API key

### MCP Configuration
This server is designed to work seamlessly with Claude Code's MCP configuration:
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["-y", "gemini-imagen-mcp-server"],
      "env": {
        "GEMINI_API_KEY": "your-api-key"
      }
    }
  }
}
```

### CLI Configuration
The server accepts command-line arguments for project-specific configuration:
- `--model`: Default model selection
- `--batch`: Enable batch processing
- `--max-batch-size`: Configure batch size (1-8)
- `--output-dir`: Change output directory (default: `imagen`)

## Development Guidelines

### TypeScript Implementation
- Full TypeScript with strict mode enabled
- Zod for runtime validation of all API inputs
- Comprehensive type definitions for Imagen API responses
- ES2022 target with Node16 module resolution

### File Structure and Output
```
your-project/
├── imagen/                    # Generated images folder
│   ├── imagen-4-ultra_2024-01-15T10-30-45_cat_space_helmet_1.png
│   └── imagen-3_2024-01-15T10-32-12_robot_coding_1.png
├── src/
│   └── index.ts              # Main MCP server implementation
├── build/                    # Compiled JavaScript output
├── test_server.js           # Comprehensive test suite
└── CLAUDE.md               # This file
```

### Testing Strategy
The `test_server.js` implements comprehensive MCP protocol validation:
- Protocol compliance (initialize, list tools/resources)
- Tool execution with parameter validation
- Error handling for various failure scenarios
- Resource access testing
- Uses child process spawning for real server testing

### Error Handling Architecture
- **API Errors**: Authentication, rate limits, safety violations
- **Validation Errors**: Invalid parameters, missing required fields
- **File System Errors**: Directory creation, write permissions
- **Network Errors**: Connectivity issues, timeouts

## Common Development Patterns

### Adding New Image Generation Features
1. Update tool schema with Zod validation in `src/index.ts`
2. Implement error handling for all failure modes
3. Add test cases to `test_server.js`
4. Update API documentation resource

### Image Processing Workflow
1. **Input Validation**: Zod schema validation of all parameters
2. **API Call**: Google Gemini Imagen API with comprehensive parameters
3. **File Generation**: Descriptive filename with timestamp and prompt
4. **Path Resolution**: Always relative to current working directory
5. **Response Formatting**: File path with size information

### Batch Processing Pattern
- Configurable batch sizes (default 4, max 8)
- Parallel processing with `Promise.all()`
- Individual batch failure isolation
- Comprehensive progress reporting

## Version History Context

**v1.3.0 Major Refocus**: 
- Complete shift from Claude Desktop support to Claude Code-only
- Removed environment detection complexity
- Simplified to always save files in `imagen/` folder
- Streamlined for project-based development workflow
- Updated all documentation and examples for Claude Code usage

**Previous versions** had complex environment detection for Claude Desktop vs CLI, but this proved unreliable and unnecessary for the primary Claude Code use case.

## Testing and Quality Assurance

### Running Tests
The test suite validates:
- MCP protocol compliance
- Tool parameter validation and execution
- Resource access functionality
- Error handling robustness
- API integration stability

```bash
npm test  # Runs build + comprehensive test suite
```

### Test Environment
- Uses mock API key for testing (expects certain failures)
- Child process spawning for real server testing
- Comprehensive MCP protocol validation
- Parameter validation testing

## Claude Code Integration Tips

### Optimal Usage Patterns
1. **Project Asset Generation**: Generate logos, icons, banners directly in project
2. **Batch Asset Creation**: Create multiple variations efficiently
3. **Development Workflow**: Generate placeholder images while coding
4. **Design Iteration**: Use seeds for reproducible variations

### File Management
- Images automatically organized in `imagen/` folder
- Descriptive filenames include model, timestamp, and prompt snippet
- Version control friendly (dedicated folder, predictable naming)
- No cleanup needed (images are project assets)

### Performance Considerations
- Default model is `imagen-4-ultra` (best quality)
- Batch processing enabled by default for multiple images
- Rate limiting handled automatically
- File I/O optimized for project directories

## Architecture Benefits for Claude Code

1. **Simplicity**: No environment detection or display mode complexity
2. **Reliability**: Always saves files, no display issues
3. **Project Integration**: Images become immediate project assets
4. **Developer Experience**: Descriptive filenames and organized structure
5. **Performance**: Optimized for file-based workflow

This server represents the ideal MCP implementation for Claude Code: focused, reliable, and perfectly integrated with project-based development workflows.