export default (initialState: { user?: API.UserDTO }) => {
  const isAdmin = initialState?.user?.role === 1;
  return {
    isAdmin,
  };
};
