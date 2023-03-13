# with open('../data/agree_words_cleaned.txt', 'r') as f:
#     agree = set(f.read().split('\n'))
# with open('../data/reject_words_cleaned.txt', 'r') as f:
#     reject = set(f.read().split('\n'))


# inter = agree.intersection(reject)
# if inter:    
#     print(inter)

#     agree, reject = agree-reject, reject-agree


#     with open('../data/agree_words_final.txt', 'w') as f:
#         f.write('\n'.join(sorted(list(agree))))

#     with open('../data/reject_words_final.txt', 'w') as f:
#         f.write('\n'.join(sorted(list(reject))))

# with open('../data/processing stages/agree_words_cleaned.txt', 'r') as f:
#     agree = set(f.read().split('\n'))
# with open('../data/agree_words_final.txt', 'r') as f:
#     agree2 = set(f.read().split('\n'))

# print(agree-agree2)
from pathlib import Path

items = ['agree_words_final.txt',
        'reject_words_final.txt',
        'manage_words_cleaned.txt',
        'necessary_words_cleaned.txt']

items_new = ['agree_words2_final.txt',
            'reject_words2_final.txt',
            'manage_words_final.txt',
            'necessary_words_final.txt']

for i, item in enumerate(items):
    with open(Path('../data')/item, 'r') as f:
        temp = set(f.read().split('\n'))
    
    for item_comp in items:
        if item_comp == item:
            continue
        with open(Path('../data')/item_comp, 'r') as f:
            comp = set(f.read().split('\n'))
        
        temp = temp - comp
    
    with open(Path('../data')/items_new[i], 'w') as f:
        f.write('\n'.join(sorted(list(temp))))

            
