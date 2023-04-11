Main focus area of Capstone project

## Requirements for the API
1. Language detection
2. Language translation
3. Take html fragments and check for cookie word
4. Take html fragments and check buttons against bag of words for decisions

## Main Methods
1. Get translation - @app.get('/translation')
2. Get source language - @app.get('/checklang')
3. check for cookie word - @app.post("/fragtest")
4. check main banner buttons - @app.post("/firstbuttons")
5. check detailed popup buttons - @app.post("/detailedoptions")

## Note:

language codes: [link](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) 

## References:

1. googletrans tutorial [link](https://www.thepythoncode.com/article/translate-text-in-python)
2. Synonyms and word lists were taken from [merriam webster](https://www.merriam-webster.com/thesaurus/)