import { invoke } from "@tauri-apps/api/core";

/**
 * Dynamically queries the assets/fonts directory via Tauri commands,
 * downloads each font as base64, registers it via the CSS Font Loading API,
 * and sets the CSS custom properties on the root element.
 */
export async function loadFontsDynamically() {
  try {
    const fonts = await invoke<string[]>("list_assets_fonts");
    console.log("[Fonts] Discovered font assets:", fonts);

    for (const fontName of fonts) {
      const nameWithoutExt = fontName.replace(/\.[^/.]+$/, "");
      const parts = nameWithoutExt.split("-");
      const familyPart = parts[0];
      const variantPart = parts[1] || "Regular";

      let family = familyPart;
      if (familyPart === "DMSans") {
        family = "DM Sans";
      } else if (familyPart === "PlayfairDisplay") {
        family = "Playfair Display";
      } else {
        // Fallback: insert spaces before capital letters
        family = familyPart.replace(/([A-Z])/g, " $1").trim();
      }

      let weight = "400";
      let style = "normal";

      if (variantPart.includes("Bold")) {
        weight = variantPart.includes("Semi") ? "600" : "700";
      } else if (variantPart.includes("Medium")) {
        weight = "500";
      } else if (variantPart.includes("Light")) {
        weight = "300";
      } else if (variantPart.includes("Regular")) {
        weight = "400";
      }

      if (variantPart.includes("Italic")) {
        style = "italic";
      }

      console.log(`[Fonts] Loading dynamic font "${family}" (${weight}, ${style})...`);

      // Fetch base64 string from Rust backend
      const base64Content = await invoke<string>("read_font_file", { name: fontName });

      // Convert Base64 string to ArrayBuffer
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "font/ttf" });
      const fontUrl = URL.createObjectURL(blob);

      // Create and register FontFace
      const fontFace = new FontFace(family, `url(${fontUrl})`, {
        weight,
        style,
      });

      try {
        await fontFace.load();
        document.fonts.add(fontFace);
        console.log(`[Fonts] Registered: "${family}" (${weight}, ${style})`);
      } catch (loadErr) {
        console.error(`[Fonts] Failed to load FontFace for ${fontName}:`, loadErr);
      }
    }

    // Apply the custom fonts to CSS variables on :root
    document.documentElement.style.setProperty(
      "--font-sans",
      '"DM Sans", Inter, "Segoe UI", sans-serif'
    );
    document.documentElement.style.setProperty(
      "--font-display",
      '"Playfair Display", Georgia, serif'
    );
    console.log("[Fonts] Dynamic fonts initialized and CSS variables updated.");
  } catch (error) {
    console.error("[Fonts] Error dynamically loading fonts:", error);
  }
}
