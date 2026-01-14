// ==UserScript==
// @name         Microsoft Loop Outline Navigator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Create outline for Microsoft Loop pages, supports Heading and Toggle
// @author       You
// @match        https://loop.microsoft.com/*
// @match        https://loop.cloud.microsoft/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    GM_addStyle(`
        #loop-outline-container {
            position: fixed;
            top: 60px;
            right: 20px;
            width: 320px;
            max-height: 80vh;
            background: #1f1f1f;
            border: 1px solid #333;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 999999;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
            display: none;
        }

        #loop-outline-header {
            background: linear-gradient(135deg, #0078d4, #106ebe);
            color: white;
            padding: 14px 16px;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #loop-outline-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .loop-outline-count {
            font-size: 11px;
            background: rgba(255,255,255,0.25);
            padding: 3px 10px;
            border-radius: 12px;
        }

        #loop-outline-actions {
            display: flex;
            gap: 4px;
        }

        #loop-outline-actions button {
            background: rgba(255,255,255,0.15);
            border: none;
            color: white;
            font-size: 14px;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 6px;
            transition: background 0.2s;
        }

        #loop-outline-actions button:hover {
            background: rgba(255,255,255,0.3);
        }

        #loop-outline-list {
            max-height: calc(80vh - 54px);
            overflow-y: auto;
            padding: 8px 0;
        }

        #loop-outline-list::-webkit-scrollbar {
            width: 6px;
        }

        #loop-outline-list::-webkit-scrollbar-track {
            background: transparent;
        }

        #loop-outline-list::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 3px;
        }

        .loop-outline-item {
            padding: 10px 14px;
            cursor: pointer;
            font-size: 13px;
            color: #d0d0d0;
            border-left: 3px solid transparent;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .loop-outline-item:hover {
            background: #2a2a2a;
            border-left-color: #0078d4;
            color: #fff;
        }

        .loop-outline-item.active {
            background: #0078d422;
            border-left-color: #0078d4;
            color: #fff;
        }

        .loop-outline-icon {
            font-size: 14px;
            flex-shrink: 0;
            width: 20px;
            text-align: center;
        }

        .loop-outline-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .loop-outline-level {
            font-size: 9px;
            color: #888;
            background: #333;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
        }

        .loop-outline-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Indent based on level */
        .loop-outline-h1 { padding-left: 14px; }
        .loop-outline-h1 .loop-outline-text { font-weight: 600; }

        .loop-outline-h2 { padding-left: 28px; }
        .loop-outline-h3 { padding-left: 42px; }
        .loop-outline-h4 { padding-left: 56px; }

        #loop-outline-toggle {
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            padding: 6px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s ease;
            color: inherit;
            font-size: 16px;
            margin-right: 4px;
        }

        #loop-outline-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        #loop-outline-toggle.active {
            background: rgba(0, 120, 212, 0.3);
        }

        #loop-outline-empty {
            padding: 30px 20px;
            text-align: center;
            color: #666;
        }

        #loop-outline-empty-icon {
            font-size: 36px;
            margin-bottom: 12px;
        }

        #loop-outline-empty-text {
            font-size: 13px;
            line-height: 1.5;
        }

        @keyframes loop-highlight {
            0% { background-color: rgba(0, 120, 212, 0.5); }
            100% { background-color: transparent; }
        }

        .loop-heading-highlight {
            animation: loop-highlight 2s ease-out;
            border-radius: 4px;
        }

        /* Legend */
        #loop-outline-legend {
            display: flex;
            gap: 12px;
            padding: 8px 14px;
            background: #171717;
            border-top: 1px solid #333;
            font-size: 11px;
            color: #888;
        }

        .loop-legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
    `);

    // Function to insert button into toolbar
    function insertToggleButton(toolbarGroup, moreOptionsNode) {
        const toggleBtn = document.createElement("button");
        toggleBtn.id = "loop-outline-toggle";
        toggleBtn.type = "button";
        toggleBtn.innerHTML = "📑";
        toggleBtn.title = "Toggle Outline (Ctrl+Shift+O)";
        toggleBtn.setAttribute("aria-label", "Document Outline");

        toolbarGroup.insertBefore(toggleBtn, moreOptionsNode);
        toggleBtn.addEventListener("click", toggleOutline);
    }

    // Observe toolbar until it is ready, then insert toggle button
    function observeToolbarAndInsertButton() {
        const observer = new MutationObserver(() => {
            const toolbar = document.querySelector(".fui-Toolbar");
            if (!toolbar) return;

            const groups = toolbar.querySelectorAll(".fui-ToolbarGroup");
            if (!groups.length) return;

            const lastGroup = groups[groups.length - 1];

            // More options button (three dots)
            const moreOptions =
                lastGroup.querySelector('[aria-label*="More"]') ||
                lastGroup.querySelector(".___vmq7z50");

            if (!moreOptions) return;
            if (document.getElementById("loop-outline-toggle")) {
                observer.disconnect();
                return;
            }

            insertToggleButton(lastGroup, moreOptions);
            observer.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    observeToolbarAndInsertButton();

    // Create outline container
    const container = document.createElement("div");
    container.id = "loop-outline-container";
    container.innerHTML = `
        <div id="loop-outline-header">
            <div id="loop-outline-header-left">
                <span>📑 Outline</span>
                <span class="loop-outline-count">0</span>
            </div>
            <div id="loop-outline-actions">
                <button id="loop-outline-refresh" title="Refresh">🔄</button>
                <button id="loop-outline-close" title="Close">✕</button>
            </div>
        </div>
        <div id="loop-outline-list"></div>
        <div id="loop-outline-legend">
            <div class="loop-legend-item"><span>📄</span> Heading</div>
            <div class="loop-legend-item"><span>📁</span> Toggle</div>
        </div>
    `;
    document.body.appendChild(container);

    const outlineList = document.getElementById("loop-outline-list");
    const countSpan = container.querySelector(".loop-outline-count");
    let isVisible = false;
    let headings = [];

    // Function to find headings in Microsoft Loop
    function findHeadings() {
        // Find Loop content container (Canvas area only)
        const contentContainer = document.querySelectorAll(
            ".scriptor-pageContainer"
        )[1];

        if (!contentContainer) {
            console.log("Loop Outline: Canvas container not found");
            return [];
        }

        // Find all headings in content area
        const allElements = contentContainer.querySelectorAll(
            '.scriptor-paragraph[role="heading"][aria-level]'
        );

        const results = [];

        allElements.forEach((el) => {
            // Extract text from .scriptor-textRun
            const textRun = el.querySelector(
                ".scriptor-textRun.scriptor-inline"
            );
            const text = textRun ? textRun.textContent.trim() : "";

            if (!text) return; // Skip empty heading

            // Check if it's a Toggle
            const isToggle = el.classList.contains(
                "scriptor-collapsibleHeading"
            );

            // If it's a Toggle, check expanded status
            let isExpanded = true;
            if (isToggle) {
                const collapseBtn = el.querySelector(
                    ".scriptor-collapseButtonContainer"
                );
                isExpanded =
                    collapseBtn?.getAttribute("aria-expanded") === "true";
            }

            const level = parseInt(el.getAttribute("aria-level")) || 1;

            // Check if element is visible
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden")
                return;

            results.push({
                element: el,
                level: level,
                text: text,
                isToggle: isToggle,
                isExpanded: isExpanded,
            });
        });

        return results;
    }

    // Function to build outline
    function buildOutline() {
        headings = findHeadings();
        outlineList.innerHTML = "";
        countSpan.textContent = headings.length;

        if (headings.length === 0) {
            outlineList.innerHTML = `
                <div id="loop-outline-empty">
                    <div id="loop-outline-empty-icon">📝</div>
                    <div id="loop-outline-empty-text">
                        No headings found on this page<br>
                        <small style="color:#555">Try adding Heading 1-4 or Toggle</small>
                    </div>
                </div>
            `;
            return;
        }

        headings.forEach((heading, index) => {
            const item = document.createElement("div");
            item.className = `loop-outline-item loop-outline-h${heading.level}`;
            item.dataset.index = index;

            // Icon
            const icon = document.createElement("span");
            icon.className = "loop-outline-icon";
            if (heading.isToggle) {
                icon.textContent = heading.isExpanded ? "📂" : "📁";
                icon.title = heading.isExpanded ? "Expanded" : "Collapsed";
            } else {
                icon.textContent = "📄";
            }

            // Text
            const textSpan = document.createElement("span");
            textSpan.className = "loop-outline-text";
            textSpan.textContent = heading.text;
            textSpan.title = heading.text;

            // Meta (level badge)
            const meta = document.createElement("span");
            meta.className = "loop-outline-meta";

            const levelBadge = document.createElement("span");
            levelBadge.className = "loop-outline-level";
            levelBadge.textContent = `H${heading.level}`;
            meta.appendChild(levelBadge);

            item.appendChild(icon);
            item.appendChild(textSpan);
            item.appendChild(meta);

            item.addEventListener("click", () => {
                // Scroll to heading
                heading.element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                // Highlight effect
                heading.element.classList.add("loop-heading-highlight");
                setTimeout(() => {
                    heading.element.classList.remove("loop-heading-highlight");
                }, 2000);

                updateActiveItem(index);
            });

            outlineList.appendChild(item);
        });

        updateActiveOnScroll();
    }

    // Update active item
    function updateActiveItem(activeIndex) {
        document.querySelectorAll(".loop-outline-item").forEach((item, i) => {
            item.classList.toggle("active", i === activeIndex);
        });
    }

    // Update active on scroll
    function updateActiveOnScroll() {
        if (!isVisible || headings.length === 0) return;

        let activeIndex = 0;
        const offset = 150;

        for (let i = 0; i < headings.length; i++) {
            const rect = headings[i].element.getBoundingClientRect();
            if (rect.top <= offset) {
                activeIndex = i;
            }
        }

        updateActiveItem(activeIndex);
    }

    // Toggle visibility
    function toggleOutline() {
        isVisible = !isVisible;
        container.style.display = isVisible ? "block" : "none";

        // Update button state
        const toggleBtn = document.getElementById("loop-outline-toggle");
        if (toggleBtn) {
            toggleBtn.classList.toggle("active", isVisible);
        }

        if (isVisible) {
            buildOutline();
        }
    }

    // Event listeners
    document
        .getElementById("loop-outline-close")
        .addEventListener("click", toggleOutline);
    document
        .getElementById("loop-outline-refresh")
        .addEventListener("click", buildOutline);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isVisible) {
            toggleOutline();
        }
        if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "O") {
            e.preventDefault();
            toggleOutline();
        }
    });

    // Scroll listener
    let scrollTimeout;
    const handleScroll = () => {
        if (!isVisible) return;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveOnScroll, 100);
    };

    window.addEventListener("scroll", handleScroll, true);

    // MutationObserver - Detect only important changes
    let buildTimeout;
    let lastBuildTime = 0;
    const MIN_BUILD_INTERVAL = 2000;

    const observer = new MutationObserver((mutations) => {
        if (!isVisible) return;

        // Check if it's a heading-related change
        const isRelevant = mutations.some((m) => {
            // Skip mutations from outline container itself
            if (m.target.closest && m.target.closest("#loop-outline-container"))
                return false;
            if (m.target.closest && m.target.closest("#loop-outline-toggle"))
                return false;

            // Skip class changes (highlight, active, etc.)
            if (m.type === "attributes" && m.attributeName === "class") {
                const target = m.target;
                if (
                    target.classList &&
                    target.classList.contains("loop-heading-highlight")
                )
                    return false;
            }

            // Detect heading add/remove
            if (m.type === "childList") {
                const nodes = [...m.addedNodes, ...m.removedNodes];
                return nodes.some((n) => {
                    if (n.nodeType !== 1) return false;
                    return (
                        n.matches?.('[role="heading"]') ||
                        n.querySelector?.('[role="heading"]') ||
                        n.closest?.('[role="heading"]')
                    );
                });
            }

            // Detect aria-expanded change (toggle collapse/expand)
            if (
                m.type === "attributes" &&
                m.attributeName === "aria-expanded"
            ) {
                return true;
            }

            return false;
        });

        if (isRelevant) {
            const now = Date.now();
            if (now - lastBuildTime < MIN_BUILD_INTERVAL) return;

            clearTimeout(buildTimeout);
            buildTimeout = setTimeout(() => {
                lastBuildTime = Date.now();
                buildOutline();
            }, 500);
        }
    });

    // Wait for page to finish loading
    setTimeout(() => {
        const targetNode =
            document.querySelector(
                '.scriptor-pageContainer[aria-label="Canvas"]'
            ) || document.body;
        observer.observe(targetNode, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["aria-expanded", "aria-level", "role"],
        });
    }, 2000);
})();
