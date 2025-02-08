/**
 * @name PawCord
 * @version 1.0
 * @description Reimagines discord UI functionality. 
 * Features:
 * Hidden server list (open it by hovering over where it should appear)
 * Chat box animations (triggers on click of DM)
 * Intro Sequence (mostly watermark but also a neat startup feature to hide slow loading)
 * @author Diane Foxington
 */

module.exports = class PawCord {
    constructor() {

         // Updt
        this.pluginVersion = "1.0";  // Current version of the combined plugin
        this.latestVersion = null;  // Placeholder for latest version from an update check

        // 2
        this.logoURL = "https://i.imgur.com/6LQb3ZJ.png"; // Custom Paw Cord logo
        this.debugMode = true; // Debug mode enabled
        this.overrideInterval = null; // Forces UI above intro


        // 3
        this.serverListSelector = "[class*=guilds]"; // Auto-detect server list
        this.appContainerSelector = "[class*=appMount]"; // Main Discord UI
        this.hoverZone = null;
        this.hideTimeout = null;
        this.observer = null;
    }

    start() {
        console.log("[PawCord] Started!");

        this.checkForUpdates();  // Check for updates when the plugin starts

        // Start individual plugin functionalities
        this.startOpeningIntroPlugin();
        this.startDmSlidingPart();
        this.startHiddenServerList();
    }

    // Check for plugin updates
    checkForUpdates() {
        console.log("[Combined Plugins] Checking for updates...");

        // Mockup: Replace this with actual version checking logic (e.g., API call)
        this.latestVersion = "1.1";  // This should come from a version tracking server or service

        if (this.pluginVersion !== this.latestVersion) {
            this.promptForUpdate();
        }
    }

    // Prompt the user to update
    promptForUpdate() {
        const updateMessage = `A newer version (${this.latestVersion}) of the plugin is available. Would you like to update?`;
        if (window.confirm(updateMessage)) {
            console.log("[Combined Plugins] User wants to update.");
            // You can redirect the user to download the latest version here or prompt them for action
            window.open('https://your-update-link.com', '_blank');
        } else {
            console.log("[Combined Plugins] User chose not to update.");
        }
    }

    // Start the DM Sliding Part functionality
    startDmSlidingPart() {
        console.log("[AnimatorPlugin] Started!");

        // Inject Custom CSS Keyframe Animation
        BdApi.injectCSS("animator-css", `
            @keyframes slideInFromRightOnLoad {
                0% {
                    transform: perspective(500px) translateZ(-200px) translateX(100%);
                }
                50% {
                    transform: perspective(500px) translateZ(-200px) translateX(0);
                }
                70% {
                    transform: perspective(500px) translateZ(-100px);
                }
                100% {
                    transform: translateX(0);
                }
            }
            .animated-slideIn {
                animation: slideInFromRightOnLoad 0.8s ease-in-out !important;
                will-change: transform;
            }
        `);

        // Add Click Event Listener
        document.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(event) {
        // Select the sidebar list
        const sidebar = document.querySelector("nav .scrollerBase__99f8c ul");

        if (!sidebar) {
            console.warn("[AnimatorPlugin] Sidebar not found!");
            return;
        }

        // Check if the clicked element is an <li> inside the sidebar
        const clickedLi = event.target.closest("li");
        if (!clickedLi || !sidebar.contains(clickedLi)) return;

        console.log("[AnimatorPlugin] Sidebar button clicked!", clickedLi);

        // Select the chat panel dynamically
        const chatPanel = document.querySelector("[class*=chat]");
        if (!chatPanel) {
            console.warn("[AnimatorPlugin] Chat panel not found!");
            return;
        }

        console.log("[AnimatorPlugin] Applying animation to:", chatPanel);

        // Remove and re-add the class to force animation replay
        chatPanel.classList.remove("animated-slideIn");
        void chatPanel.offsetWidth; // Force reflow (fixes animation replay issues)
        chatPanel.classList.add("animated-slideIn");
    }

// Start the Opening Intro Plugin functionality
startOpeningIntroPlugin() {
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

    // Start the Hidden Server List functionality
    startHiddenServerList() {
        console.log("[Hidden Server List] Started!");

        BdApi.injectCSS("hidden-server-css", `
            @keyframes slideIn {
                0% { transform: translateX(-100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            .server-list-hidden {
                transform: translateX(-100%);
                opacity: 0;
                pointer-events: none;
            }
            .server-list-visible {
                animation: slideIn 0.3s ease-in-out;
                transform: translateX(0);
                opacity: 1;
                pointer-events: auto;
            }
            .discord-expanded {
                margin-left: -80px !important;
                width: calc(100% + 80px) !important;
                transition: all 0.3s ease-in-out;
            }
        `);

        setTimeout(() => this.setupServerList(), 500);
    }

    setupServerList() {
        const serverList = document.querySelector("[class*=guilds]");
        const appContainer = document.querySelector("[class*=appMount]");
        if (!serverList || !appContainer) {
            console.warn("[Hidden Server List] Server list or main UI container not found!");
            return;
        }

        console.log("[Hidden Server List] Server list detected, hiding it by default.");

        // Hide the server list and expand the Discord UI
        serverList.classList.add("server-list-hidden");
        appContainer.classList.add("discord-expanded");

        // Ensure the hover zone is created
        this.createHoverZone();

        // Watch for UI changes and adjust hover zone
        this.observeUIChanges();

        // Listen for mouse movements to trigger hiding
        document.addEventListener("mousemove", (event) => {
            if (!serverList.classList.contains("server-list-visible")) return;

            const rect = serverList.getBoundingClientRect();
            const cursorInsideServerList =
                event.clientX >= rect.left && event.clientX <= rect.right &&
                event.clientY >= rect.top && event.clientY <= rect.bottom;

            if (!cursorInsideServerList) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = setTimeout(() => {
                    if (!this.isCursorStillOverServerList(event)) {
                        console.log("[Hidden Server List] Cursor left, hiding server list.");
                        this.hideServerList();
                    }
                }, 1000);
            }
        });
    }

    createHoverZone() {
        if (this.hoverZone) this.hoverZone.remove();

        const serverList = document.querySelector("[class*=guilds]");
        if (!serverList) return;

        const rect = serverList.getBoundingClientRect();

        this.hoverZone = document.createElement("div");
        this.hoverZone.id = "serverHoverZone";
        this.hoverZone.style.position = "fixed";
        this.hoverZone.style.left = "0";
        this.hoverZone.style.top = "0";
        this.hoverZone.style.width = `${rect.width}px`;
        this.hoverZone.style.height = "100vh";
        this.hoverZone.style.zIndex = "9999";
        this.hoverZone.style.background = "transparent";
        this.hoverZone.style.cursor = "pointer";

        document.body.appendChild(this.hoverZone);

        this.hoverZone.addEventListener("mouseenter", () => {
            console.log("[Hidden Server List] Hover detected. Showing server list.");
            clearTimeout(this.hideTimeout);
            this.showServerList();
        });
    }

    observeUIChanges() {
        if (this.observer) this.observer.disconnect();

        this.observer = new MutationObserver(() => {
            console.log("[Hidden Server List] UI change detected, repositioning hover zone.");
            this.createHoverZone();
        });

        const appMount = document.querySelector("[class*=appMount]");
        if (appMount) {
            this.observer.observe(appMount, { childList: true, subtree: true });
        }
    }

    showServerList() {
        const serverList = document.querySelector("[class*=guilds]");
        const appContainer = document.querySelector("[class*=appMount]");
        if (!serverList || !appContainer) return;

        serverList.classList.remove("server-list-hidden");
        serverList.classList.add("server-list-visible");
        appContainer.classList.remove("discord-expanded");

        // Remove the hover zone to allow interaction
        if (this.hoverZone) this.hoverZone.remove();
    }

    hideServerList() {
        const serverList = document.querySelector("[class*=guilds]");
        const appContainer = document.querySelector("[class*=appMount]");
        if (!serverList || !appContainer) return;

        serverList.classList.remove("server-list-visible");
        serverList.classList.add("server-list-hidden");
        appContainer.classList.add("discord-expanded");

        console.log("[Hidden Server List] Server list hidden, recreating hover zone.");
        this.createHoverZone();
    }

    isCursorStillOverServerList(event) {
        const serverList = document.querySelector("[class*=guilds]");
        if (!serverList) return false;

        const rect = serverList.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right &&
               event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    stop() {
        console.log("[PawCord] Stopped!");
        // Stop each individual plugin functionality
// 1 
        // Remove Click Event Listener
        document.removeEventListener("click", this.handleClick.bind(this));

        // Remove injected CSS
        BdApi.clearCSS("animator-css");
//
// *******************************************
// 2
console.log("[Hidden Server List] Stopped!");

        document.removeEventListener("mousemove", this.hideServerList);
        BdApi.clearCSS("hidden-server-css");

        const serverList = document.querySelector(this.serverListSelector);
        const appContainer = document.querySelector(this.appContainerSelector);
        if (serverList) {
            serverList.classList.remove("server-list-hidden", "server-list-visible");
        }
        if (appContainer) {
            appContainer.classList.remove("discord-expanded");
        }

        if (this.hoverZone) this.hoverZone.remove();
        if (this.observer) this.observer.disconnect();
    
//****************************************************
    // 3
    this.cleanup();
    }

};
