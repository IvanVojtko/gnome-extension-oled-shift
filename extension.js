import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Keep shift small to avoid clipping
const OFFSETS_X = [-2, -1, 0, 1, 2];
const OFFSETS_Y = [-1, 0, 1];

export default class OledShiftExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._timeoutId = null;
        this._settingsChangedId = null;
        this._step = 0;

        // Panel containers (left / center / right)
        this._boxes = [
            Main.panel?._leftBox,
            Main.panel?._centerBox,
            Main.panel?._rightBox,
        ].filter(Boolean);

        if (this._boxes.length === 0) {
            console.log(`[${this.metadata.uuid}] Could not find panel boxes; not shifting.`);
            return;
        }

        // Save original translations so we can restore on disable()
        this._original = this._boxes.map(box => {
            if (box.get_translation) {
                const [x, y, z] = box.get_translation();
                return {x, y, z};
            }
            return {
                x: box.translation_x ?? 0,
                y: box.translation_y ?? 0,
                z: box.translation_z ?? 0,
            };
        });

        // Restart timer whenever interval changes
        this._settingsChangedId = this._settings.connect(
            'changed::shift-interval-seconds',
            () => this._restartTimer()
        );

        // Apply once immediately, then start timer
        this._applyShift();
        this._restartTimer();
    }

    _restartTimer() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        // Read seconds (unsigned int); enforce minimum 1s
        const seconds = Math.max(1, this._settings.get_uint('shift-interval-seconds'));

        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            seconds,
            () => {
                this._step++;
                this._applyShift();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _applyShift() {
        const dx = OFFSETS_X[this._step % OFFSETS_X.length];
        const dy = OFFSETS_Y[(Math.floor(this._step / OFFSETS_X.length)) % OFFSETS_Y.length];

        for (let i = 0; i < this._boxes.length; i++) {
            const box = this._boxes[i];
            const o = this._original[i];
            box.set_translation(o.x + dx, o.y + dy, o.z);
        }
    }

    disable() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._settings && this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        // Restore original translations
        if (this._boxes && this._original) {
            for (let i = 0; i < this._boxes.length; i++) {
                const box = this._boxes[i];
                const o = this._original[i];
                box.set_translation(o.x, o.y, o.z);
            }
        }

        this._settings = null;
        this._boxes = null;
        this._original = null;
    }
}
