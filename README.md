# OLED Panel Shift (GNOME Shell Extension)

A small GNOME Shell extension that periodically shifts the **top bar contents** by a few pixels to reduce the risk of **OLED burn-in** from static UI elements (clock, indicators, system menu, etc.).

It works by applying a tiny translation to GNOME Shell’s panel containers:

- left section (`_leftBox`)
- center section (`_centerBox`)
- right section (`_rightBox`)

The shift interval is configurable in **seconds** via the extension’s Preferences window.

---

## Features

- Shifts top bar contents in a small repeating pattern (few pixels)
- Configurable interval (seconds)
- Restores the original panel position when disabled
- Designed for GNOME Shell 45+ (ES modules)

---

## Install (user install)

### 1) Copy the extension into the GNOME extensions folder

Your extension folder must be named exactly like the UUID:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/
cp -r oled-shift@local ~/.local/share/gnome-shell/extensions/
```

You should end up with:

```
~/.local/share/gnome-shell/extensions/oled-shift@local/
  metadata.json
  extension.js
  prefs.js
  schemas/
    org.gnome.shell.extensions.oled-shift.gschema.xml
```

### 2) Compile the GSettings schema

From inside the extension folder:

```bash
cd ~/.local/share/gnome-shell/extensions/oled-shift@local
glib-compile-schemas schemas/
```

### 3) Restart GNOME Shell (to make sure it discovers the extension)

- **Xorg**: press `Alt` + `F2`, type `r`, press Enter
- **Wayland**: log out and log back in

### 4) Enable the extension

```bash
gnome-extensions enable oled-shift@local
```

Verify it’s installed:

```bash
gnome-extensions list
```

---

## Configure

Open Preferences:

```bash
gnome-extensions prefs oled-shift@local
```

Set **Shift interval (seconds)** to how often you want the panel contents to move.

---

## Notes / Safety

- This is not a guaranteed burn-in “fix” — it’s a mitigation strategy.
- If you use extensions that heavily modify the top bar, results may vary.
