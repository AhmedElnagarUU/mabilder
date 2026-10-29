// One guard per generation: stops every queued or running AI call once the generation
// has failed, and never lets it make more calls than its budget.
export type SpendGuard = {
  signal: AbortSignal;
  startCall(): void;
  abort(reason: unknown): void;
};

export function createSpendGuard(maxCalls: number): SpendGuard {
  const controller = new AbortController();
  let calls = 0;

  function abort(reason: unknown): void {
    if (!controller.signal.aborted) {
      controller.abort(reason);
    }
  }

  function startCall(): void {
    if (controller.signal.aborted) {
      throw new Error("AI generation was stopped.", { cause: controller.signal.reason });
    }

    calls += 1;

    if (calls > maxCalls) {
      const error = new Error(`AI call budget of ${maxCalls} calls exceeded.`);
      abort(error);
      throw error;
    }
  }

  return { signal: controller.signal, startCall, abort };
}
