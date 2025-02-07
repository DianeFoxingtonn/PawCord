/**
 * @name Opening Intro Plugin
 * @version 9.4
 * @description Forces UI to front, ensures smooth slide-in, and removes intro properly.
 * @author Diane Foxington
 */

module.exports = class OpeningIntroPlugin {
    constructor() {
        this.logoURL = "https://i.imgur.com/6LQb3ZJ.png"; // Custom Paw Cord logo
        this.debugMode = true; // Debug mode enabled
        this.overrideInterval = null; // Forces UI above intro
    }

    start() {
        console.log("[DEBUG] Opening Intro Plugin Started!");

        if (!this.debugMode && BdApi.Data.load("OpeningIntroPlugin", "introPlayed")) {
            console.log("[DEBUG] Intro already played, skipping.");
            return;
        }

        if (!this.debugMode) BdApi.Data.save("OpeningIntroPlugin", "introPlayed", true); // Save play status

        // Hide UI before intro starts
        this.hideUI();

        // Play intro
        setTimeout(() => {
            this.showIntro();
            this.forceUIOnTop();
        }, 500);
    }

    /** 🚀 Hides UI at the start */
    hideUI() {
        console.log("[DEBUG] Hiding UI...");

        BdApi.injectCSS("hide-ui", `
            #app-mount {
                opacity: 0;
            }
        `);
    }

    /** 🚀 Forces UI above intro until intro ends */
    forceUIOnTop() {
        console.log("[DEBUG] Forcing UI to the front every frame...");

        this.overrideInterval = setInterval(() => {
            const appMount = document.querySelector("#app-mount");
            if (appMount) {
                appMount.style.zIndex = "9999"; // Force UI above intro
                appMount.style.position = "relative";
            }
        }, 16); // Run every frame (~60FPS)
    }

    /** 🚀 Shows the intro with full animations */
    showIntro() {
        console.log("[DEBUG] Showing Intro...");

        const introScreen = document.createElement("div");
        introScreen.id = "pawcord-intro";
        introScreen.style.width = "100vw";
        introScreen.style.height = "100vh";
        introScreen.style.display = "flex";
        introScreen.style.justifyContent = "center";
        introScreen.style.alignItems = "center";
        introScreen.style.flexDirection = "column";
        introScreen.style.background = "black";
        introScreen.style.position = "fixed";
        introScreen.style.top = "0";
        introScreen.style.left = "0";
        introScreen.style.zIndex = "1"; // Keep intro in the background
        introScreen.style.transition = "opacity 1.5s ease-in-out";

        const logo = document.createElement("img");
        logo.src = this.logoURL;
        logo.style.width = "250px";
        logo.style.animation = "popIn 0.5s ease-out forwards, glowPulse 2.5s infinite alternate";

        const text = document.createElement("div");
        text.id = "pawcord-text";
        text.style.fontSize = "60px";
        text.style.color = "#ffc400";
        text.style.fontWeight = "1000";
        text.style.fontStyle = "italic";
        text.style.textTransform = "uppercase";
        text.style.textShadow = "4px 4px 10px rgba(50, 50, 50, 0.8)";
        text.style.fontFamily = '"Audiowide", "Orbitron", "Rajdhani", "Oxanium", sans-serif';
        text.style.whiteSpace = "nowrap";
        text.style.overflow = "hidden";
        text.style.borderRight = "3px solid #ffc400";
        text.style.paddingRight = "5px";

        introScreen.appendChild(logo);
        introScreen.appendChild(text);
        document.body.appendChild(introScreen);

        // Add animations
        BdApi.injectCSS("intro-animations", `
            @keyframes popIn {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes glowPulse {
                0% { filter: drop-shadow(0 0 10px #ffc400); }
                50% { filter: drop-shadow(0 0 40px #ffc400); }
                100% { filter: drop-shadow(0 0 10px #ffc400); }
            }
        `);

        console.log("[DEBUG] Intro Loaded!");
        // Start typing effect
        this.typingEffect(text, "PAW CORD", 150, () => {
            setTimeout(() => {
                this.slideUIIn();
            }, 2500);
        });
    }

    /** Creates a typing effect for the text */
    typingEffect(element, text, speed, callback) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }

    /** 🚀 Slides UI sections into the center */
    slideUIIn() {
        console.log("[DEBUG] Sliding UI into place...");

        BdApi.injectCSS("slide-ui-in", `
            #app-mount {
                opacity: 1 !important;
            }

            /* Slide chat panel (everything else) from the right */
            [class*=chat] {
                transform: translateX(100%);
                animation: slideInFromRight 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            /* Slide sidebar (server & friend list) from the left */
            nav .scrollerBase__99f8c ul {
                transform: translateX(-100%);
                animation: slideInFromLeft 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            @keyframes slideInFromRight {
                0% { transform: translateX(100%); }
                100% { transform: translateX(0); }
            }

            @keyframes slideInFromLeft {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
            }
        `);

        setTimeout(() => {
            this.cleanup();
        }, 4000);
    }

    cleanup() {
        console.log("[DEBUG] Cleaning Up Intro...");

        if (this.overrideInterval) {
            clearInterval(this.overrideInterval);
            this.overrideInterval = null;
        }

        const introScreen = document.getElementById("pawcord-intro");
        if (introScreen) {
            introScreen.style.opacity = "1";
            setTimeout(() => introScreen.remove(), 4500);
        }

        BdApi.clearCSS("hide-ui");
        BdApi.clearCSS("intro-animations");
        BdApi.clearCSS("slide-ui-in");

        console.log("[DEBUG] Cleanup Complete!");
    }

    stop() {
        console.log("[DEBUG] Plugin Stopped.");
        this.cleanup();
    }
};
