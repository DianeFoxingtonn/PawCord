/**
 * @name PawCord
 * @version 1.2
 * @description Reimagines discord UI functionality. 
 * @author Diane Foxington
 * @authorid 317744975016230925
 * @source https://github.com/DianeFoxingtonn/PawCord/tree/main
 */
const fs = require('fs');
const path = require('path');

module.exports = class PawCord {
    constructor() {
        // Update
        this.pluginName = "PawCord";
        this.pluginFile = "PawCord.plugin.js";
        this.pluginPath = path.join(BdApi.Plugins.folder, this.pluginFile);
        this.updaterFile = "PawCordUpdater.plugin.js";
        this.updaterPath = path.join(BdApi.Plugins.folder, this.updaterFile);
        this.rawGithubUrl = "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/main/PawCord.plugin.js";
        this.rawUpdaterUrl = "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/main/PawCordUpdater.plugin.js";
        this.localVersion = null;
        this.remoteVersion = null;

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

        // Settings
        this.settings = {
            settingOne: true,
            settingTwo: false
        };
    }

    
    getSettingsPanel() {
        // Create the settings UI (a simple form with checkboxes for example)
        const settingsPanel = document.createElement('div');

        settingsPanel.innerHTML = `
            <h3>Example Plugin Settings</h3>
            <label>
                <input type="checkbox" id="settingOne" ${this.settings.settingOne ? 'checked' : ''}>
                Enable Setting One
            </label>
            <br>
            <label>
                <input type="checkbox" id="settingTwo" ${this.settings.settingTwo ? 'checked' : ''}>
                Enable Setting Two
            </label>
        `;

        // Event listeners to handle changes in settings
        settingsPanel.querySelector('#settingOne').addEventListener('change', (e) => {
            this.settings.settingOne = e.target.checked;
            console.log(`Setting One: ${this.settings.settingOne}`);
        });

        settingsPanel.querySelector('#settingTwo').addEventListener('change', (e) => {
            this.settings.settingTwo = e.target.checked;
            console.log(`Setting Two: ${this.settings.settingTwo}`);
        });

        return settingsPanel;
    }

    injectSettingsButton() {
        // Add a settings button to the plugin context menu
        const pluginList = document.querySelector('.plugin-list'); // Assuming the plugin list exists
        if (pluginList) {
            const settingsButton = document.createElement('button');
            settingsButton.textContent = '⚙️'; // This is the gear icon
            settingsButton.className = 'settings-button';
            settingsButton.addEventListener('click', () => this.onSettingsButtonClick());
            
            // Add the button next to your plugin in the list
            pluginList.appendChild(settingsButton);
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

//Update functions below here 
//[DO NOT TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING!!!!!]
//
//
//
//
//


async checkForUpdates() {
    try {
        this.localVersion = this.getLocalVersion();
        this.remoteVersion = await this.getRemoteVersion();

        if (!this.localVersion || !this.remoteVersion) {
            console.warn(`[${this.pluginName}] Could not retrieve version info.`);
            return;
        }

        if (this.isNewerVersion(this.remoteVersion, this.localVersion)) {
            console.log(`[${this.pluginName}] Update available: ${this.localVersion} → ${this.remoteVersion}`);
            await this.spawnUpdater();
        } else {
            console.log(`[${this.pluginName}] Already up-to-date.`);
            this.cleanupUpdater();
        }
    } catch (error) {
        console.error(`[${this.pluginName}] Update check failed:`, error);
    }
}

getLocalVersion() {
    try {
        if (!fs.existsSync(this.pluginPath)) return null;
        const content = fs.readFileSync(this.pluginPath, "utf8");
        const match = content.match(/@version\s+([\d.]+)/);
        return match ? match[1] : null;
    } catch (error) {
        console.error(`[${this.pluginName}] Error reading local version:`, error);
        return null;
    }
}

async getRemoteVersion() {
    try {
        const response = await BdApi.Net.fetch(this.rawGithubUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const text = await response.text();
        const match = text.match(/@version\s+([\d.]+)/);
        return match ? match[1] : null;
    } catch (error) {
        console.error(`[${this.pluginName}] Failed to fetch remote version:`, error);
        return null;
    }
}

isNewerVersion(remote, local) {
    const parseVersion = (v) => v.split(".").map(Number);
    const [rMajor, rMinor, rPatch] = parseVersion(remote);
    const [lMajor, lMinor, lPatch] = parseVersion(local);

    return (
        rMajor > lMajor ||
        (rMajor === lMajor && rMinor > lMinor) ||
        (rMajor === lMajor && rMinor === lMinor && rPatch > lPatch)
    );
}

async spawnUpdater() {
    try {
        console.log(`[${this.pluginName}] Downloading Updater Plugin...`);
        const response = await BdApi.Net.fetch(this.rawUpdaterUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const updaterCode = await response.text();
        fs.writeFileSync(this.updaterPath, updaterCode);
        console.log(`[${this.pluginName}] Updater Plugin saved.`);

        // Wait until BetterDiscord recognizes the new plugin
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Force-enable the updater plugin
        if (fs.existsSync(this.updaterPath)) {
            console.log(`[${this.pluginName}] Enabling Updater Plugin...`);
            BdApi.Plugins.enable("PawCordUpdater");
        } else {
            console.warn(`[${this.pluginName}] Updater file missing, could not enable it.`);
        }
    } catch (error) {
        console.error(`[${this.pluginName}] Failed to spawn updater:`, error);
    }
}

cleanupUpdater() {
    if (fs.existsSync(this.updaterPath)) {
        console.log(`[${this.pluginName}] Cleaning up old updater.`);
        fs.unlinkSync(this.updaterPath);
    }
}


/* ------------------- START func. HERE ------------------ */
start() {
    console.log("[PawCord] Started!");
    this.injectSettingsButton();

    // Start individual plugin functionalities
    this.startOpeningIntroPlugin();
    this.startDmSlidingPart();
    this.startHiddenServerList();

    // Auto-update
    this.checkForUpdates().then(() => {
        console.log(`[${this.pluginName}] Update check completed.`);
    });

}



// ------------------------- STOP func. BENEATH THIS --------------------------
    stop() {

        console.log("[PawCord] Stopped!");
        // Stop each individual plugin functionality


// 1 
        // Remove Click Event Listener
        document.removeEventListener("click", this.handleClick.bind(this));

        // Remove injected CSS
        BdApi.clearCSS("animator-css");
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
    // 3
    // Clean up if needed (remove settings button, close settings modal)
    const settingsButton = document.querySelector('.settings-button');
    if (settingsButton) settingsButton.remove();

    const modal = document.querySelector('.plugin-settings-modal');
    if (modal) modal.remove();
    // 4


    // LAST
    this.cleanup();
    }

};
