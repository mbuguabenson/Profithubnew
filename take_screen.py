import os
try:
    from PIL import ImageGrab
except ImportError:
    import subprocess
    subprocess.check_call(["python", "-m", "pip", "install", "pillow"])
    from PIL import ImageGrab

screenshot = ImageGrab.grab()
screenshot.save("f:/2027/Profithubnew/screen.png")
print("Screenshot saved to f:/2027/Profithubnew/screen.png")
