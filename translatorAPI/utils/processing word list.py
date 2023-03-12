import re
from itertools import chain
from pathlib import Path

data_path = Path('../data')


def process_word_list(input_list):
    # print(input_list)
    res = [re.sub(r'\([\w\s]+\)', '', string.lower()).strip().split() for string in input_list]
    # print(res)
    res = set(chain.from_iterable(res))
    # print(res)
    res = (list(filter(lambda x: len(x)>0, res)))
    # print(res)
    return res

def process_raw(keyword):
    with open(data_path/(keyword+'_words_raw.txt'), 'r') as f:
        input_list = f.read()
        result = process_word_list(input_list.split('\n'))

    with open(data_path/(keyword+'_words_proc.txt'), 'w') as f:
        input_list = f.write('\n'.join(sorted(result)))

process_raw(keyword='agree')
process_raw(keyword='reject')



