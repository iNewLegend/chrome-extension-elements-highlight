import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { ThemeProvider, useTheme } from "./theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

function ThemeToggle () {
    const { theme, setTheme } = useTheme();
    const [ checked, setChecked ] = useState( theme === "dark" );

    return (
        <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="theme-toggle" className="flex-1 text-sm font-normal">
                Dark Mode
            </Label>
            <Switch
                id="theme-toggle"
                checked={checked}
                onCheckedChange={( value ) => {
                    setChecked( value );
                    setTheme( value ? "dark" : "light" );
                }}
            />
        </div>
    );
}

function Popup() {
    return (
        <div className="p-4 w-[350px] h-[500px] bg-background text-foreground">
            <Card className="w-full h-full border-none shadow-none rounded-none bg-background overflow-hidden flex flex-col">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-xl font-bold">Chrome Extension Template</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1 overflow-auto">
                    <ThemeToggle />
                    <div className="flex gap-2">
                        <Button>Primary</Button>
                        <Button variant="outline">Secondary</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Root element not found");
}
const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="dark">
            <Popup />
        </ThemeProvider>
    </React.StrictMode>
);


