import type { AnswerInput, AnswerResponse, HintResponse } from "@/features/gameplay/session-types";
import { apiRequest } from "@/lib/api/client";

export const gameplayApi = {
  startMission(childId: string, missionId: string) {
    return apiRequest<{ session: { id: string } }>({
      url: `/api/children/${childId}/missions/${missionId}/start`,
      method: "POST",
    });
  },
  submitAnswer(sessionId: string, questionId: string, input: AnswerInput) {
    return apiRequest<AnswerResponse>({
      url: `/api/sessions/${sessionId}/questions/${questionId}/answer`,
      method: "POST",
      data: input,
    });
  },
  requestHint(sessionId: string, questionId: string) {
    return apiRequest<HintResponse>({
      url: `/api/sessions/${sessionId}/questions/${questionId}/hint`,
      method: "POST",
    });
  },
  completeSession(sessionId: string) {
    return apiRequest({ url: `/api/sessions/${sessionId}/complete`, method: "POST" });
  },
  exitSession(sessionId: string) {
    return apiRequest({ url: `/api/sessions/${sessionId}/exit`, method: "POST" });
  },
};
