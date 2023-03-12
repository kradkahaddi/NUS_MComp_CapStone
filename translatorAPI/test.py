from ast import Str
from fastapi import FastAPI
from googletrans import Translator
from typing import Optional, Union
from pydantic import BaseModel
from itertools import chain

import ast

translator = Translator()

app = FastAPI()

"""
read all the synonym lists
convert to sets
"""
def read_file(filename):
   with open(filename, 'r') as f:
      res = set(f.read().split('\n'))
      print(res)
   return res

agree_set = read_file('data/agree_words_final.txt')
reject_set= read_file('data/reject_words_final.txt')

print(f'agree words first five {list(agree_set)[:5]}')
print(f'reject words first five {list(reject_set)[:5]}')
def translate_query(query):
   return translator.translate(query)

def check_query_language(query):
   op = translate_query(query)
   return op.src
   
@app.get('/translation')
def get_translation(q: str):
   # q is query -> input string 
   op = translate_query(q)
   return {'text': op.text, "lang": op.src}

@app.get('/checklang')
def get_language(q: str):
   return {"detected_lang": check_query_language(q)}

@app.get('/testingapi')
def testing_api():
   print('recieved request')
   return {'payload': "API is functional"}

@app.get("/")
def root_path():
   print("received root path request")
   return('Hello World!')


# Must implement the following
# 1. check language -> add as a 
# 2. check for cookie banner
# 3. check for appropriate button


# customize, manage, configure, settings
# necessary, function, mandatory

# performance, targeting, functional, strictly necessary
@app.get('checkcookies')
def check_for_cookiebanner():
   pass

class InboundHTML(BaseModel):
   string:str
   lang:str

@app.post("/wholetest")
def test_whole_body(body:InboundHTML):
   print(body.string[:200])
   return dict(check=False)

@app.post("/fragtest")
def test_whole_body(body:InboundHTML):
   if len(body.string.strip())<2:
      print('small body', len(body.string.strip()), body.string)
      return dict(check=False)
   try:
      text = translate_query(body.string).text
   except Exception as e:
      print("\n\n\n\n\nthere was an error with translation\n\n\n\n\n")
      text = body.string

   print(text[:200])
   if 'cookie' in text:
      check=True
      print('\n\n\n\n\n\n\nfound cookie\n\n\n\n\n\n')
   else:
      check=False
   # return "Received body frag"
   return dict(check=check)

class InboundButtonDetails(BaseModel):
   buttons:str
   options:str
   lang:str

@app.post("/firstbuttons")
def test_first_buttons(request:InboundButtonDetails):
   """
   accept all

   response body:
   check:bool - were the banner buttons found
   solved:bool - will the banner be resolved? yes for accept/reject and no for customization
   best_index:int - index for button to press
   
   """
   print(request)

   buttons = (ast.literal_eval(request.buttons))
   buttons = [translate_query(button).text for button in buttons]
   # buttons = list(chain)
   print(f'{buttons=}')
   button_set = set(chain.from_iterable([button.split() for button in buttons]))
   # button_set = set(buttons)
   print(f"{button_set=}")
   intersection = agree_set.intersection(button_set)
   print(intersection)
   if intersection:
      print('found a button',  intersection)
      check = True
      solved = True
      best_index = 0
      if len(intersection)>1:
         print("found more than one button")
      key = list(intersection)[0]
      for i, button in enumerate(buttons):
         if ('all' in button.lower()) or (key in button.lower()):
            best_index = i
            break
   else:
      check = False
      solved = False
      best_index = None

   result = dict(check=check, solved=solved, best_index=best_index, 
                 label=buttons[best_index] if type(best_index)==int else None,
                 label_type=None)
   print(result)
   return result

   
@app.post("/detailedoptions")
def test_detailed_buttons(request:InboundButtonDetails):
   pass