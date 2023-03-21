export const getCompanyName = (email: string) => {
  return email.split("@")[1].split(".")[0];
};

export const getNetworkName = () => {};
