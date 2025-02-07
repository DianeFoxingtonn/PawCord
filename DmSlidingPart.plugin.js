    start() {
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

    stop() {
        console.log("[AnimatorPlugin] Stopped!");

        // Remove Click Event Listener
        document.removeEventListener("click", this.handleClick.bind(this));

        // Remove injected CSS
        BdApi.clearCSS("animator-css");
    }
