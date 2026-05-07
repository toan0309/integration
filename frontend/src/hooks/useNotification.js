export const useNotification = () => {
  const notify = (message) => alert(message);
  return { notify };
};
