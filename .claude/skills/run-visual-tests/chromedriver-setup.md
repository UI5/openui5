# Chromedriver Setup

One-time setup (re-run only when Chrome updates). uiveri5 1.49.x ships pinned to `chromedriver-114.0.5735.90` (see `driverVersions.json`) and won't auto-fetch a newer one. Modern Chrome (149+) needs a matching driver placed under that exact filename. The filename **must** stay `chromedriver-114.0.5735.90` (Windows: `chromedriver-114.0.5735.90.exe`) even though the binary is newer — uiveri5 won't pick it up otherwise.

Find your Chrome version, download the matching driver for your OS/arch from the [chrome-for-testing list](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json), and copy it into uiveri5's `selenium/` dir under the pinned name.

## macOS

```bash
# 1. find the version of your installed Chrome
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version

# 2. download the matching chromedriver — mac-arm64 on Apple Silicon, mac-x64 on Intel (check with `uname -m`: `arm64` vs `x86_64`)
curl -sSL -o /tmp/chromedriver.zip \
  "https://storage.googleapis.com/chrome-for-testing-public/<VERSION>/mac-arm64/chromedriver-mac-arm64.zip"
unzip -o /tmp/chromedriver.zip -d /tmp

# 3. place it where uiveri5 looks, under the hardcoded filename
SELENIUM_DIR="$(npm root -g)/@ui5/uiveri5/selenium"
mkdir -p "$SELENIUM_DIR"
cp /tmp/chromedriver-mac-arm64/chromedriver "$SELENIUM_DIR/chromedriver-114.0.5735.90"
chmod +x "$SELENIUM_DIR/chromedriver-114.0.5735.90"
xattr -d com.apple.quarantine "$SELENIUM_DIR/chromedriver-114.0.5735.90" 2>/dev/null || true

# 4. verify
"$SELENIUM_DIR/chromedriver-114.0.5735.90" --version
```

`npm root -g` resolves the global module dir regardless of how node was installed (nvm, homebrew, system).

## Windows (Git Bash / WSL)

```bash
# 1. find the version of your installed Chrome
reg query "HKCU\Software\Google\Chrome\BLBeacon" /v version   # or: "/c/Program Files/Google/Chrome/Application/chrome.exe" --version

# 2. download the matching win64 chromedriver
curl -sSL -o /tmp/chromedriver.zip \
  "https://storage.googleapis.com/chrome-for-testing-public/<VERSION>/win64/chromedriver-win64.zip"
unzip -o /tmp/chromedriver.zip -d /tmp

# 3. place it where uiveri5 looks, under the hardcoded filename — note the .exe suffix.
SELENIUM_DIR="$(npm root -g)/@ui5/uiveri5/selenium"
mkdir -p "$SELENIUM_DIR"
cp /tmp/chromedriver-win64/chromedriver.exe "$SELENIUM_DIR/chromedriver-114.0.5735.90.exe"

# 4. verify
"$SELENIUM_DIR/chromedriver-114.0.5735.90.exe" --version
```

No `chmod`/`xattr` needed on Windows. `npm root -g` resolves the global module dir regardless of installer (nvm-windows, system node).
