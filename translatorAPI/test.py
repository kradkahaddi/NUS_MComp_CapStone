from ast import Str
from fastapi import FastAPI
from googletrans import Translator
from typing import Optional, Union
from pydantic import BaseModel
from itertools import chain
import time

import json
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

agree_set     = read_file('data/agree_words2_final.txt')
reject_set    = read_file('data/reject_words2_final.txt')
manage_set    = read_file('data/manage_words_final.txt')
necessary_set = read_file('data/necessary_words_final.txt')
save_set      = read_file('data/save_words_raw.txt')

perform_set = read_file('data/performance_words_raw.txt')
func_set    = read_file('data/functional_words_raw.txt')
target_set  = read_file('data/targeting_words_raw.txt')

"""
need save
need 3 types options
"""

print(f'agree words first five {list(agree_set)[:5]}')
print(f'reject words first five {list(reject_set)[:5]}')
def translate_query(query):
   # time.sleep(30)
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
   bad_buttons:str
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

   buttons = (json.loads(request.buttons))
   buttons = [translate_query(button).text.lower() for button in buttons]
   options = json.loads(request.options)
   bad_buttons = json.loads(request.bad_buttons)
   print(f"{options=}")
   # buttons = list(chain)
   print(f'{buttons=}')
   bad_buttons = [translate_query(button).text.lower() for button in bad_buttons]
   print(f'{bad_buttons=}')
   button_set = set(chain.from_iterable([button.split() for button in buttons 
                                         if button not in bad_buttons]))
   # button_set = set(buttons)
   print(f"{button_set=}")
   
   agree_intersection = agree_set.intersection(button_set)
   reject_intersection = reject_set.intersection(button_set)
   necessary_intersection = necessary_set.intersection(button_set)
   manage_intersection = manage_set.intersection(button_set)
   policy = options['policy']
   print(f'policy is: {policy}')
   print(f"{agree_intersection=}")
   print(f"{reject_intersection=}")
   print(f"{necessary_intersection=}")
   print(f'{manage_intersection=}')

   if agree_intersection:
      print('found the agree button',  agree_intersection)
      check = True
      solved = True
      best_index = 0

      # if len(agree_intersection)>1:
      #    print("found more than one button")
      
      
      if policy == 'agree':
         key = list(agree_intersection)[0]
      elif (policy == 'reject') and (len(reject_intersection)>0):
         key = list(reject_intersection)[0]
      elif (policy == 'reject') and (len(necessary_intersection)>0):
         key = list(necessary_intersection)[0]
      elif (policy == 'reject') and (len(manage_intersection)>0):
         key = list(manage_intersection)[0]
         solved = False
      elif (policy == 'necessary') and (len(necessary_intersection)>0):
         key = list(necessary_intersection)[0]
      elif (policy == 'necessary') and (len(reject_intersection)>0):
         key = list(reject_intersection)[0]
      elif (policy == 'necessary') and (len(manage_intersection)>0):
         key = list(manage_intersection)[0]
         solved = False
      elif (policy == 'custom') and (len(manage_intersection)>0):
         key = list(manage_intersection)[0]
         solved = False
      else:
         key = list(agree_intersection)[0]
      print(key)

      for i, button in enumerate(buttons):
         if button in bad_buttons:
            continue
         if (key in button.lower()):
            best_index = i
            break
   else:
      check = False
      solved = False
      best_index = None

   result = dict(check=check, solved=solved, best_index=best_index, 
                 ori_label=json.loads(request.buttons)[best_index] if type(best_index)==int else None,
                 label=buttons[best_index] if type(best_index)==int else None,
                 label_type=None)
   print(result)
   return result

   
