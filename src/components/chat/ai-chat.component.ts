import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { ChatMessage } from '../../models';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="flex flex-col h-[calc(100vh-80px)] bg-white rounded-lg shadow-md p-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">AI Assistant Chat</h2>

      <!-- Chat Messages Display -->
      <div #chatMessages class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4">
        @for (message of messages(); track message.id) {
          <div [class]="message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'"
                 class="max-w-md p-3 rounded-xl shadow-sm text-sm">
              <p>{{ message.text }}</p>
              <p class="text-xs opacity-75 mt-1">{{ datePipe.transform(message.timestamp, 'shortTime') }}</p>
            </div>
          </div>
        }
        @if (isLoading()) {
          <div class="flex justify-start">
            <div class="bg-gray-200 text-gray-800 p-3 rounded-xl shadow-sm text-sm animate-pulse">
              <p>AI is typing...</p>
            </div>
          </div>
        }
      </div>

      <!-- Chat Input -->
      <div class="flex items-center space-x-3 border-t pt-4">
        <input type="text" [(ngModel)]="currentMessage" (keyup.enter)="sendMessage()"
               placeholder="Ask the AI assistant..."
               class="flex-1 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <button (click)="sendMessage()" [disabled]="!currentMessage() || isLoading()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50">
          <span class="material-icons">send</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'liga';
    }
  `]
})
export class AiChatComponent implements AfterViewChecked {
  aiService = inject(AiService);
  datePipe = inject(DatePipe);

  messages = signal<ChatMessage[]>([]);
  currentMessage = signal('');
  isLoading = signal(false);

  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(): void {
    const userMessageText = this.currentMessage().trim();
    if (!userMessageText) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.currentMessage.set('');
    this.isLoading.set(true);

    this.aiService.sendMessage(userMessageText).subscribe({
      next: (aiResponseText) => {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, aiMessage]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('AI Chat Error:', err);
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          sender: 'ai',
          text: 'Sorry, I encountered an error. Please try again later.',
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, errorMessage]);
        this.isLoading.set(false);
      }
    });
  }
}
