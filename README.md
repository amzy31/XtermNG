XtermNG - A Simple GTK Terminal Emulator

This is a minimal terminal emulator written in PYTHON using GTK+3 and VTE.
It provides a split-view with two terminals and basic keyboard shortcuts.

Build:
	make

Install system-wide:
	sudo make install

make executable:
	make xtermng

Keyboard shortcuts:
	Ctrl+Shift+Left  : Previous terminal
	Ctrl+Shift+Right : Next terminal
	Ctrl+=           : Zoom in
	Ctrl+-           : Zoom out
	Ctrl+0           : Reset zoom

The binary is stripped and comes in at around 15KB.
