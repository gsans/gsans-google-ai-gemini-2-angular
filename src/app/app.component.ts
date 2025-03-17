import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { 
  GoogleGenAI, 
  Type,
  FunctionCallingConfigMode,
  FunctionDeclaration,
  DynamicRetrievalConfigMode,
} from '@google/genai';

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SchemaType,
  FunctionCallingMode,
  DynamicRetrievalMode,
} from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { GEMINI_PROMO } from './video-data';

import { FileConversionService } from './file-conversion.service';
import { GoogleAI } from './models.constants';
import { GoogleSearchOutputParserService } from '../grounding-formatter.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'google-ai-gemini-angular';

  constructor(
    public http: HttpClient,
    private fileConversionService: FileConversionService,
    private datePipe: DatePipe,
    private parserService: GoogleSearchOutputParserService
  ) { }

  ngOnInit(): void {
    // (⌘ + /) Toggle line comments to test different Gemini APIs.

    // Google AI
    this.TestGemini();
    //this.TestGeminiSystemInstructions();
    //this.TestGeminiChat();
    //this.TestGeminiEmbeddings();
    //this.TestGeminiInputImages();
    //this.TestGeminiTextStreaming();
    //this.TestGeminiChatStreaming();

    // Tools
    //this.TestGeminiStructuredOutput();
    //this.TestGeminiCodeExecution();
    //this.TestGeminiCodeExecutionCSV();

    //this.TestGeminiFunctionCallingWeather();
    //this.TestGeminiGoogleSearchRetrieval(); // only works with Gemini 1.5 at this time
    //this.TestGeminiGoogleSearch();

    // Image generation
    //this.TestImagen3ImageGeneration();
    //this.TestGeminiImageGeneration();

    // Vertex AI
    //this.TestGeminiVertexAI();
    //this.TestGeminiWithVertexAIViaREST();
  }

  ////////////////////////////////////////////////////////
  // Google AI - requires API KEY from Google AI Studio
  ////////////////////////////////////////////////////////

  
  async TestGemini() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
    };

    const prompt = 'What is the largest number with a name?';
    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20Flash001,
      contents: prompt,
      config: generationConfig,
    });
    console.log(response?.candidates?.[0].content?.parts?.[0].text);
    console.log(response.text);
  }

  async TestGeminiSystemInstructions() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
      systemInstruction: "Respond in the style of a pirate.",
    };

    const prompt = 'What is the largest number with a name?';
    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20Flash001,
      contents: prompt,
      config: generationConfig,
    });
    console.log(response?.candidates?.[0].content?.parts?.[0].text);
    console.log(response.text);
  }

  async TestGeminiChat() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
    };

    const chatOptions = {
      history: [
        {
          role: "user",
          parts: [
            { text: "Hi there!" },
          ]
        },
        {
          role: "model",
          parts: [
            { text: "Great to meet you. What would you like to know?" },
          ]
        },
      ],
      config: {
        ...generationConfig,
      },
    };

    const chat = ai.chats.create({
      model: GoogleAI.Model.Gemini20Flash,
      ...chatOptions,
    });

    const prompt = 'What is the largest number with a name? Brief answer.';
    const response = await chat.sendMessage({
      message: prompt
    });
    console.log(response?.candidates?.[0].content?.parts?.[0].text);
    console.log(response.text);

    const history = chat.getHistory();
    for (const content of history) {
      console.debug('chat history: ', JSON.stringify(content, null, 2));
    }
  }

  async TestGeminiEmbeddings() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });

    // Embeddings are used to feed RAG search systems, recommendation systems, and more.
    const prompt = 'What is the largest number with a name?';
    const response = await ai.models.embedContent({
      model: GoogleAI.Embeddings.TextEmbedding005,
      contents: prompt,
    });
    console.log(JSON.stringify(response));    
  }

  async TestGeminiInputImages() {
    try {
      let imageBase64 = await this.fileConversionService.convertToBase64(
        'baked_goods_2.jpeg'
      );

      // Check for successful conversion to Base64
      if (typeof imageBase64 !== 'string') {
        console.error('Image conversion to Base64 failed.');
        return;
      }

      // Gemini Client
      const ai = new GoogleGenAI({
        apiKey: environment.API_KEY
      });
      const generationConfig = {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        maxOutputTokens: 100,
      };

      const chat = ai.chats.create({
        model: GoogleAI.Model.Gemini20ProExp,
        config: {
          ...generationConfig,
        }
      });

      let prompt = [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: 'Provide a recipe.',
        },
      ];

      const response = await chat.sendMessage({
        message: prompt
      });
      console.log(response?.candidates?.[0].content?.parts?.[0].text);
      console.log(response);
    } catch (error) {
      console.error('Error converting file to Base64', error);
    }
  }

  async TestGeminiTextStreaming() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      temperature: 0.9,
      top_p: 1,
      top_k: 32,
      maxOutputTokens: 100,
    };

    const prompt = [
      {
        role: 'user',
        parts: [
          {
            text: 'Generate a poem.',
          },
        ],
      },
    ];
    const streamingResp = await ai.models.generateContentStream({
      model: GoogleAI.Model.Gemini20ProExp,
      contents: prompt,
      config: generationConfig,
    });
    for await (const chunk of streamingResp) {
      console.log('stream chunk: ' + chunk.text);
    }
  }

  async TestGeminiChatStreaming() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      temperature: 0.9,
      top_p: 1,
      top_k: 32,
      maxOutputTokens: 100,
    };

    const prompt = [
      {
        text: 'Generate a poem.',
      },
    ];
    const chat = ai.chats.create({
      model: GoogleAI.Model.Gemini20ProExp,
      config: generationConfig,
    });
    
    const streamingResp = await chat.sendMessageStream({
      message: prompt,
    });
    for await (const chunk of streamingResp) {
      console.log('stream chunk: ' + chunk.text);
    }

    const history = chat.getHistory();
    for (const content of history) {
      console.debug('chat history: ', JSON.stringify(content, null, 2));
    }
  }

  async TestGeminiStructuredOutput() {
    // Documentation: 
    //   https://ai.google.dev/gemini-api/docs/structured-output?lang=node
    //   https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output

    const schema = {
      description: "List of recipes",
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          recipeName: {
            type: Type.STRING,
            description: "Name of the recipe",
            nullable: false,
          },
        },
        required: ["recipeName"],
      },
    };

    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,

      responseMimeType: "application/json",
      responseSchema: schema,
    };

    const prompt = "List a few popular cookie recipes.";
    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20ProExp,
      contents: prompt,
      config: generationConfig,
    });
    console.log(response.text);
  }

  async TestGeminiCodeExecution() {
    // Documentation: 
    //   https://ai.google.dev/gemini-api/docs/code-execution?lang=node
    //   https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/code-execution

    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,

      tools: [
        {
          codeExecution: {},
        },
      ],
    };

    const prompt = "What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.";
    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20ProExp,
      contents: prompt,
      config: generationConfig,
    });
    console.log(response.text);
  }

  async TestGeminiCodeExecutionCSV() {
    // Documentation:
    //   https://ai.google.dev/gemini-api/docs/code-execution?lang=node
    //   https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/code-execution
    // CSV:
    //   https://www.kaggle.com/datasets/tarunpaparaju/apple-aapl-historical-stock-data

    try {
      let csv = await this.fileConversionService.convertToBase64(
        'apple-AAPL-historical-stock-data.csv'
      );

      // Check for successful conversion to Base64
      if (typeof csv !== 'string') {
        console.error('CSV conversion to Base64 failed.');
        return;
      }

      // Gemini Client
      const ai = new GoogleGenAI({
        apiKey: environment.API_KEY
      });
      const generationConfig = {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        //maxOutputTokens: 100,

        tools: [
          {
            codeExecution: {},
          },
        ],
      };

      const prompt = [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'text/csv',
                data: csv,
              },
            },
            {
              text:
                'Create a line plot using Matplotlib to visualize the change in stock price for Apple (AAPL), with the x-axis as dates and the y-axis as stock price. Use data from the file and include a title and axis labels.',
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: GoogleAI.Model.Gemini20ProExp,
        contents: prompt,
        config: generationConfig,
      });
      // visualise Matplot diagram as output image
      // https://jaredwinick.github.io/base64-image-viewer/
      let base64ImageString = 'data:image/png;base64,';
      if (response?.candidates) {
        response.candidates.forEach((candidate) => {
          candidate?.content?.parts?.forEach((part) => {
            if (part.inlineData?.mimeType === 'image/png') {
              base64ImageString += part.inlineData.data;
            }
          });
        });
      }
      console.log(base64ImageString);
      console.log(response.text);
    } catch (error) {
      console.error('Error during Gemini Pro Code Execution with CSV:', error);
    }
  }

  async TestGeminiFunctionCallingWeather() {
    // Use this approach to:
    //   1) Create a simplified RAG system to integrate external data.
    //   2) Create a simple agent to use external tools or execute a set of predefined actions.

    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });

    // Define the function to be called.
    // Following the specificication at https://spec.openapis.org/oas/v3.0.3
    const getCurrentWeatherFunction = {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: {
            type: Type.STRING,
            enum: ["celsius", "fahrenheit"],
            description: "The temperature unit to use. Infer this from the users location.",
          },
        },
        required: ["location", "unit"],
      },
    };

    // Executable function code.
    interface WeatherParams {
      location: string;
      unit: string;
    }

    const functions = {
      getCurrentWeather: ({ location, unit }: WeatherParams) => {
        // mock API response
        return {
          location,
          temperature: "25°" + (unit.toLowerCase() === "celsius" ? "C" : "F"),
        };
      }
    };

    const toolConfig = {
      tools: [
        {
          functionDeclarations: [
            getCurrentWeatherFunction,
          ],
        },
      ],
      toolConfig: {

        functionCallingConfig: {
          // (⌘ + /) Toggle line comments to test different function calling modes.

          // (default) Generates an unstructured output or a single function call as defined in "functionDeclarations".
          mode: FunctionCallingConfigMode.AUTO,

          // // Generates a single function call as defined in "tools.functionDeclarations". 
          // // The function must be whitelisted below.
          // // Warning: unstructured outputs are not possible using this option.
          // mode: FunctionCallingConfigMode.ANY,
          // allowedFunctionNames: ["getCurrentWeather"],

          // // Effectively disables the "tools.functionDeclarations".
          // mode: FunctionCallingConfigMode.NONE,
        },
      }
    }

    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,

      ...toolConfig,
    };

    const chatOptions = {
      history: [
        {
          role: "user",
          parts: [
            { text: "Hi there!" },
          ]
        },
        {
          role: "model",
          parts: [
            { text: "Great to meet you. What would you like to know?" },
          ]
        },
      ],
      config: {
        ...generationConfig,
      },
    };

    const chat = ai.chats.create({
      model: GoogleAI.Model.Gemini20Flash,
      ...chatOptions,
    });

    // Initial request from user
    const prompt = 'What is the weather like in London?';
    const response = await chat.sendMessage({
      message: prompt
    });
    console.log(response);

    // Analyze safety ratings
    this.analyzeSafetyRatings(response);

    // Extract function call generated by the model
    const call = response?.functionCalls?.[0];
    if (call) {
      // Call the actual function
      if (call.name === "getCurrentWeather" && call.args) {
        // Remember to add additional checks for the function name and parameters
        const { location, unit } = call.args as { location: string, unit: string };
        const callResponse = functions[call.name]({ location, unit });

        // (Optional) Send the API response back to the model
        // You can skip this step if you only need the raw API response but not as part of a chatbot conversation.
        const finalResponse = await chat.sendMessage({ message: [{
            functionResponse: {
              name: 'getCurrentWeather',
              response: callResponse,
            }
          }]
        });
        // Answer from the model
        console.log(`Gemini: ${finalResponse.text}`);
        // Answer from API response (as if we skipped the finalResponse step)
        const formattedDate = this.datePipe.transform(Date.now(), 'medium'); // Use DatePipe to format the date
        console.log(`Raw API: (${formattedDate}) Temperature in (${callResponse.location}) is (${callResponse.temperature}).`);
      }
    }
  }

  async TestGeminiGoogleSearchRetrieval() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });

    const toolConfig = {
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              // (⌘ + /) Toggle line comments to test different function calling modes.

              // (default) Run retrieval only when system decides it is necessary using a threshold.
              // The threshold to be used in dynamic retrieval. Default: 0.3
              mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
              dynamicThreshold: 0.3, 

              // // Always trigger retrieval even if it's not used.
              // mode: DynamicRetrievalConfigMode.MODE_UNSPECIFIED,
            },
          },
        },
      ],
    }

    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,

      ...toolConfig,
    };

    const chatOptions = {
      config: {
        ...generationConfig,
      },
    };

    const chat = ai.chats.create({
      // model: GoogleAI.Model.Gemini15ProExp,
      model: GoogleAI.Model.Gemini15ProExp,

      // // Warning: Gemini 2 models don't support grounding search
      // model: GoogleAI.Model.Gemini20ProExp, 

      ...chatOptions,
    });

    const prompt = 'What is the largest number with a name?';
    const response = await chat.sendMessage({
      message: prompt
    });
      
    console.log(response);
    console.log(response.text);
    console.log(response?.candidates?.[0].groundingMetadata);
    console.log(this.parserService.parse(response));
  }

  async TestGeminiGoogleSearch() {
    // Gemini Client
    const ai = new GoogleGenAI({
      apiKey: environment.API_KEY
    });

    const toolConfig = {
      tools: [
        {
          googleSearch: {},
        },
      ],
    }

    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,

      ...toolConfig,
    };

    const chatOptions = {
      config: {
        ...generationConfig,
      },
    };

    const chat = ai.chats.create({
      // model: GoogleAI.Model.Gemini15ProExp,
      model: GoogleAI.Model.Gemini20Flash,

      // // Warning: Gemini 2 models don't support google search
      // model: GoogleAI.Model.Gemini20ProExp, 

      ...chatOptions,
    });

    const prompt = 'What is the largest number with a name?';
    const response = await chat.sendMessage({
      message: prompt
    });

    console.log(response);
    console.log(response.text);
    console.log(response?.candidates?.[0].groundingMetadata);
    console.log(this.parserService.parse(response));
  }

  async TestImagen3ImageGeneration() {  
    // Gemini Client
    const ai = new GoogleGenAI({ apiKey: environment.API_KEY});

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002', // latest model
      config: {
        numberOfImages: 1, // 1-4
        aspectRatio: '16:9', // 1:1, 4:3, 3:4, 16:9, 9:16
      },
      prompt: 'Generate a picture of a cat surfing.',
    });

    // To visualise the image use the following link
    // https://jaredwinick.github.io/base64-image-viewer/
    const image = response?.generatedImages![0]?.image!.imageBytes!;
    if (image) {
      let base64ImageString = 'data:image/png;base64,' + image;
      console.log(base64ImageString);
    }
  }

  async TestGeminiImageGeneration() {
    // Gemini Client
    const ai = new GoogleGenAI({ apiKey: environment.API_KEY });

    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20FlashExp,
      config: {
        responseModalities: ['text', 'image']
      },
      contents: 'Generate a picture of a cat skiing.',
    });

    // To visualise the image use the following link
    // https://jaredwinick.github.io/base64-image-viewer/
    const image = response.candidates![0]!.content!.parts!.find((p) => p.inlineData)!
      .inlineData!.data!
    if (image) {
      let base64ImageString = 'data:image/png;base64,' + image;
      console.log(base64ImageString);
    }
  }

  analyzeSafetyRatings(response: any) {
    const safetyRatings = response.promptFeedback?.safetyRatings;
    if (safetyRatings) {
      for (const rating of safetyRatings) {
        if (rating.probability !== "NEGLIGIBLE") {
          console.warn("Potentially unsafe request:", response);
          return;
        }
      }
    }
    console.log("Safe request:", response);
  }

  ////////////////////////////////////////////////////////
  // VertexAI - requires Google Cloud Account + Setup
  ////////////////////////////////////////////////////////

  async TestGeminiVertexAI() {
    // Gemini Client
    const ai = new GoogleGenAI({
      vertexai: true,
      apiKey: environment.API_KEY,
      project: environment.PROJECT_ID,
      location: 'us-central1',
      // httpOptions: {
      //   apiVersion: 'v1',
      //   headers: {
      //     Authorization: `Bearer ${ environment.GCLOUD_AUTH_PRINT_ACCESS_TOKEN }`,
      //     AccessControlAllowOrigin: 'no-cors',
      //   }
      // },
    });
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
    };

    const prompt = 'What is the largest number with a name?';
    const response = await ai.models.generateContent({
      model: GoogleAI.Model.Gemini20Flash001,
      contents: prompt,
      config: generationConfig,
    });
    console.log(response?.candidates?.[0].content?.parts?.[0].text);
    console.log(response.text);    
  }

  async TestGeminiWithVertexAIViaREST() {
    // Docs: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini#request_body
    const prompt = this.buildPrompt('What is the largest number with a name?');
    const endpoint = this.buildEndpointUrl(environment.PROJECT_ID);
    let headers = this.getAuthHeaders(
      environment.GCLOUD_AUTH_PRINT_ACCESS_TOKEN
    );

    this.http.post(endpoint, prompt, { headers }).subscribe((response: any) => {
      console.log(response.candidates?.[0].content.parts[0].text);
      console.log(response);
    });
  }

  buildPrompt(text: string) {
    return {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
            },
          ],
        },
      ],
      safety_settings: {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      generation_config: {
        max_output_tokens: 100,
      },
    };
  }

  buildEndpointUrl(projectId: string) {
    const BASE_URL = 'https://us-central1-aiplatform.googleapis.com/';
    const API_VERSION = 'v1'; // may be different at this time
    const MODEL = GoogleAI.Model.Gemini20ProExp;

    let url = BASE_URL; // base url
    url += API_VERSION; // api version
    url += '/projects/' + projectId; // project id
    url += '/locations/us-central1'; // google cloud region
    url += '/publishers/google'; // publisher
    url += '/models/' + MODEL; // model
    url += ':generateContent'; // action

    return url;
  }

  getAuthHeaders(accessToken: string) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return headers;
  }
}
