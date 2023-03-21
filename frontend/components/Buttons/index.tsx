import tw from "twin.macro";

export const PrimaryButton = tw.button`flex items-center justify-center rounded-30px bg-primary-600 disabled:bg-gray-300  text-white py-12px px-48px  hover:bg-primary-700 transition duration-150`;

export const DefaultButton = tw.button`flex items-center justify-center bg-white text-gray-700 border-1px hover:bg-gray-50 transition duration-150 border-gray-300 text-black py-12px px-48px rounded-30px`;

export const WhiteButton = tw.button`border-1px py-10px px-20px text-gray-700 border-gray-300 ease-in transition duration-150 hover:bg-gray-50 rounded-30px`;

export const ErrorButton = tw.button`text-white bg-error-600 rounded-30px py-12px px-16px ease-in transition duration-150 hover:bg-error-700`;
