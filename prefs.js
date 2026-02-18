import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from
  'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OledShiftPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('OLED Burn-in Protection'),
        });
        page.add(group);

        const row = new Adw.ActionRow({
            title: _('Shift interval'),
            subtitle: _('How often to move the top bar (seconds)'),
        });

        const adjustment = new Gtk.Adjustment({
            lower: 1,
            upper: 86400,        // up to 1 day
            step_increment: 1,
            page_increment: 10,
            value: settings.get_uint('shift-interval-seconds'),
        });

        const spin = new Gtk.SpinButton({
            adjustment,
            numeric: true,
            digits: 0,
            valign: Gtk.Align.CENTER,
        });

        row.add_suffix(spin);
        row.activatable_widget = spin;
        group.add(row);

        spin.connect('value-changed', () => {
            settings.set_uint('shift-interval-seconds', spin.get_value_as_int());
        });

        settings.connect('changed::shift-interval-seconds', () => {
            const v = settings.get_uint('shift-interval-seconds');
            if (spin.get_value_as_int() !== v)
                spin.set_value(v);
        });
    }
}
