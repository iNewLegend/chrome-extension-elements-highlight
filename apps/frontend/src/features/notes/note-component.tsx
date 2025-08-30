import type { Note } from "../../types";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useHighlightStore } from "../../stores/highlight-store";
import { useNotesStore } from "../../stores/notes-store";

interface NoteComponentProps {
    note : Note;
    container : HTMLElement | null;
    setSelectedElement : ( element : Element | null ) => void;
    onNoteDismissed : () => void;
}

export function NoteComponent ( {
    note,
    container,
    setSelectedElement,
    onNoteDismissed,
} : NoteComponentProps ) {
    const { deleteNote, setNoteEditing } = useNotesStore();
    const { addHighlight, removeHighlight } = useHighlightStore();

    const handleOpenChange = ( open : boolean ) => {
        console.log( "[Debug] Dialog onOpenChange", {
            open,
            noteId: note.id,
            currentIsEditing: note.isEditing,
        } );

        if ( !open ) {
            console.log( "[Debug] Dialog closing" );
            const element = note.highlightedElement;
            if ( element ) {
                removeHighlight( element );
                setSelectedElement( null );
            }
            setNoteEditing( note.id, false );
            // Call onNoteDismissed after a short delay to ensure state updates have completed
            requestAnimationFrame( () => {
                console.log( "[Debug] Calling onNoteDismissed" );
                onNoteDismissed();
            } );
        } else {
            console.log( "[Debug] Dialog opening" );
            if ( note.highlightedElement ) {
                addHighlight( note.highlightedElement );
                setSelectedElement( note.highlightedElement );

                // Store current scroll position
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                // Use requestAnimationFrame to restore scroll position after the dialog renders
                requestAnimationFrame( () => {
                    window.scrollTo( scrollX, scrollY );
                } );
            }
        }
    };

    return (
        <div>
            <div
                className="note-marker"
                style={{
                    left: `${ note.x ?? 0 }px`,
                    top: `${ note.y ?? 0 }px`,
                    zIndex: 2147483647,
                }}
                onClick={() => {
                    console.log( "[Debug] Note marker clicked", {
                        note,
                        element: note.highlightedElement,
                    } );
                    const element = note.highlightedElement;
                    if ( element ) {
                        setSelectedElement( element );
                        addHighlight( element );
                    }
                    console.log( "[Debug] Before setNoteEditing", {
                        noteId: note.id,
                        currentIsEditing: note.isEditing,
                    } );
                    handleOpenChange( true );
                    setNoteEditing( note.id, true );
                    console.log( "[Debug] After setNoteEditing" );
                }}
            />
            <Dialog open={note.isEditing} onOpenChange={handleOpenChange}>
                <DialogContent
                    {...( container ? { container } : {} )}
                    className="note-content"
                    style={{
                        position: "absolute",
                        left: `${ note.x }px`,
                        top: `${ note.y }px`,
                        transform: "none",
                        zIndex: 2147483647,
                    }}
                    onPointerDownOutside={( e ) => {
                        console.log( "[Debug] Dialog pointer down outside" );
                        // Prevent scrolling when clicking outside the dialog
                        e.preventDefault();
                        handleOpenChange( false );
                    }}
                    onInteractOutside={( e ) => {
                        console.log( "[Debug] Dialog interact outside" );
                        // Prevent any interaction outside the dialog from affecting scroll
                        e.preventDefault();
                    }}
                >
                    <DialogTitle className="sr-only">Add Note</DialogTitle>
                    <DialogDescription className="sr-only">
                        Add or edit your note for the selected element. Use the textarea below to
                        write your note, then click Save to confirm or Delete to remove the note.
                    </DialogDescription>
                    <textarea
                        className="w-full min-h-[100px] p-2 border border-border rounded resize-y font-sans"
                        defaultValue={note.content}
                        placeholder="Enter your note..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                console.log( "[Debug] Delete button clicked" );
                                const element = note.highlightedElement;
                                if ( element ) {
                                    removeHighlight( element );
                                    setSelectedElement( null );
                                }
                                deleteNote( note.id );
                                handleOpenChange( false ); // Explicitly trigger close
                                onNoteDismissed();
                            }}
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={() => {
                                console.log( "[Debug] Save button clicked" );
                                handleOpenChange( false ); // Explicitly trigger close
                                setNoteEditing( note.id, false );
                                onNoteDismissed();
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
