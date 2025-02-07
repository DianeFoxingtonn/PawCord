/**
 * @name PawCord
 * @version 3.6.2
 * @description For all your criminal aesthetic needs!
 * @author Diane Foxington
 */

const MODULES = {
    introSequence: "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/refs/heads/main/IntroSequence.plugin.js",
    hiddenServerList: "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/refs/heads/main/ServerListHide.plugin.js",
    dmSlidingAnimation: "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/refs/heads/main/DmSlidingPart.plugin.js"
};

class PawCord {
    constructor() {
        this.config = this.loadConfig();
        this.modules = {};
    }

    async start() {
        console.log("[PawCord] Starting plugin...");
        await this.loadModules();
        this.startModules();
    }

    async loadModules() {
        for (const [key, url] of Object.entries(MODULES)) {
            if (this.config[key]) {
                console.log(`[PawCord] Loading ${key} from ${url}`);
                await this.loadScript(url, key);
            }
        }
    }

    async loadScript(url, moduleName) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            const scriptText = await response.text();
            
            console.log(`[PawCord] Executing ${moduleName}...`);
            
            (function() {
                try {
                    const moduleObject = {};
                    (new Function('module', scriptText))(moduleObject);
                    if (moduleObject.exports) {
                        window[moduleName] = moduleObject.exports;
                    }
                } catch (error) {
                    console.error(`[PawCord] Error executing ${moduleName}:`, error);
                }
            })();
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Allow time for script execution
            console.log(moduleName);
            console.log(url);
            if (typeof window[moduleName] !== "undefined" && typeof window[moduleName].start()=== "function") {
                console.log(`[PawCord] Successfully loaded ${moduleName}, starting it now...`);
                window[moduleName].start();
                this.modules[moduleName] = window[moduleName];
            } else {
                console.error(`[PawCord] ${moduleName} did not define a valid start() method.`);
            }
        } catch (error) {
            console.error(`[PawCord] Error loading ${moduleName}:`, error);
        }
    }

    startModules() {
        for (const [key, module] of Object.entries(this.modules)) {
            if (module && typeof module.start === "function") {
                console.log(`[PawCord] Manually starting ${key}...`);
                module.start();
            } else {
                console.error(`[PawCord] ${key} does not have a valid start() method.`);
            }
        }
    }

    stop() {
        for (const [key, module] of Object.entries(this.modules)) {
            if (module && typeof module.stop === "function") {
                console.log(`[PawCord] Stopping ${key}...`);
                module.stop();
            }
        }
        console.log("[PawCord] Plugin fully stopped.");
    }

    loadConfig() {
        const defaultConfig = {
            introSequence: true,
            hiddenServerList: true,
            dmSlidingAnimation: true
        };
        return BdApi.Data.load("PawCord", "config") || defaultConfig;
    }

    saveConfig(newConfig) {
        BdApi.Data.save("PawCord", "config", newConfig);
        this.config = newConfig;
    }
}

module.exports = PawCord;
