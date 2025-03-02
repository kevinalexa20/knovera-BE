// export const formatResponse = (success: boolean, message: string, data: any = null) => {
//   return {
//     success,
//     message,
//     data,
//   };
// };

export const formatResponse = (
  success: boolean,
  message: string,
  data?: any
) => {
  return {
    success,

    message,

    data,
  };
};

export const formatError = (message: string) => ({
  status: "error",
  message,
});
