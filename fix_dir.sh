sed -i '/document.documentElement.classList.add(`accent-${accentColor}`);/a \
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";' src/context/AppContext.tsx
