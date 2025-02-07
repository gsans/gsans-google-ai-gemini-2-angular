import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SchemaType,
} from '@google/generative-ai';
import { environment } from '../environments/environment.development';
import { GEMINI_PROMO } from './video-data';

import { FileConversionService } from './file-conversion.service';
import { GoogleAI } from './models.constants';

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
    private fileConversionService: FileConversionService
  ) {}

  ngOnInit(): void {
    // Google AI
    //this.TestGeminiPro();
    //this.TestGeminiProChat();
    //this.TestGeminiProVisionImages();
    //this.TestGeminiProStreaming();

    //this.TestGeminiProStructuredOutput();
    //this.TestGeminiProCodeExecution();
    this.TestGeminiProCodeExecutionCSV();

    // Vertex AI
    //this.TestGeminiProWithVertexAIViaREST();
  }

  ////////////////////////////////////////////////////////
  // Google AI - requires API KEY from Google AI Studio
  ////////////////////////////////////////////////////////

  async TestGeminiPro() {
    // Gemini Client
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
    };
    const model = genAI.getGenerativeModel({
      model: GoogleAI.Model.Gemini20ProExp,
      ...generationConfig,
    });

    const prompt = 'What is the largest number with a name?';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.candidates?.[0].content.parts[0].text);
    console.log(response.text());
  }

  async TestGeminiProChat() {
    // Gemini Client
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      //maxOutputTokens: 100,
    };
    const model = genAI.getGenerativeModel({
      model: GoogleAI.Model.Gemini20ProExp,
      ...generationConfig,
    });

    const chat = model.startChat({
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
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const prompt = 'What is the largest number with a name? Brief answer.';
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log(response.candidates?.[0].content.parts[0].text);
    console.log(response.text());
  }

  async TestGeminiProVisionImages() {
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
      const genAI = new GoogleGenerativeAI(environment.API_KEY);
      const generationConfig = {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        maxOutputTokens: 100,
      };
      const model = genAI.getGenerativeModel({
        model: GoogleAI.Model.Gemini20ProExp,
        ...generationConfig,
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(response.candidates?.[0].content.parts[0].text);
      console.log(response);
    } catch (error) {
      console.error('Error converting file to Base64', error);
    }
  }

  async TestGeminiProStreaming() {
    // Gemini Client
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
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
    const model = genAI.getGenerativeModel({
      model: GoogleAI.Model.Gemini20ProExp,
      ...generationConfig,
    });

    const prompt = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Generate a poem.',
            },
          ],
        },
      ],
    };
    const streamingResp = await model.generateContentStream(prompt);

    for await (const item of streamingResp.stream) {
      console.log('stream chunk: ' + item.text());
    }
  }

  async TestGeminiProStructuredOutput() {
    // Documentation: 
    //   https://ai.google.dev/gemini-api/docs/structured-output?lang=node
    //   https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output

    const schema = {
      description: "List of recipes",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          recipeName: {
            type: SchemaType.STRING,
            description: "Name of the recipe",
            nullable: false,
          },
        },
        required: ["recipeName"],
      },
    };

    // Gemini Client
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
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

    const model = genAI.getGenerativeModel({
      model: GoogleAI.Model.Gemini20ProExp,
      ...generationConfig,
    });

    const prompt = "List a few popular cookie recipes.";
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }

  async TestGeminiProCodeExecution(){
    // Documentation: 
    //   https://ai.google.dev/gemini-api/docs/code-execution?lang=node
    //   https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/code-execution

    // Gemini Client
    const genAI = new GoogleGenerativeAI(environment.API_KEY);
    const generationConfig = {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 100,
    };

    const model = genAI.getGenerativeModel({
      model: GoogleAI.Model.Gemini20ProExp,
      ...generationConfig,
      tools: [
        {
          codeExecution: {},
        },
      ],
    });

    const prompt = "What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.";
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }

  async TestGeminiProCodeExecutionCSV() {
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
      const genAI = new GoogleGenerativeAI(environment.API_KEY);
      const generationConfig = {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        maxOutputTokens: 100,
      };

      const model = genAI.getGenerativeModel({
        model: GoogleAI.Model.Gemini20ProExp,
        ...generationConfig,
        tools: [
          {
            codeExecution: {},
          },
        ],
      });

      const prompt = {
        contents: [
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
        ],
      };

      const result = await model.generateContent(prompt);
      
      // visualise Matplot diagram as output image
      // https://jaredwinick.github.io/base64-image-viewer/
      let base64ImageString = 'data:image/png;base64,';
      if (result?.response?.candidates) {
        result.response.candidates.forEach((candidate) => {
          candidate.content.parts.forEach((part) => {
            if (part.inlineData?.mimeType === 'image/png') {
              base64ImageString += part.inlineData.data;
            }
          });
        });
      }
      console.log(base64ImageString);
      console.log(result.response.text());
    } catch (error) {
      console.error('Error during Gemini Pro Code Execution with CSV:', error);
    }
  }

  ////////////////////////////////////////////////////////
  // VertexAI - requires Google Cloud Account + Setup
  ////////////////////////////////////////////////////////

  async TestGeminiProWithVertexAIViaREST() {
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
