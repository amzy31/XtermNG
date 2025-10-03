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

const ZOOM_STEP = 0.1;
const DEFAULT_FONT_SCALE = 1.0;

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

function update_font_scale() {
    for (let term of terminals) {
        term.set_font_scale(current_font_scale);
    }
}

function setup_gui(icon_path) {
    const window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL });
    const main_box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });

    const home_dir = GLib.get_home_dir();
    terminals[0] = create_terminal(home_dir);
    terminals[1] = create_terminal(home_dir);

    const left_box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
    left_box.pack_start(terminals[0], true, true, 0);
    main_box.pack_start(left_box, true, true, 0);

    const right_box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
    right_box.pack_start(terminals[1], true, true, 0);
    main_box.pack_start(right_box, true, true, 0);

    window.set_title("XtermNG");
    if (GLib.file_test(icon_path, GLib.FileTest.EXISTS)) {
        window.set_icon_from_file(icon_path);
    }
    window.add(main_box);
    window.connect("destroy", () => Gtk.main_quit());

    // Set up accelerators for keyboard shortcuts
    const accel_group = new Gtk.AccelGroup();
    accel_group.connect(Gdk.KEY_equal, Gdk.ModifierType.CONTROL_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_font_scale += ZOOM_STEP;
        update_font_scale();
    });
    accel_group.connect(Gdk.KEY_plus, Gdk.ModifierType.CONTROL_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_font_scale += ZOOM_STEP;
        update_font_scale();
    });
    accel_group.connect(Gdk.KEY_minus, Gdk.ModifierType.CONTROL_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_font_scale -= ZOOM_STEP;
        if (current_font_scale < ZOOM_STEP) current_font_scale = ZOOM_STEP;
        update_font_scale();
    });
    accel_group.connect(Gdk.KEY_0, Gdk.ModifierType.CONTROL_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_font_scale = DEFAULT_FONT_SCALE;
        update_font_scale();
    });
    accel_group.connect(Gdk.KEY_Left, Gdk.ModifierType.CONTROL_MASK | Gdk.ModifierType.SHIFT_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_terminal = (current_terminal - 1 + 2) % 2;
        terminals[current_terminal].grab_focus();
    });
    accel_group.connect(Gdk.KEY_Right, Gdk.ModifierType.CONTROL_MASK | Gdk.ModifierType.SHIFT_MASK, Gtk.AccelFlags.VISIBLE, () => {
        current_terminal = (current_terminal + 1) % 2;
        terminals[current_terminal].grab_focus();
    });
    window.add_accel_group(accel_group);

    window.show_all();
    terminals[0].grab_focus();
    return window;
}



function main() {
    const icon_path = GLib.build_filenamev([GLib.get_home_dir(), ".xtermng", "icon", "xtermng.png"]);

    Gtk.init(null);
    const window = setup_gui(icon_path);
    Gtk.main();
}

main();
