import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private chat;

  constructor() {
    // Ensure API_KEY is available in the environment
    if (!process.env.API_KEY) {
      console.error('API_KEY environment variable is not set for GoogleGenAI.');
      // Fallback or error handling for when the key is missing
      // For Applet environment, assume it's pre-configured.
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'YOUR_FALLBACK_API_KEY' });
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are an academic assistant for students and faculty. Provide concise and helpful information based on academic queries. Keep responses professional and encouraging.'
      }
    });
  }

  sendMessage(message: string): Observable<string> {
    return from(this.chat.sendMessage({ message: message })).pipe(
      map(response => response.text || 'Sorry, I could not generate a response.')
    );
  }

  // Example for if you wanted to stream responses (not used in current chat for simplicity)
  sendMessageStream(message: string): Observable<string> {
    return new Observable<string>(observer => {
      const chatStream = from(this.chat.sendMessageStream({ message }));
      chatStream.subscribe({
        next: (chunk) => {
          if (chunk.text) {
            observer.next(chunk.text);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}