@app.post("/detailedoptions")
def test_detailed_buttons(request:InboundButtonDetails):
   """
   return type - based on policy:
   look for a save button - if not, move to a parent.
   reject all - first look for a reject button (maybe present)

   necessary/reject all - turn off all optional
   custom - use options for three types, turn off all others

   return save button.
   """
   try:
      print(request)
      input_options = (json.loads(request.buttons))
   except Exception as e:
      print(e)
      print('error in json load first')

   try:
      text_buttons = json.loads(input_options['button_text'])
      original_buttons = text_buttons.copy()
      print(f"{text_buttons=}")
      labelled_buttons= json.loads(input_options['button_label'])
      print(f"{labelled_buttons=}")
      labelled_inputs = json.loads(input_options['input_label'])
      print(f"{labelled_inputs=}")
   except Exception as e:
      print(e)
      print('error in json load second')
   
   try:
      buttons = [translate_query(button).text.lower() for button in text_buttons]
   except Exception as e:
      print(e)
      print('error in first translate phase')
      return dict(check=False, has_save_button=None)  
   
   button_set = set(chain.from_iterable([button.split() for button in buttons]))
   print(f"{button_set=}")
   save_intersection = save_set.intersection(button_set)
   print(f'{save_intersection=}')


   if not (save_intersection):
      return dict(check=False, has_save_button=False)
   
   # get save index
   save_idx = 0
   key = list(save_intersection)[0]
   for i, button in enumerate(buttons):
      if (key in button.lower()):
         save_idx = i
         break
   
   try:
      labelled_inputs = [translate_query(button).text.lower() for button in labelled_inputs]
   except Exception as e:
      print(e)
      print('error in second translate phase')
      return dict(check=False, has_save_button=True,)  

   labelled_input_set = set(chain.from_iterable([button.split() for button in labelled_inputs]))
   try:
      if not labelled_inputs:
         labelled_buttons = [translate_query(button).text.lower() for button in labelled_buttons]
         labelled_b_set = set(chain.from_iterable([button.split() for button in labelled_buttons]))
   except Exception as e:
      print(e)
      print('error in third translate phase')
      return dict(check=False, has_save_button=True,)  
    
   reject_intersection = reject_set.intersection(button_set)
   print(f"{reject_intersection=}")
   try:   
      options = json.loads(request.options)
      policy = options['policy']
      print(f'policy is: {policy}') 
   except Exception as e:
      print(e)
      print('error in json policy decode')
      return dict(check=False, has_save_button=True,) 

   best_index=0
   try:
      if (policy == 'reject') and (len(reject_intersection)>0):
            key = list(reject_intersection)[0]
            for i, button in enumerate(buttons):
               if (key in button.lower()):
                  best_index = i
                  break
            return dict(check=True, has_save_button=True, solved=True, 
                        is_reject=True, best_index=best_index, 
                        ori_label=(original_buttons[best_index] 
                           if type(best_index)==int else None),
                        label=(buttons[best_index] 
                           if type(best_index)==int else None))
   except Exception as e:
      print(e)
      print('something wrong in rejecting phase')
      return dict(check=False, has_save_button=True,)  
      # elif (policy == 'reject') or (policy == 'necessary'):
      #    pass
      # bad_buttons = json.loads(request.bad_buttons)
      # print(f"{options=}")
      # buttons = list(chain)
      # print(f'{buttons=}')
      # bad_buttons = [translate_query(button).text.lower() for button in bad_buttons]
   if labelled_inputs:
      checkbox=True
      option_labels = labelled_inputs
   else:
      checkbox=False
      option_labels = labelled_buttons
   
   if (policy=='reject') or (policy=='necessary'):
      check_array= []
      # option_labels = []
   
   elif policy=='custom':
      check_array=[]
      # option_labels = []


      if checkbox:
            checking_set = labelled_input_set
            checking_list = labelled_inputs
      else:
         checking_set = labelled_b_set
         checking_list = labelled_buttons
      for choice_set, option in ((perform_set, options['perf']), 
                        (func_set, options['func']), 
                        (target_set, options['tar'])):
         # choice_index=0
         if option:
            key = list(choice_set.intersection(checking_set))[0]
            for i,button_label in enumerate(checking_list):
               if (key in button_label) and (i not in check_array):
                  check_array.append(i)
                  # option_labels.append(button_label) 

            # option_labels = list()         
         


   
   try:
      res = dict(check=True, has_save_button=True, solved=True, is_reject=False, best_index=save_idx, 
                  ori_label=(original_buttons[save_idx] if type(best_index)==int else None),
                  policy=policy, pos_labels=check_array, 
                  option_labels=option_labels, checkbox=checkbox,
                  label=buttons[save_idx] if type(save_idx)==int else None)
      print(res)
      return res  
      
   except Exception as e:
      print(e)
      print('something went wrong in final return')
      return dict(check=False, has_save_button=True,)