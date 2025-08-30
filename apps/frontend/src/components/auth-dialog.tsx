import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useAuthStore } from "../stores/auth-store";

interface AuthDialogProps {
    isOpen : boolean;
    onClose : () => void;
}

export function AuthDialog ( { isOpen, onClose } : AuthDialogProps ) {
    const { signIn } = useAuthStore();

    const handleSignIn = async () => {
        try {
            await signIn();
            onClose();
            toast( "Success", {
                description: "You have been successfully signed in",
            } );
        } catch ( error ) {
            toast( "Error", {
                description: "Failed to sign in. Please try again.",
            } );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign In Required</DialogTitle>
                    <DialogDescription>Please sign in to continue using ElementsHighlight.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSignIn}>Sign In</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
