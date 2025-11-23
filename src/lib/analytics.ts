// Simple analytics implementation
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isDevelopment = process.env.NODE_ENV === 'development';

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);

    if (!this.isDevelopment) {
      // In production, send to your analytics service
      console.log('Analytics:', analyticsEvent);
      // Example: send to Google Analytics, Mixpanel, etc.
    }
  }

  trackGameStart(gameMode: string) {
    this.track('game_start', { game_mode: gameMode });
  }

  trackGameEnd(duration: number, winner?: string) {
    this.track('game_end', { duration, winner });
  }

  trackTokenGeneration(prompt: string, success: boolean) {
    this.track('token_generation', { prompt_length: prompt.length, success });
  }

  trackError(error: string, context?: string) {
    this.track('error', { error, context });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
}

export const analytics = new Analytics();