export const retryConnection = (callback: () => void, interval: number) => {
  setTimeout(callback, interval);
};
