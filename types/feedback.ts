export interface PageContext {
  goal_id?: string;
  solution_id?: string;
  page_type: 'goal' | 'solution' | 'arena' | 'general';
}

export interface FeedbackData {
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackText?: string;
  pageUrl: string;
  pagePath: string;
  pageContext: PageContext;
  userEmail?: string;
  sessionData?: Record<string, unknown>;
}

export interface FeedbackSubmission extends FeedbackData {
  userId?: string;
  isAuthenticated: boolean;
}

export interface StoredFeedback {
  id: string;
  user_id?: string;
  rating: number;
  feedback_text?: string;
  page_url: string;
  page_path: string;
  goal_id?: string;
  solution_id?: string;
  page_type: string;
  is_authenticated: boolean;
  user_email?: string;
  session_data: Record<string, unknown>;
  created_at: string;
}
