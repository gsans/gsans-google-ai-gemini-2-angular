# GoogleAiGeminiAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

#### Google AI Integration

This project demonstrates integration with Google's Gemini AI models using the `@google/generative-ai` library. It showcases various functionalities including:

*   **Text Generation:**  Generating text-based responses from the Gemini Pro model.
*   **Chat:**  Using the Gemini Pro model for conversational chat interactions.
*   **Vision:**  Analyzing images and generating responses based on image content.
*   **Streaming:**  Receiving responses from the Gemini Pro model in a stream.
*   **Structured Output:**  Generating structured JSON output from the Gemini Pro model based on a defined schema.
*   **Code Execution:**  Leveraging Gemini Pro's code execution capabilities to solve problems requiring code.
*   **Code Execution with CSV Data:**  Using Gemini Pro to analyze CSV data and generate visualizations using Matplotlib.

#### Vertex AI Integration (REST API)

The project also includes an example of interacting with the Gemini Pro model through Vertex AI using REST API calls.  This requires a Google Cloud project and proper authentication setup.

#### Prerequisites

Before running the application, ensure you have the following:

*   **Angular CLI:**  Make sure you have Angular CLI installed globally (`npm install -g @angular/cli`).
*   **Node.js and npm:**  Ensure Node.js and npm are installed on your system.
*   **Google AI API Key:** Obtain an API key from [Google AI Studio](https://makersuite.google.com/) and set it in the `environment.ts` file.
*   **Google Cloud Project (for Vertex AI):** If you plan to use the Vertex AI integration, you need a Google Cloud project with the Vertex AI API enabled.
*   **Google Cloud SDK (gcloud CLI):** Install and configure the Google Cloud SDK (`gcloud CLI`) to authenticate with your Google Cloud project.

#### Configuration

1.  **Environment Variables:**
    *   Create a file named `environment.development.ts` in the `src/environments/` directory (if it doesn't exist).
    *   Add your Google AI API key and Google Cloud project details to the `environment.development.ts` file:

    ```typescript
    export const environment = {
      production: false,
      API_KEY: 'YOUR_GOOGLE_AI_API_KEY',
      PROJECT_ID: 'YOUR_GOOGLE_CLOUD_PROJECT_ID',
      GCLOUD_AUTH_PRINT_ACCESS_TOKEN: 'YOUR_GCLOUD_AUTH_PRINT_ACCESS_TOKEN' // Obtain via: gcloud auth print-access-token
    };
    ```

2.  **Install Dependencies:**

    Run `npm install` to install the necessary dependencies, including `@google/generative-ai` and other required packages.

#### Running the Google AI Examples

To run the Google AI examples, you need to uncomment the desired test function calls in the [ngOnInit](http://_vscodecontentref_/2) method of the [app.component.ts](http://_vscodecontentref_/3) file. For example:

```typescript
  ngOnInit(): void {
    // Google AI
    this.TestGeminiPro();
  }
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
