#!/usr/bin/env gjs
/**
 * XtermNG:
 * A multi-terminal emulator with split views and zoom controls.
 *
 * Converted to JavaScript using GJS and GTK.
 */

imports.gi.versions.Gtk = "3.0";
imports.gi.versions.Vte = "2.91";

const Gtk = imports.gi.Gtk;
const Vte = imports.gi.Vte;
const GLib = imports.gi.GLib;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const System = imports.system;

const ZOOM_STEP = 0.1;
const DEFAULT_FONT_SCALE = 1.0;

// Global variables
let window = null;
let main_box = null;
let terminals = [null, null];
let current_terminal = 0;
let current_font_scale = DEFAULT_FONT_SCALE;

function create_terminal(working_dir) {
    let terminal = new Vte.Terminal();
    terminal.set_font_scale(current_font_scale);

    // Start a new shell
    let shell = GLib.getenv('SHELL') || '/bin/bash';
    try {
        let [success, pid] = terminal.spawn_sync(
            Vte.PtyFlags.DEFAULT,
            working_dir,
            [shell],
            null,
            GLib.SpawnFlags.DO_NOT_REAP_CHILD,
            null, null,
            null
        );
        print(`Spawned pid: ${pid}`);
    } catch (e) {
        print(`Spawn failed: ${e}`);
        Gtk.main_quit();
    }

    terminal.connect("child-exited", (t, status) => Gtk.main_quit());
    return terminal;
}

function setup_gui(icon_path) {
    // Create main horizontal box for split layout
    main_box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });

    // Create vertical boxes for each terminal section
    let left_box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
    let middle_box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });

    // Create terminals
    let home_dir = GLib.get_home_dir();
    terminals[0] = create_terminal(home_dir);
    terminals[1] = create_terminal(home_dir);

    // Add terminals to their respective boxes
    left_box.pack_start(terminals[0], true, true, 0);
    middle_box.pack_start(terminals[1], true, true, 0);

    // Add boxes to main box
    main_box.pack_start(left_box, true, true, 0);
    main_box.pack_start(middle_box, true, true, 0);

    // Set window properties
    window.set_title("XtermNG");
    if (GLib.file_test(icon_path, GLib.FileTest.EXISTS)) {
        window.set_icon_from_file(icon_path);
    }
    window.add(main_box);

    // Connect signals
    window.connect("destroy", () => Gtk.main_quit());
    window.connect("key-press-event", on_key_press);
}

function on_key_press(widget, event) {
    if (event.get_state() & Gdk.ModifierType.CONTROL_MASK) {
        if (event.get_keyval()[1] === Gdk.KEY_equal || event.get_keyval()[1] === Gdk.KEY_plus) {
            current_font_scale += ZOOM_STEP;
        } else if (event.get_keyval()[1] === Gdk.KEY_minus) {
            current_font_scale -= ZOOM_STEP;
            if (current_font_scale < ZOOM_STEP) {
                current_font_scale = ZOOM_STEP;
            }
        } else if (event.get_keyval()[1] === Gdk.KEY_0) {
            current_font_scale = DEFAULT_FONT_SCALE;
        } else if (event.get_keyval()[1] === Gdk.KEY_w && event.get_state() & Gdk.ModifierType.SHIFT_MASK) {
            current_terminal = (current_terminal + 1) % 2;
            terminals[current_terminal].grab_focus();
            return true;
        } else if (event.get_keyval()[1] === Gdk.KEY_Left && event.get_state() & Gdk.ModifierType.SHIFT_MASK) {
            current_terminal = (current_terminal - 1 + 2) % 2;
            terminals[current_terminal].grab_focus();
            return true;
        } else if (event.get_keyval()[1] === Gdk.KEY_Right && event.get_state() & Gdk.ModifierType.SHIFT_MASK) {
            current_terminal = (current_terminal + 1) % 2;
            terminals[current_terminal].grab_focus();
            return true;
        } else {
            return false;
        }

        // Apply font scale to all terminals
        for (let term of terminals) {
            term.set_font_scale(current_font_scale);
        }
        return true;
    }
    return false;
}

function main() {
    // Get icon path
    let home = GLib.get_home_dir();
    let icon_path = GLib.build_filenamev([home, ".xtermng", "icon", "xtermng.png"]);

    // Initialize GTK
    Gtk.init(null);

    // Create window
    window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL });

    // Setup GUI
    setup_gui(icon_path);

    // Show all widgets
    window.show_all();

    // Set initial focus to first terminal
    terminals[0].grab_focus();

    // Run main loop
    Gtk.main();
}

main();
