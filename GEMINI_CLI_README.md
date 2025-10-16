# Gemini Coding CLI

A powerful command-line interface for AI-powered code generation, analysis, and optimization using Google's Gemini AI.

## Features

- 🤖 **Code Generation**: Generate components, functions, APIs, and more
- 🔍 **Code Analysis**: Analyze existing code for quality, performance, and security
- ⚡ **Code Optimization**: Optimize code for better performance and maintainability
- 🧪 **Test Generation**: Generate comprehensive unit tests
- 📁 **File Management**: List, read, and search through project files
- 📝 **Command History**: Keep track of all commands and results

## Installation

1. Make sure you have Node.js installed
2. Install the required dependencies:
   ```bash
   npm install @google/generative-ai
   ```
3. Set your Gemini API key:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

## Usage

### Starting the CLI

```bash
node gemini-cli.js
```

### Available Commands

#### Code Generation
```javascript
// Generate a React component
generateCode('component', 'Header navigation with responsive menu')

// Generate an API endpoint
generateCode('api', 'user authentication endpoint')

// Generate a utility function
generateCode('function', 'data validation helper')
```

#### Code Analysis
```javascript
// Analyze a specific file
analyzeCode('./api/server.js')

// Analyze a component
analyzeCode('./components/Header.jsx')
```

#### Code Optimization
```javascript
// Optimize existing code
optimizeCode('./assets/js/main.js')

// Optimize a specific function
optimizeCode('./utils/helpers.js')
```

#### Test Generation
```javascript
// Generate tests for a file
generateTests('./api/gemini-api.js')

// Generate tests for a component
generateTests('./components/Button.jsx')
```

#### File Operations
```javascript
// List all files in the project
listFiles()

// Read a file
readFile('./index.html')

// Search for code patterns
searchCode('function.*async')
searchCode('console\.log')
searchCode('import.*from')
```

#### Utility Commands
```javascript
// Show help
help()

// Show command history
history()

// Clear screen
clear()

// Exit CLI
exit()
```

## Examples

### 1. Generate a React Component

```javascript
generateCode('component', 'User profile card with avatar and contact info')
```

This will generate a complete React component with:
- Modern React hooks
- TypeScript types
- Responsive design
- Error handling
- Accessibility features

### 2. Analyze Existing Code

```javascript
analyzeCode('./api/server.js')
```

This will provide:
- Code quality assessment
- Performance recommendations
- Security considerations
- Best practices suggestions
- Potential bug identification

### 3. Optimize Code

```javascript
optimizeCode('./assets/js/main.js')
```

This will:
- Improve performance
- Enhance readability
- Apply best practices
- Fix potential issues
- Add proper error handling

### 4. Generate Tests

```javascript
generateTests('./utils/validation.js')
```

This will create:
- Comprehensive test cases
- Edge case coverage
- Mock implementations
- Clear test descriptions
- Good test coverage

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

### Project Settings

The CLI automatically detects your current project directory and uses it as the base for all file operations.

## Tips

1. **Be Specific**: When generating code, provide detailed descriptions for better results
2. **Use History**: Check your command history with `history()` to see previous results
3. **File Paths**: Use relative paths from your project root
4. **Search Patterns**: Use regex patterns for advanced code searching
5. **Iterative Development**: Generate code, analyze it, optimize it, and generate tests

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your `GEMINI_API_KEY` is set correctly
2. **File Not Found**: Check that file paths are correct relative to your project root
3. **Permission Errors**: Ensure you have read/write permissions for the project directory

### Getting Help

- Use `help()` to see all available commands
- Check the command history with `history()`
- Make sure your Gemini API key is valid and has sufficient quota

## Advanced Usage

### Custom Prompts

You can modify the CLI to use custom prompts by editing the `gemini-cli.js` file and updating the prompt templates in the respective methods.

### Integration with IDEs

The CLI can be integrated with popular IDEs by:
1. Creating custom tasks
2. Using terminal integration
3. Setting up keyboard shortcuts

### Batch Operations

For multiple operations, you can create scripts that use the CLI programmatically:

```javascript
const { spawn } = require('child_process');

const cli = spawn('node', ['gemini-cli.js']);
cli.stdin.write('generateCode("component", "Button")\n');
cli.stdin.write('analyzeCode("./Button.js")\n');
cli.stdin.write('exit()\n');
```

## Contributing

Feel free to contribute to this CLI by:
1. Adding new commands
2. Improving existing functionality
3. Adding new AI models
4. Enhancing error handling
5. Adding new file format support

## License

MIT License - feel free to use and modify as needed.
