import subprocess
import os
import re
import time
import webbrowser
import pandas as pd
import multiprocessing
import threading
from pathlib import Path
import pyautogui 

path = Path("C:\Program Files\Google\Chrome Dev\Application\Chrome.exe")
b_path = "C:/Program Files/Google/Chrome Dev/Application/chrome.exe %s"
# print("starting uvicorn")
print('opening browser')
browser = webbrowser.get(b_path)
def browser_func(name):
        browser.open(name)

df = pd.read_csv('testlist.csv')

for i, row in enumerate(df.site):
    print("website no ", i)
        # start the translator server
    subprocess.Popen("uvicorn test:app", shell=True, stdout=subprocess.DEVNULL)

    #open the webpage
    t = threading.Thread(target=browser_func, args=[row])
    t.start()

    # wait for processing
    # print(f'PORT IS {res}')
    time.sleep(45)
    pyautogui.hotkey('ctrl', 'w')
    t.join()
    time.sleep(1)
    # kill the server
    server_pid = os.popen('netstat -aon | findstr 8000 | findstr LISTENING').read()
    if server_pid:
        res = re.sub('[\s\n]', ' ', server_pid).strip().split()[-1]
        os.popen("TASKKILL /F /PID "+res)
        time.sleep(1)

