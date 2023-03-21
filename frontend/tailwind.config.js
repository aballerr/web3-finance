/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderWidth: {
        "1px": "1px",
        "1.5px": "1.5px",
        "2px": "2px",
        "4px": "4px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        rightToLeft: {
          "0%": { right: "-450px" },
          "100%": { right: "0px%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 200ms ease-in-out 1",
        fadeIn100: "fadeIn 100ms ease-in-out 1",
        rightToLeft: "rightToLeft 200ms ease-in-out 1",
      },
      colors: {
        error: {
          25: "#FFFBFA",
          50: "#FEF3F2",
          100: "#FEE4E2",
          300: "#FDA29B",
          400: "#F97066",
          500: "#F04438",
          600: "#D92D20",
          700: "#B42318",
        },
        blue: {
          50: "#EFF8FF",
          600: "#1570EF",
          700: "#175CD3",
        },
        blueLight: {
          100: "#E0F2FE",
          400: "#36BFFA",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F2F4F7",
          200: "#EAECF0",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1D2939",
          900: "#101828",
        },
        orange: {
          50: "#FFF4ED",
          700: "#B93815",
        },
        pink: {
          50: "#FDF2FA",
          100: "#FCE7F6",
          700: "#C11574",
        },
        purple: {
          50: "#F4F3FF",
          700: "#5925DC",
        },
        primary: {
          25: "#F9FFFC",
          50: "#D2F4E6",
          100: "#d2f4e6",
          200: "#bbeed9",
          300: "#a3e9cd",
          400: "#8ae2c1",
          500: "#6edcb5",
          600: "#4bd6a9",
          700: "#00cf9d",
          800: "#00a577",
        },
        success: {
          25: "#F6FEF9",
          50: "#ECFDF3",
          100: "#D1FADF",
          300: "#6CE9A6",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
        },
        teal: {
          50: "#F0FDF9",
          700: "#107569",
        },
        warning: {
          50: "#FFFAEB",
          100: "#FEF0C7",
        },
        gradient: "linear-gradient(45deg, #1D2939 0%, #475467 100%)",
        modal: "rgba(52, 64, 84, 0.7)",
        navbarIcon:
          "filter: invert(78%) sepia(12%) saturate(1756%) hue-rotate(107deg) brightness(93%) contrast(89%)",
      },
      borderRadius: {
        "4px": "4px",
        "6px": "6px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "30px": "30px",
      },
      boxShadow: {
        slideOut: "0px 24px 48px -12px rgba(16, 24, 40, 0.18)",
        heavy: "rgb(55 53 47 / 16%) 0px -1px inset",
        dropdown: "0px 24px 48px -12px rgba(16, 24, 40, 0.18)",
        md: "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
        lg: "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
      },
      inset: {
        "n-48px": "-48px",
        "50%": "50%",
      },
      fontFamily: {
        Normal: "Aeonik-Normal",
        Medium: "Aeonik-Medium",
      },
      fontSize: {
        "12px": "12px",
        "14px": "14px",
        "16px": "16px",
        "18px": "18px",
        "20px": "20px",
        "24px": "24px",
        "28px": "28px",
        "30px": "30px",
        "32px": "32px",
        "36px": "36px",
      },
      zIndex: {
        15: "15",
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      gap: {
        "4px": "4px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "20px": "20px",
      },
      letterSpacing: {
        "4px": "4px",
      },
      lineHeight: {
        "18px": "18px",
        "20px": "20px",
        "24px": "24px",
        "28px": "28px",
        "30px": "30px",
        "38px": "38px",
        "44px": "44px",
      },
      spacing: {
        "1px": "1px",
        "2px": "2px",
        "4px": "4px",
        "6px": "6px",
        "8px": "8px",
        "9px": "9px",
        "10px": "10px",
        "11px": "11px",
        "12px": "12px",
        "16px": "16px",
        "20px": "20px",
        "24px": "24px",
        "28px": "28px",
        "32px": "32px",
        "36px": "36px",
        "40px": "40px",
        "42px": "42px",
        "44px": "44px",
        "48px": "48px",
        "52px": "52px",
        "56px": "56px",
        "60px": "60px",
        "64px": "64px",
        "68px": "68px",
        "70px": "70px",
        "72px": "72px",
        "80px": "80px",
        "84px": "84px",
        "96px": "96px",
        "100px": "100px",
        "108px": "108px",
        "112px": "112px",
        "120px": "120px",
        "124px": "124px",
        "128px": "128px",
        "136px": "136px",
        "148px": "148px",
        "156px": "156px",
        "160px": "160px",
        "168px": "168px",
        "170px": "170px",
        "176px": "176px",
        "180px": "180px",
        "184px": "184px",
        "188px": "188px",
        "200px": "200px",
        "212px": "212px",
        "226px": "226px",
        "240px": "240px",
        "280px": "280px",
        "300px": "300px",
        "304px": "304px",
        "312px": "312px",
        "320px": "320px",
        "400px": "400px",
        "500px": "500px",
        "510px": "510px",
        "560px": "560px",
        "696px": "696px",
      },
    },
  },
  plugins: [],
};
