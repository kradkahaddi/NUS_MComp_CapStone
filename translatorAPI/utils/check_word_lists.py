
with open('../data/agree_words_cleaned.txt', 'r') as f:
    agree = set(f.read().split('\n'))
with open('../data/reject_words_cleaned.txt', 'r') as f:
    reject = set(f.read().split('\n'))

inter = agree.intersection(reject)
if inter:    
    print(inter)

    agree, reject = agree-reject, reject-agree


    with open('../data/agree_words_final.txt', 'w') as f:
        f.write('\n'.join(sorted(list(agree))))

    with open('../data/reject_words_final.txt', 'w') as f:
        f.write('\n'.join(sorted(list(reject))))