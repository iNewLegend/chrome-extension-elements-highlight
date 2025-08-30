import React, { useEffect, useCallback, useState, useRef } from "react";
import { useNotesStore } from "../../stores/notes-store";
import { NoteComponent } from "../../features/notes/note-component";
import { useInspectorMode } from "../../hooks/use-inspector-mode";
import { ThemeProvider } from "../theme/theme-provider";
import { useModeStore, AppMode } from "../../stores/use-mode-store";
import { useHighlightStore } from "../../stores/highlight-store";
import { InteractionBlocker } from "../../components/interaction-blocker";

export const ShadowDOM : React.FC = () => {
    const { notes, createNote } = useNotesStore();
    const {
        hoveredElement,
        setHoveredElement,
        setSelectedElement,
        selectElement,
        dismiss,
        isActive,
    } = useInspectorMode();
    const [ isProcessingNoteDismissal, setIsProcessingNoteDismissal ] = useState( false );
    const [ , setLocalSelectedElement ] = useState<HTMLElement | null>( null );
    const notesContainerRef = useRef<HTMLDivElement>( null );

    // Handle note element selection
    useEffect( () => {
        const handleElementSelected = ( ( e : CustomEvent ) => {
            const element = e.detail.element;
            if ( element instanceof HTMLElement ) {
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                setLocalSelectedElement( element );

                // Update store states for note mode
                useModeStore.getState().addMode( AppMode.NOTES_MODE );
                useHighlightStore.getState().setSelectedElement( element );

                ( window as any ).updateOverlay( element );

                requestAnimationFrame( () => {
                    window.scrollTo( scrollX, scrollY );
                } );
            }
        } ) as EventListener;

        window.addEventListener( "elements-highlight:element-selected", handleElementSelected );

        return () => {
            window.removeEventListener( "elements-highlight:element-selected", handleElementSelected );
        };
    }, [] );

    const handleClick = useCallback(
        ( e : MouseEvent ) => {
            console.log( "Click event in shadow-dom.tsx", {
                e,
                target: e.target,
                currentTarget: e.currentTarget,
                hoveredElement,
                isActive,
                isInteractionBlocker: ( e.target as Element ).id === "elements-highlight-interaction-blocker",
                isProcessingNoteDismissal,
            } );

            // If we're processing a note dismissal, ignore the click
            if ( isProcessingNoteDismissal ) {
                e.preventDefault();
                e.stopPropagation();
                console.log( "Ignoring click during note dismissal processing" );
                return;
            }

            if ( !isActive || !hoveredElement ) {
                console.log( "Not in inspector mode or no hovered element" );
                return;
            }

            // Always prevent default behavior and stop propagation in inspector mode
            e.preventDefault();
            e.stopPropagation();

            // Check if we clicked on the interaction blocker or a plugin element
            const target = e.target as Element;
            const isInteractionBlocker = target.id === "elements-highlight-interaction-blocker";
            const isPluginElement = target.closest( ".notes-plugin" );

            // If we clicked on a plugin element (but not the interaction blocker), don't create a note
            if ( isPluginElement && !isInteractionBlocker ) {
                console.log( "Clicked on plugin element, not creating note" );
                return;
            }

            console.log( "Creating note for element", hoveredElement );

            // Store current scroll position
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            // Create the note if we're in inspector mode and have a hovered element
            createNote( hoveredElement );
            setHoveredElement( null );

            // Use our new selectElementForNote helper function
            if ( hoveredElement instanceof HTMLElement ) {
                selectElement( hoveredElement );
            }

            // Use requestAnimationFrame to restore scroll position after the note is created
            requestAnimationFrame( () => {
                window.scrollTo( scrollX, scrollY );
            } );
        },
        [
            isActive,
            hoveredElement,
            setHoveredElement,
            createNote,
            selectElement,
            isProcessingNoteDismissal,
        ]
    );

    useEffect( () => {
        if ( isActive ) {
            document.addEventListener( "click", handleClick, { capture: true } );
            return () => document.removeEventListener( "click", handleClick, { capture: true } );
        }
    }, [ isActive, handleClick ] );

    // Function to handle note dismissal
    const handleNoteDismissed = useCallback( () => {
        // Set a flag to prevent immediate click handling
        setIsProcessingNoteDismissal( true );

        // Use our new dismissNote helper function
        dismiss();

        // Reset the flag after a short delay to allow the DOM to update
        setTimeout( () => {
            setIsProcessingNoteDismissal( false );
        }, 100 );
    }, [ dismiss ] );

    return (
        <ThemeProvider>
            <div ref={notesContainerRef} className="notes-plugin">
                <InteractionBlocker isVisible={isActive} />
                {notes.map( ( note ) => (
                    <NoteComponent
                        key={note.id}
                        note={note}
                        container={notesContainerRef.current!.parentElement}
                        setSelectedElement={setSelectedElement}
                        onNoteDismissed={handleNoteDismissed}
                    />
                ) )}
            </div>
        </ThemeProvider>
    );
};
