/**
 * Logger stub: no-op for debug/info/warn/userAction, error shows dialog.
 */

const logger = {
  debug: (_message: string, _data?: unknown, _category?: string) => {},
  info: (_message: string, _data?: unknown, _category?: string) => {},
  warn: (_message: string, _data?: unknown, _category?: string) => {},
  error: (message: string, ..._args: unknown[]) => {
    if (typeof window !== 'undefined') {
      alert(`Error: ${message}`);
    } else {
      console.error(message);
    }
  },
  userAction: (_action: string, _details?: unknown, _category?: string) => {},
};

export const { debug, info, warn, error, userAction } = logger;
export default logger;
