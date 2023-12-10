#!/usr/bin/env python3
"""
XtermNG:
A multi-terminal emulator with split views and zoom controls.

Refactored to Python using GTK3 and VTE.
"""

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Vte', '2.91')
from gi.repository import Gtk, Vte, GLib, Gdk, Gio
import os
import sys

ZOOM_STEP = 0.1
DEFAULT_FONT_SCALE = 1.0

# Global variables
window = None
main_box = None
terminals = [None, None]
current_terminal = 0
current_font_scale = DEFAULT_FONT_SCALE

def create_terminal(working_dir):
    terminal = Vte.Terminal()
    terminal.set_font_scale(current_font_scale)

    # Start a new shell
    shell = os.environ.get('SHELL', '/bin/bash')
    try:
        pid = terminal.spawn_sync(
            Vte.PtyFlags.DEFAULT,
            working_dir,
            [shell],
            None,
            GLib.SpawnFlags.DO_NOT_REAP_CHILD,
            None, None,
            None
        )
        print(f"Spawned pid: {pid}")
    except GLib.Error as e:
        print(f"Spawn failed: {e}")
        Gtk.main_quit()

    terminal.connect("child-exited", lambda t, status: Gtk.main_quit())
    return terminal

def setup_gui(icon_path):
    global main_box, terminals, window

    # Create main horizontal box for split layout
    main_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)

    # Create vertical boxes for each terminal section
    left_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    middle_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)

    # Create terminals
    home_dir = os.path.expanduser("~")
    terminals[0] = create_terminal(home_dir)
    terminals[1] = create_terminal(home_dir)

    # Add terminals to their respective boxes
    left_box.pack_start(terminals[0], True, True, 0)
    middle_box.pack_start(terminals[1], True, True, 0)

    # Add boxes to main box
    main_box.pack_start(left_box, True, True, 0)
    main_box.pack_start(middle_box, True, True, 0)

    # Set window properties
    window.set_title("XtermNG")
    if os.path.exists(icon_path):
        window.set_icon_from_file(icon_path)
    window.add(main_box)

    # Connect signals
    window.connect("destroy", Gtk.main_quit)
    window.connect("key-press-event", on_key_press)

def on_key_press(widget, event):
    global current_font_scale, current_terminal, terminals

    if event.state & Gdk.ModifierType.CONTROL_MASK:
        if event.keyval in (Gdk.KEY_equal, Gdk.KEY_plus):
            current_font_scale += ZOOM_STEP
        elif event.keyval == Gdk.KEY_minus:
            current_font_scale -= ZOOM_STEP
            if current_font_scale < ZOOM_STEP:
                current_font_scale = ZOOM_STEP
        elif event.keyval == Gdk.KEY_0:
            current_font_scale = DEFAULT_FONT_SCALE
        elif event.keyval == Gdk.KEY_w and event.state & Gdk.ModifierType.SHIFT_MASK:
            current_terminal = (current_terminal + 1) % 2
            terminals[current_terminal].grab_focus()
            return True
        elif event.keyval == Gdk.KEY_Left and event.state & Gdk.ModifierType.SHIFT_MASK:
            current_terminal = (current_terminal - 1 + 2) % 2
            terminals[current_terminal].grab_focus()
            return True
        elif event.keyval == Gdk.KEY_Right and event.state & Gdk.ModifierType.SHIFT_MASK:
            current_terminal = (current_terminal + 1) % 2
            terminals[current_terminal].grab_focus()
            return True
        else:
            return False

        # Apply font scale to all terminals
        for term in terminals:
            term.set_font_scale(current_font_scale)
        return True
    return False

def main():
    # Get icon path
    home = os.path.expanduser("~")
    icon_path = os.path.join(home, ".xtermng", "icon", "xtermng.png")

    # Initialize GTK
    Gtk.init(sys.argv)

    global window
    # Create window
    window = Gtk.Window(type=Gtk.WindowType.TOPLEVEL)

    # Setup GUI
    setup_gui(icon_path)

    # Show all widgets
    window.show_all()

    # Set initial focus to first terminal
    terminals[0].grab_focus()

    # Run main loop
    Gtk.main()

if __name__ == "__main__":
    main()
