import React from "react";
import { createRoot } from "react-dom/client";
import { ShadowDOM } from "../shadow-dom/shadow-dom";
import { UserlandDOM } from "../userland-dom/userland-dom";
import shadowDOMStyles from "../shadow-dom/shadow-dom.css?inline";
import userlandDOMStyles from "../userland-dom/userland-dom.css?inline";

// Constants for DOM IDs
const DOM_IDS = {
    SHADOW_CONTAINER: "elements-highlight-shadow-dom",
    SHADOW_CONTENT: "elements-highlight-shadow-content",
    SHADOW_STYLES: "elements-highlight-shadow-dom-styles",
    USERLAND_CONTAINER: "elements-highlight-userland-dom",
    USERLAND_CONTENT: "elements-highlight-userland-content",
    USERLAND_STYLES: "elements-highlight-userland-dom-styles",
    ROOT_CONTAINER: "elements-highlight-root-container",
} as const;

function initializeDOMContainers () {
    const shadowContainer = document.createElement( "div" );
    shadowContainer.id = DOM_IDS.SHADOW_CONTAINER;

    const userlandContainer = document.createElement( "div" );
    userlandContainer.id = DOM_IDS.USERLAND_CONTAINER;

    return { shadowContainer, userlandContainer };
}

function initializeShadowDOM ( container : HTMLElement ) {
    const shadowRoot = container.attachShadow( { mode: "open" } );

    const shadowStyles = document.createElement( "style" );
    shadowStyles.id = DOM_IDS.SHADOW_STYLES;
    shadowStyles.textContent = shadowDOMStyles;
    shadowRoot.appendChild( shadowStyles );

    const contentContainer = document.createElement( "div" );
    contentContainer.id = DOM_IDS.SHADOW_CONTENT;
    shadowRoot.appendChild( contentContainer );

    return { shadowRoot, contentContainer };
}

function initializeUserlandDOM ( container : HTMLElement ) {
    // Create a shadow DOM for the userland container too - this is the key change
    const userlandShadowRoot = container.attachShadow( { mode: "open" } );

    // Add styles inside the shadow DOM
    const userlandStyles = document.createElement( "style" );
    userlandStyles.id = DOM_IDS.USERLAND_STYLES;
    userlandStyles.textContent = userlandDOMStyles;
    userlandShadowRoot.appendChild( userlandStyles );

    // Create content container inside the shadow DOM
    const contentContainer = document.createElement( "div" );
    contentContainer.id = DOM_IDS.USERLAND_CONTENT;
    userlandShadowRoot.appendChild( contentContainer );

    return { userlandShadowRoot, contentContainer };
}

function initializeApp () {
    // Check if already initialized
    if ( document.getElementById( DOM_IDS.ROOT_CONTAINER ) ) {
        return;
    }

    // Create root container
    const ElementsHighlightRootContainer = document.createElement( "div" );
    ElementsHighlightRootContainer.id = DOM_IDS.ROOT_CONTAINER;

    // Initialize containers
    const { shadowContainer, userlandContainer } = initializeDOMContainers();

    // Setup shadow DOM
    const { contentContainer: shadowContentContainer } = initializeShadowDOM( shadowContainer );

    // Setup userland DOM with its own shadow root for isolation
    const { contentContainer: userlandContentContainer } = initializeUserlandDOM( userlandContainer );

    // Add all containers to root
    ElementsHighlightRootContainer.appendChild( shadowContainer );
    ElementsHighlightRootContainer.appendChild( userlandContainer );

    // Append root container to body
    document.body.appendChild( ElementsHighlightRootContainer );

    // Render React components
    const root = createRoot( shadowContentContainer );
    const userlandRoot = createRoot( userlandContentContainer );

    root.render(
        <React.StrictMode>
            <ShadowDOM />
        </React.StrictMode>
    );

    userlandRoot.render(
        <React.StrictMode>
            <UserlandDOM />
        </React.StrictMode>
    );

    return { root, userlandRoot };
}

// Initialize the application
initializeApp();
