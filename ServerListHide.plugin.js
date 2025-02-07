/**
 * @name Hidden Server List
 * @version 1.8
 * @description Fixes server list not re-hiding after being shown.
 * @author Diane Foxington
 */

module.exports = class HiddenServerList {
    constructor() {
        this.serverListSelector = "[class*=guilds]"; // Auto-detect server list
        this.appContainerSelector = "[class*=appMount]"; // Main Discord UI
        this.hoverZone = null;
        this.hideTimeout = null;
        this.observer = null;
    }

    start() {
        console.log("[Hidden Server List] Started!");

        // Inject CSS for smooth animations & UI expansion
        BdApi.injectCSS("hidden-server-css", `
            @keyframes slideIn {
                0% { transform: translateX(-100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(-100%); opacity: 0; }
            }
            .server-list-hidden {
                transform: translateX(-100%);
                opacity: 0;
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
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
        const serverList = document.querySelector(this.serverListSelector);
        const appContainer = document.querySelector(this.appContainerSelector);
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

    /** Ensures the hover zone is ALWAYS in the correct position */
    createHoverZone() {
        if (this.hoverZone) this.hoverZone.remove();

        const serverList = document.querySelector(this.serverListSelector);
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

    /** Watches for UI changes and repositions the hover zone dynamically */
    observeUIChanges() {
        if (this.observer) this.observer.disconnect();

        this.observer = new MutationObserver(() => {
            console.log("[Hidden Server List] UI change detected, repositioning hover zone.");
            this.createHoverZone();
        });

        const appMount = document.querySelector(this.appContainerSelector);
        if (appMount) {
            this.observer.observe(appMount, { childList: true, subtree: true });
        }
    }

    /** Shows the server list and removes hover zone */
    showServerList() {
        const serverList = document.querySelector(this.serverListSelector);
        const appContainer = document.querySelector(this.appContainerSelector);
        if (!serverList || !appContainer) return;

        serverList.classList.remove("server-list-hidden");
        serverList.classList.add("server-list-visible");
        appContainer.classList.remove("discord-expanded");

        // Remove the hover zone to allow interaction
        if (this.hoverZone) this.hoverZone.remove();

        // Ensure re-hiding still works
        this.enableReHiding();
    }

    /** Hides the server list and re-creates the hover zone */
    hideServerList() {
        const serverList = document.querySelector(this.serverListSelector);
        const appContainer = document.querySelector(this.appContainerSelector);
        if (!serverList || !appContainer) return;

        serverList.classList.remove("server-list-visible");
        serverList.classList.add("server-list-hidden");
        appContainer.classList.add("discord-expanded");

        console.log("[Hidden Server List] Server list hidden, recreating hover zone.");
        this.createHoverZone();
    }

    /** Ensures the server list will re-hide properly */
    enableReHiding() {
        document.addEventListener("mousemove", (event) => {
            const serverList = document.querySelector(this.serverListSelector);
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

    /** Checks if cursor is still over the server list */
    isCursorStillOverServerList(event) {
        const serverList = document.querySelector(this.serverListSelector);
        if (!serverList) return false;

        const rect = serverList.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right &&
               event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    stop() {
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
    }
};
